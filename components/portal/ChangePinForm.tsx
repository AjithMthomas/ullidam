"use client";

import { useActionState } from "react";
import { changePinAction, type FormState } from "@/app/portal/actions";
import { Button } from "@/components/ui/Button";
import { PinInput } from "./PinInput";

/** Change PIN: current PIN, then the new one twice. Every other device is signed out. */
export function ChangePinForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePinAction, {});
  return (
    <form action={action} className="grid max-w-sm gap-5">
      <PinInput name="current" label="Current PIN" />
      <PinInput name="next" label="New PIN" />
      <PinInput name="confirm" label="New PIN again" />
      {state.error ? (
        <p role="alert" className="text-sm leading-relaxed text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="rounded-xl bg-highlight/60 px-4 py-3 text-sm text-ink-1">
          PIN changed. Any other device you were signed in on has been signed out.
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="justify-self-start">
        {pending ? "Saving…" : "Change PIN"}
      </Button>
    </form>
  );
}
