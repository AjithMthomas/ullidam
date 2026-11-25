import "server-only";
import { decryptField, encryptField } from "../crypto";
import { TABS } from "../schema";
import { StoreError } from "../store";
import { appendRow, ConflictError, newId, readRows, updateRow, type Row } from "../tables";
import { NotFoundError } from "./bookings";
import { clientFor, setClientRisk, type RiskLevel } from "./clients";

/**
 * Session notes (Clinical_Records, Clinical Vault).
 *
 * Draft -> Signed. A draft can be edited (autosaved); signing locks it for
 * good. After that, changes are new dated addenda linked to the note, and a
 * mistaken note is marked "Entered in error" with a reason: it stays visible,
 * nothing is ever deleted. Signing sets the client's current risk.
 */

export type NoteFormat = "SOAP" | "DAP" | "Free" | "Addendum";
export type NoteStatus = "Draft" | "Signed" | "Entered in error";

export interface NoteBody {
  [section: string]: string;
}

export interface NoteRecord {
  id: string;
  clientId: string;
  clinicianId: string;
  bookingId: string;
  sessionDate: string;
  format: string;
  noteFormat: NoteFormat;
  body: NoteBody;
  diagnosisCode: string;
  diagnosisLabel: string;
  diagnosisStatus: string;
  modalities: string[];
  riskLevel: RiskLevel;
  riskNotes: string;
  phq9: string;
  phq9Item9: string;
  gad7: string;
  followUpDue: string;
  status: NoteStatus;
  signedAt: string;
  parentId: string;
  addendumReason: string;
  errorReason: string;
  createdAt: string;
  version: string;
}

export const NOTE_SECTIONS: Record<Exclude<NoteFormat, "Addendum">, { key: string; label: string }[]> = {
  SOAP: [
    { key: "s", label: "Subjective: what the client reports" },
    { key: "o", label: "Objective: what you observed" },
    { key: "a", label: "Assessment" },
    { key: "p", label: "Plan" },
  ],
  DAP: [
    { key: "d", label: "Data: what happened in session" },
    { key: "a", label: "Assessment" },
    { key: "p", label: "Plan" },
  ],
  Free: [{ key: "text", label: "Session note" }],
};

const MAX_BODY = 30_000; // characters, so the encrypted cell stays well under Sheets' 50,000 limit
const ENCRYPTED = new Set(TABS.Clinical_Records.encrypted);
const ctx = (id: string, column: string) => `Clinical_Records:${id}:${column}`;
const read = (row: Row, column: string) => (ENCRYPTED.has(column) ? decryptField(row[column], ctx(row.Record_ID, column)) : row[column]);
const seal = (id: string, values: Record<string, string>) =>
  Object.fromEntries(Object.entries(values).map(([column, value]) => [column, ENCRYPTED.has(column) ? encryptField(value, ctx(id, column)) : value]));

function toNote(row: Row): NoteRecord {
  let body: NoteBody = {};
  try {
    body = JSON.parse(read(row, "Note_Body") || "{}") as NoteBody;
  } catch {
    body = { text: read(row, "Note_Body") };
  }
  return {
    id: row.Record_ID,
    clientId: row.Client_ID,
    clinicianId: row.Therapist_ID,
    bookingId: row.Booking_ID,
    sessionDate: row.Session_Date,
    format: row.Format,
    noteFormat: (row.Note_Format || "SOAP") as NoteFormat,
    body,
    diagnosisCode: read(row, "Diagnosis_Code"),
    diagnosisLabel: read(row, "Diagnosis_Label"),
    diagnosisStatus: read(row, "Diagnosis_Status"),
    modalities: read(row, "Modalities").split("|").filter(Boolean),
    riskLevel: read(row, "Risk_Level") as RiskLevel,
    riskNotes: read(row, "Risk_Notes"),
    phq9: read(row, "PHQ9"),
    phq9Item9: read(row, "PHQ9_Item9"),
    gad7: read(row, "GAD7"),
    followUpDue: row.Follow_Up_Due,
    status: (row.Status || "Draft") as NoteStatus,
    signedAt: row.Signed_At,
    parentId: row.Parent_Record_ID,
    addendumReason: read(row, "Addendum_Reason"),
    errorReason: read(row, "Error_Reason"),
    createdAt: row.Created_At,
    version: row.Row_Version,
  };
}

