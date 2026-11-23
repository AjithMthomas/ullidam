import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot read the CSS @theme, so custom tokens are registered
 * here. Without this, `text-display` would be mistaken for a text colour and
 * silently dropped when merged with `text-brand`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["hero", "display", "headline", "title", "lead"],
      shadow: ["card", "float", "badge"],
      animate: [
        "breathe",
        "breathe-quick",
        "inhale",
        "rise",
        "line-up",
        "mist",
        "shimmer",
        "ripple",
        "plane",
        "marquee",
        "eq",
        "cue",
      ],
      ease: ["calm"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
