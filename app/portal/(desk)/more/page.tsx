import Link from "next/link";
import { Suspense } from "react";
import { ChartLine, ChevronRight, Settings, UserRound } from "lucide-react";
import { SignOutButton } from "@/components/portal/PortalChrome";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { requireClinician } from "@/lib/portal/auth";

export const metadata = { title: "More" };

const LINKS = [
  { href: "/portal/analytics", label: "Analytics", Icon: ChartLine },
  { href: "/portal/profile", label: "Profile", Icon: UserRound },
  { href: "/portal/settings", label: "Settings", Icon: Settings },
] as const;

/** Phones: the sections that don't fit in the bottom tabs. */
export default function MorePage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <More />
    </Suspense>
  );
}

async function More() {
  await requireClinician();
  return (
    <div>
      <PortalHeader title="More" />
      <ul className="mt-8 overflow-hidden rounded-[1.5rem] bg-surface-raised ring-1 ring-line">
        {LINKS.map(({ href, label, Icon }) => (
          <li key={href} className="border-b border-line last:border-b-0">
            <Link href={href} className="flex min-h-14 items-center gap-3 px-5 text-ink-1 hover:bg-canvas-muted">
              <Icon className="size-5 text-brand" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="size-4 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
      <SignOutButton className="mt-6" />
    </div>
  );
}
