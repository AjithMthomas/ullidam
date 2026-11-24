import type { Route } from "next";

/**
 * Content for /diaspora ("Far from home"), spec: docs/specs/diaspora-redesign.md
 * (revised after the fresh review, section 11). Recognition lines are things
 * people in each situation may recognise, never quotes from clients. Copy
 * that depends on facts the practice has not yet confirmed (session hours,
 * weekends, calling restrictions, couples in two countries, cross-border
 * rules) is left out or hedged until it is confirmed (spec section 10).
 */

export interface Segment {
  id: string;
  label: string;
  /** Two lines the visitor may recognise. */
  lines: [string, string];
  help: string;
  track: { name: string; href: Route };
  /**
   * First clause of the prefilled WhatsApp message, in the visitor's voice.
   * Neutral on purpose: the chat stays on a phone others may see, so it never
   * names a marriage, divorce or diagnosis.
   */
  opener: string;
}

export const SEGMENTS: readonly Segment[] = [
  {
    id: "gulf",
    label: "Working in the Gulf",
    lines: ["I send money home every month. No one asks how I am.", "Long shifts, a shared room, and nowhere private to let it out."],
    help: "Space to put the weight down for an hour, in Malayalam, with someone who knows the life.",
    track: { name: "Individual counselling", href: "/services/individual" },
    opener: "I live and work in the Gulf",
  },
  {
    id: "student",
    label: "Studying abroad",
    lines: ["The loan is in my parents' name. I can't fail.", "Everyone back home thinks I'm living the dream."],
    help: "Wherever you study, help with pressure, loneliness and the gap between how it looks and how it feels.",
    track: { name: "Individual counselling", href: "/services/individual" },
    opener: "I'm studying abroad",
  },
  {
    id: "nurse",
    label: "Nurse or carer abroad",
    lines: ["I look after everyone on my shift. Then I go home to an empty flat.", "I'm too tired to rest, and too far to go home."],
    help: "Support for exhaustion and the quiet weight of caring for others, far from your own people.",
    track: { name: "Individual counselling", href: "/services/individual" },
    opener: "I work in healthcare abroad",
  },
  {
    id: "couple",
    label: "Couples living apart",
    lines: ["We talk every night, but we are drifting.", "I had a career in Kerala. Here I feel I've lost myself."],
    help: "Counselling for relationships stretched across distance, and for the partner who moved and lost their footing.",
    track: { name: "Couple counselling", href: "/services/couples" },
    opener: "I live abroad",
  },
  {
    id: "parent",
    label: "Raising children abroad",
    lines: ["My children are growing up in a world I don't fully understand.", "There are no grandparents here to help, and no one to ask."],
    help: "Support for you as a parent, thinking through family life between two cultures. Our care is for adults.",
    track: { name: "Individual counselling", href: "/services/individual" },
    opener: "I'm a parent living abroad",
  },
  {
    id: "return",
    label: "Back home after years away",
    lines: ["I came back after fifteen years, and I don't fit anywhere.", "Home changed while I was gone. So did I."],
    help: "Support for the hidden difficulty of returning: identity, family roles and starting again.",
    track: { name: "Individual counselling", href: "/services/individual" },
    opener: "I've recently moved back to Kerala",
  },
];

/** The weight of life abroad, said once as a single editorial sentence (not a grid of tiles). */
export const PROBLEMS = [
  "Loneliness.",
  "The pressure to provide.",
  "Festivals and funerals missed.",
  "A marriage across distance.",
  "Shifts that never end.",
  "The shame of struggling when you are supposed to be doing well.",
] as const;

export const MOTHER_TONGUE = [
  { title: "No translating your feelings", body: "Say it the way you feel it, in the words you grew up with. Malayalam, English or a mix." },
  { title: "No explaining the culture", body: "Joint families, marriage pressure, “what will people think”: we already know." },
  { title: "No judgement", body: "Whatever you are carrying, it is safe to bring it here." },
] as const;

export const PRIVACY = [
  { title: "From your phone", body: "Join with earphones. A parked car, a quiet corner or a walk all work." },
  {
    title: "No one back home needs to know",
    body: "We never contact your family without your consent. No clinic, no waiting room, no one who recognises you.",
  },
  { title: "A private video link", body: "Our coordinator sends you a secure link before each session." },
] as const;

