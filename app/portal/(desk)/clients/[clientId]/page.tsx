import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { logContactAction } from "@/app/portal/desk-actions";
import { ActionButton } from "@/components/portal/Buttons";
import { ClientForm, ClientStatusForm, NewNoteForm } from "@/components/portal/ClientForms";
import { PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { EmptyState, Panel, RiskBadge, StatusBadge } from "@/components/portal/ui";
import { SERVICE_TRACKS } from "@/data/services";
import { audit } from "@/lib/portal/audit";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { describeSlot, relativeDays, shortDate, slotParts, todayIST } from "@/lib/portal/format";
import { bookingsWithClient, NotFoundError } from "@/lib/portal/repo/bookings";
import { clientFor } from "@/lib/portal/repo/clients";
import { notesForClient } from "@/lib/portal/repo/records";

export const metadata = { title: "Client record" };

export default function ClientPage({ params, searchParams }: PageProps<"/portal/clients/[clientId]">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <ClientRecord params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/** One client's record (docs/specs/portal.md 4.4): details, status, notes and sessions. Every view is audited. */
async function ClientRecord({
  params,
  searchParams,
}: {
  params: PageProps<"/portal/clients/[clientId]">["params"];
  searchParams: PageProps<"/portal/clients/[clientId]">["searchParams"];
}) {
  const me = await requireTreatingClinician();
  const { clientId } = await params;
  const query = await searchParams;
  let client;
  try {
    client = await clientFor(me.id, clientId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  const [notes, bookings] = await Promise.all([notesForClient(me.id, clientId), bookingsWithClient(me.id)]);
  await audit({ clinicianId: me.id, action: "client.view", entity: "client", entityId: clientId });

  const sessions = bookings.filter((b) => b.clientId === clientId).sort((a, b) => (b.confirmedSlot || b.primarySlot).localeCompare(a.confirmedSlot || a.primarySlot));
  const fromBooking = sessions.find((b) => b.id === query.booking);
  const notedBookings = new Set(notes.filter((n) => n.bookingId).map((n) => n.bookingId));
  const main = notes.filter((n) => n.noteFormat !== "Addendum");
  const addendaOf = (id: string) => notes.filter((n) => n.parentId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const editing = query.edit === "1";

  return (
    <div>
      <Link href="/portal/clients" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-2">
        <ArrowLeft className="size-4" /> Clients
      </Link>
      <header className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-headline text-brand">
            <Sensitive>{client.alias}</Sensitive>
          </h1>
          <p className="mt-1 text-ink-2">
            <Sensitive>{client.fullName}</Sensitive> · {client.track}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RiskBadge level={client.riskLevel} />
          <StatusBadge status={client.status} />
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          <Panel title="Session notes">
            <NewNoteForm
              clientId={clientId}
              bookingId={fromBooking && !notedBookings.has(fromBooking.id) ? fromBooking.id : undefined}
              sessionDate={fromBooking ? (slotParts(fromBooking.confirmedSlot)?.day ?? todayIST()) : todayIST()}
              format={fromBooking?.format ?? "video"}
            />
            <ol className="mt-6 grid gap-3">
              {main.length ? (
                main.map((note) => (
                  <li key={note.id} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                    <Link href={`/portal/clients/${clientId}/notes/${note.id}`} className="flex flex-wrap items-center justify-between gap-3">
                      <span>
                        <span className="block font-medium text-ink-1">{shortDate(note.sessionDate)}</span>
                        <span className="block text-sm text-ink-3">
                          {note.noteFormat === "Free" ? "Free text" : note.noteFormat} · {note.format === "audio" ? "Audio" : "Video"}
                          {note.diagnosisCode ? (
                            <>
                              {" "}
                              · <Sensitive>{note.diagnosisCode}</Sensitive>
                            </>
                          ) : null}
                        </span>
                      </span>
                      <span className="flex items-center gap-2">
                        <RiskBadge level={note.riskLevel} />
                        <StatusBadge status={note.status} />
                      </span>
                    </Link>
                    {addendaOf(note.id).length ? (
                      <p className="mt-2 text-xs text-ink-3">
                        {addendaOf(note.id).length} {addendaOf(note.id).length === 1 ? "addendum" : "addenda"}
                      </p>
                    ) : null}
                  </li>
                ))
              ) : (
                <li>
                  <EmptyState>No notes yet.</EmptyState>
                </li>
              )}
            </ol>
          </Panel>

          <Panel title="Sessions">
            {sessions.length ? (
              <ul className="divide-y divide-line">
                {sessions.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span className="text-ink-1">{describeSlot(b.confirmedSlot || b.primarySlot)}</span>
                    <span className="flex items-center gap-3">
                      {b.status === "Completed" && !notedBookings.has(b.id) ? (
                        <Link href={`/portal/clients/${clientId}?booking=${b.id}`} className="text-brand underline underline-offset-4">
                          Write note
                        </Link>
                      ) : null}
                      <StatusBadge status={b.status} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState>No sessions linked yet. Bookings with the same WhatsApp number link automatically.</EmptyState>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-6">
          <Panel title="Details">
            {editing ? (
              <ClientForm
                tracks={SERVICE_TRACKS.map((t) => t.name)}
                clientId={clientId}
                version={client.version}
                today={todayIST()}
                defaults={client}
              />
            ) : (
              <>
                <dl className="grid gap-3 text-sm">
                  {[
                    ["WhatsApp", client.whatsapp],
                    ["Email", client.email],
                    ["Date of birth", client.dob],
                    ["Country", client.country],
                    ["Time zone", client.timeZone],
                    ["Language", client.language],
                    ["Emergency contact", client.emergencyContact],
                    ["Consent", client.consentDate ? `${shortDate(client.consentDate)}, ${client.consentMethod}` : "Not recorded"],
                    ["Last contact", relativeDays(client.lastContactAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-ink-3">{label}</dt>
                      <dd className="text-right text-ink-1">
                        <Sensitive>{value || "Not recorded"}</Sensitive>
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/portal/clients/${clientId}?edit=1`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm text-ink-1">
                    Edit details
                  </Link>
                  <ActionButton action={logContactAction.bind(null, clientId)}>Log contact today</ActionButton>
                </div>
              </>
            )}
          </Panel>
          {(client.riskLevel === "High" || client.riskLevel === "Moderate") && !client.emergencyContact ? (
            <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm leading-relaxed text-ink-1">
              This client is at {client.riskLevel.toLowerCase()} risk and has no emergency contact recorded. Add one when you can.
            </p>
          ) : null}
          <Panel title="Status">
            <ClientStatusForm clientId={clientId} status={client.status} />
            {client.status === "Archived" ? <p className="mt-3 text-sm text-ink-3">Archived: {client.archivedReason}</p> : null}
          </Panel>
        </div>
      </div>
    </div>
  );
}