/** Every note this clinician wrote, across clients (for analytics and Today). */
export async function notesBy(clinicianId: string): Promise<NoteRecord[]> {
  return (await readRows("Clinical_Records")).filter((row) => row.Therapist_ID === clinicianId).map(toNote);
}

export async function notesForClient(clinicianId: string, clientId: string): Promise<NoteRecord[]> {
  await clientFor(clinicianId, clientId); // ownership check first
  return (await readRows("Clinical_Records"))
    .filter((row) => row.Client_ID === clientId && row.Therapist_ID === clinicianId)
    .map(toNote)
    .sort((a, b) => (b.sessionDate + b.createdAt).localeCompare(a.sessionDate + a.createdAt));
}

async function rowFor(clinicianId: string, noteId: string): Promise<Row> {
  const row = (await readRows("Clinical_Records")).find((r) => r.Record_ID === noteId);
  if (!row || row.Therapist_ID !== clinicianId) throw new NotFoundError();
  return row;
}

export async function noteFor(clinicianId: string, noteId: string): Promise<NoteRecord> {
  return toNote(await rowFor(clinicianId, noteId));
}

export async function createDraft(
  clinicianId: string,
  clientId: string,
  input: { sessionDate: string; format: string; noteFormat: Exclude<NoteFormat, "Addendum">; bookingId?: string },
): Promise<string> {
  await clientFor(clinicianId, clientId);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sessionDate)) throw new StoreError("Choose the session date.", 400);
  const id = newId("RC");
  const now = new Date().toISOString();
  await appendRow("Clinical_Records", {
    Record_ID: id,
    Client_ID: clientId,
    Therapist_ID: clinicianId,
    Author_ID: clinicianId,
    Booking_ID: input.bookingId ?? "",
    Session_Date: input.sessionDate,
    Format: input.format === "audio" ? "audio" : "video",
    Note_Format: input.noteFormat,
    Status: "Draft",
    Created_At: now,
    ...seal(id, { Note_Body: "{}", Modalities: "", Risk_Level: "", Diagnosis_Code: "", Diagnosis_Label: "", Diagnosis_Status: "", Risk_Notes: "", PHQ9: "", PHQ9_Item9: "", GAD7: "", Addendum_Reason: "", Error_Reason: "" }),
  });
  return id;
}

export interface DraftFields {
  body: NoteBody;
  diagnosisCode: string;
  diagnosisLabel: string;
  diagnosisStatus: string;
  modalities: string[];
  riskLevel: RiskLevel;
  riskNotes: string;
  phq9: string;
  phq9Item9: string;
  gad7: string;
  followUpDue: string;
}

const score = (value: string, max: number, label: string) => {
  if (!value) return "";
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > max) throw new StoreError(`${label} must be a whole number from 0 to ${max}.`, 400);
  return String(n);
};

