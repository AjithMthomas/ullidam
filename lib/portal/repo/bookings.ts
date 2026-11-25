import "server-only";
import { daySlots } from "@/data/schedule";
import { istDay, istInstant } from "@/lib/time";
import { decryptField, encryptField } from "../crypto";
import { StoreError } from "../store";
import { appendRow, newId, readRows, updateRow, type Row } from "../tables";
import { holdSlot, overridesFor, releaseSlot, weeklyFor } from "./schedule";

/**
 * Bookings (Bookings_Log). Contact details and the clinician's private note
 * are encrypted. Clinician functions take the clinician ID from the verified
 * session and only ever touch that clinician's bookings; coordinator
 * functions are called only after a coordinator role check.
 */

export type BookingStatus = "Requested" | "Confirmed" | "Completed" | "No-show" | "Cancelled" | "Reschedule requested";
export type BookingFormat = "video" | "audio";

export interface Booking {
  id: string;
  createdAt: string;
  clinicianId: string;
  clientName: string;
  whatsapp: string;
  track: string;
  format: BookingFormat;
  timeZone: string;
  primarySlot: string;
  backupSlot: string;
  confirmedSlot: string;
  status: BookingStatus;
  meetingLink: string;
  note: string;
  durationMin: number;
  rescheduledFrom: string;
}

const SLOT = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})$/;
const ctx = (id: string, column: string) => `Bookings_Log:${id}:${column}`;

export class NotFoundError extends StoreError {
  constructor() {
    super("Not found.", 404);
  }
}

export function parseSlot(slot: string): { day: string; time: string } | null {
  const match = SLOT.exec(slot);
  return match ? { day: match[1], time: match[2] } : null;
}

/** When the booked (or first preferred) slot starts. */
export function slotStart(slot: string): Date | null {
  const parsed = parseSlot(slot);
  return parsed ? istInstant(parsed.day, parsed.time) : null;
}

function toBooking(row: Row): Booking {
  const id = row.Booking_ID;
  return {
    id,
    createdAt: row.Created_At,
    clinicianId: row.Therapist_ID,
    clientName: decryptField(row.Client_Name, ctx(id, "Client_Name")),
    whatsapp: decryptField(row.WhatsApp_Number, ctx(id, "WhatsApp_Number")),
    track: row.Service_Track,
    format: row.Format === "audio" ? "audio" : "video",
    timeZone: row.Country_Timezone,
    primarySlot: row.Primary_Slot,
    backupSlot: row.Backup_Slot,
    confirmedSlot: row.Confirmed_Slot,
    status: (row.Status || "Requested") as BookingStatus,
    meetingLink: row.Meeting_Link,
    note: decryptField(row.Clinician_Note, ctx(id, "Clinician_Note")),
    durationMin: Number(row.Duration_Min || "50"),
    rescheduledFrom: row.Rescheduled_From,
  };
}

async function rows(): Promise<Row[]> {
  return readRows("Bookings_Log");
}

/* ------------------------------ clinician ------------------------------ */

export async function bookingsFor(clinicianId: string): Promise<Booking[]> {
  return (await rows()).filter((row) => row.Therapist_ID === clinicianId).map(toBooking);
}

async function rowForClinician(clinicianId: string, bookingId: string): Promise<Row> {
  const row = (await rows()).find((r) => r.Booking_ID === bookingId);
  // Someone else's booking looks exactly like a missing one.
  if (!row || row.Therapist_ID !== clinicianId) throw new NotFoundError();
  return row;
}

export type ClinicianChange =
  | { kind: "complete" }
  | { kind: "no-show" }
  | { kind: "reschedule"; reason: string }
  | { kind: "link"; url: string }
  | { kind: "note"; text: string };

