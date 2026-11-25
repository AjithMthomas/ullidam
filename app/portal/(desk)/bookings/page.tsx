import Link from "next/link";
import { Suspense } from "react";
import { BookingActions } from "@/components/portal/BookingActions";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { EmptyState, StatusBadge } from "@/components/portal/ui";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { clientLocal, describeSlot } from "@/lib/portal/format";
import { bookingsWithClient, slotStart, type Booking } from "@/lib/portal/repo/bookings";
import { cn } from "@/lib/cn";

export const metadata = { title: "Bookings" };

const VIEWS = [
  { id: "requests", label: "Requests" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
] as const;
type View = (typeof VIEWS)[number]["id"];

export default function BookingsPage({ searchParams }: PageProps<"/portal/bookings">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Bookings searchParams={searchParams} />
    </Suspense>
  );
}

/** Bookings (docs/specs/portal.md 4.2): requests, upcoming, past; mark, link, note, reschedule. */
async function Bookings({ searchParams }: { searchParams: PageProps<"/portal/bookings">["searchParams"] }) {
  const me = await requireTreatingClinician();
  const params = await searchParams;
  const view: View = VIEWS.some((v) => v.id === params.view) ? (params.view as View) : "upcoming";
  const now = new Date().getTime();
  const all = await bookingsWithClient(me.id);
  const start = (b: Booking) => slotStart(b.confirmedSlot || b.primarySlot)?.getTime() ?? 0;

  const lists: Record<View, Booking[]> = {
    requests: all.filter((b) => b.status === "Requested" || b.status === "Reschedule requested").sort((a, b) => start(a) - start(b)),
    upcoming: all.filter((b) => b.status === "Confirmed" && start(b) + 60 * 60_000 >= now).sort((a, b) => start(a) - start(b)),
    past: all
      .filter((b) => ["Completed", "No-show", "Cancelled"].includes(b.status) || (b.status === "Confirmed" && start(b) + 60 * 60_000 < now))
      .sort((a, b) => start(b) - start(a))
      .slice(0, 60),
  };
  const items = lists[view];

  return (
    <div>
      <PortalHeader title="Bookings" lead="The coordinator confirms times with clients; you mark sessions and keep the video link." />
      <nav aria-label="Booking views" className="mt-8 flex gap-2 overflow-x-auto">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={`/portal/bookings?view=${v.id}`}
            aria-current={view === v.id ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm",
              view === v.id ? "bg-brand text-on-brand" : "border border-line-strong text-ink-2 hover:text-ink-1",
            )}
          >
            {v.label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", view === v.id ? "bg-on-brand/20" : "bg-canvas-muted")}>{lists[v.id].length}</span>
          </Link>
        ))}
      </nav>

      <ul className="mt-6 grid gap-3">
        {items.length ? (
          items.map((b) => {
            const started = start(b) <= now;
            const local = clientLocal(b.confirmedSlot || b.primarySlot, b.timeZone);
            return (
              <li key={b.id} className="rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-brand">
                      <Sensitive>{b.clientName}</Sensitive>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">
                      {b.track} · {b.format === "audio" ? "Audio call" : "Video"} · {b.durationMin} min
                    </p>
                  </div>
                  <StatusBadge status={b.status === "Confirmed" && started ? "Confirmed" : b.status} />
                </div>
                <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  {b.confirmedSlot ? (
                    <div>
                      <dt className="text-ink-3">Session (IST)</dt>
                      <dd className="text-ink-1">{describeSlot(b.confirmedSlot)}</dd>
                    </div>
                  ) : (
                    <>
                      <div>
                        <dt className="text-ink-3">Preferred (IST)</dt>
                        <dd className="text-ink-1">{describeSlot(b.primarySlot)}</dd>
                      </div>
                      <div>
                        <dt className="text-ink-3">Backup (IST)</dt>
                        <dd className="text-ink-1">{b.backupSlot ? describeSlot(b.backupSlot) : "None"}</dd>
                      </div>
                    </>
                  )}
                  {local ? (
                    <div>
                      <dt className="text-ink-3">Client&rsquo;s time</dt>
                      <dd className="text-ink-1">{local}</dd>
                    </div>
                  ) : null}
                  {b.meetingLink ? (
                    <div className="min-w-0">
                      <dt className="text-ink-3">Video link</dt>
                      <dd className="truncate">
                        <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="text-brand underline underline-offset-4">
                          {b.meetingLink.replace(/^https:\/\//, "")}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {b.note ? (
                  <p className="mt-3 rounded-xl bg-canvas-muted px-3 py-2 text-sm whitespace-pre-line text-ink-2">
                    <Sensitive>{b.note}</Sensitive>
                  </p>
                ) : null}
                {b.status !== "Cancelled" ? (
                  <div className="mt-4 border-t border-line pt-4">
                    <BookingActions
                      bookingId={b.id}
                      canMark={b.status === "Confirmed" && started}
                      canReschedule={b.status === "Confirmed" && !started}
                      meetingLink={b.meetingLink}
                      note={b.note}
                      format={b.format}
                    />
                  </div>
                ) : null}
              </li>
            );
          })
        ) : (
          <li>
            <EmptyState>
              {view === "requests"
                ? "No requests waiting. New ones arrive when the coordinator logs a WhatsApp enquiry for you."
                : view === "upcoming"
                  ? "No upcoming sessions yet."
                  : "No past sessions yet."}
            </EmptyState>
          </li>
        )}
      </ul>
    </div>
  );
}
