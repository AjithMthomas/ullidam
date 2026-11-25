/**
 * Clinician availability (docs/specs/booking-picker.md, docs/specs/portal.md).
 *
 * The model, shared by the clinician portal and the public booking card so
 * they always agree:
 *   - A weekly pattern ("my usual week": weekday x shift) is the default.
 *   - Dated overrides change one day: open or block a single slot, close the
 *     whole day ("ALL", for leave), or mark a slot booked.
 * Overrides live in the Therapist_Schedule sheet, the pattern in
 * Weekly_Pattern. No rolling job is needed: any day without overrides simply
 * follows the pattern.
 *
 * Every time here is IST (Asia/Kolkata), the practice's clock.
 */
export type Shift = "morning" | "afternoon" | "evening";

/** 0 = Sunday ... 6 = Saturday, as Date.getDay() and the sheet's weekday column. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WeeklySchedule = Partial<Record<Weekday, Shift[]>>;

export const SHIFTS: Record<Shift, { label: string; times: string[] }> = {
  morning: { label: "Morning", times: ["09:30", "11:00"] },
  afternoon: { label: "Afternoon", times: ["14:00", "15:30"] },
  evening: { label: "Evening", times: ["18:30", "20:00", "21:30"] },
};

export const SHIFT_ORDER: readonly Shift[] = ["morning", "afternoon", "evening"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

export const shiftOfTime = (time: string): Shift | undefined => SHIFT_ORDER.find((shift) => SHIFTS[shift].times.includes(time));

/** Sample patterns: the public fallback when the portal's records aren't connected, and the seed for local data. */
export const SAMPLE_WEEKLY: Record<string, WeeklySchedule> = {
  "ananya-menon": { 1: ["morning", "evening"], 2: ["evening"], 3: ["morning", "afternoon"], 5: ["evening"], 6: ["morning"] },
  "akash-mohan": { 1: ["afternoon", "evening"], 3: ["evening"], 4: ["afternoon", "evening"], 6: ["morning", "afternoon"] },
  "sneha-varghese": { 2: ["evening"], 4: ["evening"], 5: ["afternoon", "evening"], 0: ["morning"] },
  "dr-arun-kallada": { 1: ["morning"], 3: ["afternoon"], 5: ["morning", "afternoon"] },
};

/** One dated override. `time` is "HH:MM" IST or "ALL" (the whole day). */
export interface SlotOverride {
  day: string;
  time: string;
  open: boolean;
  /** Portal only: the booking holding this slot. Never sent to the public site. */
  bookingId?: string;
  reason?: string;
}

/** What the public site receives: the pattern and open/closed overrides, nothing about who booked. */
export interface PublicAvailability {
  weekly: WeeklySchedule;
  overrides: { day: string; time: string; open: boolean }[];
  /** True while the practice still shows sample availability (records not connected). */
  sample: boolean;
}

export type SlotState = "open" | "closed" | "blocked" | "booked";

export interface DaySlot {
  time: string;
  shift: Shift;
  state: SlotState;
  bookingId?: string;
  reason?: string;
}

/**
 * Every slot of one IST day with its state:
 *   open     available to book
 *   closed   not in the usual week (and not opened for this day)
 *   blocked  normally open, closed for this day (or leave)
 *   booked   taken by a booking
 */
export function daySlots(weekly: WeeklySchedule, overrides: readonly SlotOverride[], day: string, weekday: number): DaySlot[] {
  const usual = new Set(weekly[weekday as Weekday] ?? []);
  const forDay = overrides.filter((o) => o.day === day);
  const wholeDay = forDay.find((o) => o.time === "ALL");
  return SHIFT_ORDER.flatMap((shift) =>
    SHIFTS[shift].times.map((time): DaySlot => {
      const override = forDay.find((o) => o.time === time);
      if (override?.bookingId) return { time, shift, state: "booked", bookingId: override.bookingId, reason: override.reason };
      if (wholeDay && !wholeDay.open) return { time, shift, state: usual.has(shift) || override?.open ? "blocked" : "closed", reason: wholeDay.reason };
      if (override) return { time, shift, state: override.open ? "open" : usual.has(shift) ? "blocked" : "closed", reason: override.reason };
      return { time, shift, state: usual.has(shift) ? "open" : "closed" };
    }),
  );
}

/** Public fallback before the portal's records are connected. */
export function sampleAvailability(therapistId: string): PublicAvailability {
  return { weekly: SAMPLE_WEEKLY[therapistId] ?? {}, overrides: [], sample: true };
}