export async function clinicianUpdate(clinicianId: string, bookingId: string, change: ClinicianChange, now = new Date()): Promise<void> {
  const row = await rowForClinician(clinicianId, bookingId);
  const booking = toBooking(row);

  switch (change.kind) {
    case "complete":
    case "no-show": {
      const start = slotStart(booking.confirmedSlot);
      if (booking.status !== "Confirmed" || !start) throw new StoreError("Only a confirmed session can be marked.", 409);
      if (start.getTime() > now.getTime()) throw new StoreError("You can mark a session once it has started.", 409);
      await updateRow("Bookings_Log", row, { Status: change.kind === "complete" ? "Completed" : "No-show" });
      return;
    }
    case "reschedule": {
      if (booking.status !== "Confirmed" && booking.status !== "Requested") throw new StoreError("This booking can't be rescheduled.", 409);
      const reason = change.reason.trim().slice(0, 300);
      const note = [booking.note, reason && `Reschedule requested: ${reason}`].filter(Boolean).join("\n");
      await updateRow("Bookings_Log", row, { Status: "Reschedule requested", Clinician_Note: encryptField(note, ctx(bookingId, "Clinician_Note")) });
      return;
    }
    case "link": {
      const url = change.url.trim();
      if (url) {
        let parsed: URL;
        try {
          parsed = new URL(url);
        } catch {
          throw new StoreError("Paste the full video link, starting with https://", 400);
        }
        if (parsed.protocol !== "https:") throw new StoreError("Use a secure (https) video link.", 400);
      }
      await updateRow("Bookings_Log", row, { Meeting_Link: url.slice(0, 300) });
      return;
    }
    case "note":
      await updateRow("Bookings_Log", row, { Clinician_Note: encryptField(change.text.trim().slice(0, 2000), ctx(bookingId, "Clinician_Note")) });
      return;
  }
}

export async function bookingFor(clinicianId: string, bookingId: string): Promise<Booking & { clientId: string }> {
  const row = await rowForClinician(clinicianId, bookingId);
  return { ...toBooking(row), clientId: row.Client_ID };
}

/** Link this clinician's bookings with the same WhatsApp number to a client record. */
export async function linkBookingsToClient(clinicianId: string, clientId: string, whatsapp: string): Promise<void> {
  if (!whatsapp) return;
  const target = whatsapp.replace(/[\s-]/g, "");
  for (const row of await rows()) {
    if (row.Therapist_ID !== clinicianId || row.Client_ID) continue;
    if (toBooking(row).whatsapp.replace(/[\s-]/g, "") === target) await updateRow("Bookings_Log", row, { Client_ID: clientId });
  }
}

/** Bookings with their client link, for Today and the client record. */
export async function bookingsWithClient(clinicianId: string): Promise<(Booking & { clientId: string })[]> {
  return (await rows()).filter((row) => row.Therapist_ID === clinicianId).map((row) => ({ ...toBooking(row), clientId: row.Client_ID }));
}

/* ----------------------------- coordinator ----------------------------- */

export async function allBookings(): Promise<Booking[]> {
  return (await rows()).map(toBooking);
}

export interface NewBooking {
  clinicianId: string;
  clientName: string;
  whatsapp: string;
  track: string;
  format: BookingFormat;
  timeZone: string;
  primarySlot: string;
  backupSlot: string;
  durationMin: number;
}

export async function createBooking(input: NewBooking): Promise<string> {
  if (!input.clientName.trim()) throw new StoreError("Add the client's name.", 400);
  if (!/^\+?\d[\d\s-]{7,16}$/.test(input.whatsapp.trim())) throw new StoreError("Add a WhatsApp number with country code.", 400);
  if (!parseSlot(input.primarySlot)) throw new StoreError("Choose a preferred time.", 400);
  if (input.backupSlot && !parseSlot(input.backupSlot)) throw new StoreError("The backup time isn't valid.", 400);
  const id = newId("BK");
  await appendRow("Bookings_Log", {
    Booking_ID: id,
    Created_At: new Date().toISOString(),
    Client_ID: "",
    Client_Name: encryptField(input.clientName.trim().slice(0, 80), ctx(id, "Client_Name")),
    WhatsApp_Number: encryptField(input.whatsapp.replace(/[\s-]/g, ""), ctx(id, "WhatsApp_Number")),
    Service_Track: input.track,
    Format: input.format,
    Country_Timezone: input.timeZone.slice(0, 60),
    Therapist_ID: input.clinicianId,
    Primary_Slot: input.primarySlot,
    Backup_Slot: input.backupSlot,
    Confirmed_Slot: "",
    Status: "Requested",
    Meeting_Link: "",
    Clinician_Note: "",
    Duration_Min: String(input.durationMin),
  });
  return id;
}

