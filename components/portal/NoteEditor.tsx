"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { addendumAction, enteredInErrorAction, saveDraftAction, signNoteAction, type ActionState } from "@/app/portal/desk-actions";
import { ICD11_COMMON, MODALITIES } from "@/data/icd11";
import type { DraftFields, NoteBody } from "@/lib/portal/repo/records";
import { cn } from "@/lib/cn";
import { Field, FormMessage, inputClass } from "./ui";

const AUTOSAVE_MS = 25_000;
const RISKS = ["None", "Low", "Moderate", "High"] as const;

/**
 * The draft editor. Saves 25 seconds after the last change, when a field
 * loses focus, and on "Save draft"; warns before leaving with unsaved text.
 * Drafts live only on the server (never in browser storage). Signing locks
 * the note; High risk or PHQ-9 item 9 above 0 shows the safety steps.
 */
export function NoteEditor({
  noteId,
  clientId,
  sections,
  initial,
  initialVersion,
}: {
  noteId: string;
  clientId: string;
  sections: { key: string; label: string }[];
  initial: DraftFields;
  initialVersion: string;
}) {
  const [fields, setFields] = useState<DraftFields>(initial);
  const [version, setVersion] = useState(initialVersion);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "saved" | "error" | "conflict"; text?: string }>({ kind: "idle" });
  const [signing, startSign] = useTransition();
  const [signed, setSigned] = useState<{ escalate: boolean } | null>(null);
  const [signError, setSignError] = useState<string>();
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef({ fields, version, dirty });

  useEffect(() => {
    latest.current = { fields, version, dirty };
  }, [fields, version, dirty]);

  const save = useCallback(async () => {
    const { fields: f, version: v, dirty: d } = latest.current;
    if (!d) return true;
    window.clearTimeout(timer.current);
    setStatus({ kind: "saving" });
    const result = await saveDraftAction(noteId, f, v);
    if (result.ok && result.version) {
      setVersion(result.version);
      setDirty(false);
      setStatus({ kind: "saved", text: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()) });
      return true;
    }
    setStatus({ kind: result.conflict ? "conflict" : "error", text: result.error });
    return false;
  }, [noteId]);

  const change = (patch: Partial<DraftFields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setDirty(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(), AUTOSAVE_MS);
  };
  const setSection = (key: string, value: string) => change({ body: { ...latest.current.fields.body, [key]: value } as NoteBody });

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current.dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (signed) {
    return (
      <div className="grid gap-5">
        {signed.escalate ? (
          <div role="alert" className="rounded-[1.5rem] bg-danger/10 p-6 ring-1 ring-danger/30">
            <h2 className="font-display text-title text-ink-1">Safety steps for this client</h2>
            <ol className="mt-3 grid list-decimal gap-2 pl-5 leading-relaxed text-ink-1">
              <li>Contact the client today and agree a safety plan with them.</li>
              <li>Share the crisis numbers for the country they are in.</li>
              <li>Inform the clinical lead (no clinical detail by message).</li>
              <li>If there is immediate danger, contact emergency services where they are.</li>
            </ol>
            <p className="mt-3 text-xs text-ink-3">These steps await the clinical lead&rsquo;s sign-off before launch.</p>
          </div>
        ) : null}
        <p className="rounded-xl bg-highlight/60 px-4 py-3 text-ink-1">Signed and locked. Any change from now on is a dated addendum.</p>
        <Link href={`/portal/clients/${clientId}`} className="inline-flex min-h-12 items-center justify-self-start rounded-full bg-brand px-5 text-sm font-medium text-on-brand">
          Back to the record
        </Link>
      </div>
    );
  }

  const selectedIcd = fields.diagnosisCode ? `${fields.diagnosisCode} ${fields.diagnosisLabel}`.trim() : "";

  return (
    <div className="grid gap-6">
      <div className="sticky top-[4.25rem] z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas/95 px-1 py-2 backdrop-blur">
        <p role="status" className={cn("text-sm", status.kind === "error" || status.kind === "conflict" ? "text-danger" : dirty ? "text-ink-1" : "text-ink-3")}>
          {status.kind === "saving"
            ? "Saving…"
            : status.kind === "conflict"
              ? "This note was changed elsewhere. Copy your text, then reload."
              : status.kind === "error"
                ? status.text
                : dirty
                  ? "Not saved yet"
                  : status.kind === "saved"
                    ? `Saved ${status.text}`
                    : "Draft"}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => void save()} disabled={!dirty || status.kind === "saving"} className="min-h-11 rounded-full border border-line-strong px-4 text-sm text-ink-1 disabled:opacity-50">
            Save draft
          </button>
          <button
            type="button"
            disabled={signing}
            onClick={() => {
              if (!window.confirm("Sign this note? It will be locked; later changes become addenda.")) return;
              setSignError(undefined);
              startSign(async () => {
                if (!(await save())) return;
                const result = await signNoteAction(noteId);
                if (result.ok) setSigned({ escalate: Boolean(result.escalate) });
                else setSignError(result.error);
              });
            }}
            className="min-h-11 rounded-full bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60"
          >
            {signing ? "Signing…" : "Sign note"}
          </button>
        </div>
      </div>
      <FormMessage error={signError} />

      <div className="grid gap-4">
        {sections.map((section) => (
          <Field key={section.key} label={section.label}>
            <textarea
              rows={section.key === "text" ? 12 : 4}
              value={fields.body[section.key] ?? ""}
              onChange={(e) => setSection(section.key, e.target.value)}
              onBlur={() => void save()}
              className={inputClass}
            />
          </Field>
        ))}
      </div>

      <fieldset className="grid gap-4 rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line sm:grid-cols-[minmax(0,1fr)_12rem]">
        <legend className="sr-only">Diagnostic impression</legend>
        <Field label="Diagnostic impression (ICD-11)" hint="Pick a common code or type your own (code, then label).">
          <input
            list="icd11-common"
            defaultValue={selectedIcd}
            onChange={(e) => {
              const [code, ...rest] = e.target.value.trim().split(" ");
              const known = ICD11_COMMON.find((item) => item.code === code);
              change({ diagnosisCode: code ?? "", diagnosisLabel: known?.label ?? rest.join(" ") });
            }}
            onBlur={() => void save()}
            className={inputClass}
          />
          <datalist id="icd11-common">
            {ICD11_COMMON.map((item) => (
              <option key={item.code} value={`${item.code} ${item.label}`} />
            ))}
          </datalist>
        </Field>
        <Field label="Status">
          <select value={fields.diagnosisStatus || "Provisional"} onChange={(e) => change({ diagnosisStatus: e.target.value })} className={inputClass}>
            <option>Provisional</option>
            <option>Confirmed</option>
          </select>
        </Field>
      </fieldset>

      <fieldset className="rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line">
        <legend className="px-1 text-sm font-medium text-ink-2">Approaches used</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MODALITIES.map((m) => {
            const on = fields.modalities.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                onClick={() => change({ modalities: on ? fields.modalities.filter((x) => x !== m) : [...fields.modalities, m] })}
                className={cn("min-h-11 rounded-full px-4 text-sm", on ? "bg-brand text-on-brand" : "border border-line-strong text-ink-2")}
              >
                {m}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line">
        <legend className="px-1 text-sm font-medium text-ink-2">Risk</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Risk level">
          {RISKS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={fields.riskLevel === r}
              onClick={() => change({ riskLevel: r })}
              className={cn(
                "min-h-11 rounded-full px-4 text-sm",
                fields.riskLevel === r ? (r === "High" ? "bg-danger text-on-brand" : "bg-brand text-on-brand") : "border border-line-strong text-ink-2",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        {fields.riskLevel === "Moderate" || fields.riskLevel === "High" ? (
          <Field label="Risk notes and safety plan">
            <textarea rows={3} value={fields.riskNotes} onChange={(e) => change({ riskNotes: e.target.value })} onBlur={() => void save()} className={inputClass} />
          </Field>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-4 rounded-[1.5rem] bg-surface-raised p-5 ring-1 ring-line sm:grid-cols-4">
        <legend className="px-1 text-sm font-medium text-ink-2">Measures and follow-up (optional)</legend>
        <Field label="PHQ-9 (0 to 27)">
          <input inputMode="numeric" value={fields.phq9} onChange={(e) => change({ phq9: e.target.value.replace(/\D/g, "").slice(0, 2) })} className={inputClass} />
        </Field>
        <Field label="PHQ-9 item 9 (0 to 3)" hint="Self-harm thoughts. Above 0 needs a risk level.">
          <input inputMode="numeric" value={fields.phq9Item9} onChange={(e) => change({ phq9Item9: e.target.value.replace(/\D/g, "").slice(0, 1) })} className={inputClass} />
        </Field>
        <Field label="GAD-7 (0 to 21)">
          <input inputMode="numeric" value={fields.gad7} onChange={(e) => change({ gad7: e.target.value.replace(/\D/g, "").slice(0, 2) })} className={inputClass} />
        </Field>
        <Field label="Follow-up due">
          <input type="date" value={fields.followUpDue} onChange={(e) => change({ followUpDue: e.target.value })} className={inputClass} />
        </Field>
      </fieldset>
    </div>
  );
}

export function AddendumForm({ parentId }: { parentId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(addendumAction, {});
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="parentId" value={parentId} />
      <Field label="Addendum">
        <textarea name="text" rows={4} required className={inputClass} />
      </Field>
      <Field label="Why it is needed">
        <input name="reason" required maxLength={300} className={inputClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="min-h-11 rounded-full bg-brand px-4 text-sm font-medium text-on-brand disabled:opacity-60">
          {pending ? "Adding…" : "Add addendum"}
        </button>
        <FormMessage error={state.error} message={state.message} />
      </div>
    </form>
  );
}

export function EnteredInErrorForm({ noteId }: { noteId: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(enteredInErrorAction, {});
  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="noteId" value={noteId} />
      <Field label="Reason" hint="The note stays visible, marked as entered in error. Nothing is deleted.">
        <input name="reason" required maxLength={300} className={inputClass} />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="min-h-11 rounded-full border border-danger/30 px-4 text-sm text-danger disabled:opacity-60">
          {pending ? "Saving…" : "Mark as entered in error"}
        </button>
        <FormMessage error={state.error} />
      </div>
    </form>
  );
}
