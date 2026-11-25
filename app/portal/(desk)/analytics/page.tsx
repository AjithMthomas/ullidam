import { Suspense } from "react";
import { Bars, Columns, Heatmap, Line } from "@/components/portal/Charts";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Kpi } from "@/components/portal/ui";
import { practiceNumbers } from "@/lib/portal/analytics";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { bookingsFor } from "@/lib/portal/repo/bookings";
import { clientsFor } from "@/lib/portal/repo/clients";
import { notesBy } from "@/lib/portal/repo/records";
import { overridesFor, weeklyFor } from "@/lib/portal/repo/schedule";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Analytics />
    </Suspense>
  );
}

const signed = (n: number | null) => (n === null ? "–" : n > 0 ? `+${n}` : String(n));

/** Analytics (docs/specs/portal.md 4.6): only this clinician's own sessions, clients and notes. */
async function Analytics() {
  const me = await requireTreatingClinician();
  const [bookings, clients, notes, weekly, overrides] = await Promise.all([bookingsFor(me.id), clientsFor(me.id), notesBy(me.id), weeklyFor(me.id), overridesFor(me.id)]);
  const n = practiceNumbers({ bookings, clients, notes, weekly, overrides });
  const empty = !bookings.length;

  return (
    <div>
      <PortalHeader title="Analytics" lead="How your practice is going, from your own sessions. Weeks start on Monday; times are India time." />
      {empty ? <p className="mt-8 rounded-2xl bg-highlight/50 px-5 py-4 text-ink-1">Your charts fill in as you complete sessions.</p> : null}

      <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
        <Kpi label="Hours this month" value={n.hoursThisMonth} />
        <Kpi label="Attendance, 90 days" value={n.kpis.attendance90 === null ? "–" : `${n.kpis.attendance90}%`} />
        <Kpi label="Schedule booked, last 4 weeks" value={n.scheduleUse.past.rate === null ? "–" : `${n.scheduleUse.past.rate}%`} hint={`${n.scheduleUse.past.booked} of ${n.scheduleUse.past.capacity} slots`} />
        <Kpi label="Schedule booked, next 4 weeks" value={n.scheduleUse.next.rate === null ? "–" : `${n.scheduleUse.next.rate}%`} hint={`${n.scheduleUse.next.booked} of ${n.scheduleUse.next.capacity} slots`} />
      </dl>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Columns
          title="Sessions per week"
          caption="Completed sessions and no-shows, last 12 weeks."
          data={n.weekly.map((w) => ({ label: w.label, values: [w.completed, w.noShow] }))}
          parts={[
            { name: "Completed", className: "bg-brand" },
            { name: "No-show", className: "bg-tertiary" },
          ]}
        />
        <Line title="Attendance" caption="Share of booked sessions attended, week by week." data={n.weekly.map((w) => ({ label: w.label, value: w.attendance }))} />
        <Columns
          title="New and returning clients"
          caption="Sessions by month: a client's first ever session counts as new."
          data={n.newVsReturning.map((m) => ({ label: m.label, values: [m.returning, m.new] }))}
          parts={[
            { name: "Returning", className: "bg-brand" },
            { name: "New", className: "bg-highlight" },
          ]}
        />
        <Heatmap title="When you work" caption="Completed sessions in the last 90 days, by weekday and shift." grid={n.heatmap} />
        <Bars title="Track mix" caption="Active clients by track." data={n.trackMix} empty="No active clients yet." />
        <Bars title="Where your clients are" caption="Active clients by country." data={n.countries} empty="Countries appear as you add client records." />
      </div>

      <section aria-labelledby="outcomes-heading" className="mt-6 rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-7">
        <h2 id="outcomes-heading" className="font-display text-lg text-brand">
          Outcome trends
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-3">
          Average change between a client&rsquo;s first and latest signed score. Lower scores mean fewer symptoms. Only clients with two or more scores count.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-6">
          <Kpi label={`PHQ-9 (${n.outcomes.phq9.clients} clients)`} value={signed(n.outcomes.phq9.averageChange)} />
          <Kpi label={`GAD-7 (${n.outcomes.gad7.clients} clients)`} value={signed(n.outcomes.gad7.averageChange)} />
        </dl>
      </section>
    </div>
  );
}