export const NRI_STEPS = [
  { title: "Message us on WhatsApp", body: "Text is enough. You do not need to call or explain everything." },
  { title: "Share two times in your time zone", body: "A preferred time and a backup. We confirm one, with Kerala time alongside." },
  { title: "Join from your phone", body: "Open the private video link at your time, wherever you can talk freely." },
] as const;

export interface City {
  label: string;
  zone: string;
  group: string;
}

/** Cities where most Malayalis abroad live. Conversions use these IANA zones (daylight saving included). */
export const CITIES: readonly City[] = [
  { label: "Dubai / Abu Dhabi", zone: "Asia/Dubai", group: "Gulf" },
  { label: "Riyadh / Jeddah", zone: "Asia/Riyadh", group: "Gulf" },
  { label: "Doha", zone: "Asia/Qatar", group: "Gulf" },
  { label: "Kuwait", zone: "Asia/Kuwait", group: "Gulf" },
  { label: "Muscat", zone: "Asia/Muscat", group: "Gulf" },
  { label: "Bahrain", zone: "Asia/Bahrain", group: "Gulf" },
  { label: "London", zone: "Europe/London", group: "UK & Europe" },
  { label: "Dublin", zone: "Europe/Dublin", group: "UK & Europe" },
  { label: "Berlin", zone: "Europe/Berlin", group: "UK & Europe" },
  { label: "New York", zone: "America/New_York", group: "North America" },
  { label: "Toronto", zone: "America/Toronto", group: "North America" },
  { label: "Chicago / Houston / Dallas", zone: "America/Chicago", group: "North America" },
  { label: "Calgary", zone: "America/Edmonton", group: "North America" },
  { label: "Vancouver", zone: "America/Vancouver", group: "North America" },
  { label: "California", zone: "America/Los_Angeles", group: "North America" },
  { label: "Sydney / Melbourne", zone: "Australia/Sydney", group: "Australia & NZ" },
  { label: "Brisbane", zone: "Australia/Brisbane", group: "Australia & NZ" },
  { label: "Perth", zone: "Australia/Perth", group: "Australia & NZ" },
  { label: "Auckland", zone: "Pacific/Auckland", group: "Australia & NZ" },
  { label: "Singapore", zone: "Asia/Singapore", group: "Asia" },
  { label: "Kuala Lumpur", zone: "Asia/Kuala_Lumpur", group: "Asia" },
  { label: "Kerala", zone: "Asia/Kolkata", group: "India" },
];

export const KERALA_ZONE = "Asia/Kolkata";

export function cityForZone(zone: string | null | undefined): City | undefined {
  return zone ? CITIES.find((city) => city.zone === zone) : undefined;
}

/** A readable place for any device zone ("Europe/London" becomes "London"); undefined for India. */
export function placeForZone(zone: string | null | undefined): string | undefined {
  if (!zone || zone === KERALA_ZONE) return undefined;
  return cityForZone(zone)?.label ?? zone.split("/").pop()?.replace(/_/g, " ");
}

/** Only questions whose answers are confirmed or safely hedged (spec 3.11); these also feed the FAQPage JSON-LD. */
export const NRI_FAQS = [
  {
    q: "Can I book from outside India?",
    a: "Sessions are online, and our coordinator will tell you what is possible where you live. Rules for online care differ between countries, and for psychiatric care a local doctor may need to prescribe any medicine.",
  },
  {
    q: "What do I need for a session?",
    a: "A phone or laptop, earphones, and a private place to talk. Sessions are by video or audio call; our coordinator sends you a secure link before the session.",
  },
  {
    q: "Will my family in Kerala find out?",
    a: "Your sessions are confidential. We never contact your family without your consent; the only exception is a serious risk to your safety or someone else's.",
  },
  {
    q: "Can I speak Malayalam, English or a mix?",
    a: "Yes. Many people switch between the two. Speak however feels natural to you.",
  },
  {
    q: "How do fees and payment work from abroad?",
    a: "Our coordinator explains fees and payment privately on WhatsApp before you book anything.",
  },
] as const;

/** Sent from Kerala to someone abroad. Non-diagnostic, because it lands in their chat. */
export const SHARE_NOTE = "I came across this and thought of you. No pressure, just in case it is useful:";

export const FAMILY_GUIDANCE_MESSAGE =
  "Hello Ullidam, someone in my family lives abroad and I'm worried about them. Could you guide me on how to help?";

export const ASSOCIATION_MESSAGE =
  "Hello Ullidam, I'm with a Malayali community group abroad and would like to ask about a mental health session for our members.";
