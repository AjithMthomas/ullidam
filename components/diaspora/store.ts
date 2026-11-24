"use client";

import { useSyncExternalStore } from "react";
import { cityForZone, KERALA_ZONE, placeForZone, SEGMENTS } from "@/data/diaspora";
import { diasporaMessage, whatsappHref } from "@/lib/whatsapp";
import { useVisitorZone } from "@/lib/time";

/**
 * What the visitor has chosen on /diaspora, shared by every WhatsApp action on
 * the page so they all send the same opener. Lives in memory only: nothing is
 * stored, sent or remembered beyond the WhatsApp text the visitor sends.
 */
interface DiasporaChoice {
  segment: string | null;
  /** A city the visitor picked in the time helper (overrides the device zone). */
  zone: string | null;
  /** An hour the visitor picked as "free around", in that zone. */
  hour: number | null;
}

const INITIAL: DiasporaChoice = { segment: null, zone: null, hour: null };
let state = INITIAL;
const listeners = new Set<() => void>();

export function setChoice(patch: Partial<DiasporaChoice>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useChoice(): DiasporaChoice {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

/** The zone the page should talk about: the picked city, else the device zone (unless it is India's). */
export function useEffectiveZone(): string | null {
  const { zone } = useChoice();
  const detected = useVisitorZone();
  return zone ?? (detected && detected !== KERALA_ZONE ? detected : null);
}

export function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
}

/** The WhatsApp link for the visitor's current choices (server: the plain opener). */
export function useDiasporaHref(): string {
  const { segment, hour } = useChoice();
  const zone = useEffectiveZone();
  const opener = SEGMENTS.find((item) => item.id === segment)?.opener;
  const place = placeForZone(zone);
  const short = cityForZone(zone)?.label.split(" / ")[0] ?? place;
  const freeAt = hour !== null && short ? `${hourLabel(hour)} ${short} time` : undefined;
  return whatsappHref(diasporaMessage({ opener, place, freeAt }));
}
