// Seeds the LOCAL stand-in for the portal's Google Sheets (development only).
//
//   npm run portal:seed             create .data/portal and dev secrets if missing
//   npm run portal:seed -- --reset  rebuild the sample data (keeps existing dev PINs)
//
// - Adds PORTAL_DATA_DRIVER=local and fresh secrets to .env.local (never
//   overwrites existing values).
// - Writes .data/portal/ops.json and vault.json with every tab and header
//   from lib/portal/schema.json, the four sample clinicians, a coordinator,
//   usual weeks, 12 weeks of past sessions, upcoming and pending bookings,
//   and client records with signed notes, all encrypted exactly as the app
//   encrypts them.
// - Fake people and fake data only. Never put real client information in
//   development.
import { createCipheriv, createHmac, hkdfSync, randomBytes, randomInt, scryptSync } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
// --demo builds the committed demo copy (lib/portal/demo) used on Vercel, with demo-only keys.
const demo = process.argv.includes("--demo");
const localDir = path.join(root, ".data", "portal");
const dataDir = demo ? path.join(root, "lib", "portal", "demo") : localDir;
const envFile = path.join(root, ".env.local");
const schema = JSON.parse(readFileSync(path.join(root, "lib", "portal", "schema.json"), "utf8"));
const reset = process.argv.includes("--reset") || demo;

let pepper;
let master;
if (demo) {
  /* Demo keys: public by design, used only for the fake demo data (never real records). */
  mkdirSync(dataDir, { recursive: true });
  const keysFile = path.join(dataDir, "keys.json");
  if (!existsSync(keysFile)) {
    writeFileSync(
      keysFile,
      JSON.stringify(
        {
          $comment: "Demo-only keys for the fake sample data in this folder. Public by design. Never use for real records: production sets PORTAL_DATA_DRIVER=google with its own secrets.",
          PORTAL_SESSION_SECRET: randomBytes(48).toString("base64url"),
          RECORDS_ENCRYPTION_KEY: randomBytes(32).toString("base64"),
          PIN_PEPPER: randomBytes(32).toString("base64url"),
        },
        null,
        2,
      ) + "\n",
    );
  }
  const keys = JSON.parse(readFileSync(keysFile, "utf8"));
  pepper = keys.PIN_PEPPER;
  master = Buffer.from(keys.RECORDS_ENCRYPTION_KEY, "base64");
} else {
  /* 1. Secrets in .env.local (kept if already present). */
  const env = existsSync(envFile) ? readFileSync(envFile, "utf8") : "";
  const has = (name) => new RegExp(`^${name}=`, "m").test(env);
  const additions = [];
  if (!has("PORTAL_DATA_DRIVER")) additions.push("PORTAL_DATA_DRIVER=local");
  if (!has("PORTAL_SESSION_SECRET")) additions.push(`PORTAL_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
  if (!has("RECORDS_ENCRYPTION_KEY")) additions.push(`RECORDS_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`);
  if (!has("PIN_PEPPER")) additions.push(`PIN_PEPPER=${randomBytes(32).toString("base64url")}`);
  if (additions.length) {
    writeFileSync(envFile, `${env}\n# Clinician portal (local development only; production values live in Vercel)\n${additions.join("\n")}\n`);
    console.log(`Added ${additions.length} portal setting(s) to .env.local`);
  }
  const finalEnv = readFileSync(envFile, "utf8");
  const secret = (name) => finalEnv.match(new RegExp(`^${name}=(.+)$`, "m"))?.[1]?.trim();
  pepper = secret("PIN_PEPPER");
  master = Buffer.from(secret("RECORDS_ENCRYPTION_KEY"), "base64");
}

