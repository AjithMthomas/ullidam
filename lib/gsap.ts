"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { claimRaf, getLenis, watchLenis } from "./smooth";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Mobile browsers resize the viewport as the address bar hides; ignoring that
// keeps pinned scenes from jumping mid-story.
ScrollTrigger.config({ ignoreMobileResize: true });

// One clock: GSAP's ticker drives Lenis, so smooth scrolling and pinned scenes
// never drift apart. Lag smoothing off, or a slow frame would jolt the scrub.
claimRaf();
gsap.ticker.add((time) => getLenis()?.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Keep scroll-linked scenes in step with Lenis smooth scrolling whenever it runs.
let detach: (() => void) | undefined;
watchLenis((lenis) => {
  detach?.();
  detach = lenis ? lenis.on("scroll", ScrollTrigger.update) : undefined;
});

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, useGSAP };
