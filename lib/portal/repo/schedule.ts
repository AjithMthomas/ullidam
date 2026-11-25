import "server-only";
import { SHIFT_ORDER, SHIFTS, shiftOfTime, type Shift, type SlotOverride, type Weekday, type WeeklySchedule } from "@/data/schedule";
import { StoreError } from "../store";
import { appendRow, readRows, updateRow, type Row } from "../tables";

/**
 * Availability: the weekly pattern (Weekly_Pattern) plus dated overrides
 * (Therapist_Schedule), the model in data/schedule.ts. Every function takes
 * the clinician ID from the caller's verified session.
 */

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const SHIFT_SET = new Set<string>(SHIFT_ORDER);

export class BookedSlotError extends StoreError {
  constructor() {
    super("That time is booked. Cancel or move the booking first.", 409);
  }
}

function assertDay(day: string) {
  if (!DAY.test(day) || Number.isNaN(Date.parse(day))) throw new StoreError("Invalid date.", 400);
}

export async function weeklyFor(clinicianId: string): Promise<WeeklySchedule> {
  const weekly: WeeklySchedule = {};
  for (const row of await readRows("Weekly_Pattern")) {
    if (row.Therapist_ID !== clinicianId || row.Active.toUpperCase() !== "TRUE" || !SHIFT_SET.has(row.Shift)) continue;
    const day = Number(row.Weekday) as Weekday;
    (weekly[day] ??= []).push(row.Shift as Shift);
  }
  return weekly;
}

const toOverride = (row: Row): SlotOverride => ({
  day: row.Date,
  time: row.Slot_Time_IST,
  open: row.Is_Available.toUpperCase() === "TRUE",
  bookingId: row.Booking_ID || undefined,
  reason: row.Reason || undefined,
});

export async function overridesFor(clinicianId: string, fromDay?: string): Promise<SlotOverride[]> {
  return (await readRows("Therapist_Schedule"))
    .filter((row) => row.Therapist_ID === clinicianId && (!fromDay || row.Date >= fromDay))
    .map(toOverride);
}

export async function setWeekly(clinicianId: string, weekday: number, shift: string, active: boolean): Promise<void> {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || !SHIFT_SET.has(shift)) throw new StoreError("Invalid shift.", 400);
  const row = (await readRows("Weekly_Pattern")).find(
    (r) => r.Therapist_ID === clinicianId && Number(r.Weekday) === weekday && r.Shift === shift,
  );
  if (row) {
    if ((row.Active.toUpperCase() === "TRUE") !== active) await updateRow("Weekly_Pattern", row, { Active: active ? "TRUE" : "FALSE" });
  } else if (active) {
    await appendRow("Weekly_Pattern", { Therapist_ID: clinicianId, Weekday: String(weekday), Shift: shift, Active: "TRUE" });
  }
}

async function upsertOverride(clinicianId: string, day: string, time: string, values: Record<string, string>): Promise<void> {
  const row = (await readRows("Therapist_Schedule")).find(
    (r) => r.Therapist_ID === clinicianId && r.Date === day && r.Slot_Time_IST === time,
  );
  if (row) await updateRow("Therapist_Schedule", row, values);
  else
    await appendRow("Therapist_Schedule", {
      Therapist_ID: clinicianId,
      Date: day,
      Slot_Time_IST: time,
      Shift: time === "ALL" ? "" : (shiftOfTime(time) ?? ""),
      Is_Available: "FALSE",
      Booking_ID: "",
      Reason: "",
      ...values,
    });
}

/** Open or block one slot on one day. Booked slots can't be changed here. */
export async function setSlot(clinicianId: string, day: string, time: string, open: boolean): Promise<void> {
  assertDay(day);
  if (!shiftOfTime(time)) throw new StoreError("Invalid time.", 400);
  const existing = (await overridesFor(clinicianId, day)).find((o) => o.day === day && o.time === time);
  if (existing?.bookingId) throw new BookedSlotError();
  await upsertOverride(clinicianId, day, time, { Is_Available: open ? "TRUE" : "FALSE", Reason: "" });
}

/** Close a whole day (leave, a day off) or reopen it. Booked slots stay booked either way. */
export async function setDayClosed(clinicianId: string, day: string, closed: boolean, reason = ""): Promise<void> {
  assertDay(day);
  await upsertOverride(clinicianId, day, "ALL", { Is_Available: closed ? "FALSE" : "TRUE", Reason: closed ? reason.slice(0, 80) : "" });
}

/** Leave across a date range (inclusive), at most 60 days. */
export async function setLeave(clinicianId: string, from: string, to: string, reason: string): Promise<void> {
  assertDay(from);
  assertDay(to);
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (end < start || end - start > 60 * 86_400_000) throw new StoreError("Choose a range of up to 60 days.", 400);
  for (let at = start; at <= end; at += 86_400_000) {
    await setDayClosed(clinicianId, new Date(at).toISOString().slice(0, 10), true, reason || "Leave");
  }
}

/** Mark a slot taken by a booking (coordinator confirm), or release it. */
export async function holdSlot(clinicianId: string, day: string, time: string, bookingId: string): Promise<void> {
  await upsertOverride(clinicianId, day, time, { Is_Available: "FALSE", Booking_ID: bookingId });
}

export async function releaseSlot(clinicianId: string, bookingId: string): Promise<void> {
  const row = (await readRows("Therapist_Schedule")).find((r) => r.Therapist_ID === clinicianId && r.Booking_ID === bookingId);
  if (row) await updateRow("Therapist_Schedule", row, { Booking_ID: "", Is_Available: "TRUE" });
}

export const slotTimes = SHIFT_ORDER.flatMap((shift) => SHIFTS[shift].times);
