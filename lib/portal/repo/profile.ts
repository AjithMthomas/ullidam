import "server-only";
import { THERAPISTS } from "@/data/therapists";
import { StoreError } from "../store";
import { readRows, updateRow, type Row } from "../tables";
import { findClinicianRow } from "./clinicians";

/**
 * Public profile text (Clinicians, Operations). A clinician's edits are saved
 * as drafts with status "Pending review"; the coordinator approves them into
 * the live columns the public site reads (decision D5), or returns them with
 * a note. Lists are stored one item per line.
 */
export interface ProfileFields {
  bio: string;
  approach: string;
  specialties: string[];
  languages: string[];
}

export type ProfileStatus = "Published" | "Pending review" | "Returned";

const lines = (value: string) => value.split("\n").map((v) => v.trim()).filter(Boolean);
const fallback = (id: string): ProfileFields => {
  const t = THERAPISTS.find((therapist) => therapist.id === id);
  return { bio: t?.bio ?? "", approach: t?.approach ?? "", specialties: t?.specialties ?? [], languages: t?.languages ?? [] };
};

export function liveProfile(row: Row): ProfileFields {
  const base = fallback(row.Clinician_ID);
  return {
    bio: row.Bio || base.bio,
    approach: row.Approach || base.approach,
    specialties: row.Specialties ? lines(row.Specialties) : base.specialties,
    languages: row.Languages ? lines(row.Languages) : base.languages,
  };
}

function draftProfile(row: Row): ProfileFields | null {
  if (row.Profile_Status !== "Pending review" && row.Profile_Status !== "Returned") return null;
  return { bio: row.Draft_Bio, approach: row.Draft_Approach, specialties: lines(row.Draft_Specialties), languages: lines(row.Draft_Languages) };
}

export async function profileFor(clinicianId: string) {
  const row = await findClinicianRow(clinicianId);
  if (!row) throw new StoreError("Profile not found.", 404);
  return {
    live: liveProfile(row),
    draft: draftProfile(row),
    status: (row.Profile_Status || "Published") as ProfileStatus,
    note: row.Profile_Note,
  };
}

function validate(fields: ProfileFields): ProfileFields {
  const bio = fields.bio.trim();
  const approach = fields.approach.trim();
  if (bio.length < 40) throw new StoreError("Write a short bio (at least a couple of sentences).", 400);
  if (bio.length > 900 || approach.length > 600) throw new StoreError("Keep the bio under 900 characters and the approach under 600.", 400);
  const specialties = fields.specialties.map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const languages = fields.languages.map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (!languages.length) throw new StoreError("Add at least one language.", 400);
  return { bio, approach, specialties, languages };
}

export async function submitProfile(clinicianId: string, fields: ProfileFields): Promise<void> {
  const row = await findClinicianRow(clinicianId);
  if (!row) throw new StoreError("Profile not found.", 404);
  const clean = validate(fields);
  await updateRow("Clinicians", row, {
    Draft_Bio: clean.bio,
    Draft_Approach: clean.approach,
    Draft_Specialties: clean.specialties.join("\n"),
    Draft_Languages: clean.languages.join("\n"),
    Profile_Status: "Pending review",
    Profile_Note: "",
  });
}

/* Coordinator */

export async function pendingProfiles(): Promise<{ id: string; name: string; slug: string; live: ProfileFields; draft: ProfileFields }[]> {
  return (await readRows("Clinicians"))
    .filter((row) => row.Profile_Status === "Pending review")
    .map((row) => ({ id: row.Clinician_ID, name: row.Display_Name, slug: row.Slug, live: liveProfile(row), draft: draftProfile(row)! }));
}

export async function approveProfile(clinicianId: string): Promise<string> {
  const row = await findClinicianRow(clinicianId);
  if (!row || row.Profile_Status !== "Pending review") throw new StoreError("Nothing to approve.", 409);
  await updateRow("Clinicians", row, {
    Bio: row.Draft_Bio,
    Approach: row.Draft_Approach,
    Specialties: row.Draft_Specialties,
    Languages: row.Draft_Languages,
    Draft_Bio: "",
    Draft_Approach: "",
    Draft_Specialties: "",
    Draft_Languages: "",
    Profile_Status: "Published",
    Profile_Note: "",
  });
  return row.Slug;
}

export async function returnProfile(clinicianId: string, note: string): Promise<void> {
  const row = await findClinicianRow(clinicianId);
  if (!row || row.Profile_Status !== "Pending review") throw new StoreError("Nothing to return.", 409);
  await updateRow("Clinicians", row, { Profile_Status: "Returned", Profile_Note: note.trim().slice(0, 300) });
}
