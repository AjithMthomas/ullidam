"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { setupPinAction, signInAction, type FormState } from "@/app/portal/actions";
import { Button } from "@/components/ui/Button";
import type { ClinicianCard } from "@/lib/portal/repo/clinicians";
import { PinInput } from "./PinInput";

/** Step 1: who is signing in (photo cards). Step 2: their PIN, or a first-time setup code. */
export function SignIn({ clinicians, notice }: { clinicians: ClinicianCard[]; notice?: string }) {
  const [selected, setSelected] = useState<ClinicianCard | null>(null);
  const [mode, setMode] = useState<"pin" | "setup">("pin");

  if (!selected) {
    return (
      <div>
        {notice ? (
          <p role="status" className="mb-6 rounded-2xl bg-highlight/60 px-4 py-3 text-sm text-ink-1">
            {notice}
          </p>
        ) : null}
        <h2 className="text-sm font-medium text-ink-2">Who is signing in?</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {clinicians.map((clinician) => (
            <li key={clinician.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(clinician);
                  setMode("pin");
                }}
                className="flex w-full items-center gap-4 rounded-2xl bg-surface-raised p-4 text-left ring-1 ring-line transition-shadow duration-300 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Avatar clinician={clinician} />
                <span className="min-w-0">
                  <span className="block font-display text-lg text-brand">{clinician.name}</span>
                  <span className="block text-sm leading-snug text-ink-3">{clinician.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 hover:text-ink-1"
      >
        <ArrowLeft className="size-4" />
        Not you? Choose again
      </button>
      <div className="mt-4 flex items-center gap-4">
        <Avatar clinician={selected} />
        <div>
          <p className="font-display text-xl text-brand">{selected.name}</p>
          <p className="text-sm text-ink-3">{mode === "pin" ? "Enter your 6-digit PIN" : "Set up your PIN"}</p>
        </div>
      </div>
      {mode === "pin" ? (
        <PinForm clinicianId={selected.id} onSetup={() => setMode("setup")} />
      ) : (
        <SetupForm clinicianId={selected.id} onBack={() => setMode("pin")} />
      )}
    </div>
  );
}

function PinForm({ clinicianId, onSetup }: { clinicianId: string; onSetup: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(signInAction, {});
  return (
    <form action={action} className="mt-8">
      <input type="hidden" name="clinicianId" value={clinicianId} />
      <PinInput name="pin" label="PIN" autoFocus />
      <ErrorLine message={state.error} />
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
        {pending ? "Checking…" : "Sign in"}
      </Button>
      <button type="button" onClick={onSetup} className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-sm text-ink-3 underline underline-offset-4 hover:text-ink-1">
        First time here? Use your setup code
      </button>
    </form>
  );
}

function SetupForm({ clinicianId, onBack }: { clinicianId: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(setupPinAction, {});
  return (
    <form action={action} className="mt-8 grid gap-5">
      <input type="hidden" name="clinicianId" value={clinicianId} />
      <div>
        <label htmlFor="setup-code" className="text-sm font-medium text-ink-2">
          Setup code from the coordinator
        </label>
        <input
          id="setup-code"
          name="code"
          required
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface-raised px-4 font-medium tracking-[0.2em] text-ink-1 uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </div>
      <PinInput name="pin" label="Choose a 6-digit PIN" />
      <PinInput name="confirm" label="Type it again" />
      <ErrorLine message={state.error} />
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Set PIN and sign in"}
      </Button>
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center justify-center text-sm text-ink-3 underline underline-offset-4 hover:text-ink-1">
        I already have a PIN
      </button>
    </form>
  );
}

function ErrorLine({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-3 text-sm leading-relaxed text-danger">
      {message}
    </p>
  ) : null;
}

function Avatar({ clinician }: { clinician: ClinicianCard }) {
  return (
    <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-tertiary">
      {clinician.photo ? <Image src={clinician.photo} alt="" fill sizes="56px" className="object-cover object-top" /> : null}
    </span>
  );
}
