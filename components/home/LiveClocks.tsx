"use client";

import { useSyncExternalStore } from "react";
import { detectTimeZone } from "@/lib/region";

const ZONES = [
  { place: "Kerala", code: "IST", timeZone: "Asia/Kolkata" },
  { place: "Dubai", code: "GST", timeZone: "Asia/Dubai" },
  { place: "London", code: "UK", timeZone: "Europe/London" },
  { place: "New York", code: "US East", timeZone: "America/New_York" },
] as const;

const TICK = 15_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK);
  return () => clearInterval(id);
}

/** A stable value per 15-second window, so the clock re-renders only when the minute can change. */
const minuteSnapshot = () => Math.floor(Date.now() / TICK);

function format(now: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone })
    .format(now)
    .toUpperCase();
}

/** Live clocks for the diaspora, with the visitor's own time highlighted. Rendered after hydration only. */
export function LiveClocks() {
  const tick = useSyncExternalStore(subscribe, minuteSnapshot, () => null);
  const ownZone = useSyncExternalStore(subscribe, detectTimeZone, () => null);
  // Accurate to the 15-second window: enough for a clock that shows minutes.
  const now = tick === null ? null : tick * TICK;

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3">
        {ZONES.map((zone) => {
          const isOwn = ownZone === zone.timeZone;
          return (
            <li
              key={zone.timeZone}
              className={`rounded-2xl px-4 py-3 ${isOwn ? "bg-brand text-on-brand" : "bg-canvas/70 text-ink-1"}`}
            >
              <span className={`block text-xs ${isOwn ? "text-on-brand-muted" : "text-ink-3"}`}>
                {zone.place} &middot; {zone.code}
                {isOwn ? " · you" : ""}
              </span>
              <span className="mt-0.5 block font-display text-xl tabular-nums" suppressHydrationWarning>
                {now === null ? "--:--" : format(now, zone.timeZone)}
              </span>
            </li>
          );
        })}
      </ul>
      {ownZone && !ZONES.some((z) => z.timeZone === ownZone) && now !== null ? (
        <p className="mt-3 text-sm text-ink-3">
          Your time ({ownZone.split("/").pop()?.replace(/_/g, " ")}): {format(now, ownZone)}
        </p>
      ) : null}
    </div>
  );
}
