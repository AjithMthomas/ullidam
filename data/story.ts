/**
 * "Head Above Water": the homepage story (docs/cinematic-script.md).
 *
 * REPLACING THE PORTRAITS: put your two matched portraits in /public/story/
 * (plain portraits, NO water: the water is drawn live) and point `src` below
 * at them, e.g. "/story/under-wide.avif". Then adjust `eyes` and `chin` so the
 * water line starts across the eyes and ends below the chin.
 *
 * Until then a single Unsplash portrait stands in for both moments; the
 * story still works through colour, water and light.
 */
const PLACEHOLDER = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2000";

export interface StoryImage {
  src: string;
  width: number;
  height: number;
}

export interface StoryFrame {
  /** CSS object-position for this crop. */
  position: string;
  /** Screen height (%) where the eyes sit: the water starts here. */
  eyes: number;
  /** Screen height (%) just below the chin: the water ends here. */
  chin: number;
}

export const STORY_IMAGES = {
  /** Weary, eyes downcast or closed. */
  under: {
    wide: { src: PLACEHOLDER, width: 2000, height: 3000 } satisfies StoryImage,
    tall: { src: PLACEHOLDER, width: 2000, height: 3000 } satisfies StoryImage,
    alt: "A woman's face, half under still water, eyes hidden beneath the surface.",
  },
  /** Same person: eyes open, a soft smile, warm light. */
  above: {
    wide: { src: PLACEHOLDER, width: 2000, height: 3000 } satisfies StoryImage,
    tall: { src: PLACEHOLDER, width: 2000, height: 3000 } satisfies StoryImage,
    alt: "The same woman, now with her head above the water, calm and at ease in soft morning light.",
  },
  frame: {
    wide: { position: "50% 22%", eyes: 54, chin: 84 } satisfies StoryFrame,
    tall: { position: "50% 26%", eyes: 50, chin: 76 } satisfies StoryFrame,
  },
} as const;

export const STORY_COPY = {
  under: { en: "Some days, it’s hard to see clearly.", ml: "" },
  breathe: { en: "You don’t have to carry this alone.", ml: "" },
  clear: { en: "Clarity returns, gently.", ml: "" },
  arrival: {
    title: "A calm space for your mind.",
    lead: "Confidential counselling, psychotherapy and psychiatric care, in Malayalam and English. No waiting rooms, no logins, and no one else needs to know.",
  },
} as const;

/** Worries that surface in the mist, then dissolve. Positions are % of the screen. */
export const STORY_WORRIES = [
  { text: "What will people think?", x: 12, y: 30 },
  { text: "Will anyone understand?", x: 62, y: 24 },
  { text: "I should manage alone.", x: 66, y: 62 },
  { text: "Not now. Maybe later.", x: 8, y: 68 },
  { text: "I can’t sleep again.", x: 38, y: 82 },
] as const;

export const STORY_CHAPTERS = ["Under", "Mist", "Breathe", "Clear"] as const;
