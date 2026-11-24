"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CITIES, KERALA_ZONE, placeForZone } from "@/data/diaspora";
import { hourLabel, setChoice, useChoice, useEffectiveZone } from "./store";
import { formatDay, formatTime, instantAt, useTick } from "@/lib/time";

const DEFAULT_ZONE = "Asia/Dubai";
const DEFAULT_HOUR = 20;
const GROUPS = [...new Set(CITIES.map((city) => city.group))];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/**
 * "Your time, and Kerala's": the visitor's city (detected from the device,
 * changeable) and Kerala side by side, live; and an hour picker that converts
 * "8 PM in Dubai" to Kerala time, with the day when it crosses midnight. The
 * picked city and hour also go into the WhatsApp message.
 */
export function TimeHelper() {
  const { hour } = useChoice();
  const effective = useEffectiveZone();
  const tick = useTick();
  const zone = effective ?? DEFAULT_ZONE;
  const place = placeForZone(zone) ?? "Your city";
  const shortPlace = place.split(" / ")[0];
  const listed = CITIES.some((city) => city.zone === zone);
  const freeHour = hour ?? DEFAULT_HOUR;
  const now = tick === null ? null : new Date();
  const at = now ? instantAt(zone, freeHour, now) : null;

  return (
    <div className="rounded-[2rem] bg-surface-raised p-6 ring-1 ring-line sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Where you are" htmlFor="tz-city">
          <select
            id="tz-city"
            value={zone}
            onChange={(event) => setChoice({ zone: event.target.value })}
            className="h-12 w-full appearance-none rounded-full border border-line-strong bg-canvas pr-11 pl-5 text-[0.9375rem] text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {!listed ? <option value={zone}>Your time ({place})</option> : null}
            {GROUPS.map((group) => (
              <optgroup key={group} label={group}>
                {CITIES.filter((city) => city.group === group && city.zone !== KERALA_ZONE).map((city) => (
                  <option key={city.zone} value={city.zone}>
                    {city.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="If you are free at" htmlFor="tz-hour">
          <select
            id="tz-hour"
            value={freeHour}
            onChange={(event) => setChoice({ hour: Number(event.target.value) })}
            className="h-12 w-full appearance-none rounded-full border border-line-strong bg-canvas pr-11 pl-5 text-[0.9375rem] text-ink-1 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {hourLabel(h)} {shortPlace} time
              </option>
            ))}
          </select>
        </Field>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3">
        <Clock label={`Now in ${shortPlace}`} value={now ? formatTime(zone, now) : null} />
        <Clock label="Now in Kerala" value={now ? formatTime(KERALA_ZONE, now) : null} />
      </dl>

      <p aria-live="polite" className="mt-6 min-h-14 font-display text-xl leading-snug text-pretty text-brand">
        {at ? (
          <>
            {hourLabel(freeHour)} {formatDay(zone, at)} in {shortPlace} is {formatTime(KERALA_ZONE, at)} {formatDay(KERALA_ZONE, at)} in Kerala.
          </>
        ) : (
          "Pick your city and a time to see it in Kerala time."
        )}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-3">
        Tell us two times that suit you. Our coordinator matches them to a clinician&rsquo;s schedule. The time you pick
        here is added to your WhatsApp message.
      </p>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="relative mt-2">
        {children}
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-3" />
      </div>
    </div>
  );
}

function Clock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-2xl bg-canvas-muted px-4 py-4 sm:px-5">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-1 font-display text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-none text-brand tabular-nums">
        {value ?? "--:--"}
      </dd>
    </div>
  );
}