/** Is this slot open right now for this clinician (pattern, overrides, existing bookings)? */
export async function isSlotOpen(clinicianId: string, slot: string): Promise<boolean> {
  const parsed = parseSlot(slot);
  if (!parsed) return false;
  const [weekly, overrides] = await Promise.all([weeklyFor(clinicianId), overridesFor(clinicianId, parsed.day)]);
  const { weekday } = istDay(istInstant(parsed.day, "12:00"));
  return daySlots(weekly, overrides, parsed.day, weekday).some((s) => s.time === parsed.time && s.state === "open");
}

/** Confirm the preferred or backup time: holds the slot and confirms the booking. */
export async function confirmBooking(bookingId: string, which: "primary" | "backup"): Promise<{ clinicianId: string }> {
  const row = (await rows()).find((r) => r.Booking_ID === bookingId);
  if (!row) throw new NotFoundError();
  const booking = toBooking(row);
  if (booking.status !== "Requested" && booking.status !== "Reschedule requested") throw new StoreError("This booking is already settled.", 409);
  const slot = which === "primary" ? booking.primarySlot : booking.backupSlot;
  const parsed = parseSlot(slot);
  if (!parsed) throw new StoreError("That time isn't set.", 400);
  if (!(await isSlotOpen(booking.clinicianId, slot))) throw new StoreError("That time is no longer open. Choose the other time or ask the client again.", 409);
  if (booking.confirmedSlot) await releaseSlot(booking.clinicianId, bookingId);
  await holdSlot(booking.clinicianId, parsed.day, parsed.time, bookingId);
  await updateRow("Bookings_Log", row, {
    Confirmed_Slot: slot,
    Status: "Confirmed",
    Rescheduled_From: booking.confirmedSlot && booking.confirmedSlot !== slot ? booking.confirmedSlot : booking.rescheduledFrom,
  });
  return { clinicianId: booking.clinicianId };
}

/** New times for a reschedule request (the coordinator agreed them with the client). */
export async function proposeTimes(bookingId: string, primarySlot: string, backupSlot: string): Promise<void> {
  const row = (await rows()).find((r) => r.Booking_ID === bookingId);
  if (!row) throw new NotFoundError();
  if (!parseSlot(primarySlot) || (backupSlot && !parseSlot(backupSlot))) throw new StoreError("Choose valid times.", 400);
  await updateRow("Bookings_Log", row, { Primary_Slot: primarySlot, Backup_Slot: backupSlot, Status: "Reschedule requested" });
}

export async function cancelBooking(bookingId: string, by: "client" | "clinician" | "coordinator"): Promise<{ clinicianId: string }> {
  const row = (await rows()).find((r) => r.Booking_ID === bookingId);
  if (!row) throw new NotFoundError();
  const booking = toBooking(row);
  if (booking.status === "Completed" || booking.status === "No-show" || booking.status === "Cancelled") throw new StoreError("This booking is already closed.", 409);
  if (booking.confirmedSlot) await releaseSlot(booking.clinicianId, bookingId);
  await updateRow("Bookings_Log", row, { Status: "Cancelled", Cancelled_By: by });
  return { clinicianId: booking.clinicianId };
}

export async function coordinatorSetLink(bookingId: string, url: string): Promise<void> {
  const row = (await rows()).find((r) => r.Booking_ID === bookingId);
  if (!row) throw new NotFoundError();
  await clinicianUpdate(row.Therapist_ID, bookingId, { kind: "link", url });
}
