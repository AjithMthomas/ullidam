import type { ReactNode } from "react";

/** A portal screen's heading block: title, one short line, optional actions. */
export function PortalHeader({ title, lead, actions }: { title: string; lead?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-headline text-balance text-brand">{title}</h1>
        {lead ? <p className="mt-2 max-w-2xl leading-relaxed text-pretty text-ink-2">{lead}</p> : null}
      </div>
      {actions}
    </header>
  );
}

/** Skeleton while a screen's data streams in (sized like the content, so nothing jumps). */
export function PortalSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-10 w-64 rounded-xl bg-canvas-muted" />
      <div className="mt-3 h-5 w-96 max-w-full rounded-lg bg-canvas-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-canvas-muted" />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-2xl bg-canvas-muted" />
    </div>
  );
}

/** A section still to come in a later phase: says what it will do, honestly. */
export function ComingSoon({ points, phase }: { points: string[]; phase: string }) {
  return (
    <section className="mt-10 max-w-2xl rounded-[1.75rem] bg-surface-raised p-7 ring-1 ring-line sm:p-9">
      <p className="text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">Arriving in {phase}</p>
      <ul className="mt-5 grid gap-3">
        {points.map((point) => (
          <li key={point} className="flex gap-3 leading-relaxed text-ink-2">
            <span aria-hidden="true" className="mt-[0.6rem] size-1.5 shrink-0 rounded-full bg-tertiary" />
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
