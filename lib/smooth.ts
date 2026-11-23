"use client";

import type Lenis from "lenis";

/**
 * A tiny registry for the active Lenis instance, so animation code that only
 * some pages load (GSAP on the homepage) can sync to smooth scrolling without
 * the layout having to import GSAP on every page.
 */
let current: Lenis | null = null;
const watchers = new Set<(lenis: Lenis | null) => void>();

/** Once GSAP loads it drives Lenis from its own ticker, so both share one clock. */
let rafClaimed = false;

export function setLenis(lenis: Lenis | null) {
  current = lenis;
  watchers.forEach((watch) => watch(lenis));
}

export function getLenis(): Lenis | null {
  return current;
}

export function watchLenis(watch: (lenis: Lenis | null) => void): () => void {
  watchers.add(watch);
  watch(current);
  return () => watchers.delete(watch);
}

export function claimRaf() {
  rafClaimed = true;
}

export function isRafClaimed() {
  return rafClaimed;
}
