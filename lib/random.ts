/**
 * Seeded pseudo-random generator (mulberry32). Generated artwork uses it so
 * the same seed always draws the same landscape, on every render.
 */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rounds coordinates so generated SVG paths stay compact. */
export const round = (value: number) => Math.round(value * 10) / 10;
