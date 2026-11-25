import { Suspense } from "react";
import { approveProfileAction, cancelBookingAction, confirmBookingAction, issueSetupCodeAction } from "@/app/portal/desk-actions";
import { ActionButton } from "@/components/portal/Buttons";
import { NewBookingForm, ProposeTimesForm, ReturnProfileForm } from "@/components/portal/Desk";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { EmptyState, Panel, StatusBadge } from "@/components/portal/ui";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { SERVICE_TRACKS } from "@/data/services";
import { requireCoordinator } from "@/lib/portal/auth";
import { clientLocal, describeSlot } from "@/lib/portal/format";
import { allBookings, isSlotOpen, slotStart } from "@/lib/portal/repo/bookings";
import { listClinicians } from "@/lib/portal/repo/clinicians";
import { pendingProfiles } from "@/lib/portal/repo/profile";

export const metadata = { title: "Coordinator desk" };

export default function DeskPage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Desk />
    </Suspense>
  );
}

/** The coordinator's desk (decision D8): log enquiries, confirm times, review profiles, issue setup codes. */
async function Desk() {
  await requireCoordinator();
  const [bookings, clinicians, profiles] = await Promise.all([allBookings(), listClinicians(), pendingProfiles()]);
  const nameOf = new Map(clinicians.map((c) => [c.id, c.name]));
  const now = new Date().getTime();
  const requests = bookings
    .filter((b) => b.status === "Requested" || b.status === "Reschedule requested")
    .sort((a, b) => a.primarySlot.localeCompare(b.primarySlot));
  const openness = new Map(
    await Promise.all(
      requests.flatMap((b) => [b.primarySlot, b.backupSlot].filter(Boolean).map(async (slot) => [`${b.id}|${slot}`, await isSlotOpen(b.clinicianId, slot)] as const)),
    ),
  );
  const upcoming = bookings
    .filter((b) => b.status === "Confirmed" && (slotStart(b.confirmedSlot)?.getTime() ?? 0) > now - 60 * 60_000)
    .sort((a, b) => a.confirmedSlot.localeCompare(b.confirmedSlot))
    .slice(0, 30);

  return (
    <div className="grid gap-8">
      <PortalHeader title="Coordinator desk" lead="Log WhatsApp enquiries, confirm times with clients, and keep the team's pages current." />

      <Panel title="New booking request">
        <NewBookingForm clinicians={clinicians.map((c) => ({ id: c.id, name: c.name }))} tracks={SERVICE_TRACKS.map((t) => t.name)} />
      </Panel>

      <Panel title={`Requests to confirm (${requests.length})`}>
        {requests.length ? (
          <ul className="grid gap-3">
            {requests.map((b) => (
              <li key={b.id} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-1">
                      <Sensitive>{b.clientName}</Sensitive> <span className="text-ink-3">with {nameOf.get(b.clinicianId) ?? b.clinicianId}</span>
                    </p>
                    <p className="text-sm text-ink-3">
                      {b.track} · {b.format === "audio" ? "Audio call" : "Video"} · {b.durationMin} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    <a
                      href={`https://wa.me/${b.whatsapp.replace(/^\+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Message the client on WhatsApp"
                      className="grid size-11 place-items-center rounded-full border border-line-strong text-whatsapp"
                    >
                      <WhatsAppLogo className="size-4" />
                    </a>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {(["primary", "backup"] as const).map((which) => {
                    const slot = which === "primary" ? b.primarySlot : b.backupSlot;
                    if (!slot) return null;
                    const open = openness.get(`${b.id}|${slot}`);
                    const local = clientLocal(slot, b.timeZone);
                    return (
                      <div key={which} className="rounded-xl bg-surface-raised p-3 ring-1 ring-line">
                        <p className="text-xs text-ink-3">{which === "primary" ? "Preferred" : "Backup"} (IST)</p>
                        <p className="text-sm font-medium text-ink-1">{describeSlot(slot)}</p>
                        {local ? <p className="text-xs text-ink-3">{local}</p> : null}
                        <div className="mt-2">
                          {open ? (
                            <ActionButton action={confirmBookingAction.bind(null, b.id, which)} variant="primary">
                              Confirm this time
                            </ActionButton>
                          ) : (
                            <p className="text-xs text-danger">No longer open in the clinician&rsquo;s schedule.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <details className="mt-3">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm text-ink-2 underline underline-offset-4">New times or cancel</summary>
                  <div className="mt-2 grid gap-3">
                    <ProposeTimesForm bookingId={b.id} />
                    <ActionButton action={cancelBookingAction.bind(null, b.id, "client")} variant="danger" confirm="Cancel this booking request?">
                      Cancel request
                    </ActionButton>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No requests waiting.</EmptyState>
        )}
      </Panel>

      <Panel title="Upcoming sessions">
        {upcoming.length ? (
          <ul className="divide-y divide-line">
            {upcoming.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-1">
                    {describeSlot(b.confirmedSlot)} · <Sensitive>{b.clientName}</Sensitive>
                  </p>
                  <p className="text-xs text-ink-3">
                    {nameOf.get(b.clinicianId)} · {b.format === "audio" ? "Audio" : b.meetingLink ? "Video link ready" : "Video link not added yet"}
                  </p>
                </div>
                <ActionButton action={cancelBookingAction.bind(null, b.id, "client")} variant="quiet" confirm="Cancel this session and free the time?">
                  Cancel
                </ActionButton>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No confirmed sessions coming up.</EmptyState>
        )}
      </Panel>

      <Panel title="Profile changes to review">
        {profiles.length ? (
          <ul className="grid gap-4">
            {profiles.map((p) => (
              <li key={p.id} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                <p className="font-medium text-ink-1">{p.name}</p>
                <dl className="mt-3 grid gap-3 text-sm">
                  <div>
                    <dt className="text-ink-3">New bio</dt>
                    <dd className="whitespace-pre-line text-ink-1">{p.draft.bio}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">New approach</dt>
                    <dd className="whitespace-pre-line text-ink-1">{p.draft.approach || "None"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Specialties · Languages</dt>
                    <dd className="text-ink-1">
                      {p.draft.specialties.join(", ") || "None"} · {p.draft.languages.join(", ")}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 grid gap-3">
                  <ActionButton action={approveProfileAction.bind(null, p.id)} variant="primary">
                    Approve and publish
                  </ActionButton>
                  <ReturnProfileForm clinicianId={p.id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>No profile changes waiting.</EmptyState>
        )}
      </Panel>

      <Panel title="Sign-in codes">
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-ink-2">
          For a clinician&rsquo;s first sign-in or a forgotten PIN: issue a one-time code (valid 24 hours) and share it privately. They choose their own PIN with it.
        </p>
        <ul className="divide-y divide-line">
          {clinicians.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="text-sm text-ink-1">{c.name}</span>
              <ActionButton action={issueSetupCodeAction.bind(null, c.id)} confirm={`Issue a new setup code for ${c.name}?`}>
                Issue setup code
              </ActionButton>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
