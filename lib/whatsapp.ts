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

/**
 * The /diaspora opener: the visitor's situation (if chosen), city and a time
 * they are free, so they never have to write the first sentence. Openers are
 * deliberately neutral (no marriage, divorce or diagnosis words) because the
 * chat stays on a phone others may see.
 */
export function diasporaMessage({ opener, place, freeAt }: { opener?: string; place?: string; freeAt?: string } = {}): string {
  const situation = opener ?? "I live outside India";
  const where = place ? `, in ${place}` : "";
  const when = freeAt ? ` I'm usually free around ${freeAt}.` : "";
  return `Hello Ullidam, ${situation}${where}. I'd like to talk to someone in Malayalam.${when}`;
}

/** WhatsApp's share link: no number, so the visitor chooses who receives it. */
export function shareHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * The booking card's request: format, the clinician, and up to two picked
 * times (preferred and backup, already described in IST plus local time).
 */
export function bookingRequestMessage({
  name,
  format,
  picks,
  place,
}: {
  name: string;
  format: "video" | "audio";
  picks: string[];
  place?: string;
}): string {
  let text = `Hello Ullidam, I would like to request a confidential ${format === "audio" ? "audio call" : "video"} session with ${name}.`;
  if (picks[0]) text += ` Preferred: ${picks[0]}.`;
  if (picks[1]) text += ` Backup: ${picks[1]}.`;
  if (place && !picks.length) text += ` I'm in ${place}.`;
  return text;
}

export function applicationMessage(roleTitle: string): string {
  return `Hello Ullidam, I would like to apply for the ${roleTitle} opening.`;
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
