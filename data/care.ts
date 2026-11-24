import type { Route } from "next";

/**
 * /services: plain-language explanations of the three kinds of care, and the
 * charter objectives that reach beyond one-to-one care
 * (docs/specs/services-redesign.md). Wording stays factual: no outcomes promised.
 */
export const CARE_KINDS = [
  {
    title: "Counselling",
    body: "A confidential conversation with a trained professional about what is happening now: to find clarity, steady yourself and work out next steps.",
    helps: "a hard season, a decision, stress, grief, or a relationship under strain.",
  },
  {
    title: "Psychotherapy",
    body: "Deeper, structured work on patterns that keep returning, using evidence-informed approaches such as CBT, ACT, EFT and the Gottman Method.",
    helps: "anxiety, low mood, trauma or habits that have lasted a long time.",
  },
  {
    title: "Psychiatric care",
    body: "Care from a medical doctor: assessment, diagnosis, medication when it is needed, and regular follow-up. It often works alongside therapy.",
    helps: "symptoms are severe or long-lasting, sleep or daily life is badly affected, or medication may help.",
  },
] as const;

export const BEYOND_THERAPY: readonly { title: string; body: string; href: Route; cta: string }[] = [
  {
    title: "Mental health awareness",
    body: "Workshops, seminars and psychoeducation for colleges, workplaces and communities.",
    href: "/awareness",
    cta: "Awareness programmes",
  },
  {
    title: "Internship and training",
    body: "Supervised practical exposure for psychology students and early-career professionals.",
    href: "/internships",
    cta: "Internships",
  },
  {
    title: "Community outreach",
    body: "Mental health literacy and wider access to care, especially where “what will people think?” keeps people silent.",
    href: "/awareness",
    cta: "Outreach",
  },
];

export const GOOD_TO_KNOW = [
  { label: "Who we see", value: "Adults 18 and over" },
  { label: "Sessions", value: "Video or audio call" },
  { label: "Language", value: "Malayalam, English or a mix" },
  { label: "Privacy", value: "Confidential, no clinic visit" },
] as const;
