"use client";

import { useSyncExternalStore } from "react";
import { detectTimeZone } from "@/lib/region";

/** Browser-only time hooks (the pure helpers are in lib/time.ts, safe on the server). */

const noop = () => () => {};

/** The visitor's device time zone after hydration; null on the server (never from IP). */
export function useVisitorZone(): string | null {
  return useSyncExternalStore(noop, detectTimeZone, () => null);
}

const TICK = 15_000;
const subscribeTick = (onChange: () => void) => {
  const id = setInterval(onChange, TICK);
  return () => clearInterval(id);
};

/** Changes every 15 seconds on the client (clocks stay current); null on the server and before hydration. */
export function useTick(): number | null {
  return useSyncExternalStore(subscribeTick, () => Math.floor(Date.now() / TICK), () => null);
}
