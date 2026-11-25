import { Suspense } from "react";
import { ChangePinForm } from "@/components/portal/ChangePinForm";
import { SignOutButton } from "@/components/portal/PortalChrome";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { requireClinician } from "@/lib/portal/auth";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireClinician();
  return (
    <div>
      <PortalHeader title="Settings" lead="Your PIN and where you are signed in." />
      <section aria-labelledby="pin-heading" className="mt-10 rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-8">
        <h2 id="pin-heading" className="font-display text-title text-brand">Change your PIN</h2>
        <p className="mt-2 mb-6 max-w-xl text-sm leading-relaxed text-ink-2">
          Six digits that aren&rsquo;t a run or a repeat. Changing it signs you out on every other device.
        </p>
        <ChangePinForm />
      </section>
      <section aria-labelledby="devices-heading" className="mt-6 rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-8">
        <h2 id="devices-heading" className="font-display text-title text-brand">Signed-in devices</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-2">
          Lost a phone or used a shared computer? Sign out everywhere at once. A list of recent sign-ins arrives in Phase E.
        </p>
        <SignOutButton everywhere className="mt-4 -ml-3.5" />
      </section>
    </div>
  );
}
