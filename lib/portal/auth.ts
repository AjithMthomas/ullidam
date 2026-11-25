import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { audit } from "./audit";
import { hashPin, isValidPin, sameHash, setupCodeHash, verifyPin } from "./crypto";
import {
  findAuthRow,
  findClinicianRow,
  forgetSessionCheck,
  isActive,
  sessionCheck,
  toPortalClinician,
  type PortalClinician,
} from "./repo/clinicians";
import { endSession, readSession, startSession } from "./session";
import { StoreError } from "./store";
import { updateRow } from "./tables";
import { isIdle } from "./token";

/**
 * The portal's data-access gate (Next.js "Data Access Layer"). Every screen
 * and server action gets the clinician from here, never from the request,
 * so each one only ever sees their own data. The server enforces the idle
 * limit and session version itself; the screen lock is only a courtesy.
 */

export const MAX_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

/** The signed-in clinician; otherwise back to sign-in (expired, idle, revoked or inactive). */
export const requireClinician = cache(async (): Promise<PortalClinician> => {
  const session = await readSession();
  if (!session) redirect("/portal");
  if (isIdle(session)) redirect("/portal?idle=1");
  const check = await sessionCheck(session.clinicianId);
  if (!check || !check.active || check.version !== session.version) redirect("/portal?signedOut=1");
  return toPortalClinician(check.row);
});

/** Clinical screens: clinicians only (the coordinator has the desk, not client records). */
export async function requireTreatingClinician(): Promise<PortalClinician> {
  const user = await requireClinician();
  if (user.role !== "clinician") redirect("/portal/desk");
  return user;
}

/** Coordinator screens: anyone else gets the same "not found" as a missing page. */
export async function requireCoordinator(): Promise<PortalClinician> {
  const user = await requireClinician();
  if (user.role !== "coordinator") notFound();
  return user;
}

/** For the sign-in page: who is signed in and still valid, if anyone (no redirect). */
export async function currentClinicianId(): Promise<string | null> {
  const session = await readSession();
  if (!session || isIdle(session)) return null;
  const check = await sessionCheck(session.clinicianId);
  return check && check.active && check.version === session.version ? session.clinicianId : null;
}

export type PinResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; attemptsLeft: number }
  | { ok: false; reason: "locked"; minutes: number };

const DUMMY_HASH = "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

/**
 * Check a clinician's PIN with lockout: after MAX_ATTEMPTS wrong PINs the
 * account locks for LOCK_MINUTES. Shared by sign-in, the idle-lock screen and
 * PIN changes, so every path counts against the same limit. Unknown
 * clinicians and wrong PINs look the same to the caller.
 */
export async function checkPin(clinicianId: string, pin: string, ip: string | null, purpose: "signin" | "unlock"): Promise<PinResult> {
  const [card, auth] = await Promise.all([findClinicianRow(clinicianId), findAuthRow(clinicianId)]);
  const now = Date.now();
  if (!card || !auth || !isActive(card) || !auth.PIN_Hash) {
    await verifyPin(isValidPin(pin) ? pin : "000000", DUMMY_HASH); // similar timing either way
    return { ok: false, reason: "invalid", attemptsLeft: MAX_ATTEMPTS };
  }

  const lockedUntil = auth.Locked_Until ? Date.parse(auth.Locked_Until) : 0;
  if (lockedUntil > now) {
    await audit({ clinicianId, action: "signin.locked", ip, result: "denied" });
    return { ok: false, reason: "locked", minutes: Math.ceil((lockedUntil - now) / 60_000) };
  }

  if (isValidPin(pin) && (await verifyPin(pin, auth.PIN_Hash))) {
    if (auth.Failed_Attempts !== "0" || auth.Locked_Until) await updateRow("Clinician_Auth", auth, { Failed_Attempts: "0", Locked_Until: "" });
    await audit({ clinicianId, action: purpose === "signin" ? "signin.success" : "unlock.success", ip });
    return { ok: true };
  }

  const failures = Number(auth.Failed_Attempts || "0") + 1;
  const lock = failures >= MAX_ATTEMPTS;
  await updateRow("Clinician_Auth", auth, {
    Failed_Attempts: lock ? "0" : String(failures),
    Locked_Until: lock ? new Date(now + LOCK_MINUTES * 60_000).toISOString() : "",
  });
  await audit({ clinicianId, action: purpose === "signin" ? "signin.fail" : "unlock.fail", ip, result: "denied" });
  return lock
    ? { ok: false, reason: "locked", minutes: LOCK_MINUTES }
    : { ok: false, reason: "invalid", attemptsLeft: MAX_ATTEMPTS - failures };
}

export async function signIn(clinicianId: string, pin: string, ip: string | null): Promise<PinResult> {
  const result = await checkPin(clinicianId, pin, ip, "signin");
  if (result.ok) {
    const auth = await findAuthRow(clinicianId);
    await startSession({ clinicianId, version: Number(auth?.Session_Version || "0") });
  }
  return result;
}