/* 2. Keep existing PINs: hashes on a local --reset; the same plain PINs for the demo copy. */
if (!demo && existsSync(dataDir) && !reset) {
  console.log("Local portal data already exists (.data/portal). Use --reset to rebuild the sample data.");
  process.exit(0);
}
const previousAuth = new Map();
const knownPins = new Map(); // name or id -> plain PIN, from the local DEV-PINS.txt
let previousPins = "";
try {
  previousPins = readFileSync(path.join(localDir, "DEV-PINS.txt"), "utf8");
  for (const line of previousPins.split("\n")) {
    const match = /^(.+?)\s+(\d{6})\s*$/.exec(line.trim());
    if (match) knownPins.set(match[1].trim(), match[2]);
  }
  if (!demo) {
    const vault = JSON.parse(readFileSync(path.join(localDir, "vault.json"), "utf8"));
    const [header, ...rows] = vault.Clinician_Auth;
    for (const row of rows) previousAuth.set(row[header.indexOf("Clinician_ID")], row[header.indexOf("PIN_Hash")]);
  }
} catch {
  /* first run */
}
if (demo) previousPins = "";
if (reset && !demo) rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

/* Crypto: the same scheme as lib/portal/crypto.ts. */
const subKey = (purpose) => Buffer.from(hkdfSync("sha256", master, Buffer.alloc(0), purpose, 32));
const fieldKey = subKey("fields/v1");
const lookupKey = subKey("lookup/v1");
function enc(plain, context) {
  if (!plain) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", fieldKey, iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const body = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), body.toString("base64url"), cipher.getAuthTag().toString("base64url")].join(":");
}
const lookup = (value) => createHmac("sha256", lookupKey).update(value.trim().toLowerCase()).digest("base64url");
function hashPin(pin) {
  const salt = randomBytes(16);
  const peppered = createHmac("sha256", pepper).update(pin).digest("base64url");
  return `scrypt$16384$8$1$${salt.toString("base64url")}$${scryptSync(peppered, salt, 32, { N: 16384, r: 8, p: 1 }).toString("base64url")}`;
}
function devPin() {
  for (;;) {
    const pin = String(randomInt(0, 1_000_000)).padStart(6, "0");
    if (!/^(\d)\1{5}$/.test(pin) && !"01234567890".includes(pin) && !"09876543210".includes(pin)) return pin;
  }
}
const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const id = (prefix) => `${prefix}-${Array.from(randomBytes(8), (b) => alphabet[b % alphabet.length]).join("")}`;

/* Dates in IST. */
const IST_MS = 330 * 60_000;
const DAY = 86_400_000;
const istNow = Date.now() + IST_MS;
const dayKey = (offset) => new Date(istNow + offset * DAY).toISOString().slice(0, 10);
const weekdayOf = (offset) => new Date(istNow + offset * DAY).getUTCDay();
const nowIso = new Date().toISOString();

/* Tables. */
const books = { ops: {}, vault: {} };
for (const [tab, def] of Object.entries(schema.tabs)) books[def.book][tab] = [def.columns];
const put = (tab, values) => {
  const def = schema.tabs[tab];
  const stamped = def.columns.includes("Row_Version") ? { Row_Version: "1", Updated_At: nowIso, ...values } : values;
  books[def.book][tab].push(def.columns.map((c) => stamped[c] ?? ""));
};
const sealed = (tab, key, values) => {
  const encrypted = new Set(schema.tabs[tab].encrypted);
  return Object.fromEntries(Object.entries(values).map(([c, v]) => [c, encrypted.has(c) ? enc(v, `${tab}:${key}:${c}`) : v]));
};

