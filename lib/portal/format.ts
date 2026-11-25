import { formatDate, formatTime, IST, istDay, istInstant } from "@/lib/time";

/** Display helpers for portal screens (pure, server or browser). */

export function slotParts(slot: string): { day: string; time: string } | null {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/.exec(slot);
  return m ? { day: m[1], time: m[2] } : null;
}

/** "Tue 26 Nov, 6:30 PM" (IST). */
export function describeSlot(slot: string): string {
  const parts = slotParts(slot);
  if (!parts) return "Not set";
  const at = istInstant(parts.day, parts.time);
  return `${formatDate(IST, at)}, ${formatTime(IST, at)}`;
}

/** The same moment in the client's own zone, when it differs: "1:00 PM Thu in London". */
export function clientLocal(slot: string, zone: string): string | null {
  const parts = slotParts(slot);
  if (!parts || !zone || zone === IST || !zone.includes("/")) return null;
  try {
    const at = istInstant(parts.day, parts.time);
    return `${formatTime(zone, at)} ${formatDate(zone, at).split(" ")[0]} in ${zone.split("/").pop()?.replace(/_/g, " ")}`;
  } catch {
    return null;
  }
}

export const todayIST = () => istDay(new Date()).key;

export function shortDate(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}/.test(day)) return "";
  return formatDate(IST, istInstant(day.slice(0, 10), "12:00"));
}

export function relativeDays(iso: string, now = Date.now()): string {
  if (!iso) return "never";
  const days = Math.floor((now - Date.parse(iso)) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
}
