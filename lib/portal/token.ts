import { jwtVerify, SignJWT } from "jose";

/**
 * The session token: who is signed in (clinician ID), their session version
 * and when they were last active, signed with HS256. It carries no client or
 * clinical data.
 *
 * - Raising a clinician's Session_Version (sign out everywhere, PIN change)
 *   invalidates every token issued before.
 * - The server refuses a token idle for more than IDLE_LIMIT, whatever the
 *   screen shows; the page keeps it fresh while the clinician is active.
 */
export const SESSION_MAX_AGE = 12 * 60 * 60; // seconds
export const IDLE_LIMIT_MS = 20 * 60_000; // server-side; the screen locks earlier, at 15 minutes
const AUDIENCE = "ullidam-portal";

export interface SessionClaims {
  clinicianId: string;
  version: number;
  /** Last activity, epoch milliseconds. */
  activeAt: number;
  /** When the clinician signed in, epoch milliseconds: the 12-hour limit counts from here, however active they are. */
  startedAt: number;
}

export function sessionKey(secret: string): Uint8Array {
  if (secret.length < 32) throw new Error("PORTAL_SESSION_SECRET must be at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function signSession(claims: SessionClaims, key: Uint8Array, maxAge = SESSION_MAX_AGE): Promise<string> {
  return new SignJWT({ ver: claims.version, act: claims.activeAt, sta: claims.startedAt })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.clinicianId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(claims.startedAt / 1000) + maxAge)
    .sign(key);
}

export async function verifySession(token: string, key: Uint8Array): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, key, { audience: AUDIENCE, algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.ver !== "number" || typeof payload.act !== "number" || typeof payload.sta !== "number") return null;
    return { clinicianId: payload.sub, version: payload.ver, activeAt: payload.act, startedAt: payload.sta };
  } catch {
    return null;
  }
}

export const isIdle = (claims: SessionClaims, now = Date.now()) => now - claims.activeAt > IDLE_LIMIT_MS;
