/**
 * Editorial photographs, served from /public/photos.
 *
 * Source: Pexels (pexels.com/license: free for commercial use, no attribution
 * required). They are stand-ins until the practice has its own photography;
 * the people shown are not Ullidam clients or clinicians, so never caption or
 * describe them as such. To swap one, replace the file and keep its name, or
 * point `src` at a new file and update `alt` and `position`.
 *
 * `position` is the CSS object-position that keeps the subject in frame when
 * a landscape photograph is cropped into a portrait arch.
 */
export interface Photo {
  src: string;
  alt: string;
  position?: string;
  /** Pexels photo id, for tracing the licence. */
  pexelsId: number;
}

export const PHOTOS = {
  individual: {
    src: "/photos/track-individual-session.jpg",
    alt: "A counsellor listens to a client in a calm, light room.",
    position: "60% 40%",
    pexelsId: 14797769,
  },
  psychiatry: {
    src: "/photos/track-psychiatry.jpg",
    alt: "A doctor smiles while talking with a patient across a bright desk.",
    position: "40% 50%",
    pexelsId: 7579831,
  },
  couples: {
    src: "/photos/track-couples.jpg",
    alt: "A couple sit on the floor by a window, talking over cups of coffee.",
    position: "55% 50%",
    pexelsId: 4307726,
  },
  divorce: {
    src: "/photos/track-divorce.jpg",
    alt: "A woman sits by a window in soft light, looking out at the city.",
    position: "62% 50%",
    pexelsId: 4383361,
  },
  services: {
    src: "/photos/page-services.jpg",
    alt: "Two people talk in wooden armchairs in a bright room with tall windows.",
    position: "8% 50%",
    pexelsId: 4101137,
  },
  diaspora: {
    src: "/photos/page-diaspora.jpg",
    alt: "A woman talks warmly to someone on a video call from her laptop.",
    position: "35% 50%",
    pexelsId: 9159663,
  },
  awareness: {
    src: "/photos/page-awareness.jpg",
    alt: "A small group sit in a circle of chairs, listening to one another.",
    position: "55% 50%",
    pexelsId: 7579174,
  },
  internships: {
    src: "/photos/page-internships.jpg",
    alt: "A student reads a textbook between library shelves.",
    position: "68% 50%",
    pexelsId: 16461275,
  },
  careers: {
    src: "/photos/page-careers.jpg",
    alt: "A psychologist sits at a round table with a notebook, deep in thought.",
    position: "58% 50%",
    pexelsId: 5699472,
  },
  guide: {
    src: "/photos/page-guide.jpg",
    alt: "A glass cup of tea beside an open notebook and a pencil.",
    position: "30% 50%",
    pexelsId: 9907955,
  },
  trust: {
    src: "/photos/home-trust.jpg",
    alt: "An empty white chair by a sunlit window with sheer curtains.",
    position: "50% 72%",
    pexelsId: 4377192,
  },
  journey: {
    src: "/photos/home-journey.jpg",
    alt: "A soft armchair beside potted plants in a sunlit corner.",
    position: "50% 50%",
    pexelsId: 16269026,
  },
  stepChoose: {
    src: "/photos/step-choose.jpg",
    alt: "A woman in a chair by a green wall, browsing on her phone.",
    position: "50% 40%",
    pexelsId: 4307697,
  },
  stepTimes: {
    src: "/photos/step-times.jpg",
    alt: "A hand marking a date on a desk calendar beside a cup of coffee.",
    position: "60% 50%",
    pexelsId: 5408684,
  },
  stepConfirm: {
    src: "/photos/step-confirm-counsellor.jpg",
    alt: "A smiling counsellor in glasses and a blazer, writing notes at her desk.",
    position: "64% 30%",
    pexelsId: 8190808,
  },
  closing: {
    src: "/photos/home-closing.jpg",
    alt: "Calm backwaters in Kerala, lined with palm trees and reflecting the light.",
    position: "50% 62%",
    pexelsId: 29988973,
  },
} as const satisfies Record<string, Photo>;
