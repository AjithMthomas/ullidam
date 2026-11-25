"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/lib/portal/audit";
import { issueSetupCode, requireCoordinator, requireTreatingClinician } from "@/lib/portal/auth";
import { availabilityTag, profileTag } from "@/lib/portal/public";
import {
  cancelBooking,
  clinicianUpdate,
  confirmBooking,
  createBooking,
  linkBookingsToClient,
  proposeTimes,
  type BookingFormat,
  type ClinicianChange,
} from "@/lib/portal/repo/bookings";
import { createClient, logContact, setClientStatus, updateClient, type ClientInput, type ClientStatus } from "@/lib/portal/repo/clients";
import { approveProfile, returnProfile, submitProfile } from "@/lib/portal/repo/profile";
import { addAddendum, createDraft, markEnteredInError, saveDraft, signNote, type DraftFields, type NoteFormat } from "@/lib/portal/repo/records";
import { setDayClosed, setLeave, setSlot, setWeekly } from "@/lib/portal/repo/schedule";
import { StoreError } from "@/lib/portal/store";

/**
 * Every portal mutation. Each one checks the signed-in user on the server
 * (role included) and passes their ID to the data layer, which only touches
 * that clinician's records. Expected problems come back as a message;
 * anything else is a real error.
 */
export interface ActionState {
  error?: string;
  ok?: boolean;
  message?: string;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

async function attempt(task: () => Promise<void | string>): Promise<ActionState> {
  try {
    const message = await task();
    return { ok: true, message: typeof message === "string" ? message : undefined };
  } catch (error) {
    if (error instanceof StoreError) return { error: error.message };
    throw error;
  }
}

/* ------------------------------- Schedule ------------------------------- */

export async function toggleSlotAction(day: string, time: string, open: boolean): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const result = await attempt(() => setSlot(me.id, day, time, open));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "schedule.update", entity: "slot", entityId: `${day} ${time}` });
    updateTag(availabilityTag(me.id));
    refresh();
  }
  return result;
}

export async function setDayClosedAction(day: string, closed: boolean): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const result = await attempt(() => setDayClosed(me.id, day, closed, closed ? "Day off" : ""));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "schedule.update", entity: "day", entityId: day });
    updateTag(availabilityTag(me.id));
    refresh();
  }
  return result;
}

export async function setWeeklyAction(weekday: number, shift: string, active: boolean): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const result = await attempt(() => setWeekly(me.id, weekday, shift, active));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "schedule.update", entity: "weekly", entityId: `${weekday}:${shift}` });
    updateTag(availabilityTag(me.id));
    refresh();
  }
  return result;
}

export async function addLeaveAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const result = await attempt(() => setLeave(me.id, text(form, "from"), text(form, "to") || text(form, "from"), text(form, "reason") || "Leave"));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "schedule.update", entity: "leave", entityId: text(form, "from") });
    updateTag(availabilityTag(me.id));
    refresh();
  }
  return result;
}

/* ------------------------------- Bookings ------------------------------- */

export async function bookingChangeAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const bookingId = text(form, "bookingId");
  const kind = text(form, "kind");
  const change: ClinicianChange | null =
    kind === "complete" || kind === "no-show"
      ? { kind }
      : kind === "reschedule"
        ? { kind, reason: text(form, "reason") }
        : kind === "link"
          ? { kind, url: text(form, "url") }
          : kind === "note"
            ? { kind, text: text(form, "text") }
            : null;
  if (!change) return { error: "Unknown change." };
  const result = await attempt(() => clinicianUpdate(me.id, bookingId, change));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "booking.update", entity: kind, entityId: bookingId });
    refresh();
  }
  return result;
}

/* ------------------------------ Coordinator ----------------------------- */

const slot = (form: FormData, prefix: string) => {
  const day = text(form, `${prefix}Day`);
  const time = text(form, `${prefix}Time`);
  return day && time ? `${day} ${time}` : "";
};

