"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { isRafClaimed, setLenis } from "@/lib/smooth";

/**
 * Weighted momentum scrolling (Lenis). Touch scrolling stays native, and it
 * switches off entirely when reduced motion is requested. Pages with scroll
 * scenes sync GSAP to it through lib/smooth, so GSAP loads only where used.
 * Lenis runs on this component's frame loop until GSAP claims it and drives
 * it from the GSAP ticker instead (one clock for scrolling and scenes).
 */
export function SmoothScroll() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;

    const loop = (time: number) => {
      if (lenis && !isRafClaimed()) lenis.raf(time);
      frame = requestAnimationFrame(loop);
    };

    const sync = () => {
      if (media.matches && lenis) {
        lenis.destroy();
        lenis = null;
        setLenis(null);
      } else if (!media.matches && !lenis) {
        lenis = new Lenis({ autoRaf: false, lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -96 } });
        setLenis(lenis);
      }
    };

    sync();
    frame = requestAnimationFrame(loop);
    media.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", sync);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
