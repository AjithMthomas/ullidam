import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it, vi } from "vitest";
import schema from "./schema.json";

// Test secrets and an isolated local store (never the developer's .data folder).
process.env.RECORDS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
process.env.PIN_PEPPER = randomBytes(32).toString("base64url");
process.env.PORTAL_SESSION_SECRET = randomBytes(48).toString("base64url");
process.env.PORTAL_DATA_DRIVER = "local";
process.env.PORTAL_LOCAL_DIR = mkdtempSync(path.join(tmpdir(), "ullidam-portal-"));

// Server-only Next APIs the auth module touches; sessions are not under test here.
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }), headers: async () => new Headers() }));
vi.mock("next/navigation", () => ({ redirect: (to: string) => { throw new Error(`redirect:${to}`); } }));

const { decryptField, encryptField, hashPin, lookupHash, verifyPin } = await import("./crypto");
const { signSession, verifySession, sessionKey, isIdle, IDLE_LIMIT_MS } = await import("./token");
const { checkPin, MAX_ATTEMPTS, setupPin } = await import("./auth");

describe("field encryption", () => {
  it("round-trips and never stores the plain text", () => {
    const cipher = encryptField("Panic attacks since March", "Clinical_Records:RC-1:Note_Body");
    expect(cipher.startsWith("v1:")).toBe(true);
    expect(cipher).not.toContain("Panic");
    expect(decryptField(cipher, "Clinical_Records:RC-1:Note_Body")).toBe("Panic attacks since March");
  });

  it("refuses a ciphertext moved to another row or column", () => {
    const cipher = encryptField("High risk", "Clinical_Records:RC-1:Risk_Notes");
    expect(() => decryptField(cipher, "Clinical_Records:RC-2:Risk_Notes")).toThrow();
    expect(() => decryptField(cipher, "Clinical_Records:RC-1:Note_Body")).toThrow();
  });

  it("detects tampering", () => {
    const cipher = encryptField("Some note", "ctx");
    const parts = cipher.split(":");
    parts[2] = Buffer.from("tampered").toString("base64url");
    expect(() => decryptField(parts.join(":"), "ctx")).toThrow();
  });

  it("makes stable lookup hashes without revealing the value", () => {
    expect(lookupHash(" +919744131213 ")).toBe(lookupHash("+919744131213"));
    expect(lookupHash("+919744131213")).not.toContain("9744");
  });
});

describe("PINs", () => {
  it("verifies the right PIN only", async () => {
    const stored = await hashPin("493817");
    expect(await verifyPin("493817", stored)).toBe(true);
    expect(await verifyPin("493818", stored)).toBe(false);
    expect(stored).not.toContain("493817");
  });

  it("needs the server pepper: a hash is useless without it", async () => {
    const stored = await hashPin("493817");
    const original = process.env.PIN_PEPPER;
    process.env.PIN_PEPPER = randomBytes(32).toString("base64url");
    expect(await verifyPin("493817", stored)).toBe(false);
    process.env.PIN_PEPPER = original;
  });
});

describe("session token", () => {
  const key = sessionKey(process.env.PORTAL_SESSION_SECRET!);
  const now = Date.now();

  it("verifies a genuine token and rejects a forged one", async () => {
    const token = await signSession({ clinicianId: "akash-mohan", version: 2, activeAt: now, startedAt: now }, key);
    expect(await verifySession(token, key)).toMatchObject({ clinicianId: "akash-mohan", version: 2 });
    const forged = sessionKey(randomBytes(48).toString("base64url"));
    expect(await verifySession(token, forged)).toBeNull();
    const [h, , s] = token.split(".");
    const otherPayload = Buffer.from(JSON.stringify({ sub: "dr-arun-kallada", ver: 2, act: now, sta: now, aud: "ullidam-portal" })).toString("base64url");
    expect(await verifySession(`${h}.${otherPayload}.${s}`, key)).toBeNull();
  });

  it("treats a quiet session as idle", () => {
    expect(isIdle({ clinicianId: "x", version: 0, activeAt: now, startedAt: now }, now + IDLE_LIMIT_MS + 1)).toBe(true);
    expect(isIdle({ clinicianId: "x", version: 0, activeAt: now, startedAt: now }, now + 60_000)).toBe(false);
  });

  it("expires 12 hours after sign-in, however active", async () => {
    const thirteenHoursAgo = now - 13 * 60 * 60 * 1000;
    const token = await signSession({ clinicianId: "x", version: 0, activeAt: now, startedAt: thirteenHoursAgo }, key);
    expect(await verifySession(token, key)).toBeNull();
  });
});

