import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ClientForm, type ClientDefaults } from "@/components/portal/ClientForms";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { Panel } from "@/components/portal/ui";
import { SERVICE_TRACKS } from "@/data/services";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { todayIST } from "@/lib/portal/format";
import { bookingFor } from "@/lib/portal/repo/bookings";
import { StoreError } from "@/lib/portal/store";

export const metadata = { title: "Add client" };

export default function NewClientPage({ searchParams }: PageProps<"/portal/clients/new">) {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <NewClient searchParams={searchParams} />
    </Suspense>
  );
}

/** Add a client; from a booking, the name, number, track and time zone are filled in. */
async function NewClient({ searchParams }: { searchParams: PageProps<"/portal/clients/new">["searchParams"] }) {
  const me = await requireTreatingClinician();
  const bookingId = String((await searchParams).booking ?? "");
  let defaults: ClientDefaults = {};
  if (bookingId) {
    try {
      const b = await bookingFor(me.id, bookingId);
      defaults = { fullName: b.clientName, whatsapp: b.whatsapp, track: b.track, timeZone: b.timeZone };
    } catch (error) {
      if (!(error instanceof StoreError)) throw error;
    }
  }
  return (
    <div>
      <Link href="/portal/clients" className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-2">
        <ArrowLeft className="size-4" /> Clients
      </Link>
      <PortalHeader title="Add a client" lead="Consent comes first. Everything you enter here is encrypted and only you can see it." />
      <Panel className="mt-8">
        <ClientForm tracks={SERVICE_TRACKS.map((t) => t.name)} defaults={defaults} bookingId={bookingId || undefined} today={todayIST()} />
      </Panel>
    </div>
  );
}
