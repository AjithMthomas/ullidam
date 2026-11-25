import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AddendumForm, EnteredInErrorForm, NoteEditor } from "@/components/portal/NoteEditor";
import { PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { Panel, RiskBadge, StatusBadge } from "@/components/portal/ui";
import { audit } from "@/lib/portal/audit";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { shortDate } from "@/lib/portal/format";
import { NotFoundError } from "@/lib/portal/repo/bookings";
import { clientFor } from "@/lib/portal/repo/clients";
import { NOTE_SECTIONS, noteFor, notesForClient, type NoteFormat } from "@/lib/portal/repo/records";

export const metadata = { title: "Session note" };

export default function NotePage({ params }: PageProps<"/portal/clients/[clientId]/notes/[noteId]">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Note params={params} />
    </Suspense>
  );
}

/** A session note: the editor while it is a draft; a locked record with addenda once signed. */
async function Note({ params }: { params: PageProps<"/portal/clients/[clientId]/notes/[noteId]">["params"] }) {
  const me = await requireTreatingClinician();
  const { clientId, noteId } = await params;
  let note, client;
  try {
    [note, client] = await Promise.all([noteFor(me.id, noteId), clientFor(me.id, clientId)]);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  if (note.clientId !== clientId) notFound();
  await audit({ clinicianId: me.id, action: "note.view", entity: "note", entityId: noteId });

  const format = (note.noteFormat === "Addendum" ? "Free" : note.noteFormat) as Exclude<NoteFormat, "Addendum">;
  const sections = NOTE_SECTIONS[format];
  const addenda = (await notesForClient(me.id, clientId)).filter((n) => n.parentId === noteId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <div className="max-w-4xl">
      <Link href={`/portal/clients/${clientId}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-2">
        <ArrowLeft className="size-4" /> <Sensitive>{client.alias}</Sensitive>
      </Link>
      <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-headline text-brand">Session, {shortDate(note.sessionDate)}</h1>
        <span className="flex items-center gap-2">
          <RiskBadge level={note.riskLevel} />
          <StatusBadge status={note.status} />
        </span>
      </header>
      <p className="mt-1 text-sm text-ink-3">
        {format === "Free" ? "Free text" : format} · {note.format === "audio" ? "Audio call" : "Video"}
        {note.signedAt ? ` · Signed ${shortDate(note.signedAt)}` : ""}
      </p>

      <div className="mt-8">
        {note.status === "Draft" ? (
          <NoteEditor
            noteId={noteId}
            clientId={clientId}
            sections={sections}
            initialVersion={note.version}
            initial={{
              body: note.body,
              diagnosisCode: note.diagnosisCode,
              diagnosisLabel: note.diagnosisLabel,
              diagnosisStatus: note.diagnosisStatus,
              modalities: note.modalities,
              riskLevel: note.riskLevel,
              riskNotes: note.riskNotes,
              phq9: note.phq9,
              phq9Item9: note.phq9Item9,
              gad7: note.gad7,
              followUpDue: note.followUpDue,
            }}
          />
        ) : (
          <div className="grid gap-6">
            {note.status === "Entered in error" ? (
              <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-ink-1">
                Entered in error: <Sensitive>{note.errorReason}</Sensitive>
              </p>
            ) : null}
            <Panel>
              <dl className="grid gap-5">
                {sections.map((section) => (
                  <div key={section.key}>
                    <dt className="text-sm font-medium text-ink-2">{section.label}</dt>
                    <dd className="mt-1 leading-relaxed whitespace-pre-line text-ink-1">
                      <Sensitive>{note.body[section.key] || "None"}</Sensitive>
                    </dd>
                  </div>
                ))}
                <div className="grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-3">Diagnostic impression</dt>
                    <dd className="text-ink-1">
                      <Sensitive>{note.diagnosisCode ? `${note.diagnosisCode} ${note.diagnosisLabel} (${note.diagnosisStatus || "Provisional"})` : "None recorded"}</Sensitive>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Approaches</dt>
                    <dd className="text-ink-1">{note.modalities.join(", ") || "None recorded"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Measures</dt>
                    <dd className="text-ink-1">
                      <Sensitive>
                        {[note.phq9 && `PHQ-9 ${note.phq9}`, note.phq9Item9 && `item 9: ${note.phq9Item9}`, note.gad7 && `GAD-7 ${note.gad7}`].filter(Boolean).join(" · ") || "None"}
                      </Sensitive>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Follow-up due</dt>
                    <dd className="text-ink-1">{note.followUpDue ? shortDate(note.followUpDue) : "Not set"}</dd>
                  </div>
                  {note.riskNotes ? (
                    <div className="sm:col-span-2">
                      <dt className="text-ink-3">Risk notes and safety plan</dt>
                      <dd className="whitespace-pre-line text-ink-1">
                        <Sensitive>{note.riskNotes}</Sensitive>
                      </dd>
                    </div>
                  ) : null}
                </div>
              </dl>
            </Panel>

            {addenda.length ? (
              <Panel title="Addenda">
                <ol className="grid gap-4">
                  {addenda.map((a) => (
                    <li key={a.id} className="rounded-2xl bg-canvas p-4 ring-1 ring-line">
                      <p className="text-xs text-ink-3">
                        {shortDate(a.createdAt)} · Reason: <Sensitive>{a.addendumReason}</Sensitive>
                      </p>
                      <p className="mt-2 leading-relaxed whitespace-pre-line text-ink-1">
                        <Sensitive>{a.body.text}</Sensitive>
                      </p>
                    </li>
                  ))}
                </ol>
              </Panel>
            ) : null}

            {note.status === "Signed" ? (
              <>
                <Panel title="Add an addendum">
                  <AddendumForm parentId={noteId} />
                </Panel>
                <details className="rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line">
                  <summary className="min-h-11 cursor-pointer py-2 text-sm text-ink-2">This note was written in error</summary>
                  <div className="mt-3">
                    <EnteredInErrorForm noteId={noteId} />
                  </div>
                </details>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
