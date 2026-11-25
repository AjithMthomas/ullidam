import "server-only";
import { decryptField, encryptField, lookupHash } from "../crypto";
import { TABS } from "../schema";
import { StoreError } from "../store";
import { appendRow, ConflictError, newId, readRows, updateRow, type Row } from "../tables";
import { NotFoundError } from "./bookings";

/**
 * Client records (Clients, Clinical Vault). Everything identifying or
 * clinical is encrypted; only IDs, the clinician, status and dates are plain.
 * Every function takes the clinician ID from the verified session; another
 * clinician's client is indistinguishable from a missing one.
 */

export type ClientStatus = "Active" | "Paused" | "Discharged" | "Archived";
export type RiskLevel = "" | "None" | "Low" | "Moderate" | "High";

export interface Client {
  id: string;
  clinicianId: string;
  alias: string;
  fullName: string;
  whatsapp: string;
  email: string;
  dob: string;
  gender: string;
  country: string;
  timeZone: string;
  language: string;
  track: string;
  referral: string;
  consentDate: string;
  consentMethod: string;
  emergencyContact: string;
  status: ClientStatus;
  riskLevel: RiskLevel;
  riskUpdatedAt: string;
  lastContactAt: string;
  tags: string;
  archivedReason: string;
  createdAt: string;
  version: string;
}

const ENCRYPTED = new Set(TABS.Clients.encrypted);
const ctx = (id: string, column: string) => `Clients:${id}:${column}`;
const read = (row: Row, column: string) => (ENCRYPTED.has(column) ? decryptField(row[column], ctx(row.Client_ID, column)) : row[column]);

function toClient(row: Row): Client {
  return {
    id: row.Client_ID,
    clinicianId: row.Clinician_ID,
    alias: read(row, "Alias"),
    fullName: read(row, "Full_Name"),
    whatsapp: read(row, "WhatsApp"),
    email: read(row, "Email"),
    dob: read(row, "DOB"),
    gender: read(row, "Gender"),
    country: read(row, "Country"),
    timeZone: read(row, "Time_Zone"),
    language: read(row, "Language"),
    track: read(row, "Track"),
    referral: read(row, "Referral"),
    consentDate: row.Consent_Date,
    consentMethod: row.Consent_Method,
    emergencyContact: read(row, "Emergency_Contact"),
    status: (row.Status || "Active") as ClientStatus,
    riskLevel: read(row, "Risk_Level") as RiskLevel,
    riskUpdatedAt: row.Risk_Updated_At,
    lastContactAt: row.Last_Contact_At,
    tags: read(row, "Tags"),
    archivedReason: read(row, "Archived_Reason"),
    createdAt: row.Created_At,
    version: row.Row_Version,
  };
}

/** Encrypt the columns that need it, leaving the rest as given. */
function seal(id: string, values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([column, value]) => [column, ENCRYPTED.has(column) ? encryptField(value, ctx(id, column)) : value]));
}

export async function clientsFor(clinicianId: string): Promise<Client[]> {
  return (await readRows("Clients")).filter((row) => row.Clinician_ID === clinicianId).map(toClient);
}

async function rowFor(clinicianId: string, clientId: string): Promise<Row> {
  const row = (await readRows("Clients")).find((r) => r.Client_ID === clientId);
  if (!row || row.Clinician_ID !== clinicianId) throw new NotFoundError();
  return row;
}

export async function clientFor(clinicianId: string, clientId: string): Promise<Client> {
  return toClient(await rowFor(clinicianId, clientId));
}

export interface ClientInput {
  alias: string;
  fullName: string;
  whatsapp: string;
  email: string;
  dob: string;
  gender: string;
  country: string;
  timeZone: string;
  language: string;
  track: string;
  referral: string;
  consentDate: string;
  consentMethod: string;
  emergencyContact: string;
  tags: string;
}

const ageOn = (dob: string, now = new Date()) => {
  const birth = new Date(`${dob}T00:00:00Z`);
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
};

