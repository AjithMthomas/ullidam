"use client";

import { useActionState, useState, useTransition } from "react";
import { addLeaveAction, setDayClosedAction, setWeeklyAction, toggleSlotAction, type ActionState } from "@/app/portal/desk-actions";
import { SHIFT_ORDER, SHIFTS, WEEKDAYS, type Shift, type SlotState, type WeeklySchedule } from "@/data/schedule";
import { cn } from "@/lib/cn";
import { Sensitive } from "./PortalProvider";
import { Field, FormMessage, inputClass } from "./ui";

export interface ScheduleDay {
  key: string;
  label: string;
  isToday: boolean;
  closedAllDay: boolean;
  closedReason: string;
  slots: { time: string; label: string; shift: Shift; state: SlotState; who?: string }[];
}

/**
 * The clinician's schedule: the next two weeks (tap a time to open or block
 * it, close a whole day), their usual week, and leave. Every change goes to
 * the server, which updates the public booking card within a minute.
 */
export function ScheduleEditor({ days, weekly }: { days: ScheduleDay[]; weekly: WeeklySchedule }) {
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();

  const run = (key: string, task: () => Promise<ActionState>) => {
    setBusy(key);
    setError(undefined);
    start(async () => {
      const result = await task();
      if (result.error) setError(result.error);
      setBusy(null);
    });
  };

  return (
    <div className="grid gap-10">
      <section aria-labelledby="fortnight-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="fortnight-heading" className="font-display text-title text-brand">
            Next two weeks
          </h2>
          <Legend />
        </div>
        <FormMessage error={error} />
        <ol className="mt-5 grid gap-3">
          {days.map((day) => (
            <li key={day.key} className={cn("rounded-2xl bg-surface-raised p-4 ring-1 ring-line sm:p-5", day.isToday && "ring-brand/40")}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-ink-1">
                  {day.label}
                  {day.isToday ? <span className="ml-2 text-xs font-normal text-accent-ink">Today</span> : null}
                  {day.closedAllDay ? <span className="ml-2 rounded-full bg-canvas-muted px-2 py-0.5 text-xs font-normal text-ink-2">{day.closedReason || "Closed"}</span> : null}
                </p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(`day:${day.key}`, () => setDayClosedAction(day.key, !day.closedAllDay))}
                  className="min-h-11 rounded-full px-3 text-sm text-ink-2 underline underline-offset-4 disabled:opacity-60"
                >
                  {busy === `day:${day.key}` ? "Saving…" : day.closedAllDay ? "Reopen day" : "Close day"}
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {SHIFT_ORDER.map((shift) => (
                  <div key={shift}>
                    <p className="text-xs text-ink-3">{SHIFTS[shift].label}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {day.slots
                        .filter((slot) => slot.shift === shift)
                        .map((slot) => {
                          const key = `${day.key} ${slot.time}`;
                          const booked = slot.state === "booked";
                          const willOpen = slot.state !== "open";
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={pending || booked || day.closedAllDay}
                              aria-pressed={slot.state === "open"}
                              aria-label={`${slot.label}: ${slot.state}${booked ? "" : willOpen ? ", tap to open" : ", tap to block"}`}
                              onClick={() => run(key, () => toggleSlotAction(day.key, slot.time, willOpen))}
                              className={cn(
                                "min-h-11 rounded-xl px-3 text-sm tabular-nums transition-colors duration-200 disabled:cursor-not-allowed",
                                slot.state === "open" && "border border-brand/50 bg-surface-raised text-brand hover:bg-highlight/50",
                                slot.state === "blocked" && "border border-dashed border-line-strong text-ink-3 line-through",
                                slot.state === "closed" && "border border-dashed border-line text-ink-3/80",
                                booked && "bg-brand text-left text-on-brand",
                                busy === key && "opacity-60",
                              )}
                            >
                              {slot.label}
                              {booked ? (
                                <span className="block text-[0.6875rem] text-on-brand-muted">
                                  <Sensitive>{slot.who || "Booked"}</Sensitive>
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="weekly-heading" className="rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-8">
        <h2 id="weekly-heading" className="font-display text-title text-brand">
          Your usual week
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-2">The shifts you normally work. Every day follows this unless you change it above.</p>
        <div className="mt-5 grid gap-2">
          {[1, 2, 3, 4, 5, 6, 0].map((weekday) => (
            <div key={weekday} className="grid grid-cols-[6.5rem_repeat(3,minmax(0,1fr))] items-center gap-2 sm:grid-cols-[9rem_repeat(3,minmax(0,10rem))]">
              <span className="text-sm text-ink-1">{WEEKDAYS[weekday]}</span>
              {SHIFT_ORDER.map((shift) => {
                const on = (weekly[weekday as keyof WeeklySchedule] ?? []).includes(shift);
                const key = `week:${weekday}:${shift}`;
                return (
                  <button
                    key={shift}
                    type="button"
                    disabled={pending}
                    aria-pressed={on}
                    aria-label={`${WEEKDAYS[weekday]} ${SHIFTS[shift].label}`}
                    onClick={() => run(key, () => setWeeklyAction(weekday, shift, !on))}
                    className={cn(
                      "min-h-11 rounded-xl px-2 text-sm transition-colors",
                      on ? "bg-brand text-on-brand" : "border border-dashed border-line-strong text-ink-3 hover:text-ink-1",
                      busy === key && "opacity-60",
                    )}
                  >
                    {SHIFTS[shift].label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <LeaveForm />
    </div>
  );
}

function LeaveForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(addLeaveAction, {});
  return (
    <section aria-labelledby="leave-heading" className="rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-8">
      <h2 id="leave-heading" className="font-display text-title text-brand">
        Leave
      </h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-2">Close every slot across a range of dates (up to 60 days). Booked sessions stay booked; ask the coordinator to move them.</p>
      <form action={action} className="mt-5 grid gap-4 sm:grid-cols-[repeat(3,minmax(0,12rem))_auto] sm:items-end">
        <Field label="From">
          <input type="date" name="from" required className={inputClass} />
        </Field>
        <Field label="To">
          <input type="date" name="to" className={inputClass} />
        </Field>
        <Field label="Shown as">
          <input name="reason" placeholder="Leave" maxLength={40} className={inputClass} />
        </Field>
        <button disabled={pending} className="min-h-12 rounded-full bg-brand px-5 text-sm font-medium text-on-brand disabled:opacity-60">
          {pending ? "Saving…" : "Add leave"}
        </button>
      </form>
      <div className="mt-3">
        <FormMessage error={state.error} message={state.ok ? "Leave added." : undefined} />
      </div>
    </section>
  );
}

function Legend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs text-ink-3" aria-label="Key">
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded border border-brand/50" /> Open
      </li>
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded bg-brand" /> Booked
      </li>
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded border border-dashed border-line-strong" /> Blocked or not your hours
      </li>
    </ul>
  );
}
