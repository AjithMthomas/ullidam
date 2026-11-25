import { daySlots, SHIFT_ORDER, shiftOfTime, type Shift, type SlotOverride, type WeeklySchedule } from "@/data/schedule";
import { istDay, istInstant } from "@/lib/time";

/**
 * The clinician's practice numbers (docs/specs/portal.md 4.6), computed from
 * their own bookings, clients and notes. Pure functions: no I/O, so the
 * figures can be checked against hand-counted data. Weeks start on Monday,
 * days are IST.
 */

export interface AnalyticsBooking {
  status: string;
  confirmedSlot: string;
  whatsapp: string;
  clientName: string;
  track: string;
  durationMin: number;
}
export interface AnalyticsClient {
  status: string;
  track: string;
  country: string;
}
export interface AnalyticsNote {
  clientId: string;
  status: string;
  sessionDate: string;
  phq9: string;
  gad7: string;
  noteFormat: string;
}

const DAY_MS = 86_400_000;
const slotAt = (slot: string) => {
  const m = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/.exec(slot);
  return m ? { at: istInstant(m[1], m[2]), day: m[1], time: m[2] } : null;
};
const mondayOf = (day: string) => {
  const { weekday } = istDay(istInstant(day, "12:00"));
  return istDay(new Date(istInstant(day, "12:00").getTime() - ((weekday + 6) % 7) * DAY_MS)).key;
};
const label = (day: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${day}T00:00:00Z`));
const monthKey = (day: string) => day.slice(0, 7);
const monthLabel = (key: string) => new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(new Date(`${key}-01T00:00:00Z`));
const who = (b: AnalyticsBooking) => (b.whatsapp || b.clientName).replace(/[\s-]/g, "").toLowerCase();

export function practiceNumbers(input: {
  bookings: AnalyticsBooking[];
  clients: AnalyticsClient[];
  notes: AnalyticsNote[];
  weekly: WeeklySchedule;
  overrides: SlotOverride[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const today = istDay(now).key;
  const thisWeek = mondayOf(today);
  const dated = input.bookings.map((b) => ({ ...b, slot: slotAt(b.confirmedSlot) })).filter((b) => b.slot);
  const completed = dated.filter((b) => b.status === "Completed");
  const noShows = dated.filter((b) => b.status === "No-show");
  const within = (b: (typeof dated)[number], days: number) => now.getTime() - b.slot!.at.getTime() <= days * DAY_MS && b.slot!.at <= now;

  // Headline numbers
  const sessionsThisWeek = completed.filter((b) => mondayOf(b.slot!.day) === thisWeek).length;
  const upcoming7 = dated.filter((b) => b.status === "Confirmed" && b.slot!.at > now && b.slot!.at.getTime() - now.getTime() <= 7 * DAY_MS).length;
  const activeClients = input.clients.length
    ? input.clients.filter((c) => c.status === "Active").length
    : new Set(completed.filter((b) => within(b, 60)).map(who)).size;
  const done90 = completed.filter((b) => within(b, 90)).length;
  const missed90 = noShows.filter((b) => within(b, 90)).length;
  const attendance90 = done90 + missed90 ? Math.round((done90 / (done90 + missed90)) * 100) : null;

  // 12 weeks of sessions and attendance
  const weeks = Array.from({ length: 12 }, (_, i) => istDay(new Date(istInstant(thisWeek, "12:00").getTime() - (11 - i) * 7 * DAY_MS)).key);
  const weekly = weeks.map((week) => {
    const c = completed.filter((b) => mondayOf(b.slot!.day) === week).length;
    const n = noShows.filter((b) => mondayOf(b.slot!.day) === week).length;
    return { week, label: label(week), completed: c, noShow: n, attendance: c + n ? Math.round((c / (c + n)) * 100) : null };
  });

  // New vs returning, last 6 months (new = their first completed session ever)
  const firstSeen = new Map<string, string>();
  for (const b of [...completed].sort((a, z) => a.slot!.at.getTime() - z.slot!.at.getTime())) {
    if (!firstSeen.has(who(b))) firstSeen.set(who(b), b.slot!.day);
  }
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${monthKey(today)}-01T00:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const newVsReturning = months.map((month) => {
    const inMonth = completed.filter((b) => monthKey(b.slot!.day) === month);
    const fresh = inMonth.filter((b) => monthKey(firstSeen.get(who(b))!) === month && firstSeen.get(who(b)) === b.slot!.day).length;
    return { month, label: monthLabel(month), new: fresh, returning: inMonth.length - fresh };
  });

  const hoursThisMonth = Math.round((completed.filter((b) => monthKey(b.slot!.day) === monthKey(today)).reduce((sum, b) => sum + (b.durationMin || 50), 0) / 60) * 10) / 10;

  // Track mix and countries: from client records when there are any, otherwise from bookings
  const tally = (values: string[]) =>
    [...values.reduce((map, v) => map.set(v || "Not recorded", (map.get(v || "Not recorded") ?? 0) + 1), new Map<string, number>())]
      .map(([name, value]) => ({ label: name, value }))
      .sort((a, b) => b.value - a.value);
  const activeRecords = input.clients.filter((c) => c.status === "Active");
  const trackMix = activeRecords.length ? tally(activeRecords.map((c) => c.track)) : tally(completed.filter((b) => within(b, 90)).map((b) => b.track));
  const countries = tally(activeRecords.map((c) => c.country));

  // When you work: completed sessions in 90 days, weekday (Mon..Sun) by shift
  const heat: Record<string, number> = {};
  for (const b of completed.filter((x) => within(x, 90))) {
    const shift = shiftOfTime(b.slot!.time);
    if (!shift) continue;
    const { weekday } = istDay(b.slot!.at);
    const key = `${(weekday + 6) % 7}:${shift}`;
    heat[key] = (heat[key] ?? 0) + 1;
  }
  const heatmap = Array.from({ length: 7 }, (_, d) => SHIFT_ORDER.map((shift: Shift) => ({ day: d, shift, count: heat[`${d}:${shift}`] ?? 0 })));

  // Schedule use: sessions booked (anything not cancelled) as a share of the hours offered, last and next 4 weeks.
  const sessionDays = new Map<string, number>();
  for (const b of dated) {
    if (b.status === "Cancelled") continue;
    sessionDays.set(b.slot!.day, (sessionDays.get(b.slot!.day) ?? 0) + 1);
  }
  const slotUse = (fromOffset: number, toOffset: number) => {
    let capacity = 0;
    let booked = 0;
    for (let i = fromOffset; i < toOffset; i++) {
      const { key, weekday } = istDay(new Date(now.getTime() + i * DAY_MS));
      const offered = daySlots(input.weekly, input.overrides, key, weekday).filter((s) => s.state === "open" || s.state === "booked").length;
      const taken = sessionDays.get(key) ?? 0;
      capacity += Math.max(offered, taken);
      booked += taken;
    }
    return { booked, capacity, rate: capacity ? Math.round((booked / capacity) * 100) : null };
  };
  const scheduleUse = { past: slotUse(-28, 0), next: slotUse(0, 28) };

  // Outcomes: change in PHQ-9 / GAD-7 between first and latest signed score, per client
  const change = (field: "phq9" | "gad7") => {
    const byClient = new Map<string, number[]>();
    for (const note of [...input.notes].filter((n) => n.status === "Signed" && n[field] !== "").sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))) {
      byClient.set(note.clientId, [...(byClient.get(note.clientId) ?? []), Number(note[field])]);
    }
    const deltas = [...byClient.values()].filter((s) => s.length >= 2).map((s) => s[s.length - 1] - s[0]);
    return { clients: deltas.length, averageChange: deltas.length ? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) / 10 : null };
  };

  return {
    kpis: { sessionsThisWeek, upcoming7, activeClients, attendance90 },
    weekly,
    newVsReturning,
    hoursThisMonth,
    trackMix,
    countries,
    heatmap,
    scheduleUse,
    outcomes: { phq9: change("phq9"), gad7: change("gad7") },
  };
}

export type PracticeNumbers = ReturnType<typeof practiceNumbers>;