/* People. */
const SHIFT_TIMES = { morning: ["09:30", "11:00"], afternoon: ["14:00", "15:30"], evening: ["18:30", "20:00", "21:30"] };
const WEEKLY = {
  "ananya-menon": { 1: ["morning", "evening"], 2: ["evening"], 3: ["morning", "afternoon"], 5: ["evening"], 6: ["morning"] },
  "akash-mohan": { 1: ["afternoon", "evening"], 3: ["evening"], 4: ["afternoon", "evening"], 6: ["morning", "afternoon"] },
  "sneha-varghese": { 2: ["evening"], 4: ["evening"], 5: ["afternoon", "evening"], 0: ["morning"] },
  "dr-arun-kallada": { 1: ["morning"], 3: ["afternoon"], 5: ["morning", "afternoon"] },
};
const clinicians = [
  ["ananya-menon", "Dr. Ananya Menon", "dr-ananya-menon", "Senior Consultant Clinical Psychologist", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800", "Individual Counselling and Therapy"],
  ["akash-mohan", "Akash Mohan", "akash-mohan", "Licensed Clinical Psychologist (M.Phil)", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", "Individual Counselling and Therapy"],
  ["sneha-varghese", "Sneha Varghese", "sneha-varghese", "Senior Consultant Psychotherapist, Couples & Families", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800", "Couple and Relationship Counselling"],
  ["dr-arun-kallada", "Dr. Arun Kallada", "dr-arun-kallada", "Consultant Psychiatrist & Neuropsychology Lead", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800", "Psychiatric Services"],
];
// Fake clients: [alias, full name, country, time zone, phone]
const FAKE_CLIENTS = [
  ["R.K.", "Rahul Krishnan (sample)", "India", "", "+919800000001"],
  ["A.N.", "Anjali Nair (sample)", "United Arab Emirates", "Asia/Dubai", "+971500000002"],
  ["S.T.", "Sanjay Thomas (sample)", "United Kingdom", "Europe/London", "+447700000003"],
  ["M.J.", "Meera Joseph (sample)", "Qatar", "Asia/Qatar", "+974300000004"],
  ["F.R.", "Faisal Rahman (sample)", "India", "", "+919800000005"],
  ["L.P.", "Lakshmi Pillai (sample)", "Canada", "America/Toronto", "+14160000006"],
  ["J.V.", "Jacob Varghese (sample)", "India", "", "+919800000007"],
  ["N.S.", "Nisha Suresh (sample)", "Saudi Arabia", "Asia/Riyadh", "+966500000008"],
];

const pins = [];
const auth = (clinicianId, displayName = clinicianId) => {
  const kept = previousAuth.get(clinicianId);
  if (kept) return kept;
  // Demo copy: the same plain PINs as the local data (re-hashed with the demo pepper).
  const pin = knownPins.get(displayName) ?? knownPins.get(clinicianId) ?? devPin();
  pins.push(`${displayName.padEnd(22)} ${pin}`);
  return hashPin(pin);
};

for (const [cid, name, slug, title, photo] of clinicians) {
  put("Clinicians", { Clinician_ID: cid, Display_Name: name, Slug: slug, Title: title, Photo_URL: photo, Role: "clinician", Profile_Status: "Published", Active: "TRUE" });
  put("Clinician_Auth", { Clinician_ID: cid, PIN_Hash: auth(cid, name), Failed_Attempts: "0", Session_Version: "0" });
  for (const [weekday, shifts] of Object.entries(WEEKLY[cid])) for (const shift of shifts) put("Weekly_Pattern", { Therapist_ID: cid, Weekday: weekday, Shift: shift, Active: "TRUE" });
}
put("Clinicians", { Clinician_ID: "coordinator", Display_Name: "Practice Coordinator", Slug: "", Title: "Coordinator", Photo_URL: "", Role: "coordinator", Active: "TRUE" });
put("Clinician_Auth", { Clinician_ID: "coordinator", PIN_Hash: auth("coordinator"), Failed_Attempts: "0", Session_Version: "0" });

/* Sessions, clients and notes. */
const pick = (list, i) => list[i % list.length];
const slotFor = (cid, offset, index) => {
  const shifts = WEEKLY[cid][weekdayOf(offset)];
  if (!shifts) return null;
  const times = shifts.flatMap((s) => SHIFT_TIMES[s]);
  return times[index % times.length];
};
let fake = 0;
for (const [cid, , , , , track] of clinicians) {
  for (let c = 0; c < 2; c++) {
    const [alias, fullName, country, tz, phone] = FAKE_CLIENTS[fake++ % FAKE_CLIENTS.length];
    const clientId = id("CL");
    const risk = cid === "akash-mohan" && c === 0 ? "Moderate" : cid === "ananya-menon" && c === 1 ? "High" : "Low";
    put(
      "Clients",
      {
        Client_ID: clientId,
        Clinician_ID: cid,
        Status: "Active",
        Consent_Date: dayKey(-80),
        Consent_Method: "Verbal, recorded in session",
        Consent_Recorded_By: cid,
        WhatsApp_Hash: lookup(phone),
        Risk_Updated_At: new Date(Date.now() - 20 * DAY).toISOString(),
        Last_Contact_At: risk === "High" ? new Date(Date.now() - 18 * DAY).toISOString() : "",
        Created_At: new Date(Date.now() - 80 * DAY).toISOString(),
        ...sealed("Clients", clientId, {
          Alias: alias,
          Full_Name: fullName,
          WhatsApp: phone,
          DOB: `19${88 + c}-0${3 + c}-1${c}`,
          Country: country,
          Time_Zone: tz,
          Language: "Malayalam and English",
          Track: track,
          Referral: c ? "Instagram" : "A friend",
          Risk_Level: risk,
          Emergency_Contact: risk === "High" ? "" : "Sibling (sample), +919800000099",
        }),
      },
    );

    // Past weekly sessions (about 10 weeks), on this clinician's days.
    let sessionNo = 0;
    let lastOffset = -999;
    for (let offset = -80 + c * 2; offset < 0; offset++) {
      const time = slotFor(cid, offset, c);
      if (!time || offset - lastOffset < 6) continue; // about weekly, on the clinician's working days
      lastOffset = offset;
      sessionNo += 1;
      const status = sessionNo % 9 === 4 ? "No-show" : sessionNo % 13 === 7 ? "Cancelled" : "Completed";
      const bookingId = id("BK");
      put("Bookings_Log", {
        Booking_ID: bookingId,
        Created_At: new Date(Date.now() + (offset - 5) * DAY).toISOString(),
        Client_ID: clientId,
        ...sealed("Bookings_Log", bookingId, { Client_Name: fullName, WhatsApp_Number: phone, Clinician_Note: "" }),
        Service_Track: track,
        Format: sessionNo % 4 === 0 ? "audio" : "video",
        Country_Timezone: tz,
        Therapist_ID: cid,
        Primary_Slot: `${dayKey(offset)} ${time}`,
        Confirmed_Slot: `${dayKey(offset)} ${time}`,
        Status: status,
        Meeting_Link: "https://meet.google.com/sample-link",
        Duration_Min: track.startsWith("Couple") ? "80" : track.startsWith("Psychiatric") ? "30" : "50",
        Cancelled_By: status === "Cancelled" ? "client" : "",
      });
      if (status === "Completed" && offset < -2) {
        const recordId = id("RC");
        const phq = Math.max(4, 19 - sessionNo + c);
        put("Clinical_Records", {
          Record_ID: recordId,
          Client_ID: clientId,
          Therapist_ID: cid,
          Author_ID: cid,
          Booking_ID: bookingId,
          Session_Date: dayKey(offset),
          Format: "video",
          Note_Format: "SOAP",
          Status: "Signed",
          Signed_At: new Date(Date.now() + (offset + 1) * DAY).toISOString(),
          Follow_Up_Due: offset > -10 && c === 0 ? dayKey(1) : "",
          Created_At: new Date(Date.now() + offset * DAY).toISOString(),
          ...sealed("Clinical_Records", recordId, {
            Note_Body: JSON.stringify({
              s: "Sample note: reports better sleep this week; work stress still high.",
              o: "Engaged, settled affect, good rapport.",
              a: "Gradual improvement; anxiety around work persists.",
              p: "Continue CBT; practise the breathing exercise daily.",
            }),
            Diagnosis_Code: sessionNo === 1 ? "6B00" : "",
            Diagnosis_Label: sessionNo === 1 ? "Generalised anxiety disorder" : "",
            Diagnosis_Status: sessionNo === 1 ? "Provisional" : "",
            Modalities: "CBT|Psychoeducation",
            Risk_Level: risk,
            Risk_Notes: risk === "High" ? "Sample: safety plan agreed; check in weekly." : "",
            PHQ9: sessionNo % 3 === 1 ? String(phq) : "",
            PHQ9_Item9: "0",
            GAD7: sessionNo % 3 === 1 ? String(Math.max(3, 15 - sessionNo)) : "",
            Addendum_Reason: "",
            Error_Reason: "",
          }),
        });
      }
    }

    // Upcoming: one confirmed session this week or next, holding its slot.
    for (let offset = c === 0 ? 0 : 3; offset < 14; offset++) {
      const time = slotFor(cid, offset, 0);
      const startsAt = Date.parse(`${dayKey(offset)}T${time ?? "00:00"}:00+05:30`);
      if (!time || startsAt < Date.now() + 60 * 60_000) continue;
      const bookingId = id("BK");
      put("Bookings_Log", {
        Booking_ID: bookingId,
        Created_At: nowIso,
        Client_ID: clientId,
        ...sealed("Bookings_Log", bookingId, { Client_Name: fullName, WhatsApp_Number: phone, Clinician_Note: "" }),
        Service_Track: track,
        Format: "video",
        Country_Timezone: tz,
        Therapist_ID: cid,
        Primary_Slot: `${dayKey(offset)} ${time}`,
        Confirmed_Slot: `${dayKey(offset)} ${time}`,
        Status: "Confirmed",
        Meeting_Link: "https://meet.google.com/sample-link",
        Duration_Min: "50",
      });
      put("Therapist_Schedule", { Therapist_ID: cid, Date: dayKey(offset), Slot_Time_IST: time, Shift: Object.keys(SHIFT_TIMES).find((s) => SHIFT_TIMES[s].includes(time)), Is_Available: "FALSE", Booking_ID: bookingId });
      break;
    }
  }

  // One new request per clinician, for the coordinator to confirm.
  const [, , , tz, phone] = FAKE_CLIENTS[(fake + 3) % FAKE_CLIENTS.length];
  const requestId = id("BK");
  const first = [...Array(14).keys()].map((d) => d + 2).find((d) => slotFor(cid, d, 1));
  const second = [...Array(14).keys()].map((d) => d + first + 1).find((d) => slotFor(cid, d, 0));
  put("Bookings_Log", {
    Booking_ID: requestId,
    Created_At: nowIso,
    Client_ID: "",
    ...sealed("Bookings_Log", requestId, { Client_Name: `New enquiry ${pick(["Arun", "Divya", "Hari", "Reshma"], fake)} (sample)`, WhatsApp_Number: phone.replace(/\d$/, "9"), Clinician_Note: "" }),
    Service_Track: track,
    Format: "video",
    Country_Timezone: tz,
    Therapist_ID: cid,
    Primary_Slot: `${dayKey(first)} ${slotFor(cid, first, 1)}`,
    Backup_Slot: second ? `${dayKey(second)} ${slotFor(cid, second, 0)}` : "",
    Status: "Requested",
    Duration_Min: "50",
  });
}

writeFileSync(path.join(dataDir, "ops.json"), JSON.stringify(books.ops, null, 1));
writeFileSync(path.join(dataDir, "vault.json"), JSON.stringify(books.vault, null, 1));
const header = demo
  ? "Demo PINs (deployed demo with fake sample data only)\n\n"
  : "Development PINs (sample clinicians and coordinator, fake data only)\n\n";
const kept = demo ? "" : previousPins.replace(/^Development PINs[^\n]*\n+/gm, "").trim();
const pinText = `${header}${[kept, ...pins].filter(Boolean).join("\n")}\n`;
writeFileSync(path.join(dataDir, demo ? "DEMO-PINS.txt" : "DEV-PINS.txt"), pinText);

const counts = Object.fromEntries(Object.entries({ ...books.ops, ...books.vault }).map(([tab, rows]) => [tab, rows.length - 1]));
console.log(`\nPortal sample data created in ${path.relative(root, dataDir)}`, counts, `\n\n${pinText}\nRestart the server so it reads the new data.`);
