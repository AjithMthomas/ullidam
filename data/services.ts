import { PHOTOS, type Photo } from "./photos";
import type { Route } from "next";

export type TrackId = "individual" | "psychiatry" | "couples" | "divorce";

export interface ServiceOffering {
  title: string;
  description: string;
}

export interface JourneyPhase {
  step: string;
  title: string;
  description: string;
}

export interface ServiceTrack {
  id: TrackId;
  letter: "A" | "B" | "C" | "D";
  href: Route;
  name: string;
  navLabel: string;
  audience: string;
  summary: string;
  focusAreas: string[];
  photo: Photo;
  offerings: ServiceOffering[];
  /** Track D only: the three-phase clinical journey. */
  phases?: JourneyPhase[];
}

/** ULLIDAM's four clinical service tracks. */
export const SERVICE_TRACKS: readonly ServiceTrack[] = [
  {
    id: "individual",
    letter: "A",
    href: "/services/individual",
    name: "Individual Counselling and Therapy",
    navLabel: "Individual therapy (18+)",
    audience: "Adults aged 18 and above",
    summary:
      "One-to-one sessions for adults carrying anxiety, low mood, burnout or a difficult transition. We work at your pace, with approaches proven to help.",
    focusAreas: ["Anxiety & panic", "Depression & low mood", "Burnout", "Trauma", "Life transitions"],
    photo: PHOTOS.individual,
    offerings: [
      {
        title: "Individual counselling",
        description: "A confidential space to untangle what you feel and find your footing again.",
      },
      {
        title: "Evidence-informed psychotherapy",
        description: "Structured approaches such as CBT and ACT, tailored to you and reviewed as you progress.",
      },
      {
        title: "Emotional regulation",
        description: "Practical skills for overwhelm, panic, anger and the nights that feel too long.",
      },
      {
        title: "Life and career transitions",
        description: "Support through change, loss of direction and questions of meaning and identity.",
      },
    ],
  },
  {
    id: "psychiatry",
    letter: "B",
    href: "/services/psychiatry",
    name: "Psychiatric Services",
    navLabel: "Psychiatric care",
    audience: "Adults who need medical evaluation",
    summary:
      "Medical evaluation, diagnosis and medication management with a consultant psychiatrist. Unhurried consultations, clear explanations and steady follow-up.",
    focusAreas: ["Clinical depression", "Severe anxiety", "Bipolar spectrum", "Complex trauma & PTSD", "Insomnia & sleep"],
    photo: PHOTOS.psychiatry,
    offerings: [
      {
        title: "Psychiatric consultation",
        description: "A careful conversation about your symptoms, your history and what you hope will change.",
      },
      {
        title: "Diagnostic evaluation",
        description: "A structured assessment of what is happening, explained in plain language.",
      },
      {
        title: "Medication management",
        description: "Thoughtful prescribing, reviewed regularly, with your questions always welcome.",
      },
      {
        title: "Follow-up care",
        description: "Continuity over months, not a single appointment, coordinated with your therapist.",
      },
    ],
  },
  {
    id: "couples",
    letter: "C",
    href: "/services/couples",
    name: "Couple and Relationship Counselling",
    navLabel: "Couples & relationships",
    audience: "Engaged, married and committed partners",
    summary:
      "For engaged couples, married partners and relationships under strain. We help you see the pattern between you, and find a way back to each other.",
    focusAreas: ["Communication", "Recurring conflict", "Intimacy & trust", "Joint-family pressure", "Long-distance strain"],
    photo: PHOTOS.couples,
    offerings: [
      {
        title: "Premarital counselling",
        description: "Align values, finances, family boundaries and ways of communicating before marriage.",
      },
      {
        title: "Marital counselling",
        description: "Resolve recurring conflict, heal ruptures in intimacy and navigate joint-family pressure.",
      },
      {
        title: "Relationship counselling",
        description: "Reconnect emotionally and rebuild trust, whatever stage your relationship is in.",
      },
      {
        title: "Cross-cultural and NRI couples",
        description: "Support for long-distance strain between Kerala and the Gulf, and for couples across cultures.",
      },
    ],
  },
  {
    id: "divorce",
    letter: "D",
    href: "/services/divorce",
    name: "Pre-divorce and Divorce Counselling",
    navLabel: "Pre-divorce & divorce",
    audience: "Individuals and couples facing separation",
    summary:
      "Separation is one of life’s most painful crossroads. Whether you are still deciding, in the middle of proceedings or rebuilding after, you do not have to carry it alone.",
    focusAreas: ["Decision-making", "Legal stress", "Family & social stigma", "Co-parenting", "Grief & self-worth"],
    photo: PHOTOS.divorce,
    offerings: [
      {
        title: "Clarity sessions",
        description: "Space to understand your ambivalence and whether repair is possible, before any legal step.",
      },
      {
        title: "Support through proceedings",
        description: "Steadiness through legal stress, panic and the weight of what others will say.",
      },
      {
        title: "Co-parenting guidance",
        description: "Child-centred strategies that protect your children through the transition.",
      },
      {
        title: "Post-divorce adjustment",
        description: "Healing grief and shame, and rebuilding identity, confidence and autonomy.",
      },
    ],
    phases: [
      {
        step: "Before",
        title: "Pre-divorce clarity",
        description:
          "Unhurried sessions to understand your ambivalence, set boundaries and decide whether repair is possible, before any irreversible step.",
      },
      {
        step: "During",
        title: "Through the process",
        description:
          "Support for legal stress, family and societal stigma, and child-centred co-parenting while proceedings unfold.",
      },
      {
        step: "After",
        title: "Rebuilding yourself",
        description:
          "Healing grief and shame, restoring self-worth and growing into a life that feels like your own again.",
      },
    ],
  },
];

export function getTrack(id: TrackId): ServiceTrack {
  const track = SERVICE_TRACKS.find((candidate) => candidate.id === id);
  if (!track) throw new Error(`Unknown service track: ${id}`);
  return track;
}
