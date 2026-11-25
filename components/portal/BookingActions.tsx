"use client";

import { useActionState, useState } from "react";
import { bookingChangeAction, type ActionState } from "@/app/portal/desk-actions";
import { FormMessage, inputClass } from "./ui";

/**
 * The clinician's actions on one booking: mark how it went, the video link,
 * a private note, or ask the coordinator to reschedule. Each is its own small
 * form; the server checks the booking is theirs.
 */
export function BookingActions({
  bookingId,
  canMark,
  canReschedule,
  meetingLink,
  note,
  format,
}: {
  bookingId: string;
  canMark: boolean;
  canReschedule: boolean;
  meetingLink: string;
  note: string;
  format: "video" | "audio";
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(bookingChangeAction, {});
  const [open, setOpen] = useState<null | "link" | "note" | "reschedule">(null);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {canMark ? (
          <>
            <form action={action}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="kind" value="complete" />
              <button disabled={pending} className="min-h-11 rounded-full bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60">
                Completed
              </button>
            </form>
            <form action={action}>
              <input type="hidden" name="bookingId" value={bookingId} />
              <input type="hidden" name="kind" value="no-show" />
              <button disabled={pending} className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-ink-1 disabled:opacity-60">
                No-show
              </button>
            </form>
          </>
        ) : null}
        {format === "video" && canReschedule ? (
          <button type="button" onClick={() => setOpen(open === "link" ? null : "link")} className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-ink-1">
            {meetingLink ? "Change video link" : "Add video link"}
          </button>
        ) : null}
        <button type="button" onClick={() => setOpen(open === "note" ? null : "note")} className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-ink-1">
          {note ? "Edit private note" : "Private note"}
        </button>
        {canReschedule ? (
          <button type="button" onClick={() => setOpen(open === "reschedule" ? null : "reschedule")} className="min-h-11 rounded-full px-3 text-sm text-ink-2 underline underline-offset-4">
            Ask to reschedule
          </button>
        ) : null}
      </div>

      {open ? (
        <form action={action} className="grid gap-3 rounded-2xl bg-canvas-muted p-4">
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="kind" value={open} />
          {open === "link" ? (
            <input name="url" type="url" defaultValue={meetingLink} placeholder="https://meet.google.com/..." className={inputClass} aria-label="Video link" />
          ) : open === "note" ? (
            <textarea name="text" defaultValue={note} rows={3} maxLength={2000} className={inputClass} aria-label="Private note (encrypted; only you see it)" placeholder="Only you see this. Encrypted." />
          ) : (
            <textarea name="reason" rows={2} maxLength={300} className={inputClass} aria-label="Why it needs moving" placeholder="Why it needs moving (shared with the coordinator)" />
          )}
          <div className="flex items-center gap-3">
            <button disabled={pending} className="min-h-11 rounded-full bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60">
              {pending ? "Saving…" : open === "reschedule" ? "Send to coordinator" : "Save"}
            </button>
            <button type="button" onClick={() => setOpen(null)} className="min-h-11 px-2 text-sm text-ink-3">
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      <FormMessage error={state.error} />
    </div>
  );
}
