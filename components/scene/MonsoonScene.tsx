import { useId, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { round, seededRandom } from "@/lib/random";
import { mix, theme } from "@/theme";

const int = (value: number) => Math.round(value);

/**
 * The Ullidam backwater: Western Ghats hills, coconut palms and a lamp-lit
 * boat, drawn from a fixed seed so every page shows the same place. Only the
 * hour changes (see docs/cinematic-script.md). Rendered on the server only;
 * the browser never recomputes the geometry.
 */
export type SceneVariant = "dusk" | "night" | "dawn" | "day" | "evening";

interface Palette {
  sky: [string, string, string];
  glow: string;
  glowOpacity: number;
  hills: [string, string, string];
  palms: string;
  foreground: string;
  water: [string, string];
  reflection: number;
  mist: string;
  mistOpacity: number;
  shimmer: string;
  hull: string;
}

/*
 * Every hour of the backwater is mixed from the theme roles in /theme.ts, so a
 * new palette recolours the scenes too. Darkness is the primary colour deepened;
 * daylight is the tertiary and surface; the warm light is theme.glow.
 */
const t = theme;
const DARK = "#000000";
const PALETTES: Record<SceneVariant, Palette> = {
  dusk: {
    sky: [mix(t.primary, DARK, 0.55), mix(t.primary, DARK, 0.22), mix(t.primary, t.secondary, 0.55)],
    glow: t.glow,
    glowOpacity: 0.26,
    hills: [mix(t.secondary, t.primary, 0.45), mix(t.primary, t.secondary, 0.12), mix(t.primary, DARK, 0.32)],
    palms: mix(t.primary, DARK, 0.55),
    foreground: mix(t.primary, DARK, 0.72),
    water: [mix(t.secondary, t.primary, 0.5), mix(t.primary, DARK, 0.58)],
    reflection: 0.3,
    mist: t.tertiary,
    mistOpacity: 0.14,
    shimmer: t.tertiary,
    hull: mix(t.primary, DARK, 0.78),
  },
  night: {
    sky: [mix(t.primary, DARK, 0.78), mix(t.primary, DARK, 0.55), mix(t.primary, DARK, 0.18)],
    glow: t.tertiary,
    glowOpacity: 0.12,
    hills: [mix(t.primary, DARK, 0.3), mix(t.primary, DARK, 0.48), mix(t.primary, DARK, 0.64)],
    palms: mix(t.primary, DARK, 0.75),
    foreground: mix(t.primary, DARK, 0.85),
    water: [mix(t.primary, DARK, 0.4), mix(t.primary, DARK, 0.78)],
    reflection: 0.25,
    mist: t.tertiary,
    mistOpacity: 0.08,
    shimmer: mix(t.tertiary, t.primary, 0.3),
    hull: mix(t.primary, DARK, 0.88),
  },
  dawn: {
    sky: [t.surface, mix(t.surface, t.glow, 0.22), mix(t.surface, t.glow, 0.45)],
    glow: t.glow,
    glowOpacity: 0.6,
    hills: [mix(t.tertiary, t.surface, 0.4), mix(t.secondary, t.tertiary, 0.55), mix(t.secondary, t.primary, 0.2)],
    palms: mix(t.primary, t.secondary, 0.4),
    foreground: mix(t.primary, t.secondary, 0.2),
    water: [mix(t.surface, t.tertiary, 0.45), mix(t.tertiary, t.secondary, 0.25)],
    reflection: 0.2,
    mist: t.surfaceRaised,
    mistOpacity: 0.5,
    shimmer: t.surfaceRaised,
    hull: t.primary,
  },
  day: {
    sky: [t.tertiary, mix(t.tertiary, t.surfaceRaised, 0.5), t.surface],
    glow: t.surfaceRaised,
    glowOpacity: 0.5,
    hills: [mix(t.tertiary, t.secondary, 0.3), mix(t.secondary, t.tertiary, 0.35), t.secondary],
    palms: mix(t.primary, t.secondary, 0.3),
    foreground: t.primary,
    water: [mix(t.tertiary, t.surfaceRaised, 0.3), mix(t.tertiary, t.secondary, 0.35)],
    reflection: 0.2,
    mist: t.surfaceRaised,
    mistOpacity: 0.45,
    shimmer: t.surfaceRaised,
    hull: t.primary,
  },
  evening: {
    sky: [mix(t.primary, DARK, 0.35), mix(t.primary, t.secondary, 0.55), mix(t.glow, t.tertiary, 0.5)],
    glow: t.glow,
    glowOpacity: 0.42,
    hills: [mix(t.secondary, t.primary, 0.35), mix(t.primary, t.secondary, 0.15), mix(t.primary, DARK, 0.35)],
    palms: mix(t.primary, DARK, 0.52),
    foreground: mix(t.primary, DARK, 0.68),
    water: [mix(t.secondary, t.glow, 0.28), mix(t.primary, DARK, 0.45)],
    reflection: 0.28,
    mist: mix(t.tertiary, t.surface, 0.5),
    mistOpacity: 0.16,
    shimmer: mix(t.glow, t.surface, 0.55),
    hull: mix(t.primary, DARK, 0.72),
  },
};

/* Light sources, also from the theme. */
const LIGHT = {
  lampCore: mix(t.glow, t.surfaceRaised, 0.45),
  lamp: t.glow,
  lampStreak: mix(t.glow, t.surfaceRaised, 0.35),
  star: mix(t.tertiary, t.surfaceRaised, 0.5),
  moon: mix(t.tertiary, t.surfaceRaised, 0.65),
  sun: mix(t.glow, t.surfaceRaised, 0.3),
  beacon: t.surface,
};

const W = 1600;
const H = 900;
const WATERLINE = 612;

type Point = [number, number];

function smoothPath(points: Point[]): string {
  let d = `M${int(points[0][0])},${int(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d += ` C${int(p1[0] + (p2[0] - p0[0]) / 6)},${int(p1[1] + (p2[1] - p0[1]) / 6)} ${int(p2[0] - (p3[0] - p1[0]) / 6)},${int(p2[1] - (p3[1] - p1[1]) / 6)} ${int(p2[0])},${int(p2[1])}`;
  }
  return d;
}

function ridge(rand: () => number, base: number, amp: number, freq: number, bottom: number, step = 40): string {
  const phase = [rand(), rand(), rand()].map((v) => v * Math.PI * 2);
  const points: Point[] = [];
  for (let x = -60; x <= W + 60; x += step) {
    const wave =
      0.55 * Math.sin(x * freq + phase[0]) +
      0.3 * Math.sin(x * freq * 2.3 + phase[1]) +
      0.15 * Math.sin(x * freq * 5.1 + phase[2]);
    points.push([x, base - amp * wave]);
  }
  return `${smoothPath(points)} L${W + 60},${bottom} L-60,${bottom} Z`;
}

interface PalmShape {
  trunk: string;
  fronds: string;
  leaflets?: string;
}

function palm(rand: () => number, x: number, baseY: number, height: number, lean: number, detailed = false): PalmShape {
  const topX = x + lean;
  const topY = baseY - height;
  const cx = x + lean * 0.3 + (rand() - 0.5) * height * 0.16;
  const cy = baseY - height * 0.5;
  const wb = Math.max(3, height * 0.05);
  const wt = Math.max(2, height * 0.026);
  const trunk = `M${int(x - wb / 2)},${int(baseY)} Q${int(cx - wb / 2)},${int(cy)} ${int(topX - wt / 2)},${int(topY)} L${int(topX + wt / 2)},${int(topY)} Q${int(cx + wb / 2)},${int(cy)} ${int(x + wb / 2)},${int(baseY)} Z`;

  const angles: number[] = [];
  const count = 8 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i++) angles.push(Math.PI * (1.04 + (i / (count - 1)) * 0.92) + (rand() - 0.5) * 0.22);
  angles.push(Math.PI * 0.86, Math.PI * 0.14); // two older, hanging fronds

  let fronds = "";
  let leaflets = "";
  for (const angle of angles) {
    const len = height * (0.34 + rand() * 0.14);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const droop = dy > 0 ? 0.55 : 0.42;
    const ex = topX + dx * len;
    const ey = topY + dy * len * 0.55 + len * droop;
    const c1x = topX + dx * len * 0.5;
    const c1y = topY + dy * len * 0.75 - len * 0.06;
    // Distant palms read as solid crescents; detailed ones get a thin rib plus leaflets.
    const thick = len * (detailed ? 0.028 : 0.085);
    fronds += `M${int(topX)},${int(topY)} Q${int(c1x)},${int(c1y)} ${int(ex)},${int(ey)} Q${int(c1x)},${int(c1y + thick)} ${int(topX)},${int(topY + thick * 0.35)} Z `;

    if (detailed) {
      for (let t = 0.12; t < 0.97; t += 0.06) {
        const mt = 1 - t;
        const px = mt * mt * topX + 2 * mt * t * c1x + t * t * ex;
        const py = mt * mt * topY + 2 * mt * t * c1y + t * t * ey;
        let tx = 2 * mt * (c1x - topX) + 2 * t * (ex - c1x);
        let ty = 2 * mt * (c1y - topY) + 2 * t * (ey - c1y);
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        // Leaflets sweep forward toward the tip and droop a little, on both sides of the rib.
        const leaf = len * 0.15 * Math.sin(Math.PI * Math.min(1, t * 1.15)) + len * 0.02;
        for (const side of [1, -1]) {
          let lx = tx * 0.75 - ty * side * 0.6;
          let ly = ty * 0.75 + tx * side * 0.6 + 0.45;
          const ll = Math.hypot(lx, ly) || 1;
          lx /= ll;
          ly /= ll;
          leaflets += `M${Math.round(px)},${Math.round(py)}l${Math.round(lx * leaf)},${Math.round(ly * leaf)}`;
        }
      }
    }
  }
  return { trunk, fronds: fronds.trim(), leaflets: detailed ? leaflets : undefined };
}

/* Geometry is shared by every variant: one place, many hours. */
const geometry = (() => {
  const rand = seededRandom(20261122);
  const far = ridge(rand, 432, 58, 0.0031, WATERLINE);
  const mid = ridge(rand, 488, 34, 0.0047, WATERLINE);
  const bank = ridge(rand, 584, 12, 0.011, WATERLINE + 4, 32);

  const palms: PalmShape[] = [];
  const clusters = [60, 230, 390, 560, 700, 1080, 1250, 1430, 1560];
  for (const cx of clusters) {
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const x = cx + (rand() - 0.5) * 90;
      const h = 120 + rand() * 110;
      palms.push(palm(rand, x, 590 + rand() * 10, h, (rand() - 0.45) * h * 0.35));
    }
  }

  const foreground = [
    palm(rand, -20, H + 20, 760, 150, true),
    palm(rand, 90, H + 40, 560, 70, true),
    palm(rand, W + 70, H + 40, 560, -140, true),
  ];

  const shimmer = Array.from({ length: 16 }, () => ({
    x: rand() * W,
    y: WATERLINE + 18 + rand() * 250,
    w: 30 + rand() * 140,
    delay: rand() * 7,
  }));
  const ripples = Array.from({ length: 9 }, () => ({
    x: 120 + rand() * (W - 240),
    y: WATERLINE + 40 + rand() * 230,
    r: 18 + rand() * 30,
    delay: rand() * 3.2,
  }));
  const stars = Array.from({ length: 70 }, () => ({
    x: rand() * W,
    y: rand() * 360,
    r: 0.6 + rand() * 1.3,
    o: 0.25 + rand() * 0.6,
  }));
  const lamps = Array.from({ length: 6 }, (_, i) => ({
    x: 180 + i * 240 + (rand() - 0.5) * 80,
    y: WATERLINE + 34 + rand() * 120,
    s: 0.45 + rand() * 0.35,
  }));
  return { far, mid, bank, palms, foreground, shimmer, ripples, stars, lamps };
})();

const BOAT = { x: 930, y: 676 };

function Boat({ x, y, scale = 1, hull, lampGlowId, lamp = true }: { x: number; y: number; scale?: number; hull: string; lampGlowId: string; lamp?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {lamp ? (
        <>
          <ellipse cx="74" cy="58" rx="8" ry="64" fill={`url(#${lampGlowId}-streak)`} opacity="0.8" />
          <circle cx="74" cy="-30" r="74" fill={`url(#${lampGlowId})`} className="origin-center [transform-box:fill-box] motion-safe:animate-inhale" />
        </>
      ) : null}
      {/* A vallam: long low hull with upturned ends, an arched canopy, and a boatman with his pole. */}
      <path d="M-128,-18 Q-112,-4 -86,-2 Q0,8 88,-2 Q112,-5 128,-20 Q118,-4 100,3 Q0,16 -100,3 Q-118,-2 -128,-18 Z" fill={hull} />
      <path d="M-26,-1 L-26,-13 A30,13 0 0 1 34,-13 L34,-1 Z" fill={hull} />
      <path d="M-76,-2 L-74,-30 Q-71,-37 -66,-30 L-62,-2 Z" fill={hull} />
      <circle cx="-69" cy="-42" r="5.2" fill={hull} />
      <path d="M-96,-74 L-44,36" stroke={hull} strokeWidth="2.2" strokeLinecap="round" />
      {lamp ? (
        <>
          <path d="M74,-2 L74,-24" stroke={hull} strokeWidth="2" />
          <circle cx="74" cy="-30" r="3.8" className="fill-accent-on-dark" />
        </>
      ) : null}
    </g>
  );
}

