import Link from "next/link";
import { Suspense } from "react";
import { CalendarCheck, CircleAlert, Phone, Video } from "lucide-react";
import { logContactAction } from "@/app/portal/desk-actions";
import { ActionButton } from "@/components/portal/Buttons";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { Kpi, Panel, RiskBadge } from "@/components/portal/ui";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { practiceNumbers } from "@/lib/portal/analytics";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { clientLocal, relativeDays, shortDate, slotParts, todayIST } from "@/lib/portal/format";
import { bookingsWithClient, slotStart } from "@/lib/portal/repo/bookings";
import { clientsFor } from "@/lib/portal/repo/clients";
import { notesBy } from "@/lib/portal/repo/records";
import { overridesFor, weeklyFor } from "@/lib/portal/repo/schedule";
import { formatDate, formatTime, IST } from "@/lib/time";

export const metadata = { title: "Today" };

export default function TodayPage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Today />
    </Suspense>
  );
}

const greeting = (hour: number) => (hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening");

/** Today (docs/specs/portal.md 4.1): the day's sessions, what needs attention, four numbers. */
async function Today() {
  const me = await requireTreatingClinician();
  const [bookings, clients, notes, weekly, overrides] = await Promise.all([
    bookingsWithClient(me.id),
    clientsFor(me.id),
    notesBy(me.id),
    weeklyFor(me.id),
    overridesFor(me.id),
  ]);
  const now = new Date();
  const today = todayIST();
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "numeric", hourCycle: "h23" }).format(now));
  const numbers = practiceNumbers({ bookings, clients, notes, weekly, overrides, now });

  const todays = bookings
    .filter((b) => ["Confirmed", "Completed", "No-show"].includes(b.status) && slotParts(b.confirmedSlot)?.day === today)
    .sort((a, b) => a.confirmedSlot.localeCompare(b.confirmedSlot));
  const next = todays.find((b) => b.status === "Confirmed" && (slotStart(b.confirmedSlot)?.getTime() ?? 0) > now.getTime());

  // Needs attention
  const toMark = bookings.filter((b) => b.status === "Confirmed" && (slotStart(b.confirmedSlot)?.getTime() ?? Infinity) + 60 * 60_000 < now.getTime());
  const notedBookings = new Set(notes.filter((n) => n.status === "Signed" && n.bookingId).map((n) => n.bookingId));
  const toWrite = bookings.filter((b) => b.status === "Completed" && !notedBookings.has(b.id) && (slotStart(b.confirmedSlot)?.getTime() ?? 0) > now.getTime() - 14 * 86_400_000);
  const requests = bookings.filter((b) => b.status === "Requested").length;
  const atRisk = clients.filter(
    (c) => c.status === "Active" && (c.riskLevel === "High" || c.riskLevel === "Moderate") && (!c.lastContactAt || now.getTime() - Date.parse(c.lastContactAt) > 14 * 86_400_000),
  );
  const latestFollowUp = new Map<string, string>();
  for (const note of notes.filter((n) => n.status === "Signed" && n.followUpDue)) {
    if ((latestFollowUp.get(note.clientId) ?? "") < note.followUpDue) latestFollowUp.set(note.clientId, note.followUpDue);
  }
  const followUps = clients.filter((c) => c.status === "Active" && (latestFollowUp.get(c.id) ?? "9999") <= today);
  const attention = toMark.length + toWrite.length + atRisk.length + followUps.length;

  return (
    <div>
      <PortalHeader title={`${greeting(hour)}, ${me.firstName}.`} lead={formatDate(IST, now)} />

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        <Kpi label="Sessions this week" value={numbers.kpis.sessionsThisWeek} />
        <Kpi label="Upcoming, next 7 days" value={numbers.kpis.upcoming7} />
        <Kpi label="Active clients" value={numbers.kpis.activeClients} />
        <Kpi label="Attendance, 90 days" value={numbers.kpis.attendance90 === null ? "–" : `${numbers.kpis.attendance90}%`} />
      </dl>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title={<>Today&rsquo;s sessions</>} icon={<CalendarCheck className="size-5" />}>
          {todays.length ? (
            <ol className="grid gap-3">
              {todays.map((b) => {
                const local = clientLocal(b.confirmedSlot, b.timeZone);
                return (
                  <li key={b.id} className="grid gap-3 rounded-2xl bg-canvas p-4 ring-1 ring-line sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <p className="font-display text-xl text-brand tabular-nums">{formatTime(IST, slotStart(b.confirmedSlot)!)}</p>
                      {b.id === next?.id ? <p className="text-xs font-medium text-accent-ink">Next</p> : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-ink-1">
                        <Sensitive>{b.clientName}</Sensitive>
                      </p>
                      <p className="text-sm text-ink-3">
                        {b.track} · {b.format === "audio" ? "Audio call" : "Video"} · {b.durationMin} min
                        {local ? ` · ${local}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {b.status === "Confirmed" ? (
                        b.format === "audio" ? (
                          <a href={`tel:${b.whatsapp}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-on-brand">
                            <Phone className="size-4" /> Call
                          </a>
                        ) : b.meetingLink ? (
                          <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-medium text-on-brand">
                            <Video className="size-4" /> Join
                          </a>
                        ) : (
                          <Link href="/portal/bookings?view=upcoming" className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm text-ink-2">
                            Add video link
                          </Link>
                        )
                      ) : (
                        <span className="text-sm text-ink-3">{b.status}</span>
                      )}
                      <a
                        href={`https://wa.me/${b.whatsapp.replace(/^\+/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Message on WhatsApp"
                        className="grid size-11 place-items-center rounded-full border border-line-strong text-whatsapp"
                      >
                        <WhatsAppLogo className="size-4" />
                      </a>
                      {b.clientId ? (
                        <Link href={`/portal/clients/${b.clientId}`} className="inline-flex min-h-11 items-center px-2 text-sm text-brand underline underline-offset-4">
                          Record
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="leading-relaxed text-ink-2">No sessions today.{numbers.kpis.upcoming7 ? ` ${numbers.kpis.upcoming7} coming up this week.` : ""}</p>
          )}
        </Panel>

        <Panel title="Needs attention" icon={<CircleAlert className="size-5" />}>
          {attention || requests ? (
            <ul className="grid gap-4">
              {toMark.map((b) => (
                <li key={`mark-${b.id}`} className="leading-relaxed">
                  <span className="text-ink-1">
                    Mark how <Sensitive>{b.clientName}</Sensitive>&rsquo;s session went
                  </span>
                  <span className="block text-sm text-ink-3">{shortDate(b.confirmedSlot)}</span>
                  <Link href="/portal/bookings?view=past" className="text-sm font-medium text-brand underline underline-offset-4">
                    Mark completed or no-show
                  </Link>
                </li>
              ))}
              {toWrite.map((b) => (
                <li key={`note-${b.id}`} className="leading-relaxed">
                  <span className="text-ink-1">
                    Note still to write for <Sensitive>{b.clientName}</Sensitive>
                  </span>
                  <span className="block text-sm text-ink-3">{shortDate(b.confirmedSlot)}</span>
                  <Link
                    href={b.clientId ? `/portal/clients/${b.clientId}?booking=${b.id}` : `/portal/clients/new?booking=${b.id}`}
                    className="text-sm font-medium text-brand underline underline-offset-4"
                  >
                    {b.clientId ? "Write the note" : "Create the record, then the note"}
                  </Link>
                </li>
              ))}
              {atRisk.map((c) => (
                <li key={`risk-${c.id}`} className="leading-relaxed">
                  <span className="flex flex-wrap items-center gap-2 text-ink-1">
                    Check in with <Sensitive>{c.alias}</Sensitive> <RiskBadge level={c.riskLevel} />
                  </span>
                  <span className="block text-sm text-ink-3">Last contact: {relativeDays(c.lastContactAt)}</span>
                  <ActionButton action={logContactAction.bind(null, c.id)} variant="quiet" className="min-h-9 px-0">
                    Log contact today
                  </ActionButton>
                </li>
              ))}
              {followUps.map((c) => (
                <li key={`follow-${c.id}`} className="leading-relaxed">
                  <span className="text-ink-1">
                    Follow-up due: <Sensitive>{c.alias}</Sensitive>
                  </span>
                  <Link href={`/portal/clients/${c.id}`} className="block text-sm font-medium text-brand underline underline-offset-4">
                    Open record
                  </Link>
                </li>
              ))}
              {requests ? (
                <li className="text-sm leading-relaxed text-ink-2">
                  {requests} booking {requests === 1 ? "request is" : "requests are"} with the coordinator.{" "}
                  <Link href="/portal/bookings?view=requests" className="font-medium text-brand underline underline-offset-4">
                    See requests
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="leading-relaxed text-ink-2">Nothing needs you right now.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
