import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { PortalHeader, PortalSkeleton } from "@/components/portal/PortalPage";
import { ProfileForm } from "@/components/portal/ProfileForm";
import { StatusBadge } from "@/components/portal/ui";
import { requireTreatingClinician } from "@/lib/portal/auth";
import { profileFor } from "@/lib/portal/repo/profile";

export const metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <Suspense fallback={<PortalSkeleton />}>
      <Profile />
    </Suspense>
  );
}

/** Profile (docs/specs/portal.md 4.7): edit the public page; the coordinator reviews before it goes live. */
async function Profile() {
  const me = await requireTreatingClinician();
  const profile = await profileFor(me.id);
  const source = profile.draft ?? profile.live;

  return (
    <div>
      <PortalHeader
        title="Your profile"
        lead="What visitors see on your public page. The coordinator reviews changes before they go live."
        actions={
          <Link href={`/therapists/${me.slug}` as Route} target="_blank" className="inline-flex min-h-11 items-center self-start text-sm font-medium text-brand underline underline-offset-4">
            View your public page
          </Link>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={profile.status} />
        <p className="text-sm text-ink-2">
          {profile.status === "Published"
            ? "Your page is up to date."
            : profile.status === "Pending review"
              ? "Your changes are waiting for the coordinator's review."
              : `Returned by the coordinator: ${profile.note || "please revise"}`}
        </p>
      </div>
      <div className="mt-8">
        <ProfileForm
          name={me.name}
          title={me.title}
          initial={{ bio: source.bio, approach: source.approach, specialties: source.specialties.join("\n"), languages: source.languages.join("\n") }}
        />
      </div>
    </div>
  );
}
