import "server-only";
import { lookupHash } from "./crypto";
import { appendRow } from "./tables";

/**
 * The audit trail (Audit_Log in the Clinical Vault). Records who did what to
 * which record, never any clinical content. IP addresses are stored only as
 * keyed hashes. An audit failure never blocks the clinician's action, but it
 * is reported to the server log.
 */
/**
 * "area.verb": signin.success|fail|locked, signout(.everywhere), unlock.*,
 * pin.change, setup.issue, schedule.update, booking.create|confirm|cancel|
 * update|propose, client.create|update|view|archive|contact, note.create|
 * save|sign|addendum|error|view, profile.submit|approve|return.
 */
export type AuditAction = string;

export async function audit(entry: {
  clinicianId: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  ip?: string | null;
  result?: "ok" | "denied";
}): Promise<void> {
  try {
    await appendRow("Audit_Log", {
      Timestamp: new Date().toISOString(),
      Clinician_ID: entry.clinicianId,
      Action: entry.action,
      Entity: entry.entity ?? "",
      Entity_ID: entry.entityId ?? "",
      IP_Hash: entry.ip ? lookupHash(entry.ip) : "",
      Result: entry.result ?? "ok",
    });
  } catch (error) {
    console.error("[portal] audit write failed:", (error as Error).message);
  }
}