export async function createBookingAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireCoordinator();
  const result = await attempt(async () => {
    const id = await createBooking({
      clinicianId: text(form, "clinicianId"),
      clientName: text(form, "clientName"),
      whatsapp: text(form, "whatsapp"),
      track: text(form, "track"),
      format: (text(form, "format") === "audio" ? "audio" : "video") as BookingFormat,
      timeZone: text(form, "timeZone"),
      primarySlot: slot(form, "primary"),
      backupSlot: slot(form, "backup"),
      durationMin: Number(text(form, "duration") || "50"),
    });
    await audit({ clinicianId: me.id, action: "booking.create", entity: "booking", entityId: id });
    return "Booking request added.";
  });
  if (result.ok) refresh();
  return result;
}

export async function confirmBookingAction(bookingId: string, which: "primary" | "backup"): Promise<ActionState> {
  const me = await requireCoordinator();
  return attempt(async () => {
    const { clinicianId } = await confirmBooking(bookingId, which);
    await audit({ clinicianId: me.id, action: "booking.confirm", entity: "booking", entityId: bookingId });
    updateTag(availabilityTag(clinicianId));
    refresh();
  });
}

export async function cancelBookingAction(bookingId: string, by: "client" | "clinician" | "coordinator"): Promise<ActionState> {
  const me = await requireCoordinator();
  return attempt(async () => {
    const { clinicianId } = await cancelBooking(bookingId, by);
    await audit({ clinicianId: me.id, action: "booking.cancel", entity: "booking", entityId: bookingId });
    updateTag(availabilityTag(clinicianId));
    refresh();
  });
}

export async function proposeTimesAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireCoordinator();
  const bookingId = text(form, "bookingId");
  const result = await attempt(() => proposeTimes(bookingId, slot(form, "primary"), slot(form, "backup")));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "booking.propose", entity: "booking", entityId: bookingId });
    refresh();
  }
  return result;
}

export async function issueSetupCodeAction(clinicianId: string): Promise<ActionState> {
  const me = await requireCoordinator();
  return attempt(async () => `Setup code: ${await issueSetupCode(clinicianId, me.id)}. Valid once, for 24 hours. Share it privately.`);
}

export async function approveProfileAction(clinicianId: string): Promise<ActionState> {
  const me = await requireCoordinator();
  return attempt(async () => {
    await approveProfile(clinicianId);
    await audit({ clinicianId: me.id, action: "profile.approve", entity: "clinician", entityId: clinicianId });
    updateTag(profileTag(clinicianId));
    refresh();
  });
}

export async function returnProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireCoordinator();
  const clinicianId = text(form, "clinicianId");
  const result = await attempt(() => returnProfile(clinicianId, text(form, "note")));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "profile.return", entity: "clinician", entityId: clinicianId });
    refresh();
  }
  return result;
}

/* -------------------------------- Clients ------------------------------- */

function clientInput(form: FormData): ClientInput {
  return {
    alias: text(form, "alias"),
    fullName: text(form, "fullName"),
    whatsapp: text(form, "whatsapp"),
    email: text(form, "email"),
    dob: text(form, "dob"),
    gender: text(form, "gender"),
    country: text(form, "country"),
    timeZone: text(form, "timeZone"),
    language: text(form, "language"),
    track: text(form, "track"),
    referral: text(form, "referral"),
    consentDate: text(form, "consentDate"),
    consentMethod: text(form, "consentMethod"),
    emergencyContact: text(form, "emergencyContact"),
    tags: text(form, "tags"),
  };
}

export async function saveClientAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const clientId = text(form, "clientId");
  let createdId = "";
  const result = await attempt(async () => {
    if (clientId) {
      await updateClient(me.id, clientId, clientInput(form), text(form, "version"));
      await audit({ clinicianId: me.id, action: "client.update", entity: "client", entityId: clientId });
      return "Saved.";
    }
    const input = clientInput(form);
    createdId = await createClient(me.id, input);
    await linkBookingsToClient(me.id, createdId, input.whatsapp);
    await audit({ clinicianId: me.id, action: "client.create", entity: "client", entityId: createdId });
  });
  if (result.ok && createdId) redirect(`/portal/clients/${createdId}`);
  if (result.ok) refresh();
  return result;
}