interface MonsoonSceneProps {
  variant?: SceneVariant;
  /** Rain ripples on the water (dusk and night by default). */
  ripples?: boolean;
  /** A plane's light crossing the night sky (NRI care). */
  plane?: boolean;
  /** Many small lamps on the water (community). */
  lamps?: boolean;
  /** Show the big framing palms in the foreground. */
  foreground?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function MonsoonScene({
  variant = "dusk",
  ripples,
  plane = false,
  lamps = false,
  foreground = true,
  className,
  style,
}: MonsoonSceneProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = PALETTES[variant];
  const id = (name: string) => `${uid}-${name}`;
  const showRipples = ripples ?? (variant === "dusk" || variant === "night");
  const isDawnLike = variant === "dawn" || variant === "day";
  const showStars = variant === "night";
  const sun = variant === "dawn" ? { cx: 700, cy: 404, r: 40 } : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={cn("block h-full w-full", className)}
      style={style}
    >
      <defs>
        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.glow} stopOpacity={p.glowOpacity} />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("water")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.water[0]} />
          <stop offset="1" stopColor={p.water[1]} />
        </linearGradient>
        <radialGradient id={id("mist")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.mist} stopOpacity={p.mistOpacity} />
          <stop offset="1" stopColor={p.mist} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("lamp")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={LIGHT.lampCore} stopOpacity="0.9" />
          <stop offset="0.18" stopColor={LIGHT.lamp} stopOpacity="0.45" />
          <stop offset="1" stopColor={LIGHT.lamp} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("lamp-streak")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={LIGHT.lampStreak} stopOpacity="0.7" />
          <stop offset="1" stopColor={LIGHT.lampStreak} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("fade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id("reflect")} maskUnits="userSpaceOnUse" x="0" y={WATERLINE} width={W} height={H - WATERLINE}>
          <rect x="0" y={WATERLINE} width={W} height="200" fill={`url(#${id("fade")})`} />
        </mask>
      </defs>

      <g data-depth="0">
        <rect width={W} height={H} fill={`url(#${id("sky")})`} />
        {showStars
          ? geometry.stars.map((s, i) => <circle key={i} cx={round(s.x)} cy={round(s.y)} r={round(s.r)} fill={LIGHT.star} opacity={round(s.o)} />)
          : null}
        {variant === "night" ? <circle cx="1240" cy="150" r="20" fill={LIGHT.moon} opacity="0.85" /> : null}
        <ellipse cx={sun ? sun.cx : 800} cy={sun ? sun.cy : 520} rx="620" ry="340" fill={`url(#${id("glow")})`} />
        {sun ? <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill={LIGHT.sun} opacity="0.95" /> : null}
        {isDawnLike ? (
          <g fill="none" stroke={p.palms} strokeWidth="2.2" strokeLinecap="round" opacity="0.7">
            <path d="M980,250 q9,-9 18,0 q9,-9 18,0" />
            <path d="M1040,215 q7,-7 14,0 q7,-7 14,0" />
            <path d="M1100,262 q6,-6 12,0 q6,-6 12,0" />
          </g>
        ) : null}
        {plane ? (
          <g className="motion-safe:animate-plane">
            <circle cx="0" cy="118" r="2.2" fill={LIGHT.beacon} />
            <circle cx="0" cy="118" r="5" fill={LIGHT.lamp} opacity="0.5" className="motion-safe:animate-breathe-quick" />
          </g>
        ) : null}
      </g>

      {/* Shared geometry lives once in <SceneSprite />; each hour only recolours it. */}
      <g data-depth="0.12">
        <use href={`#${SPRITE.far}`} fill={p.hills[0]} />
        <ellipse cx="560" cy="470" rx="560" ry="38" fill={`url(#${id("mist")})`} className="motion-safe:animate-mist" />
      </g>
      <g data-depth="0.25">
        <use href={`#${SPRITE.mid}`} fill={p.hills[1]} />
        <ellipse cx="1150" cy="540" rx="620" ry="34" fill={`url(#${id("mist")})`} className="motion-safe:animate-mist [animation-delay:-14s]" />
      </g>
      <g data-depth="0.4">
        <use href={`#${SPRITE.bank}`} fill={p.hills[2]} />
        <use href={`#${SPRITE.palms}`} fill={p.palms} />
      </g>

      <g data-depth="0.5">
        <rect y={WATERLINE} width={W} height={H - WATERLINE} fill={`url(#${id("water")})`} />
        <g mask={`url(#${id("reflect")})`} opacity={p.reflection}>
          <g transform={`translate(0 ${WATERLINE * 2}) scale(1 -1)`}>
            <use href={`#${SPRITE.bank}`} fill={p.hills[2]} />
            <use href={`#${SPRITE.palms}`} fill={p.palms} />
          </g>
        </g>
        <g fill={p.shimmer}>
          {geometry.shimmer.map((s, i) => (
            <rect
              key={i}
              x={round(s.x)}
              y={round(s.y)}
              width={round(s.w)}
              height="1.6"
              rx="0.8"
              opacity="0.3"
              className="motion-safe:animate-shimmer"
              style={{ animationDelay: `${round(s.delay)}s` }}
            />
          ))}
        </g>
        {showRipples ? (
          <g fill="none" stroke={p.shimmer} strokeWidth="1.2">
            {geometry.ripples.map((r, i) => (
              <ellipse
                key={i}
                cx={round(r.x)}
                cy={round(r.y)}
                rx={round(r.r)}
                ry={round(r.r * 0.22)}
                opacity="0"
                className="origin-center [transform-box:fill-box] motion-safe:animate-ripple"
                style={{ animationDelay: `${round(r.delay)}s` }}
              />
            ))}
          </g>
        ) : null}
      </g>

      <g data-depth="0.65">
        {lamps
          ? geometry.lamps.map((l, i) => (
              <Boat key={i} x={round(l.x)} y={round(l.y)} scale={round(l.s)} hull={p.hull} lampGlowId={id("lamp")} />
            ))
          : null}
        <Boat x={BOAT.x} y={BOAT.y} hull={p.hull} lampGlowId={id("lamp")} />
      </g>

      {foreground ? (
        <g data-depth="1">
          <use href={`#${SPRITE.foreground}`} fill={p.foreground} stroke={p.foreground} />
        </g>
      ) : null}
    </svg>
  );
}

const SPRITE = {
  far: "ullidam-scene-far",
  mid: "ullidam-scene-mid",
  bank: "ullidam-scene-bank",
  palms: "ullidam-scene-palms",
  foreground: "ullidam-scene-foreground",
} as const;

/**
 * The backwater's geometry, defined once per page in the root layout. Every
 * <MonsoonScene /> references it with <use>, so the same hills and palms are
 * never sent twice, and client-side navigation never re-sends them at all.
 * Colours are inherited from each <use>, which is why no fills appear here.
 */
export function SceneSprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
      <defs>
        <path id={SPRITE.far} d={geometry.far} />
        <path id={SPRITE.mid} d={geometry.mid} />
        <path id={SPRITE.bank} d={geometry.bank} />
        <path id={SPRITE.palms} d={geometry.palms.map((palmShape) => `${palmShape.trunk} ${palmShape.fronds}`).join(" ")} />
        <g id={SPRITE.foreground}>
          <path stroke="none" d={geometry.foreground.map((palmShape) => `${palmShape.trunk} ${palmShape.fronds}`).join(" ")} />
          <path
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            d={geometry.foreground.map((palmShape) => palmShape.leaflets ?? "").join("")}
          />
        </g>
      </defs>
    </svg>
  );
}
