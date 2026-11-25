"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  changePin,
  checkPin,
  requireClinician,
  setupPin,
  signIn,
  signOut,
  signOutEverywhere,
  type PinResult,
  type SetupResult,
} from "@/lib/portal/auth";
import { readSession, touchSession } from "@/lib/portal/session";
import { isIdle } from "@/lib/portal/token";

export interface FormState {
  error?: string;
  ok?: boolean;
}

/**
 * A coarse extra brake per network address. It lives in one server instance
 * only; production adds a Vercel Firewall rate-limit rule on /portal
 * (docs/specs/portal.md section 14), and the per-clinician lockout is the
 * real limit.
 */
const attemptsByIp = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 20;

async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

function tooManyFrom(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (attemptsByIp.get(ip) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  attemptsByIp.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

const TOO_MANY = "Too many attempts from this connection. Please wait a few minutes.";

function message(result: Exclude<PinResult | SetupResult, { ok: true }>): string {
  switch (result.reason) {
    case "locked":
      return `Too many attempts. To keep records safe, this account is locked for ${result.minutes} minutes.`;
    case "weak":
      return "Choose 6 digits that aren't a run or a repeat (like 123456 or 111111).";
    case "expired":
      return "This setup code has expired. Ask the coordinator for a new one.";
    case "invalid":
      return "attemptsLeft" in result && result.attemptsLeft <= 2
        ? `That didn't match. ${result.attemptsLeft} ${result.attemptsLeft === 1 ? "try" : "tries"} left before a short lock.`
        : "That didn't match. Please try again.";
  }
}

export async function signInAction(_: FormState, form: FormData): Promise<FormState> {
  const clinicianId = String(form.get("clinicianId") ?? "");
  const ip = await clientIp();
  if (tooManyFrom(ip)) return { error: TOO_MANY };
  if (!clinicianId) return { error: "Choose who is signing in." };
  const result = await signIn(clinicianId, String(form.get("pin") ?? ""), ip);
  if (!result.ok) return { error: message(result) };
  redirect("/portal/today");
}

export async function setupPinAction(_: FormState, form: FormData): Promise<FormState> {
  const clinicianId = String(form.get("clinicianId") ?? "");
  const pin = String(form.get("pin") ?? "");
  const ip = await clientIp();
  if (tooManyFrom(ip)) return { error: TOO_MANY };
  if (pin !== String(form.get("confirm") ?? "")) return { error: "The two PINs don't match." };
  const result = await setupPin(clinicianId, String(form.get("code") ?? ""), pin, ip);
  if (!result.ok) return { error: message(result) };
  redirect("/portal/today");
}

/** The idle-lock screen: the same PIN check and lockout as sign-in; refreshes activity on success. */
export async function unlockAction(_: FormState, form: FormData): Promise<FormState> {
  const session = await readSession();
  if (!session) redirect("/portal");
  const ip = await clientIp();
  if (tooManyFrom(ip)) return { error: TOO_MANY };
  const result = await checkPin(session.clinicianId, String(form.get("pin") ?? ""), ip, "unlock");
  if (result.ok) {
    await touchSession(session);
    return { ok: true };
  }
  if (result.reason === "locked") {
    await signOut();
    redirect("/portal?locked=1");
  }
  return { error: message(result) };
}

/** Called every few minutes while the clinician is active, so the server's idle limit doesn't end a session in use. */
export async function touchAction(): Promise<{ ok: boolean }> {
  const session = await readSession();
  if (!session || isIdle(session)) return { ok: false };
  await touchSession(session);
  return { ok: true };
}

/** Sign-out returns instead of redirecting: the page then does a full reload, so no records stay in the browser's memory. */
export async function signOutAction(): Promise<void> {
  await signOut();
}

export async function signOutEverywhereAction(): Promise<void> {
  const clinician = await requireClinician();
  await signOutEverywhere(clinician.id);
}

export async function changePinAction(_: FormState, form: FormData): Promise<FormState> {
  const clinician = await requireClinician();
  const next = String(form.get("next") ?? "");
  if (next !== String(form.get("confirm") ?? "")) return { error: "The new PINs don't match." };
  const result = await changePin(clinician.id, String(form.get("current") ?? ""), next, await clientIp());
  return result.ok ? { ok: true } : { error: message(result) };
}
