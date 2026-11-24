"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/data/photos";
import { cn } from "@/lib/cn";

const SRC = PHOTOS.palmShadow.src;

/** Where the two fronds fall: sized by height on the one-screen stage, by width on long lists. */
const LAYOUT = {
  stage: {
    first: "-top-[18%] -left-[7%] h-[118%]",
    second: "-right-[9%] -bottom-[26%] h-[92%]",
    sizes: "34vw",
  },
  list: {
    first: "-top-16 -left-[22%] w-[78%] max-w-md",
    second: "top-[38%] -right-[26%] w-[78%] max-w-md",
    sizes: "78vw",
  },
} as const;

/**
 * The shadow of a palm frond falling across the section from either side,
 * swaying slowly in the morning light. One small image (lazy, used twice),
 * CSS transform/opacity animation only, paused while off screen. Each frond
 * multiplies over this layer's own page-coloured ground, so the photo's white
 * wall disappears and only the shadow remains. Place inside a positioned,
 * isolated parent.
 */
export function PalmShade({ variant = "stage" }: { variant?: keyof typeof LAYOUT }) {
  const root = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(true);
  const layout = LAYOUT[variant];

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), { rootMargin: "100px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-paused={paused}
      className="pointer-events-none absolute inset-0 -z-10 isolate overflow-hidden bg-canvas"
    >
      <div className={cn("palm-frond absolute aspect-[1100/1956] mix-blend-multiply", layout.first)}>
        <Image src={SRC} alt="" fill sizes={layout.sizes} quality={60} className="object-cover" />
      </div>
      {/* Mirrored; the blend sits on this outer layer because the flip makes it its own group. */}
      <div className={cn("absolute aspect-[1100/1956] -scale-x-100 mix-blend-multiply", layout.second)}>
        <div className="palm-frond palm-frond-late absolute inset-0">
          <Image src={SRC} alt="" fill sizes={layout.sizes} quality={60} className="object-cover" />
        </div>
      </div>
    </div>
  );
}
