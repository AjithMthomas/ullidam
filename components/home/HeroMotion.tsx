"use client";

import { useRef, type ReactNode } from "react";
import { RainCanvas } from "@/components/scene/RainCanvas";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

/**
 * The hero frame: the dusk scene, live rain, and scroll parallax. As the
 * visitor scrolls away, each scene layer drifts at its own depth and the
 * story text lifts and fades, handing over to Act II.
 */
export function HeroMotion({ scene, children }: { scene: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const frame = root.current;
        if (!frame) return;
        const scrub = { trigger: frame, start: "top top", end: "bottom top", scrub: true };
        gsap.utils.toArray<SVGGElement>("[data-depth]", frame).forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? 0);
          gsap.to(layer, { y: depth * 140, ease: "none", scrollTrigger: scrub });
        });
        gsap.to("[data-hero-copy]", { y: -90, opacity: 0, ease: "none", scrollTrigger: { ...scrub, end: "60% top" } });
        gsap.to("[data-hero-dim]", { opacity: 0.55, ease: "none", scrollTrigger: scrub });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="relative h-screen min-h-[680px] w-full overflow-hidden bg-night"
    >
      <div className="absolute inset-0">{scene}</div>
      <RainCanvas className="absolute inset-0" />
      {/* Legibility: a soft vignette behind the words, darker toward the story below. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_10%_10%,color-mix(in_oklab,var(--theme-night)_72%,transparent),transparent_60%)]" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-night/70" />
      <div data-hero-dim aria-hidden="true" className="absolute inset-0 bg-night opacity-0" />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
