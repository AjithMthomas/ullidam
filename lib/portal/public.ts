import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { sampleAvailability, type PublicAvailability } from "@/data/schedule";
import { findClinicianRow } from "./repo/clinicians";
import { liveProfile, type ProfileFields } from "./repo/profile";
import { overridesFor, weeklyFor } from "./repo/schedule";

/**
 * What the public website reads from the portal, cached on the server and
 * refreshed within a minute (or at once when a clinician or the coordinator
 * saves, through updateTag). Only public fields leave here: no booking IDs,
 * no client data. If the records aren't reachable (not set up yet, or
 * Google unavailable) the site falls back to the sample data.
 */

export const availabilityTag = (clinicianId: string) => `availability:${clinicianId}`;
export const profileTag = (clinicianId: string) => `profile:${clinicianId}`;

export async function publicAvailability(clinicianId: string): Promise<PublicAvailability> {
  "use cache";
  cacheTag(availabilityTag(clinicianId));
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  try {
    const [weekly, overrides] = await Promise.all([weeklyFor(clinicianId), overridesFor(clinicianId)]);
    if (!Object.keys(weekly).length && !overrides.length) return sampleAvailability(clinicianId);
    return {
      weekly,
      overrides: overrides.map(({ day, time, open, bookingId }) => ({ day, time, open: open && !bookingId })),
      sample: false,
    };
  } catch {
    return sampleAvailability(clinicianId);
  }
}

export async function publicProfile(clinicianId: string): Promise<ProfileFields | null> {
  "use cache";
  cacheTag(profileTag(clinicianId));
  cacheLife({ stale: 60, revalidate: 300, expire: 86_400 });
  try {
    const row = await findClinicianRow(clinicianId);
    return row ? liveProfile(row) : null;
  } catch {
    return null;
  }
}