describe("sign-in lockout and setup codes", () => {
  beforeAll(async () => {
    const books: Record<"ops" | "vault", Record<string, string[][]>> = { ops: {}, vault: {} };
    for (const [tab, def] of Object.entries(schema.tabs)) books[def.book as "ops" | "vault"][tab] = [def.columns];
    const at = new Date().toISOString();
    const cols = (tab: keyof typeof schema.tabs, v: Record<string, string>) => schema.tabs[tab].columns.map((c) => v[c] ?? "");
    for (const id of ["ananya-menon", "akash-mohan"]) {
      books.ops.Clinicians.push(cols("Clinicians", { Clinician_ID: id, Display_Name: id, Active: "TRUE", Row_Version: "1", Updated_At: at }));
      books.vault.Clinician_Auth.push(cols("Clinician_Auth", { Clinician_ID: id, PIN_Hash: await hashPin("482913"), Failed_Attempts: "0", Session_Version: "0", Row_Version: "1", Updated_At: at }));
    }
    const dir = process.env.PORTAL_LOCAL_DIR!;
    writeFileSync(path.join(dir, "ops.json"), JSON.stringify(books.ops));
    writeFileSync(path.join(dir, "vault.json"), JSON.stringify(books.vault));
  });

  it("accepts the right PIN", async () => {
    expect(await checkPin("ananya-menon", "482913", null, "signin")).toEqual({ ok: true });
  });

  it("locks after repeated wrong PINs, even for the right PIN", async () => {
    for (let i = 0; i < MAX_ATTEMPTS - 1; i++) {
      expect((await checkPin("ananya-menon", "111222", null, "signin")).ok).toBe(false);
    }
    expect(await checkPin("ananya-menon", "111222", null, "signin")).toMatchObject({ ok: false, reason: "locked" });
    expect(await checkPin("ananya-menon", "482913", null, "signin")).toMatchObject({ ok: false, reason: "locked" });
  });

  it("keeps clinicians separate: one lockout never affects another", async () => {
    expect(await checkPin("akash-mohan", "482913", null, "signin")).toEqual({ ok: true });
  });

  it("treats unknown clinicians like a wrong PIN", async () => {
    expect(await checkPin("nobody", "482913", null, "signin")).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("rejects a setup code that was never issued", async () => {
    expect(await setupPin("akash-mohan", "ABCDEFGHJK", "735190", null)).toMatchObject({ ok: false, reason: "invalid" });
  });

  it("rejects weak PINs", async () => {
    expect(await setupPin("akash-mohan", "ABCDEFGHJK", "123456", null)).toMatchObject({ ok: false, reason: "weak" });
  });
});

describe("data isolation between clinicians (every mutation, with another clinician's IDs)", () => {
  const client = {
    alias: "T.S.",
    fullName: "Test Sample",
    whatsapp: "+919800000123",
    email: "",
    dob: "1990-01-01",
    gender: "",
    country: "India",
    timeZone: "",
    language: "English",
    track: "Individual Counselling and Therapy",
    referral: "",
    consentDate: "2026-11-01",
    consentMethod: "Verbal, recorded in session",
    emergencyContact: "",
    tags: "",
  };

  it("keeps clients, notes and bookings private to their clinician", async () => {
    const { createClient, clientFor, updateClient, setClientStatus, logContact } = await import("./repo/clients");
    const { createDraft, noteFor, saveDraft, signNote } = await import("./repo/records");
    const { createBooking, clinicianUpdate } = await import("./repo/bookings");

    const clientId = await createClient("ananya-menon", client);
    const noteId = await createDraft("ananya-menon", clientId, { sessionDate: "2026-11-20", format: "video", noteFormat: "SOAP" });
    const bookingId = await createBooking({
      clinicianId: "ananya-menon",
      clientName: "Test Sample",
      whatsapp: "+919800000123",
      track: "Individual Counselling and Therapy",
      format: "video",
      timeZone: "",
      primarySlot: "2026-12-01 09:30",
      backupSlot: "",
      durationMin: 50,
    });

    // The owner can read them.
    expect((await clientFor("ananya-menon", clientId)).fullName).toBe("Test Sample");
    expect((await noteFor("ananya-menon", noteId)).status).toBe("Draft");

    // Another clinician gets "not found" for every read and write.
    const other = "akash-mohan";
    await expect(clientFor(other, clientId)).rejects.toThrow("Not found");
    await expect(updateClient(other, clientId, client, "1")).rejects.toThrow("Not found");
    await expect(setClientStatus(other, clientId, "Archived", "x")).rejects.toThrow("Not found");
    await expect(logContact(other, clientId)).rejects.toThrow("Not found");
    await expect(createDraft(other, clientId, { sessionDate: "2026-11-21", format: "video", noteFormat: "SOAP" })).rejects.toThrow("Not found");
    await expect(noteFor(other, noteId)).rejects.toThrow("Not found");
    await expect(saveDraft(other, noteId, { body: { s: "x" }, diagnosisCode: "", diagnosisLabel: "", diagnosisStatus: "", modalities: [], riskLevel: "", riskNotes: "", phq9: "", phq9Item9: "", gad7: "", followUpDue: "" }, "1")).rejects.toThrow("Not found");
    await expect(signNote(other, noteId)).rejects.toThrow("Not found");
    await expect(clinicianUpdate(other, bookingId, { kind: "note", text: "x" })).rejects.toThrow("Not found");
  });

  it("stores names and notes encrypted, never in the clear", async () => {
    const { readFileSync } = await import("node:fs");
    const vault = readFileSync(path.join(process.env.PORTAL_LOCAL_DIR!, "vault.json"), "utf8");
    const ops = readFileSync(path.join(process.env.PORTAL_LOCAL_DIR!, "ops.json"), "utf8");
    expect(vault).not.toContain("Test Sample");
    expect(vault).not.toContain("+919800000123");
    expect(ops).not.toContain("Test Sample");
    expect(ops).not.toContain("+919800000123");
  });

  it("refuses under-18 clients and requires consent", async () => {
    const { createClient } = await import("./repo/clients");
    const nextYear = new Date().getUTCFullYear() - 10;
    await expect(createClient("akash-mohan", { ...client, whatsapp: "", dob: `${nextYear}-01-01` })).rejects.toThrow("adults");
    await expect(createClient("akash-mohan", { ...client, whatsapp: "", consentDate: "" })).rejects.toThrow("consent");
  });

  it("locks a signed note: no more draft edits", async () => {
    const { createClient } = await import("./repo/clients");
    const { createDraft, saveDraft, signNote } = await import("./repo/records");
    const clientId = await createClient("akash-mohan", { ...client, whatsapp: "+919800000456" });
    const noteId = await createDraft("akash-mohan", clientId, { sessionDate: "2026-11-20", format: "video", noteFormat: "Free" });
    const fields = { body: { text: "Sample session" }, diagnosisCode: "", diagnosisLabel: "", diagnosisStatus: "", modalities: [], riskLevel: "" as const, riskNotes: "", phq9: "", phq9Item9: "", gad7: "", followUpDue: "" };
    const version = await saveDraft("akash-mohan", noteId, fields, "1");
    await signNote("akash-mohan", noteId);
    await expect(saveDraft("akash-mohan", noteId, fields, version)).rejects.toThrow("signed");
  });
});

describe("analytics", () => {
  it("counts completed sessions, no-shows and attendance by hand-checkable rules", async () => {
    const { practiceNumbers } = await import("./analytics");
    const now = new Date("2026-11-25T12:00:00+05:30"); // a Wednesday
    const b = (slot: string, status: string) => ({ status, confirmedSlot: slot, whatsapp: "+91 1", clientName: "x", track: "Individual", durationMin: 50 });
    const numbers = practiceNumbers({
      bookings: [b("2026-11-24 09:30", "Completed"), b("2026-11-23 18:30", "Completed"), b("2026-11-20 18:30", "No-show"), b("2026-11-26 09:30", "Confirmed")],
      clients: [],
      notes: [],
      weekly: {},
      overrides: [],
      now,
    });
    expect(numbers.kpis.sessionsThisWeek).toBe(2); // Mon 23 and Tue 24 Nov
    expect(numbers.kpis.upcoming7).toBe(1);
    expect(numbers.kpis.attendance90).toBe(67); // 2 of 3
    expect(numbers.hoursThisMonth).toBe(1.7); // 100 minutes
  });
});
