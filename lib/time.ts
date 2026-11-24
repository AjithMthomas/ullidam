import { useSyncExternalStore } from "react";
import { detectTimeZone } from "@/lib/region";

/**
 * Time-zone helpers shared by the diaspora page and the booking picker.
 * Everything goes through Intl with IANA zones, so half-hour zones and
 * daylight saving are handled; nothing adds hours by hand except IST, which
 * has a fixed +5:30 and no daylight saving.
 */
export const IST = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60_000;

const noop = () => () => {};

/** The visitor's device time zone after hydration; null on the server (never from IP). */
export function useVisitorZone(): string | null {
  return useSyncExternalStore(noop, detectTimeZone, () => null);
}

const TICK = 15_000;
const subscribeTick = (onChange: () => void) => {
  const id = setInterval(onChange, TICK);
  return () => clearInterval(id);
};

/** Changes every 15 seconds on the client (clocks stay current); null on the server and before hydration. */
export function useTick(): number | null {
  return useSyncExternalStore(subscribeTick, () => Math.floor(Date.now() / TICK), () => null);
}

/** "9:40 PM" in a time zone. */
export function formatTime(zone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

/** "Thu" in a time zone. */
export function formatDay(zone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: zone, weekday: "short" }).format(date);
}

/** "Tue 26 Nov" in a time zone. */
export function formatDate(zone: string, date: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: zone, weekday: "short", day: "numeric", month: "short" }).format(date);
}

function partsIn(zone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour") % 24, min: get("minute") };
}

/** How far a zone is ahead of UTC at an instant. */
function offsetMs(zone: string, date: Date): number {
  const p = partsIn(zone, date);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - Math.floor(date.getTime() / 60_000) * 60_000;
}

/** The instant when it is `hour`:00 today in `zone` (today as that zone sees it). */
export function instantAt(zone: string, hour: number, base: Date): Date {
  const today = partsIn(zone, base);
  const wall = Date.UTC(today.y, today.m - 1, today.d, hour, 0);
  let guess = wall;
  // Two passes settle daylight-saving edges: the offset is re-read at the corrected instant.
  for (let i = 0; i < 2; i++) guess = wall - offsetMs(zone, new Date(guess));
  return new Date(guess);
}

/** The IST calendar day of an instant as "YYYY-MM-DD", plus its weekday (0 = Sunday). */
export function istDay(date: Date): { key: string; weekday: number } {
  const shifted = new Date(date.getTime() + IST_OFFSET_MS);
  return { key: shifted.toISOString().slice(0, 10), weekday: shifted.getUTCDay() };
}

/** The instant of an IST wall time: day "YYYY-MM-DD", time "HH:MM". */
export function istInstant(dayKey: string, time: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, h, min) - IST_OFFSET_MS);
}
