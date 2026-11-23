"use client";

import { useSyncExternalStore } from "react";
import { detectRegion, type Region } from "./region";

/**
 * UllidamVault (spec Rule 2): preferences live only in this browser's
 * localStorage. Nothing here is ever sent to a server, and every access is
 * guarded because storage can be blocked (private windows, strict settings).
 * Sensitive answers, such as triage responses, are never stored.
 */
interface VaultData {
  /** The homepage story has been watched to the end on this device. */
  storySeen?: boolean;
}

const KEY = "ullidam-vault";
const CHANGE_EVENT = "ullidam-vault-change";

function read(): VaultData {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as VaultData) : {};
  } catch {
    return {};
  }
}

export function writeVault(patch: Partial<VaultData>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }));
  } catch {
    // Storage unavailable: the preference simply lasts for this page view.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const noopSubscribe = () => () => {};

/** Returning visitors open on the calm ending instead of replaying the story. */
export function useStorySeen(): [boolean, (seen: boolean) => void] {
  const seen = useSyncExternalStore(subscribe, () => read().storySeen === true, () => false);
  return [seen, (next) => writeVault({ storySeen: next })];
}

/** The visitor's region from their device time zone (India until hydrated). */
export function useRegion(): Region {
  return useSyncExternalStore(noopSubscribe, detectRegion, () => "india" as Region);
}
