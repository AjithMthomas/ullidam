import type { TrackId } from "./services";

export interface Therapist {
  id: string;
  slug: string;
  name: string;
  title: string;
  license: string; // Official RCI / MCI registration code
  experienceYears: number;
  rating: number; // Displayed numerically: 4.97 / 5.0 (Zero-Emoji)
  reviewCount: number;
  languages: string[];
  trackFocus: TrackId[];
  specialties: string[];
  modalities: string[];
  availabilityStatus: "open" | "fast" | "gone"; // Powers StatusPulse
  nextAvailableText: string;
  bio: string;
  approach: string;
  firstSessionGuide: string;
  education: string[];
  image: string; // Unsplash placeholder, hot-swappable
  voiceIntroAudio?: string; // Path in public/audio/intros/
}

/**
 * Dummy faculty from the master specification. Replace names, credentials
 * and photos here; no UI code needs to change.
 */
export const THERAPISTS: Therapist[] = [
  {
    id: "ananya-menon",
    slug: "dr-ananya-menon",
    name: "Dr. Ananya Menon",
    title: "Senior Consultant Clinical Psychologist",
    license: "RCI-CRR-A84920",
    experienceYears: 11,
    rating: 4.97,
    reviewCount: 340,
    languages: ["Malayalam", "English", "Hindi"],
    trackFocus: ["individual"],
    specialties: ["Anxiety & Panic", "Workplace Burnout", "Health Anxiety", "OCD"],
    modalities: [
      "Cognitive Behavioural Therapy (CBT)",
      "Mindfulness-Based Cognitive Therapy (MBCT)",
      "Exposure & Response Prevention (ERP)",
    ],
    availabilityStatus: "open",
    nextAvailableText: "Available Today",
    bio: "Specializing in adult individual psychotherapy, Dr. Ananya combines structured CBT with warm, culturally grounded empathy for working professionals in Kerala and the diaspora.",
    approach:
      "Therapy with me is a collaborative laboratory where we map cognitive triggers and build measurable behavioural resilience.",
    firstSessionGuide:
      "We map your primary distress triggers, establish safety anchors, and draft a tailored 6-week roadmap without judgment.",
    education: ["Ph.D. Clinical Psychology — NIMHANS Bangalore", "M.Sc. Clinical Psychology — Manipal Academy"],
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "akash-mohan",
    slug: "akash-mohan",
    name: "Akash Mohan",
    title: "Licensed Clinical Psychologist (M.Phil)",
    license: "RCI-CRR-B71204",
    experienceYears: 7,
    rating: 4.94,
    reviewCount: 215,
    languages: ["Malayalam", "English"],
    trackFocus: ["individual"],
    specialties: ["Men's Mental Health", "Adult ADHD", "Identity & Life Transitions", "Depression"],
    modalities: [
      "Acceptance & Commitment Therapy (ACT)",
      "Behavioural Activation",
      "Compassion-Focused Therapy",
    ],
    availabilityStatus: "open",
    nextAvailableText: "Available Tomorrow",
    bio: "Akash specializes in helping men and young adults navigate emotional vulnerability, career stagnation, and adult neurodivergence in a shame-free space.",
    approach:
      "We strip away therapeutic jargon and look honestly at what is holding you back, developing practical, value-aligned behavioural steps.",
    firstSessionGuide:
      "We examine your life baseline, clarify core values, and address how ADHD or depressive patterns interfere with what matters most.",
    education: ["M.Phil Clinical Psychology — IMHANS Calicut", "M.Sc. Psychology — University of Calicut"],
    // The spec's placeholder (photo-1534528741775) shows a woman; swapped for a male portrait.
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "sneha-varghese",
    slug: "sneha-varghese",
    name: "Sneha Varghese",
    title: "Senior Consultant Psychotherapist — Couples & Families",
    license: "RCI-CRR-S90118",
    experienceYears: 13,
    rating: 4.99,
    reviewCount: 480,
    languages: ["Malayalam", "English", "Tamil"],
    trackFocus: ["couples", "divorce"],
    specialties: [
      "Couples & Marital Therapy",
      "Pre-Divorce & Divorce Adjustment",
      "Premarital Counselling",
      "Family Conflict",
    ],
    modalities: [
      "Gottman Method (Level 2 Trained)",
      "Emotion-Focused Therapy (EFT)",
      "Systemic Family Therapy",
    ],
    availabilityStatus: "fast",
    nextAvailableText: "Filling Fast (2 Slots Left)",
    bio: "A veteran relationship therapist leading Ullidam’s Couple and Pre-Divorce/Divorce counselling division, helping partners de-escalate crisis and rebuild self-worth.",
    approach:
      "In relationship work, the dynamic itself is my focus. I illuminate toxic cycles and guide either healthy repair or compassionate separation.",
    firstSessionGuide:
      "A structured relationship audit examining conflict cycles, repair attempts, and emotional safety.",
    education: ["M.Phil Psychiatric Social Work — NIMHANS", "Gottman Clinical Training Institute Level 2"],
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dr-arun-kallada",
    slug: "dr-arun-kallada",
    name: "Dr. Arun Kallada",
    title: "Consultant Psychiatrist & Neuropsychology Lead",
    license: "MCI-KMC-41982",
    experienceYears: 15,
    rating: 4.98,
    reviewCount: 520,
    languages: ["Malayalam", "English", "Hindi"],
    trackFocus: ["psychiatry"],
    specialties: [
      "Psychiatric Consultation",
      "Medication Management",
      "Clinical Depression",
      "Complex Trauma & PTSD",
      "Insomnia",
    ],
    modalities: ["Neurobiological Assessment", "Pharmacotherapy", "EMDR (Trained)", "Sleep Architecture CBT-I"],
    availabilityStatus: "open",
    nextAvailableText: "Available in 2 Days",
    bio: "Dr. Arun leads Ullidam’s Psychiatric Services, providing medical evaluations, diagnostic assessments, and evidence-informed medication management.",
    approach:
      "We look at the brain and body as an integrated electrical and emotional circuit, combining careful medical oversight with psychotherapeutic support.",
    firstSessionGuide:
      "A comprehensive medical, psychiatric, and sleep evaluation to identify biological contributors before mapping medication or therapy.",
    education: ["MD Psychiatry — Govt Medical College Trivandrum", "Fellowship in Neuropsychiatry — London UK"],
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800",
  },
];

export function therapistsForTrack(track: TrackId): Therapist[] {
  return THERAPISTS.filter((therapist) => therapist.trackFocus.includes(track));
}

/** Practice-wide figures derived from the faculty data, so they never drift. */
export function getPracticeStats() {
  const totalReviews = THERAPISTS.reduce((sum, t) => sum + t.reviewCount, 0);
  const weightedRating =
    THERAPISTS.reduce((sum, t) => sum + t.rating * t.reviewCount, 0) / totalReviews;
  return {
    averageRating: weightedRating,
    totalReviews,
    acceptingCount: THERAPISTS.filter((t) => t.availabilityStatus !== "gone").length,
  };
}
