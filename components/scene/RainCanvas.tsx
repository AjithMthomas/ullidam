"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { theme } from "@/theme";

// Raindrops take the theme's tertiary colour (see theme.ts).
const RAIN_RGB = [1, 3, 5].map((i) => parseInt(theme.tertiary.slice(i, i + 2), 16)).join(", ");

export interface RainControl {
  /** 0 (dry) to 1 (full monsoon). Scroll timelines tween this value. */
  intensity: number;
}

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  layer: 0 | 1 | 2;
}

// Far, middle and near rain: fainter, shorter and slower with distance.
const LAYERS = [
  { alpha: 0.16, width: 0.8, speed: [380, 520], length: [7, 12] },
  { alpha: 0.26, width: 1, speed: [640, 820], length: [13, 20] },
  { alpha: 0.38, width: 1.35, speed: [940, 1180], length: [22, 32] },
] as const;
const WIND = 0.16;

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min);

/**
 * Live monsoon rain over a scene. Pauses off screen and in background tabs,
 * draws fewer drops on small screens, and never runs for reduced motion.
 */
export function RainCanvas({ control, className }: { control?: { current: RainControl }; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let drops: Drop[] = [];
    let frame = 0;
    let last = 0;
    let visible = true;

    const spawn = (drop: Partial<Drop> = {}): Drop => {
      const layer = (Math.random() < 0.45 ? 0 : Math.random() < 0.65 ? 1 : 2) as Drop["layer"];
      return {
        x: Math.random() * (width + 120) - 60,
        y: Math.random() * -height,
        layer,
        length: between(LAYERS[layer].length),
        speed: between(LAYERS[layer].speed),
        ...drop,
      };
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(260, Math.max(56, (width * height) / 6500)));
      drops = Array.from({ length: count }, () => spawn({ y: Math.random() * height }));
    };

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      const intensity = control?.current.intensity ?? 1;
      ctx.clearRect(0, 0, width, height);
      if (intensity <= 0.01) return;
      const active = Math.round(drops.length * intensity);
      ctx.lineCap = "round";
      for (let layer = 0; layer < 3; layer++) {
        const style = LAYERS[layer];
        ctx.strokeStyle = `rgba(${RAIN_RGB}, ${style.alpha * (0.45 + 0.55 * intensity)})`;
        ctx.lineWidth = style.width;
        ctx.beginPath();
        for (let i = 0; i < active; i++) {
          const drop = drops[i];
          if (drop.layer !== layer) continue;
          drop.y += drop.speed * dt;
          drop.x += drop.speed * WIND * dt;
          if (drop.y - drop.length > height || drop.x > width + 60) drops[i] = spawn();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - drop.length * WIND, drop.y - drop.length);
        }
        ctx.stroke();
      }
    };

    const run = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", run);
    resize();
    run();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, [control]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none block h-full w-full", className)} />;
}
