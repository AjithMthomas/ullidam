import type { Transition } from "motion/react";

/**
 * Spring presets for component interactions (Motion, imported from "motion/react").
 * The scroll-driven homepage film stays on GSAP; use these for buttons, cards,
 * menus, dialogs and reveals. Reduced motion is handled once, globally, by
 * <MotionProvider> in the root layout.
 */

/** Editorial and unhurried: text, cards, section reveals. */
export const springCalm = { type: "spring", stiffness: 120, damping: 20 } as const satisfies Transition;

/** Quick and settled: buttons, toggles, tabs, anything the hand touches. */
export const springSnappy = { type: "spring", stiffness: 300, damping: 30 } as const satisfies Transition;

/** Slow, weighty: scene reveals and large imagery. */
export const springCinematic = { type: "spring", stiffness: 40, damping: 15 } as const satisfies Transition;