function validate(input: ClientInput) {
  const clean = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, String(v ?? "").trim()])) as unknown as ClientInput;
  if (!clean.alias) throw new StoreError("Add an alias: a short name only you will see in lists (for example “R.K.”).", 400);
  if (!clean.fullName) throw new StoreError("Add the client's full name.", 400);
  if (clean.whatsapp && !/^\+?\d[\d\s-]{7,16}$/.test(clean.whatsapp)) throw new StoreError("Add the WhatsApp number with its country code.", 400);
  if (clean.dob) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.dob) || Number.isNaN(Date.parse(clean.dob))) throw new StoreError("The date of birth isn't valid.", 400);
    if (ageOn(clean.dob) < 18) {
      throw new StoreError("Ullidam's care is for adults (18+). Please refer this person to a child and adolescent service.", 400);
    }
  }
  if (!clean.consentDate || !clean.consentMethod) throw new StoreError("Record the client's consent (date and how it was given) before saving.", 400);
  for (const [key, value] of Object.entries(clean)) {
    if (value.length > 300) throw new StoreError(`${key} is too long.`, 400);
  }
  return { ...clean, whatsapp: clean.whatsapp.replace(/[\s-]/g, "") };
}

function columns(input: ClientInput, clinicianId: string): Record<string, string> {
  return {
    Alias: input.alias,
    Full_Name: input.fullName,
    WhatsApp: input.whatsapp,
    WhatsApp_Hash: input.whatsapp ? lookupHash(input.whatsapp) : "",
    Email: input.email,
    DOB: input.dob,
    Gender: input.gender,
    Country: input.country,
    Time_Zone: input.timeZone,
    Language: input.language,
    Track: input.track,
    Referral: input.referral,
    Consent_Date: input.consentDate,
    Consent_Method: input.consentMethod,
    Consent_Recorded_By: clinicianId,
    Emergency_Contact: input.emergencyContact,
    Tags: input.tags,
  };
}

export async function createClient(clinicianId: string, raw: ClientInput): Promise<string> {
  const input = validate(raw);
  if (input.whatsapp) {
    const hash = lookupHash(input.whatsapp);
    const duplicate = (await readRows("Clients")).find((r) => r.Clinician_ID === clinicianId && r.WhatsApp_Hash === hash && r.Status !== "Archived");
    if (duplicate) throw new StoreError("You already have a client with this WhatsApp number.", 409);
  }
  const id = newId("CL");
  await appendRow("Clients", {
    Client_ID: id,
    Clinician_ID: clinicianId,
    Status: "Active",
    Created_At: new Date().toISOString(),
    ...seal(id, { ...columns(input, clinicianId), Risk_Level: "" }),
  });
  return id;
}

export async function updateClient(clinicianId: string, clientId: string, raw: ClientInput, expectedVersion: string): Promise<void> {
  const row = await rowFor(clinicianId, clientId);
  if (row.Row_Version !== expectedVersion) throw new ConflictError();
  const input = validate(raw);
  await updateRow("Clients", row, seal(clientId, columns(input, clinicianId)));
}

export async function setClientStatus(clinicianId: string, clientId: string, status: ClientStatus, reason = ""): Promise<void> {
  const row = await rowFor(clinicianId, clientId);
  if (status === "Archived" && !reason.trim()) throw new StoreError("Give a reason for archiving. The record is kept, not deleted.", 400);
  await updateRow("Clients", row, { Status: status, ...seal(clientId, { Archived_Reason: status === "Archived" ? reason.trim().slice(0, 200) : "" }) });
}

export async function logContact(clinicianId: string, clientId: string): Promise<void> {
  const row = await rowFor(clinicianId, clientId);
  await updateRow("Clients", row, { Last_Contact_At: new Date().toISOString() });
}

/** The client's risk is the latest signed assessment (set when a note is signed). */
export async function setClientRisk(clinicianId: string, clientId: string, level: RiskLevel): Promise<void> {
  const row = await rowFor(clinicianId, clientId);
  await updateRow("Clients", row, { ...seal(clientId, { Risk_Level: level }), Risk_Updated_At: new Date().toISOString() });
}
