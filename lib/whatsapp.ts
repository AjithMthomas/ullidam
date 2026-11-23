import { COORDINATOR_WHATSAPP } from "@/data/site-config";

/** Pre-filled openers. Plain, dignified wording; no emoji (spec Rule 1). */
export const WHATSAPP_MESSAGES = {
  general:
    "Hello Ullidam, I would like to book a confidential session. Could you help me find the right therapist?",
  awareness: "Hello Ullidam, I would like to know more about your awareness programmes and workshops.",
  internships: "Hello Ullidam, I am a psychology student and would like to know about internship opportunities.",
  careers: "Hello Ullidam, I am a mental health professional and would like to know about joining your clinical team.",
  diaspora: "Hello Ullidam, I live outside India and would like to book a session in my time zone.",
} as const;

export function therapistRequestMessage(therapistName: string): string {
  return `Hello Ullidam, I would like to request a confidential session with ${therapistName}.`;
}

export function trackRequestMessage(trackName: string): string {
  return `Hello Ullidam, I would like to book a confidential session for ${trackName}.`;
}

/**
 * Link to the practice coordinator. Phase 3 replaces the booking flow with the
 * structured dual-slot dispatch; this stays the simple "talk to a person" path.
 */
export function whatsappHref(message: string = WHATSAPP_MESSAGES.general): string {
  return `https://wa.me/${COORDINATOR_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
