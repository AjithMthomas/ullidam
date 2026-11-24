/**
 * Clinician availability for the booking picker (docs/specs/booking-picker.md).
 *
 * The shape mirrors the planned Google Sheet "Therapist_Schedule": one row per
 * clinician, weekday and shift. Phase 4 replaces SAMPLE_WEEKLY with rows read
 * from that sheet (the counsellor portal will let each clinician edit their
 * own); callers only use getWeeklySchedule(), so nothing else changes.
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

/** Sample patterns until live schedules launch (the card says so). */
const SAMPLE_WEEKLY: Record<string, WeeklySchedule> = {
  "ananya-menon": { 1: ["morning", "evening"], 2: ["evening"], 3: ["morning", "afternoon"], 5: ["evening"], 6: ["morning"] },
  "akash-mohan": { 1: ["afternoon", "evening"], 3: ["evening"], 4: ["afternoon", "evening"], 6: ["morning", "afternoon"] },
  "sneha-varghese": { 2: ["evening"], 4: ["evening"], 5: ["afternoon", "evening"], 0: ["morning"] },
  "dr-arun-kallada": { 1: ["morning"], 3: ["afternoon"], 5: ["morning", "afternoon"] },
};

export const SCHEDULE_IS_SAMPLE = true;

/** One open slot: the shape of a Therapist_Schedule row (Therapist_ID, Date, Slot_Time_IST, Shift). */
export interface SlotRow {
  /** IST date, "YYYY-MM-DD" (stored as plain text in the sheet). */
  day: string;
  /** IST time, "HH:MM" (plain text in the sheet). */
  time: string;
  shift: Shift;
}

/**
 * Open slots for a clinician on the given IST days, keyed by Therapist.id.
 * Date-based like the sheet, so leave, holidays, single blocked slots and
 * booked slots can be expressed once Phase 4 reads real rows; for now the
 * rows are generated from the sample weekly pattern.
 */
export function getAvailability(therapistId: string, days: readonly { key: string; weekday: number }[]): SlotRow[] {
  const weekly = SAMPLE_WEEKLY[therapistId] ?? {};
  return days.flatMap(({ key, weekday }) => {
    const shifts = weekly[weekday as Weekday] ?? [];
    return SHIFT_ORDER.filter((shift) => shifts.includes(shift)).flatMap((shift) =>
      SHIFTS[shift].times.map((time) => ({ day: key, time, shift })),
    );
  });
}
