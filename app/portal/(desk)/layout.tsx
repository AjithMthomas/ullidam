import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { LogoMark } from "@/components/layout/Logo";
import { SignOutButton, TopBar } from "@/components/portal/PortalChrome";
import { PortalNav } from "@/components/portal/PortalNav";
import { PortalProvider } from "@/components/portal/PortalProvider";
import { requireClinician } from "@/lib/portal/auth";

/**
 * The signed-in portal: the same layout for every clinician (rail on desktop,
 * bottom tabs on phones), with each screen showing only their own data.
 * The session is read inside Suspense boundaries, never at the top of this
 * layout, so the frame renders at once (Next 16 Cache Components).
 */
export default function DeskLayout({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface-raised px-4 py-6 lg:flex">
          <Link href="/portal/today" className="flex min-h-11 items-center gap-2.5 px-2 text-brand">
            <LogoMark className="size-7" />
            <span className="font-display text-xl">Ullidam</span>
            <span className="rounded-full bg-canvas-muted px-2 py-0.5 text-[0.6875rem] text-ink-2">Portal</span>
          </Link>
          <Suspense fallback={<div className="mt-10 h-72 animate-pulse rounded-xl bg-canvas-muted" />}>
            <RoleNav variant="rail" />
          </Suspense>
          <div className="mt-auto border-t border-line pt-4">
            <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-canvas-muted" />}>
              <ClinicianBadge />
            </Suspense>
            <SignOutButton className="mt-2 w-full" />
          </div>
        </aside>
        <div className="flex min-h-dvh min-w-0 flex-col">
          <TopBar />
          <div id="portal-content" className="flex-1 px-5 pt-7 pb-28 sm:px-8 lg:px-12 lg:pt-10 lg:pb-16">
            {children}
          </div>
        </div>
        <Suspense fallback={null}>
          <RoleNav variant="tabs" />
        </Suspense>
      </div>
    </PortalProvider>
  );
}

/** Navigation depends on the role (clinician or coordinator), read from the session. */
async function RoleNav({ variant }: { variant: "rail" | "tabs" }) {
  const me = await requireClinician();
  return <PortalNav variant={variant} role={me.role} />;
}

async function ClinicianBadge() {
  const clinician = await requireClinician();
  return (
    <Link href="/portal/profile" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-canvas-muted">
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-tertiary">
        {clinician.photo ? <Image src={clinician.photo} alt="" fill sizes="40px" className="object-cover object-top" /> : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink-1">{clinician.name}</span>
        <span className="block truncate text-xs text-ink-3">{clinician.title}</span>
      </span>
    </Link>
  );
}
