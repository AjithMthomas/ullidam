/**
 * Realistic drifting mist, rendered live with WebGL (no images, no video).
 * Two layers of fractal noise drift at different speeds, the second warped by
 * the first, which gives fog its soft, rolling look. Scroll sets `density`
 * (how much mist) and `lift` (clearing from the water upward); the cursor or a
 * tap wipes clear patches that slowly mist over again, like a fogged window.
 */
const VERTEX = `
attribute vec2 a;
varying vec2 vUv;
void main() { vUv = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uDensity;
uniform float uLift;
uniform vec3 uFog;
uniform vec3 uCool;
uniform sampler2D uWipe;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return v;
}
void main() {
  vec2 p = vUv * vec2(uRes.x / uRes.y, 1.0) * 1.6;
  float t = uTime * 0.035;
  float base = fbm(p + vec2(t, t * 0.35));
  float rolling = fbm(p * 1.9 + vec2(-t * 1.4, t * 0.2) + base * 1.6);
  float mist = base * 0.55 + rolling * 0.6;
  // Thin mist gathers over the water (low on screen) first, then fills everything.
  float cover = uDensity * 1.3 + (mist - 0.55) * 1.1 * (1.0 - uDensity * 0.55) + (0.4 - vUv.y) * 0.6 * (1.0 - uDensity);
  // Clearing rises from the water upward, with a soft ragged edge.
  cover *= smoothstep(uLift - 0.3, uLift + 0.05, vUv.y + (mist - 0.55) * 0.3);
  cover *= 1.0 - texture2D(uWipe, vUv).r * 0.92;
  cover = clamp(cover, 0.0, 1.0);
  vec3 col = mix(uFog, uCool, clamp(rolling * 0.45, 0.0, 1.0)) * (0.975 + 0.05 * base);
  gl_FragColor = vec4(col * cover, cover);
}`;

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as [number, number, number];

export class Mist {
  private gl: WebGLRenderingContext;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private wipeCanvas = document.createElement("canvas");
  private wipeCtx: CanvasRenderingContext2D;
  private wipeTexture: WebGLTexture | null;
  private wipeActive = 0;
  private frame = 0;
  private running = false;
  private density = 0;
  private lift = -0.4;

  constructor(private canvas: HTMLCanvasElement, colors: { fog: string; cool: string }) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    const wipeCtx = this.wipeCanvas.getContext("2d");
    if (!gl || !wipeCtx) throw new Error("WebGL unavailable");
    this.gl = gl;
    this.wipeCtx = wipeCtx;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("link");
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    for (const name of ["uRes", "uTime", "uDensity", "uLift", "uFog", "uCool", "uWipe"]) {
      this.uniforms[name] = gl.getUniformLocation(program, name);
    }
    gl.uniform3fv(this.uniforms.uFog, toRgb(colors.fog));
    gl.uniform3fv(this.uniforms.uCool, toRgb(colors.cool));

    // A small greyscale "wipe" map: white where the visitor has cleared the mist.
    this.wipeCanvas.width = this.wipeCanvas.height = 96;
    wipeCtx.fillStyle = "#000";
    wipeCtx.fillRect(0, 0, 96, 96);
    this.wipeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.wipeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.uploadWipe();
    gl.uniform1i(this.uniforms.uWipe, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this.resize();
  }

  /** Fog is soft, so half resolution looks identical and costs a quarter. */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.max(2, Math.round(rect.width * 0.5));
    this.canvas.height = Math.max(2, Math.round(rect.height * 0.5));
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(this.uniforms.uRes, this.canvas.width, this.canvas.height);
    this.draw(performance.now());
  }

  set(density: number, lift: number) {
    this.density = density;
    this.lift = lift;
    if (!this.running) this.draw(performance.now());
  }

  /** Clear a soft patch of mist at screen position (0 to 1, y downward). */
  wipe(x: number, y: number, radius = 11) {
    const ctx = this.wipeCtx;
    const px = x * 96;
    const py = y * 96;
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    this.wipeActive = 240; // frames until the mist has fully re-formed
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = (now: number) => {
      if (!this.running) return;
      this.frame = requestAnimationFrame(loop);
      this.draw(now);
    };
    this.frame = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  destroy() {
    this.stop();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private uploadWipe() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.wipeTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.wipeCanvas);
  }

  private draw(now: number) {
    const gl = this.gl;
    if (this.wipeActive > 0) {
      // Wiped patches slowly mist over again.
      this.wipeCtx.fillStyle = "rgba(0,0,0,0.018)";
      this.wipeCtx.fillRect(0, 0, 96, 96);
      this.uploadWipe();
      this.wipeActive -= 1;
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (this.density < 0.004) return;
    gl.uniform1f(this.uniforms.uTime, now / 1000);
    gl.uniform1f(this.uniforms.uDensity, this.density);
    gl.uniform1f(this.uniforms.uLift, this.lift);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
