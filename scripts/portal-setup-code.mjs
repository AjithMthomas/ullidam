// Issues a one-time setup code so a clinician can choose their own PIN
// (LOCAL stand-in only; the coordinator desk does this in production, Phase E).
//
//   npm run portal:setup-code -- ananya-menon
//
// The code is single use and expires in 24 hours. Only its keyed hash is stored.
import { createHmac, hkdfSync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const clinicianId = process.argv[2];
if (!clinicianId) {
  console.error("Usage: npm run portal:setup-code -- <clinician-id>");
  process.exit(1);
}

const root = process.cwd();
const env = readFileSync(path.join(root, ".env.local"), "utf8");
const masterB64 = env.match(/^RECORDS_ENCRYPTION_KEY=(.+)$/m)?.[1]?.trim();
if (!masterB64) throw new Error("RECORDS_ENCRYPTION_KEY missing; run npm run portal:seed first");

// Same derivation as lib/portal/crypto.ts setupCodeHash().
const key = Buffer.from(hkdfSync("sha256", Buffer.from(masterB64, "base64"), Buffer.alloc(0), "setup-code/v1", 32));
const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const code = Array.from(randomBytes(10), (b) => alphabet[b % alphabet.length]).join("");
const hash = createHmac("sha256", key).update(code).digest("base64url");

const vaultFile = path.join(root, ".data", "portal", "vault.json");
const vault = JSON.parse(readFileSync(vaultFile, "utf8"));
const [header, ...rows] = vault.Clinician_Auth;
const col = (name) => header.indexOf(name);
const target = rows.find((r) => r[col("Clinician_ID")] === clinicianId);
if (!target) throw new Error(`No clinician "${clinicianId}"`);
target[col("Setup_Code_Hash")] = hash;
target[col("Setup_Code_Expires")] = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
target[col("Row_Version")] = String(Number(target[col("Row_Version")] || "0") + 1);
target[col("Updated_At")] = new Date().toISOString();
writeFileSync(vaultFile, JSON.stringify(vault, null, 1));

console.log(`Setup code for ${clinicianId}: ${code}\nValid once, for 24 hours. Share it privately.`);
