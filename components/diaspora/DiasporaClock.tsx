"use client";

import { KERALA_ZONE, placeForZone } from "@/data/diaspora";
import { formatTime } from "@/lib/time";
import { useTick, useVisitorZone } from "@/lib/use-time";

/**
 * The hero's small clock: the visitor's time beside Kerala's, from the device
 * time zone only. On the server (and before hydration) it simply says
 * "Kerala time (IST)". Visitors in India are pointed to the family section.
 */
export function DiasporaClock() {
  const zone = useVisitorZone();
  const tick = useTick();
  const now = tick === null ? null : new Date();
  const inIndia = zone === KERALA_ZONE;
  const city = placeForZone(zone);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-2">
      <p className="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface-raised px-4 py-2 tabular-nums">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-glow" />
        {now === null ? (
          "Kerala time (IST)"
        ) : inIndia || !zone ? (
          <>Kerala {formatTime(KERALA_ZONE, now)}</>
        ) : (
          <>
            {city ?? "Your time"} {formatTime(zone, now)}
            <span aria-hidden="true" className="text-ink-3">
              ·
            </span>
            Kerala {formatTime(KERALA_ZONE, now)}
          </>
        )}
      </p>
      {inIndia ? (
        <a href="#family" className="inline-flex min-h-11 items-center font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
          Worried about someone abroad?
        </a>
      ) : null}
    </div>
  );
}
