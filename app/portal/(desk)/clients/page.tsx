import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Sensitive } from "@/components/portal/PortalProvider";
import { EmptyState, inputClass, RiskBadge, StatusBadge } from "@/components/portal/ui";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { describeSlot, shortDate } from "@/lib/portal/format";
import { bookingsWithClient, slotStart } from "@/lib/portal/repo/bookings";
import { clientsFor } from "@/lib/portal/repo/clients";
import { cn } from "@/lib/cn";

export const metadata = { title: "Clients" };

const FILTERS = ["Active", "Paused", "Discharged", "Archived", "All"] as const;

export default function ClientsPage({ searchParams }: PageProps<"/portal/clients">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Clients searchParams={searchParams} />
    </Suspense>
  );
}

/** Clients (docs/specs/portal.md 4.4): this clinician's clients only; search and filter happen on the server. */
async function Clients({ searchParams }: { searchParams: PageProps<"/portal/clients">["searchParams"] }) {
  const me = await requireTreatingClinician();
  const params = await searchParams;
  const status = FILTERS.find((f) => f === params.status) ?? "Active";
  const query = String(params.q ?? "").trim().toLowerCase();
  const [clients, bookings] = await Promise.all([clientsFor(me.id), bookingsWithClient(me.id)]);
  const now = new Date().getTime();

  const shown = clients
    .filter((c) => status === "All" || c.status === status)
    .filter((c) => !query || [c.alias, c.fullName, c.track].some((v) => v.toLowerCase().includes(query)))
    .sort((a, b) => a.alias.localeCompare(b.alias));

  const sessionsOf = (id: string) => bookings.filter((b) => b.clientId === id && b.confirmedSlot);
  const last = (id: string) =>
    sessionsOf(id)
      .filter((b) => b.status === "Completed")
      .sort((a, b) => b.confirmedSlot.localeCompare(a.confirmedSlot))[0]?.confirmedSlot;
  const next = (id: string) =>
    sessionsOf(id)
      .filter((b) => b.status === "Confirmed" && (slotStart(b.confirmedSlot)?.getTime() ?? 0) > now)
      .sort((a, b) => a.confirmedSlot.localeCompare(b.confirmedSlot))[0]?.confirmedSlot;

  return (
    <div>
      <PortalHeader
        title="Clients"
        lead="Your clients only. Names and notes are encrypted before they are stored."
        actions={
          <Link href="/portal/clients/new" className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-brand px-5 text-sm font-medium text-on-brand">
            <Plus className="size-4" /> Add client
          </Link>
        }
      />

      <form className="mt-8 flex flex-wrap items-center gap-3" role="search">
        <input type="search" name="q" defaultValue={query} placeholder="Search alias, name or track" aria-label="Search clients" className={cn(inputClass, "max-w-sm")} />
        <input type="hidden" name="status" value={status} />
        <button className="min-h-12 rounded-full border border-line-strong px-4 text-sm text-ink-1">Search</button>
      </form>
      <nav aria-label="Filter by status" className="mt-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/portal/clients?status=${f}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
            aria-current={status === f ? "page" : undefined}
            className={cn("inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm", status === f ? "bg-brand text-on-brand" : "border border-line-strong text-ink-2")}
          >
            {f}
          </Link>
        ))}
      </nav>

      <ul className="mt-6 overflow-hidden rounded-[1.5rem] bg-surface-raised ring-1 ring-line">
        {shown.length ? (
          shown.map((c) => (
            <li key={c.id} className="border-b border-line last:border-b-0">
              <Link href={`/portal/clients/${c.id}`} className="grid gap-2 px-5 py-4 hover:bg-canvas-muted sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-1">
                    <Sensitive>{c.alias}</Sensitive>
                  </span>
                  <span className="block text-sm text-ink-3">{c.track}</span>
                </span>
                <span className="text-sm text-ink-2">Last: {last(c.id) ? shortDate(last(c.id)!) : "No sessions yet"}</span>
                <span className="text-sm text-ink-2">Next: {next(c.id) ? describeSlot(next(c.id)!) : "Not booked"}</span>
                <span className="flex flex-wrap items-center gap-2">
                  <RiskBadge level={c.riskLevel} />
                  <StatusBadge status={c.status} />
                </span>
              </Link>
            </li>
          ))
        ) : (
          <li className="p-6">
            <EmptyState>{clients.length ? "No clients match." : "No clients yet. Add one, or create a record from a booking on Today."}</EmptyState>
          </li>
        )}
      </ul>
    </div>
  );
}
