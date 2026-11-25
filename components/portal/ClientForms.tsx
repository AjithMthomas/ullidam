"use client";

import { useActionState, useState } from "react";
import { clientStatusAction, newNoteAction, saveClientAction, type ActionState } from "@/app/portal/desk-actions";
import { Field, FormMessage, inputClass } from "./ui";

export interface ClientDefaults {
  alias?: string;
  fullName?: string;
  whatsapp?: string;
  email?: string;
  dob?: string;
  gender?: string;
  country?: string;
  timeZone?: string;
  language?: string;
  track?: string;
  referral?: string;
  consentDate?: string;
  consentMethod?: string;
  emergencyContact?: string;
  tags?: string;
}

const CONSENT_METHODS = ["Verbal, recorded in session", "Written (signed form)", "Online form", "WhatsApp message"];

/** Add or edit a client. Everything identifying is encrypted on the server before it is stored. */
export function ClientForm({
  tracks,
  defaults = {},
  clientId,
  version,
  bookingId,
  today,
}: {
  tracks: string[];
  defaults?: ClientDefaults;
  clientId?: string;
  version?: string;
  bookingId?: string;
  today: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveClientAction, {});
  const d = defaults;
  return (
    <form action={action} className="grid gap-5">
      {clientId ? <input type="hidden" name="clientId" value={clientId} /> : null}
      {version ? <input type="hidden" name="version" value={version} /> : null}
      {bookingId ? <input type="hidden" name="bookingId" value={bookingId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Alias" hint="A short name only you see in lists, for example R.K.">
          <input name="alias" required maxLength={40} defaultValue={d.alias} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Full name">
          <input name="fullName" required maxLength={80} defaultValue={d.fullName} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="WhatsApp number" hint="With country code.">
          <input name="whatsapp" inputMode="tel" defaultValue={d.whatsapp} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Email (optional)">
          <input name="email" type="email" defaultValue={d.email} className={inputClass} autoComplete="off" />
        </Field>
        <Field label="Date of birth" hint="Ullidam sees adults (18+).">
          <input name="dob" type="date" defaultValue={d.dob} className={inputClass} />
        </Field>
        <Field label="Gender (optional)">
          <input name="gender" maxLength={30} defaultValue={d.gender} className={inputClass} />
        </Field>
        <Field label="Country">
          <input name="country" maxLength={40} defaultValue={d.country} className={inputClass} />
        </Field>
        <Field label="Time zone" hint="For example Asia/Dubai. Empty means India.">
          <input name="timeZone" maxLength={60} defaultValue={d.timeZone} className={inputClass} />
        </Field>
        <Field label="Language">
          <select name="language" defaultValue={d.language || "Malayalam and English"} className={inputClass}>
            <option>Malayalam and English</option>
            <option>Malayalam</option>
            <option>English</option>
          </select>
        </Field>
        <Field label="Track">
          <select name="track" defaultValue={d.track || tracks[0]} className={inputClass}>
            {tracks.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="How they found us (optional)">
          <input name="referral" maxLength={60} defaultValue={d.referral} className={inputClass} />
        </Field>
        <Field label="Emergency contact (optional)" hint="Needed for moderate or high risk.">
          <input name="emergencyContact" maxLength={120} defaultValue={d.emergencyContact} className={inputClass} />
        </Field>
      </div>

      <fieldset className="grid gap-4 rounded-2xl bg-canvas-muted p-4 sm:grid-cols-2">
        <legend className="sr-only">Consent</legend>
        <p className="text-sm leading-relaxed text-ink-2 sm:col-span-2">Consent to counselling and to keeping these records is required before saving.</p>
        <Field label="Consent date">
          <input name="consentDate" type="date" required defaultValue={d.consentDate || today} className={inputClass} />
        </Field>
        <Field label="How consent was given">
          <select name="consentMethod" required defaultValue={d.consentMethod || CONSENT_METHODS[0]} className={inputClass}>
            {CONSENT_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
      </fieldset>

      <Field label="Tags (optional)" hint="Your own words, separated by commas.">
        <input name="tags" maxLength={120} defaultValue={d.tags} className={inputClass} />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending} className="min-h-12 rounded-full bg-brand px-6 text-sm font-medium text-on-brand disabled:opacity-60">
          {pending ? "Saving…" : clientId ? "Save changes" : "Add client"}
        </button>
        <FormMessage error={state.error} message={state.message} />
      </div>
    </form>
  );
}

/** Change status: active, paused, discharged, or archived (with a reason; the record is kept). */
export function ClientStatusForm({ clientId, status }: { clientId: string; status: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(clientStatusAction, {});
  const [next, setNext] = useState(status);
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="clientId" value={clientId} />
      <Field label="Status">
        <select name="status" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass}>
          <option>Active</option>
          <option>Paused</option>
          <option>Discharged</option>
          <option>Archived</option>
        </select>
      </Field>
      {next === "Archived" ? (
        <Field label="Reason for archiving" hint="Archived records are kept, never deleted.">
          <input name="reason" required maxLength={200} className={inputClass} />
        </Field>
      ) : null}
      <button disabled={pending || next === status} className="min-h-11 justify-self-start rounded-full border border-line-strong px-4 text-sm text-ink-1 disabled:opacity-50">
        {pending ? "Saving…" : "Update status"}
      </button>
      <FormMessage error={state.error} />
    </form>
  );
}

/** Start a session note: the date, video or audio, and the note format. */
export function NewNoteForm({ clientId, bookingId, sessionDate, format }: { clientId: string; bookingId?: string; sessionDate: string; format: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(newNoteAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-end">
      <input type="hidden" name="clientId" value={clientId} />
      {bookingId ? <input type="hidden" name="bookingId" value={bookingId} /> : null}
      <Field label="Session date">
        <input type="date" name="sessionDate" required defaultValue={sessionDate} className={inputClass} />
      </Field>
      <Field label="Session">
        <select name="format" defaultValue={format} className={inputClass}>
          <option value="video">Video</option>
          <option value="audio">Audio call</option>
        </select>
      </Field>
      <Field label="Note format">
        <select name="noteFormat" defaultValue="SOAP" className={inputClass}>
          <option value="SOAP">SOAP</option>
          <option value="DAP">DAP</option>
          <option value="Free">Free text</option>
        </select>
      </Field>
      <button disabled={pending} className="min-h-12 rounded-full bg-brand px-5 text-sm font-medium text-on-brand disabled:opacity-60">
        {pending ? "Starting…" : "Start note"}
      </button>
      <div className="sm:col-span-4">
        <FormMessage error={state.error} />
      </div>
    </form>
  );
}
