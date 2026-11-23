import { SESSION_LENGTH_NOTE } from "./session";

/**
 * Things people often say when they first reach out. Deliberately NOT
 * testimonials: these are common first-session reflections, written to help
 * visitors feel less alone, and must never be presented as client reviews.
 * (Indian medical conduct rules also restrict testimonial advertising.)
 */
export const FIRST_WORDS = [
  "I kept thinking my problems weren’t serious enough for therapy.",
  "I didn’t want anyone at home to know I was looking for help.",
  "I’ve lived abroad for years, but I still think in Malayalam when I’m upset.",
  "We stopped talking about anything except the children.",
  "I wasn’t sure if I needed a therapist or a psychiatrist.",
  "Everyone kept asking what people would think. I just wanted to feel like myself again.",
] as const;

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: readonly FaqItem[] = [
  {
    question: "Is everything I share confidential?",
    answer:
      "Yes. What you share stays with your clinician. The only exception is a serious risk to your safety or someone else’s, which your therapist explains at the start.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. There are no logins and no passwords. You book through a simple WhatsApp message to our coordinator.",
  },
  {
    question: "How do online sessions work?",
    answer: `Sessions happen over private video; a phone or laptop and a quiet corner are all you need. ${SESSION_LENGTH_NOTE}`,
  },
  {
    question: "Can I speak in Malayalam?",
    answer: "Yes. Every clinician works in Malayalam and English, and some also in Hindi or Tamil. Switch whenever you like.",
  },
  {
    question: "Do I need a therapist or a psychiatrist?",
    answer:
      "Therapists help you work through thoughts, feelings and relationships. Psychiatrists are doctors who can assess and prescribe. Not sure? The short guide above, or our coordinator, can help.",
  },
  {
    question: "What if I am in crisis?",
    answer:
      "Ullidam is not an emergency service. If you are in danger, call your local emergency number now. Crisis lines for India, the UAE, the UK and North America are listed at the foot of every page.",
  },
];
