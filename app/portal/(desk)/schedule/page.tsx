import { Suspense } from "react";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { ScheduleEditor, type ScheduleDay } from "@/components/portal/ScheduleEditor";
import { daySlots } from "@/data/schedule";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { bookingsFor } from "@/lib/portal/repo/bookings";
import { overridesFor, weeklyFor } from "@/lib/portal/repo/schedule";
import { formatDate, formatTime, IST, istDay, istInstant } from "@/lib/time";

export const metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Schedule />
    </Suspense>
  );
}

/** Schedule (docs/specs/portal.md 4.3): two weeks, the usual week, leave. Feeds the public booking card. */
async function Schedule() {
  const me = await requireTreatingClinician();
  const now = new Date();
  const today = istDay(now).key;
  const [weekly, overrides, bookings] = await Promise.all([weeklyFor(me.id), overridesFor(me.id, today), bookingsFor(me.id)]);
  const names = new Map(bookings.map((b) => [b.id, b.clientName.split(" ")[0]]));

  const days: ScheduleDay[] = Array.from({ length: 14 }, (_, i) => istDay(new Date(now.getTime() + i * 86_400_000))).map(({ key, weekday }) => {
    const whole = overrides.find((o) => o.day === key && o.time === "ALL" && !o.open);
    return {
      key,
      label: formatDate(IST, istInstant(key, "12:00")),
      isToday: key === today,
      closedAllDay: Boolean(whole),
      closedReason: whole?.reason ?? "",
      slots: daySlots(weekly, overrides, key, weekday).map((slot) => ({
        time: slot.time,
        label: formatTime(IST, istInstant(key, slot.time)),
        shift: slot.shift,
        state: slot.state,
        who: slot.bookingId ? names.get(slot.bookingId) : undefined,
      })),
    };
  });

  return (
    <div>
      <PortalHeader title="Schedule" lead="When you are open for sessions, in India time. Changes reach your public booking card within a minute." />
      <div className="mt-10">
        <ScheduleEditor days={days} weekly={weekly} />
      </div>
    </div>
  );
}
