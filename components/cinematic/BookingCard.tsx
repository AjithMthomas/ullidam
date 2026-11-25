"use client";

import { useState } from "react";
import { Phone, Video, X } from "lucide-react";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { ButtonExternalLink, buttonStyles } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { placeForZone } from "@/data/diaspora";
import { daySlots, sampleAvailability, SHIFT_ORDER, SHIFTS, type PublicAvailability, type Shift } from "@/data/schedule";
import type { Therapist } from "@/data/therapists";
import { cn } from "@/lib/cn";
import { formatDate, formatTime, IST, istDay, istInstant } from "@/lib/time";
import { useTick, useVisitorZone } from "@/lib/use-time";
import { bookingRequestMessage, whatsappHref } from "@/lib/whatsapp";

type Format = "video" | "audio";
interface Slot {
  shift: Shift;
  time: string;
  at: Date;
}
interface Day {
  key: string;
  at: Date;
  slots: Slot[];
}
interface Pick {
  day: string;
  time: string;
}

const DAYS_AHEAD = 14;
const MIN_NOTICE_MS = 3 * 60 * 60 * 1000;
const FORMATS: { id: Format; label: string; Icon: typeof Video }[] = [
  { id: "video", label: "Video", Icon: Video },
  { id: "audio", label: "Audio call", Icon: Phone },
];

/** The next two weeks of open slots, in IST; today only offers slots at least 3 hours away. */
function upcomingDays(availability: PublicAvailability, now: Date): Day[] {
  return Array.from({ length: DAYS_AHEAD }, (_, i) => istDay(new Date(now.getTime() + i * 86_400_000))).map(({ key, weekday }) => ({
    key,
    at: istInstant(key, "12:00"),
    slots: daySlots(availability.weekly, availability.overrides, key, weekday)
      .filter((slot) => slot.state === "open")
      .map((slot) => ({ shift: slot.shift, time: slot.time, at: istInstant(key, slot.time) }))
      .filter((slot) => slot.at.getTime() > now.getTime() + MIN_NOTICE_MS),
  }));
}

/**
 * The booking station (docs/specs/booking-picker.md): video or audio, an
 * available date, then up to two times (preferred and backup), sent to the
 * coordinator as one WhatsApp message. The coordinator confirms; nothing is
 * booked automatically. Dates depend on today, so they render after
 * hydration, and picks are re-checked on every tick so stale times drop out.
 */