export async function clientStatusAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const clientId = text(form, "clientId");
  const status = text(form, "status") as ClientStatus;
  if (!["Active", "Paused", "Discharged", "Archived"].includes(status)) return { error: "Unknown status." };
  const result = await attempt(() => setClientStatus(me.id, clientId, status, text(form, "reason")));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: status === "Archived" ? "client.archive" : "client.update", entity: "client", entityId: clientId });
    refresh();
  }
  return result;
}

export async function logContactAction(clientId: string): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const result = await attempt(() => logContact(me.id, clientId));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "client.contact", entity: "client", entityId: clientId });
    refresh();
  }
  return result;
}

/* --------------------------------- Notes -------------------------------- */

export async function newNoteAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const clientId = text(form, "clientId");
  let noteId = "";
  const result = await attempt(async () => {
    noteId = await createDraft(me.id, clientId, {
      sessionDate: text(form, "sessionDate"),
      format: text(form, "format"),
      noteFormat: (["SOAP", "DAP", "Free"].includes(text(form, "noteFormat")) ? text(form, "noteFormat") : "SOAP") as Exclude<NoteFormat, "Addendum">,
      bookingId: text(form, "bookingId") || undefined,
    });
    await audit({ clinicianId: me.id, action: "note.create", entity: "note", entityId: noteId });
  });
  if (result.ok && noteId) redirect(`/portal/clients/${clientId}/notes/${noteId}`);
  return result;
}

export async function saveDraftAction(noteId: string, fields: DraftFields, version: string): Promise<ActionState & { version?: string; conflict?: boolean }> {
  const me = await requireTreatingClinician();
  try {
    const next = await saveDraft(me.id, noteId, fields, version);
    await audit({ clinicianId: me.id, action: "note.save", entity: "note", entityId: noteId });
    return { ok: true, version: next };
  } catch (error) {
    if (error instanceof StoreError) return { error: error.message, conflict: error.status === 409 };
    throw error;
  }
}

export async function signNoteAction(noteId: string): Promise<ActionState & { escalate?: boolean }> {
  const me = await requireTreatingClinician();
  try {
    const { escalate } = await signNote(me.id, noteId);
    await audit({ clinicianId: me.id, action: "note.sign", entity: "note", entityId: noteId });
    // No refresh: the editor must stay on screen to show the confirmation and, for high risk, the safety steps.
    return { ok: true, escalate };
  } catch (error) {
    if (error instanceof StoreError) return { error: error.message };
    throw error;
  }
}

export async function addendumAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const parentId = text(form, "parentId");
  const result = await attempt(async () => {
    const id = await addAddendum(me.id, parentId, text(form, "text"), text(form, "reason"));
    await audit({ clinicianId: me.id, action: "note.addendum", entity: "note", entityId: id });
    return "Addendum added.";
  });
  if (result.ok) refresh();
  return result;
}

export async function enteredInErrorAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const noteId = text(form, "noteId");
  const result = await attempt(() => markEnteredInError(me.id, noteId, text(form, "reason")));
  if (result.ok) {
    await audit({ clinicianId: me.id, action: "note.error", entity: "note", entityId: noteId });
    refresh();
  }
  return result;
}

/* -------------------------------- Profile ------------------------------- */

export async function submitProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireTreatingClinician();
  const list = (key: string) => text(form, key).split("\n").map((s) => s.trim()).filter(Boolean);
  const result = await attempt(async () => {
    await submitProfile(me.id, { bio: text(form, "bio"), approach: text(form, "approach"), specialties: list("specialties"), languages: list("languages") });
    await audit({ clinicianId: me.id, action: "profile.submit", entity: "clinician", entityId: me.id });
    return "Sent to the coordinator for review. Your page updates once it is approved.";
  });
  if (result.ok) refresh();
  return result;
}
