"use client";

import { useSyncExternalStore } from "react";
import { detectTimeZone } from "@/lib/region";

const IST = "Asia/Kolkata";
const TICK = 15_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK);
  return () => clearInterval(id);
}

const minuteSnapshot = () => Math.floor(Date.now() / TICK);

function format(now: number, timeZone: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone })
    .format(now)
    .toUpperCase();
}

function place(timeZone: string) {
  return timeZone.split("/").pop()?.replace(/_/g, " ") ?? "You";
}

/**
 * The visitor's time beside Kerala's, rendered in the browser only (the server
 * cannot know the visitor's zone). One clock when the visitor is already on IST.
 * No live region: a ticking clock should never interrupt a screen reader.
 */
export function FilmClocks() {
  const tick = useSyncExternalStore(subscribe, minuteSnapshot, () => null);
  const zone = useSyncExternalStore(subscribe, detectTimeZone, () => null);
  const now = tick === null ? null : tick * TICK;
  const rows = zone && zone !== IST && zone !== "Asia/Calcutta"
    ? [{ label: `You, ${place(zone)}`, zone }, { label: "Kerala", zone: IST }]
    : [{ label: "Kerala", zone: IST }];

  return (
    <dl className="mt-3 grid gap-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-6">
          <dt className="text-sm text-on-brand-muted">{row.label}</dt>
          <dd className="font-display text-lg text-on-brand tabular-nums" suppressHydrationWarning>
            {now === null ? "--:--" : format(now, row.zone)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