export function BookingCard({ therapist, availability = sampleAvailability(therapist.id) }: { therapist: Therapist; availability?: PublicAvailability }) {
  const psychiatry = therapist.trackFocus.includes("psychiatry");
  const [format, setFormat] = useState<Format>("video");
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const [rawPicks, setPicks] = useState<Pick[]>([]);
  const tick = useTick();
  const zone = useVisitorZone();
  const local = zone && zone !== IST && !zone.startsWith("Etc/") && zone !== "UTC" ? zone : null;
  const place = placeForZone(local)?.split(" / ")[0];

  const days = tick === null ? null : upcomingDays(availability, new Date());
  const open = (key: string | null) => Boolean(key && days?.some((day) => day.key === key && day.slots.length > 0));
  const firstOpen = days?.find((day) => day.slots.length > 0) ?? null;
  const dayKey = open(chosenDay) ? chosenDay : (firstOpen?.key ?? null);
  const day = days?.find((item) => item.key === dayKey);
  // Picks whose time has passed the cutoff (or whose day left the strip) quietly drop out.
  const picks = days
    ? rawPicks.filter((pick) => days.some((d) => d.key === pick.day && d.slots.some((slot) => slot.time === pick.time)))
    : rawPicks;

  /** "Tue 26 Nov, 9:30 AM IST (11:00 PM Mon 25 Nov, New York)": the local day appears when it differs. */
  const describe = (pick: Pick) => {
    const at = istInstant(pick.day, pick.time);
    const base = `${formatDate(IST, at)}, ${formatTime(IST, at)} IST`;
    if (!local) return base;
    const localDay = formatDate(local, at) !== formatDate(IST, at) ? ` ${formatDate(local, at)}` : "";
    return `${base} (${formatTime(local, at)}${localDay}, ${place})`;
  };
  const href = whatsappHref(bookingRequestMessage({ name: therapist.name, format, picks: picks.map(describe), place }));

  const remove = (target: Pick) => setPicks(picks.filter((pick) => !(pick.day === target.day && pick.time === target.time)));
  const toggle = (slot: Slot) => {
    if (!dayKey) return;
    const exists = picks.some((pick) => pick.day === dayKey && pick.time === slot.time);
    if (exists) remove({ day: dayKey, time: slot.time });
    else if (picks.length < 2) setPicks([...picks, { day: dayKey, time: slot.time }]);
  };
  const pickIndex = (time: string) => picks.findIndex((pick) => pick.day === dayKey && pick.time === time);
  const nextOpenLabel = firstOpen?.slots[0] ? `Next open: ${formatDate(IST, firstOpen.slots[0].at)}` : "No open times in the next two weeks";

  return (
    <>
      <div id="book" className="scroll-mt-28 rounded-[2rem] border border-line bg-canvas p-6 shadow-card sm:p-8">
        {days === null ? (
          <p className="h-5 text-sm text-ink-3">Checking availability</p>
        ) : (
          <StatusPulse status={firstOpen ? "open" : "gone"} label={nextOpenLabel} className="text-sm font-medium text-ink-2" />
        )}
        <h2 className="mt-5 font-display text-title text-brand">Book a session</h2>
        {availability.sample ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-3">
            Sample availability until live schedules launch. Our coordinator confirms one time with you.
          </p>
        ) : null}

        {/* 1. Format */}
        <fieldset className="mt-6 min-w-0">
          <legend className="text-sm font-medium text-ink-2">How would you like to talk?</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-canvas-muted p-1">
            {FORMATS.map(({ id, label, Icon }) => (
              <label
                key={id}
                className="relative flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full text-[0.9375rem] font-medium text-ink-2 transition-[background-color,color,box-shadow] duration-300 ease-calm has-[:checked]:bg-surface-raised has-[:checked]:text-brand has-[:checked]:shadow-card has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
              >
                <input type="radio" name="format" value={id} checked={format === id} onChange={() => setFormat(id)} className="sr-only" />
                <Icon className="size-4" />
                {label}
              </label>
            ))}
          </div>
          {psychiatry ? (
            <p className="mt-2 text-xs leading-relaxed text-ink-3">First psychiatric consultations are by video.</p>
          ) : null}
        </fieldset>

        {/* 2. Date (India time) */}
        <fieldset className="mt-7 min-w-0">
          <legend className="text-sm font-medium text-ink-2">
            Pick a date <span className="font-normal text-ink-3">(India time)</span>
          </legend>
          {days === null ? (
            <p role="status" className="mt-3 grid h-[4.75rem] place-items-center rounded-2xl bg-canvas-muted text-sm text-ink-3">
              Loading available dates
            </p>
          ) : (
            <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 [contain:inline-size] [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
              {days.map((item) => {
                const isOpen = item.slots.length > 0;
                const [weekday, date, month] = formatDate(IST, item.at).replace(",", "").split(" ");
                return (
                  <label
                    key={item.key}
                    className={cn(
                      "relative flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2.5 text-center transition-[background-color,border-color,color] duration-300 ease-calm",
                      isOpen
                        ? "cursor-pointer border-line-strong bg-surface-raised text-ink-1 hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-on-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
                        : "cursor-not-allowed border-dashed border-line text-ink-3",
                    )}
                  >
                    <input
                      type="radio"
                      name="day"
                      value={item.key}
                      disabled={!isOpen}
                      checked={dayKey === item.key}
                      onChange={(event) => {
                        setChosenDay(item.key);
                        event.currentTarget.parentElement?.scrollIntoView({ block: "nearest", inline: "nearest" });
                      }}
                      className="sr-only"
                    />
                    <span className="text-[0.6875rem] font-medium tracking-wide uppercase">{weekday}</span>
                    <span className={cn("font-display text-xl leading-tight tabular-nums", !isOpen && "line-through decoration-1")}>{date}</span>
                    <span className="text-[0.6875rem]">{isOpen ? month : "Closed"}</span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* 3. Up to two times */}
        <div className="mt-7">
          <p id="times-hint" className="text-sm font-medium text-ink-2">
            Pick up to two times{" "}
            <span className="font-normal text-ink-3">
              {picks.length >= 2 ? "(two picked; tap one to change it)" : "(preferred, then a backup)"}
            </span>
          </p>
          {days === null ? (
            <div className="mt-3 h-24 rounded-2xl bg-canvas-muted" aria-hidden="true" />
          ) : !firstOpen ? (
            <p className="mt-3 rounded-2xl bg-canvas-muted p-4 text-sm leading-relaxed text-ink-2">
              No open times in the next two weeks. Message us and we will find one.
            </p>
          ) : (
            <div role="group" aria-label={day ? `Times on ${formatDate(IST, day.at)}` : "Times"} className="mt-3 grid gap-4">
              {SHIFT_ORDER.map((shift) => {
                const slots = day?.slots.filter((slot) => slot.shift === shift) ?? [];
                if (!slots.length) return null;
                return (
                  <div key={shift}>
                    <p className="text-xs text-ink-3">{SHIFTS[shift].label}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {slots.map((slot) => {
                        const index = pickIndex(slot.time);
                        const picked = index >= 0;
                        const localDiffers = local && formatDate(local, slot.at) !== formatDate(IST, slot.at);
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            aria-pressed={picked}
                            aria-describedby="times-hint"
                            disabled={!picked && picks.length >= 2}
                            onClick={() => toggle(slot)}
                            className={cn(
                              "flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-1.5 text-center transition-[background-color,border-color,color] duration-300 ease-calm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45",
                              picked ? "border-brand bg-brand text-on-brand" : "border-line-strong bg-surface-raised text-ink-1 hover:border-brand/40",
                            )}
                          >
                            <span className="text-sm font-medium tabular-nums">{formatTime(IST, slot.at)} IST</span>
                            {local ? (
                              <span className={cn("text-[0.6875rem] tabular-nums", picked ? "text-on-brand-muted" : "text-ink-3")}>
                                {formatTime(local, slot.at)}
                                {localDiffers ? ` ${formatDate(local, slot.at).split(" ")[0].replace(",", "")}` : ""} {place}
                              </span>
                            ) : null}
                            {picked ? (
                              <span className="text-[0.625rem] font-semibold tracking-wide uppercase">{index === 0 ? "Preferred" : "Backup"}</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Always rendered, so the first pick is announced too. */}
        <div aria-live="polite">
          {picks.length ? (
            <dl className="mt-6 grid gap-1 rounded-2xl bg-highlight/50 p-2 text-sm">
              {picks.map((pick, index) => (
                <div key={`${pick.day}-${pick.time}`} className="flex items-center justify-between gap-2 pl-2">
                  <dt className="shrink-0 text-ink-2">{index === 0 ? "Preferred" : "Backup"}</dt>
                  <dd className="flex min-w-0 items-center gap-1">
                    <span className="text-right font-medium text-ink-1">{describe(pick)}</span>
                    <button
                      type="button"
                      onClick={() => remove(pick)}
                      aria-label={`Remove ${index === 0 ? "preferred" : "backup"} time`}
                      className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-raised hover:text-brand focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <X className="size-4" />
                    </button>
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          {picks.length === 1 ? <p className="mt-2 text-xs text-ink-3">Adding a backup time helps us confirm faster.</p> : null}
        </div>

        <ButtonExternalLink href={href} size="lg" className="mt-6 w-full">
          <WhatsAppLogo />
          Request on WhatsApp
        </ButtonExternalLink>
        <p className="mt-3 text-center text-sm leading-relaxed text-ink-3">Our coordinator confirms one time with you on WhatsApp.</p>

        <dl className="mt-7 grid gap-2.5 border-t border-line pt-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Languages</dt>
            <dd className="text-right text-ink-1">{therapist.languages.join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Registration</dt>
            <dd className="text-ink-1">{therapist.license}</dd>
          </div>
        </dl>
      </div>

      {/* Phones: one tap to the picker, then one tap to send. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <p className="min-w-0 text-sm">
            <span className="block font-display text-lg text-brand">{format === "audio" ? "Audio call" : "Video session"}</span>
            <span className="block truncate text-ink-3">{picks[0] ? describe(picks[0]) : "Private and one-to-one"}</span>
          </p>
          {picks.length || (days !== null && !firstOpen) ? (
            <ButtonExternalLink href={href}>
              <WhatsAppLogo />
              Request
            </ButtonExternalLink>
          ) : (
            <a href="#book" className={buttonStyles({})}>
              Pick a time
            </a>
          )}
        </div>
      </div>
    </>
  );
}