export async function saveDraft(clinicianId: string, noteId: string, fields: DraftFields, expectedVersion: string): Promise<string> {
  const row = await rowFor(clinicianId, noteId);
  if (row.Status !== "Draft") throw new StoreError("This note is signed. Add an addendum instead.", 409);
  if (row.Row_Version !== expectedVersion) throw new ConflictError();
  const body = JSON.stringify(fields.body);
  if (body.length > MAX_BODY) throw new StoreError("This note is very long. Split it into an addendum.", 400);
  const risk = (["", "None", "Low", "Moderate", "High"] as const).includes(fields.riskLevel) ? fields.riskLevel : "";
  await updateRow(
    "Clinical_Records",
    row,
    {
      ...seal(noteId, {
        Note_Body: body,
        Diagnosis_Code: fields.diagnosisCode.slice(0, 20),
        Diagnosis_Label: fields.diagnosisLabel.slice(0, 160),
        Diagnosis_Status: fields.diagnosisStatus === "Confirmed" ? "Confirmed" : fields.diagnosisCode ? "Provisional" : "",
        Modalities: fields.modalities.join("|").slice(0, 300),
        Risk_Level: risk,
        Risk_Notes: fields.riskNotes.slice(0, 2000),
        PHQ9: score(fields.phq9, 27, "PHQ-9"),
        PHQ9_Item9: score(fields.phq9Item9, 3, "PHQ-9 item 9"),
        GAD7: score(fields.gad7, 21, "GAD-7"),
      }),
      Follow_Up_Due: /^\d{4}-\d{2}-\d{2}$/.test(fields.followUpDue) ? fields.followUpDue : "",
    },
  );
  return String(Number(row.Row_Version) + 1);
}

/**
 * Sign: locks the note and makes its risk the client's current risk.
 * Returns whether the escalation reminder must be shown (High risk, or any
 * PHQ-9 item 9 answer above 0).
 */
export async function signNote(clinicianId: string, noteId: string): Promise<{ escalate: boolean }> {
  const row = await rowFor(clinicianId, noteId);
  const note = toNote(row);
  if (note.status !== "Draft") throw new StoreError("This note is already signed.", 409);
  const hasText = Object.values(note.body).some((value) => value.trim());
  if (!hasText) throw new StoreError("Write the note before signing it.", 400);
  if (Number(note.phq9Item9 || "0") > 0 && !note.riskLevel) {
    throw new StoreError("PHQ-9 item 9 shows thoughts of self-harm. Record a risk level before signing.", 400);
  }
  await updateRow("Clinical_Records", row, { Status: "Signed", Signed_At: new Date().toISOString() });
  if (note.riskLevel) await setClientRisk(clinicianId, note.clientId, note.riskLevel);
  return { escalate: note.riskLevel === "High" || Number(note.phq9Item9 || "0") > 0 };
}

export async function addAddendum(clinicianId: string, parentId: string, text: string, reason: string): Promise<string> {
  const parent = await noteFor(clinicianId, parentId);
  if (parent.status === "Draft") throw new StoreError("Drafts can be edited directly.", 409);
  if (!text.trim() || !reason.trim()) throw new StoreError("Write the addendum and why it is needed.", 400);
  if (text.length > MAX_BODY) throw new StoreError("This addendum is too long.", 400);
  const id = newId("RC");
  const now = new Date().toISOString();
  await appendRow("Clinical_Records", {
    Record_ID: id,
    Client_ID: parent.clientId,
    Therapist_ID: clinicianId,
    Author_ID: clinicianId,
    Booking_ID: parent.bookingId,
    Session_Date: parent.sessionDate,
    Format: parent.format,
    Note_Format: "Addendum",
    Status: "Signed",
    Signed_At: now,
    Parent_Record_ID: parentId,
    Created_At: now,
    ...seal(id, { Note_Body: JSON.stringify({ text: text.trim() }), Addendum_Reason: reason.trim().slice(0, 300), Modalities: "", Risk_Level: "", Diagnosis_Code: "", Diagnosis_Label: "", Diagnosis_Status: "", Risk_Notes: "", PHQ9: "", PHQ9_Item9: "", GAD7: "", Error_Reason: "" }),
  });
  return id;
}

export async function markEnteredInError(clinicianId: string, noteId: string, reason: string): Promise<void> {
  const row = await rowFor(clinicianId, noteId);
  if (!reason.trim()) throw new StoreError("Give a reason. The note stays visible, marked as entered in error.", 400);
  await updateRow("Clinical_Records", row, { Status: "Entered in error", ...seal(noteId, { Error_Reason: reason.trim().slice(0, 300) }) });
}
