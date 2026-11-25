"use client";

import { useActionState } from "react";
import { createBookingAction, proposeTimesAction, returnProfileAction, type ActionState } from "@/app/portal/desk-actions";
import { SHIFT_ORDER, SHIFTS } from "@/data/schedule";
import { Field, FormMessage, inputClass } from "./ui";

const TIMES = SHIFT_ORDER.flatMap((shift) => SHIFTS[shift].times.map((time) => ({ time, shift: SHIFTS[shift].label })));

function SlotPicker({ prefix, label, required }: { prefix: string; label: string; required?: boolean }) {
  return (
    <fieldset className="grid gap-1.5">
      <legend className="text-sm font-medium text-ink-2">{label}</legend>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,9rem)] gap-2">
        <input type="date" name={`${prefix}Day`} required={required} aria-label={`${label} date`} className={inputClass} />
        <select name={`${prefix}Time`} required={required} aria-label={`${label} time (IST)`} className={inputClass} defaultValue="">
          <option value="">{required ? "Time" : "None"}</option>
          {TIMES.map(({ time, shift }) => (
            <option key={time} value={time}>
              {time} IST ({shift})
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

/** The coordinator logs a WhatsApp enquiry: who, with whom, and two preferred times (IST). */
export function NewBookingForm({ clinicians, tracks }: { clinicians: { id: string; name: string }[]; tracks: string[] }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createBookingAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label="Therapist">
        <select name="clinicianId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Choose
          </option>
          {clinicians.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Track">
        <select name="track" required className={inputClass} defaultValue={tracks[0]}>
          {tracks.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Client name">
        <input name="clientName" required maxLength={80} autoComplete="off" className={inputClass} />
      </Field>
      <Field label="WhatsApp number" hint="With country code, for example +971 50 123 4567.">
        <input name="whatsapp" required inputMode="tel" autoComplete="off" className={inputClass} />
      </Field>
      <Field label="Format">
        <select name="format" className={inputClass} defaultValue="video">
          <option value="video">Video</option>
          <option value="audio">Audio call</option>
        </select>
      </Field>
      <Field label="Session length">
        <select name="duration" className={inputClass} defaultValue="50">
          <option value="30">30 minutes</option>
          <option value="50">50 minutes</option>
          <option value="80">80 minutes (couples)</option>
        </select>
      </Field>
      <Field label="Client's time zone" hint="As a city zone, for example Asia/Dubai or Europe/London. Leave empty for India.">
        <input name="timeZone" maxLength={60} placeholder="Asia/Dubai" className={inputClass} />
      </Field>
      <div />
      <SlotPicker prefix="primary" label="Preferred time" required />
      <SlotPicker prefix="backup" label="Backup time" />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="min-h-12 rounded-full bg-brand px-6 text-sm font-medium text-on-brand disabled:opacity-60">
          {pending ? "Saving…" : "Add booking request"}
        </button>
        <FormMessage error={state.error} message={state.message} />
      </div>
    </form>
  );
}

/** For a reschedule: new preferred and backup times agreed with the client. */
export function ProposeTimesForm({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(proposeTimesAction, {});
  return (
    <form action={action} className="grid gap-3 rounded-2xl bg-canvas-muted p-4 sm:grid-cols-2">
      <input type="hidden" name="bookingId" value={bookingId} />
      <SlotPicker prefix="primary" label="New preferred time" required />
      <SlotPicker prefix="backup" label="New backup time" />
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={pending} className="min-h-11 rounded-full bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60">
          {pending ? "Saving…" : "Save new times"}
        </button>
        <FormMessage error={state.error} message={state.ok ? "Saved. Confirm one when the client agrees." : undefined} />
      </div>
    </form>
  );
}

export function ReturnProfileForm({ clinicianId }: { clinicianId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(returnProfileAction, {});
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="clinicianId" value={clinicianId} />
      <Field label="Or return with a note" className="min-w-0 flex-1">
        <input name="note" maxLength={300} required placeholder="What to change" className={inputClass} />
      </Field>
      <button disabled={pending} className="min-h-12 rounded-full border border-line-strong px-4 text-sm text-ink-1 disabled:opacity-60">
        Return
      </button>
      <FormMessage error={state.error} />
    </form>
  );
}
