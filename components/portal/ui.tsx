import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small building blocks shared by portal screens (server-safe). */

export function Panel({ title, icon, children, className, actions }: { title?: ReactNode; icon?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-8", className)}>
      {title ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2.5 font-display text-title text-brand">
            {icon}
            {title}
          </h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const TONES: Record<string, string> = {
  Requested: "bg-highlight text-brand",
  "Reschedule requested": "bg-status-fast/15 text-ink-1",
  Confirmed: "bg-brand text-on-brand",
  Completed: "bg-canvas-muted text-ink-2",
  "No-show": "bg-danger/10 text-danger",
  Cancelled: "bg-canvas-muted text-ink-3 line-through",
  Active: "bg-highlight text-brand",
  Paused: "bg-canvas-muted text-ink-2",
  Discharged: "bg-canvas-muted text-ink-3",
  Archived: "bg-canvas-muted text-ink-3",
  Draft: "bg-status-fast/15 text-ink-1",
  Signed: "bg-highlight text-brand",
  "Entered in error": "bg-danger/10 text-danger",
  Published: "bg-highlight text-brand",
  "Pending review": "bg-status-fast/15 text-ink-1",
  Returned: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium", TONES[status] ?? "bg-canvas-muted text-ink-2")}>{status}</span>;
}

/** Risk is shown with shape and words, never colour alone. */
export function RiskBadge({ level }: { level: string }) {
  if (!level || level === "None") return null;
  const tone = level === "High" ? "bg-danger text-on-brand" : level === "Moderate" ? "bg-status-fast/20 text-ink-1" : "bg-canvas-muted text-ink-2";
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", tone)}>
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", level === "High" ? "bg-on-brand" : "bg-current")} />
      {level} risk
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="leading-relaxed text-pretty text-ink-2">{children}</p>;
}

export const inputClass =
  "w-full rounded-xl border border-line-strong bg-surface-raised px-4 py-3 text-[0.9375rem] text-ink-1 placeholder:text-ink-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid content-start gap-1.5", className)}>
      <span className="text-sm font-medium text-ink-2">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-relaxed text-ink-3">{hint}</span> : null}
    </label>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error)
    return (
      <p role="alert" className="text-sm leading-relaxed text-danger">
        {error}
      </p>
    );
  if (message)
    return (
      <p role="status" className="rounded-xl bg-highlight/60 px-4 py-2.5 text-sm text-ink-1">
        {message}
      </p>
    );
  return null;
}

export function Kpi({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="border-t border-line-strong pt-4">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="mt-1 font-display text-3xl text-brand tabular-nums">{value}</dd>
      {hint ? <dd className="mt-1 text-xs text-ink-3">{hint}</dd> : null}
    </div>
  );
}
