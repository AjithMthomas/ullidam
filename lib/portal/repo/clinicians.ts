import "server-only";
import { readRows, type Row } from "../tables";

/**
 * Clinicians: public card fields live in Operations (`Clinicians`); sign-in
 * secrets live only in the Clinical Vault (`Clinician_Auth`), which no one
 * edits by hand.
 */

/** What the sign-in screen may show about a clinician: no auth fields. */
export interface ClinicianCard {
  id: string;
  name: string;
  title: string;
  photo: string;
}

/** The signed-in clinician, as screens see them (narrow on purpose). */
export interface PortalClinician extends ClinicianCard {
  firstName: string;
  slug: string;
  role: "clinician" | "coordinator";
}

export const isActive = (row: Row) => row.Active.toUpperCase() === "TRUE";

export async function findClinicianRow(id: string): Promise<Row | undefined> {
  return (await readRows("Clinicians")).find((row) => row.Clinician_ID === id);
}

export async function listClinicianCards(): Promise<ClinicianCard[]> {
  return (await readRows("Clinicians")).filter(isActive).map(toCard);
}

export function toCard(row: Row): ClinicianCard {
  return { id: row.Clinician_ID, name: row.Display_Name, title: row.Title, photo: row.Photo_URL };
}

export function toPortalClinician(row: Row): PortalClinician {
  const name = row.Display_Name;
  const firstName = name.replace(/^Dr\.?\s+/i, "").split(" ")[0] ?? name;
  return { ...toCard(row), firstName, slug: row.Slug, role: row.Role === "coordinator" ? "coordinator" : "clinician" };
}

/** Active clinicians (not the coordinator), for the coordinator's pickers. */
export async function listClinicians(): Promise<PortalClinician[]> {
  return (await readRows("Clinicians")).filter((row) => isActive(row) && row.Role !== "coordinator").map(toPortalClinician);
}

export async function findAuthRow(id: string): Promise<Row | undefined> {
  return (await readRows("Clinician_Auth")).find((row) => row.Clinician_ID === id);
}

/**
 * Session checks happen on every request, so the clinician's session version
 * and active flag are cached in this server instance for 60 seconds (Sheets
 * allows about 60 reads a minute). A version bump reaches every instance
 * within a minute; this instance drops its copy at once.
 */
const CHECK_TTL_MS = 60_000;
const checks = new Map<string, { at: number; version: number; active: boolean; row: Row }>();

export async function sessionCheck(id: string): Promise<{ version: number; active: boolean; row: Row } | null> {
  const cached = checks.get(id);
  if (cached && Date.now() - cached.at < CHECK_TTL_MS) return cached;
  const [card, auth] = await Promise.all([findClinicianRow(id), findAuthRow(id)]);
  if (!card || !auth) return null;
  const entry = { at: Date.now(), version: Number(auth.Session_Version || "0"), active: isActive(card), row: card };
  checks.set(id, entry);
  return entry;
}

export function forgetSessionCheck(id: string): void {
  checks.delete(id);
}