export async function signOut(): Promise<void> {
  const session = await readSession();
  if (session) await audit({ clinicianId: session.clinicianId, action: "signout" });
  await endSession();
}

async function bumpSessionVersion(clinicianId: string, extra: Record<string, string> = {}): Promise<void> {
  const auth = await findAuthRow(clinicianId);
  if (auth) await updateRow("Clinician_Auth", auth, { ...extra, Session_Version: String(Number(auth.Session_Version || "0") + 1) });
  forgetSessionCheck(clinicianId);
}

/** Ends every session of this clinician on every device. */
export async function signOutEverywhere(clinicianId: string): Promise<void> {
  await bumpSessionVersion(clinicianId);
  await audit({ clinicianId, action: "signout.everywhere" });
  await endSession();
}

export const isWeakPin = (pin: string) =>
  !isValidPin(pin) || /^(\d)\1{5}$/.test(pin) || "01234567890".includes(pin) || "09876543210".includes(pin);

/** Change PIN (needs the current PIN). Signs out every other device, then keeps this one signed in. */
export async function changePin(
  clinicianId: string,
  currentPin: string,
  nextPin: string,
  ip: string | null,
): Promise<PinResult | { ok: false; reason: "weak" }> {
  if (isWeakPin(nextPin)) return { ok: false, reason: "weak" };
  const check = await checkPin(clinicianId, currentPin, ip, "unlock");
  if (!check.ok) return check;
  await bumpSessionVersion(clinicianId, { PIN_Hash: await hashPin(nextPin) });
  await audit({ clinicianId, action: "pin.change", ip });
  const auth = await findAuthRow(clinicianId);
  await startSession({ clinicianId, version: Number(auth?.Session_Version || "0") });
  return { ok: true };
}

/** Coordinator: a one-time setup code for a clinician's first sign-in or a forgotten PIN. Shown once, stored only hashed. */
export async function issueSetupCode(clinicianId: string, issuedBy: string): Promise<string> {
  const auth = await findAuthRow(clinicianId);
  if (!auth) throw new StoreError("Unknown clinician.", 404);
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const code = Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => alphabet[b % alphabet.length]).join("");
  await updateRow("Clinician_Auth", auth, {
    Setup_Code_Hash: setupCodeHash(code),
    Setup_Code_Expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  await audit({ clinicianId: issuedBy, action: "setup.issue", entity: "clinician", entityId: clinicianId });
  return code;
}

export type SetupResult = { ok: true } | { ok: false; reason: "invalid" | "expired" | "weak" };

/**
 * First sign-in: a one-time setup code from the coordinator (single use,
 * 24-hour expiry) lets the clinician choose their own PIN, so nobody else
 * ever knows it. Wrong codes count towards the same lockout as PINs.
 */
export async function setupPin(clinicianId: string, code: string, pin: string, ip: string | null): Promise<SetupResult | PinResult> {
  if (isWeakPin(pin)) return { ok: false, reason: "weak" };
  const [card, auth] = await Promise.all([findClinicianRow(clinicianId), findAuthRow(clinicianId)]);
  if (!card || !auth || !isActive(card) || !auth.Setup_Code_Hash) return { ok: false, reason: "invalid" };

  const lockedUntil = auth.Locked_Until ? Date.parse(auth.Locked_Until) : 0;
  if (lockedUntil > Date.now()) return { ok: false, reason: "locked", minutes: Math.ceil((lockedUntil - Date.now()) / 60_000) };
  if (!auth.Setup_Code_Expires || Date.parse(auth.Setup_Code_Expires) < Date.now()) return { ok: false, reason: "expired" };

  if (!sameHash(setupCodeHash(code), auth.Setup_Code_Hash)) {
    const failures = Number(auth.Failed_Attempts || "0") + 1;
    const lock = failures >= MAX_ATTEMPTS;
    await updateRow("Clinician_Auth", auth, {
      Failed_Attempts: lock ? "0" : String(failures),
      Locked_Until: lock ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : "",
    });
    await audit({ clinicianId, action: "signin.fail", entity: "setup-code", ip, result: "denied" });
    return lock ? { ok: false, reason: "locked", minutes: LOCK_MINUTES } : { ok: false, reason: "invalid" };
  }

  await bumpSessionVersion(clinicianId, {
    PIN_Hash: await hashPin(pin),
    Setup_Code_Hash: "",
    Setup_Code_Expires: "",
    Failed_Attempts: "0",
    Locked_Until: "",
  });
  await audit({ clinicianId, action: "pin.change", entity: "setup-code", ip });
  const fresh = await findAuthRow(clinicianId);
  await startSession({ clinicianId, version: Number(fresh?.Session_Version || "0") });
  return { ok: true };
}
