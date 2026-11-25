"use client";

import { useActionState, useState } from "react";
import { submitProfileAction, type ActionState } from "@/app/portal/desk-actions";
import { Field, FormMessage, inputClass } from "./ui";

interface Values {
  bio: string;
  approach: string;
  specialties: string;
  languages: string;
}

/** Edit the public profile with a live preview; changes go to the coordinator before they publish. */
export function ProfileForm({ initial, name, title }: { initial: Values; name: string; title: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(submitProfileAction, {});
  const [values, setValues] = useState(initial);
  const set = (key: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const list = (value: string) => value.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <form action={action} className="grid content-start gap-5">
        <Field label="Bio" hint={`${values.bio.length} of 900 characters. Two or three warm, plain sentences work best.`}>
          <textarea name="bio" rows={6} maxLength={900} value={values.bio} onChange={set("bio")} className={inputClass} />
        </Field>
        <Field label="How you work" hint="One or two sentences, in your own voice.">
          <textarea name="approach" rows={3} maxLength={600} value={values.approach} onChange={set("approach")} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Specialties" hint="One per line, up to 8.">
            <textarea name="specialties" rows={6} value={values.specialties} onChange={set("specialties")} className={inputClass} />
          </Field>
          <Field label="Languages" hint="One per line.">
            <textarea name="languages" rows={6} value={values.languages} onChange={set("languages")} className={inputClass} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button disabled={pending} className="min-h-12 rounded-full bg-brand px-6 text-sm font-medium text-on-brand disabled:opacity-60">
            {pending ? "Sending…" : "Send for review"}
          </button>
          <FormMessage error={state.error} message={state.message} />
        </div>
      </form>

      <aside aria-label="Preview" className="self-start rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line lg:sticky lg:top-24">
        <p className="text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">Preview</p>
        <p className="mt-3 font-display text-2xl text-brand">{name}</p>
        <p className="text-sm text-ink-3">{title}</p>
        <p className="mt-4 leading-relaxed text-pretty text-ink-2">{values.bio || "Your bio appears here."}</p>
        {values.approach ? <p className="mt-4 font-display text-lg leading-snug text-brand">&ldquo;{values.approach}&rdquo;</p> : null}
        <ul className="mt-5 flex flex-wrap gap-2">
          {list(values.specialties).slice(0, 8).map((s) => (
            <li key={s} className="rounded-full bg-highlight px-3 py-1 text-sm text-brand">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-3">{list(values.languages).join(", ")}</p>
      </aside>
    </div>
  );
}
