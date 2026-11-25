import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/layout/Logo";
import { SignIn } from "@/components/portal/SignIn";
import { currentClinicianId } from "@/lib/portal/auth";
import { listClinicianCards } from "@/lib/portal/repo/clinicians";
import { StoreError } from "@/lib/portal/store";

const NOTICES: Record<string, string> = {
  idle: "You were signed out after a quiet spell, to keep records safe. Please sign in again.",
  signedOut: "You have been signed out.",
  locked: "Too many attempts. Your account is locked for a short while to keep records safe.",
};

/** Sign-in: choose your photo, then your PIN. Already signed in goes straight to Today. */
export default function PortalSignInPage({ searchParams }: PageProps<"/portal">) {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-5 py-16">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 text-brand">
          <LogoMark className="size-8" />
          <span className="font-display text-xl">Ullidam</span>
          <span className="rounded-full bg-canvas-muted px-2.5 py-1 text-xs text-ink-2">Clinician portal</span>
        </div>
        <h1 className="mt-10 font-display text-headline text-balance text-brand">Welcome back.</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-pretty text-ink-2">
          A private space for Ullidam clinicians. Only you can see your clients and notes.
        </p>
        <div className="mt-10">
          <Suspense fallback={<CardsSkeleton />}>
            <SignInGate searchParams={searchParams} />
          </Suspense>
        </div>
        <p className="mt-12 text-xs leading-relaxed text-ink-3">
          Sign-ins and record access are logged. After 15 quiet minutes the portal locks itself.
        </p>
      </div>
    </div>
  );
}

async function SignInGate({ searchParams }: { searchParams: PageProps<"/portal">["searchParams"] }) {
  const params = await searchParams;
  let clinicians: Awaited<ReturnType<typeof listClinicianCards>>;
  let signedInAs: string | null;
  try {
    [signedInAs, clinicians] = await Promise.all([currentClinicianId(), listClinicianCards()]);
  } catch (error) {
    if (error instanceof StoreError) return <NotReady message={error.message} />;
    throw error;
  }
  if (signedInAs) redirect("/portal/today");
  const notice = Object.keys(NOTICES).find((key) => params[key] !== undefined);
  return <SignIn clinicians={clinicians} notice={notice ? NOTICES[notice] : undefined} />;
}

function NotReady({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl bg-surface-raised p-6 ring-1 ring-line">
      <p className="font-medium text-ink-1">The portal&rsquo;s records aren&rsquo;t connected yet.</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-2">{message}</p>
    </div>
  );
}

function CardsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid animate-pulse gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-[5.5rem] rounded-2xl bg-canvas-muted" />
      ))}
    </div>
  );
}
