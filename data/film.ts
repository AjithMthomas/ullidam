/**
 * The homepage opening (components/film/FilmHero.tsx): "Here, Now".
 *
 * Three sharp, high-resolution photographs (3000 px wide, served as AVIF/WebP
 * by next/image). The camera comes down from the wide morning view to the
 * present moment, the way grounding works in therapy:
 *   1. Pexels photo 37183183: morning sun through the trees at a forest edge.
 *   2. Pexels photo 16630712: grass at ground level, the sun rising between trees.
 *   3. Pexels photo 2957860: dew on grass glowing in morning light.
 * Pexels licence: free for commercial use, no attribution required.
 */
export const FILM = {
  shots: [
    {
      key: "wide",
      src: "/photos/hero-forest-light.jpg",
      alt: "Morning sunlight filtering through the trees at the edge of a quiet forest.",
      /** The camera moves toward this point. */
      focus: "40% 72%",
      position: "40% 50%",
    },
    {
      key: "ground",
      src: "/photos/hero-lawn-sun.jpg",
      alt: "Grass at ground level, sunlit, with the morning sun rising between the trees.",
      focus: "72% 12%",
      position: "60% 40%",
    },
    {
      key: "drop",
      src: "/photos/hero-dew.jpg",
      alt: "Dew drops on blades of grass, glowing in soft morning light.",
      focus: "50% 50%",
      position: "50% 50%",
    },
  ],
} as const;

export const FILM_COPY = {
  title: "A calm space for your mind.",
  lead: "Confidential online counselling and psychiatric care, in Malayalam and English.",
  /** One short line per photograph; `light` lines sit over darker frames. */
  lines: [
    { text: "Slow down for a moment.", light: true },
    { text: "Come back to where you are.", light: true },
    { text: "This is your space within.", light: false },
  ],
  /** Under reduced motion the three lines read as one sentence. */
  still: "Slow down for a moment. Come back to where you are: this is your space within.",
} as const;
