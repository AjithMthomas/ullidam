import "server-only";
import { cookies } from "next/headers";
import { requireSecret } from "./env";
import { SESSION_MAX_AGE, sessionKey, signSession, verifySession, type SessionClaims } from "./token";

/**
 * The portal session cookie: httpOnly, SameSite=Strict, scoped to /portal,
 * 12 hours at most. Cookies can only be written from server actions and
 * route handlers, so activity is refreshed through touchSession() there.
 */
export const SESSION_COOKIE = "ullidam_portal";

const key = () => sessionKey(requireSecret("PORTAL_SESSION_SECRET"));

export async function startSession(claims: { clinicianId: string; version: number }, startedAt = Date.now()): Promise<void> {
  const now = Date.now();
  const token = await signSession({ ...claims, activeAt: now, startedAt }, key());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/portal",
    maxAge: Math.max(1, Math.floor((startedAt + SESSION_MAX_AGE * 1000 - now) / 1000)),
  });
}

export async function readSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(token, key()) : null;
}

/** Marks the clinician as active now (server actions only). */
export async function touchSession(claims: SessionClaims): Promise<void> {
  await startSession({ clinicianId: claims.clinicianId, version: claims.version }, claims.startedAt);
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/portal" });
}
