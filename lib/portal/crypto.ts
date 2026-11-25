import "server-only";
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { requireSecret } from "./env";

/**
 * Field encryption, lookup hashes and PIN hashing for the portal.
 *
 * - Fields: AES-256-GCM with a key derived from RECORDS_ENCRYPTION_KEY. The
 *   context ("Clients:CL-7F3K9Q:Full_Name") is bound as associated data, so a
 *   ciphertext copied into another row or column fails to decrypt.
 * - Lookup hashes: keyed HMAC, so a duplicate WhatsApp number can be found
 *   without storing it in the clear.
 * - PINs: scrypt with a random salt; the stored string carries its own
 *   parameters ("scrypt$N$r$p$salt$hash"), so they can be raised later.
 */

const FIELD_VERSION = "v1";

function masterKey(): Buffer {
  const key = Buffer.from(requireSecret("RECORDS_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("RECORDS_ENCRYPTION_KEY must be 32 bytes, base64-encoded.");
  return key;
}

function subKey(purpose: string): Buffer {
  return Buffer.from(hkdfSync("sha256", masterKey(), Buffer.alloc(0), purpose, 32));
}

export function encryptField(plain: string, context: string): string {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", subKey(`fields/${FIELD_VERSION}`), iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [FIELD_VERSION, iv.toString("base64url"), body.toString("base64url"), cipher.getAuthTag().toString("base64url")].join(":");
}

export function decryptField(value: string, context: string): string {
  if (!value) return "";
  const [version, iv, body, tag] = value.split(":");
  if (version !== FIELD_VERSION || !iv || !body || !tag) throw new Error("Unrecognised encrypted value.");
  const decipher = createDecipheriv("aes-256-gcm", subKey(`fields/${version}`), Buffer.from(iv, "base64url"));
  decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
}

export function lookupHash(value: string): string {
  return createHmac("sha256", subKey("lookup/v1")).update(value.trim().toLowerCase()).digest("base64url");
}

const PIN_PATTERN = /^\d{6}$/;
export const isValidPin = (pin: string) => PIN_PATTERN.test(pin);

/**
 * A 6-digit PIN has only a million values, so a stolen hash alone must be
 * useless: the PIN is first keyed with PIN_PEPPER (env only, never stored
 * beside the hashes), then scrypt-hashed.
 */
function peppered(pin: string): string {
  const pepper = requireSecret("PIN_PEPPER");
  return createHmac("sha256", pepper).update(pin).digest("base64url");
}

/** One-time setup codes (high-entropy, single use, short expiry): a keyed hash is enough. */
export function setupCodeHash(code: string): string {
  return createHmac("sha256", subKey("setup-code/v1")).update(code.trim().toUpperCase()).digest("base64url");
}

export function sameHash(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function scrypt(password: string, salt: Buffer, length: number, options: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCallback(password, salt, length, { ...options, maxmem: 64 * 1024 * 1024 }, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

export async function hashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) throw new Error("A PIN is exactly 6 digits.");
  const salt = randomBytes(16);
  const N = 16384, r = 8, p = 1;
  const hash = await scrypt(peppered(pin), salt, 32, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash || !isValidPin(pin)) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scrypt(peppered(pin), Buffer.from(salt, "base64url"), expected.length, { N: Number(N), r: Number(r), p: Number(p) });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
