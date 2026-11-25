import type { ReactNode } from "react";
import { SHIFTS, type Shift } from "@/data/schedule";
import { cn } from "@/lib/cn";

/**
 * Quiet, dependency-free charts for the portal (server-rendered). Each one
 * has a plain-English caption and a visually hidden table with the same
 * numbers for screen readers. Colours come from theme tokens.
 */

function Figure({ title, caption, children, table }: { title: string; caption: string; children: ReactNode; table: ReactNode }) {
  return (
    <figure className="rounded-[1.75rem] bg-surface-raised p-6 ring-1 ring-line sm:p-7">
      <h2 className="font-display text-lg text-brand">{title}</h2>
      <figcaption className="mt-1 text-sm leading-relaxed text-ink-3">{caption}</figcaption>
      <div className="mt-6" aria-hidden="true">
        {children}
      </div>
      <div className="sr-only">{table}</div>
    </figure>
  );
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Vertical columns, optionally split into two stacked parts (for example completed and no-show). */
export function Columns({
  title,
  caption,
  data,
  parts,
}: {
  title: string;
  caption: string;
  data: { label: string; values: number[] }[];
  parts: { name: string; className: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.values.reduce((a, b) => a + b, 0)));
  return (
    <Figure
      title={title}
      caption={caption}
      table={<Table head={["Period", ...parts.map((p) => p.name)]} rows={data.map((d) => [d.label, ...d.values])} />}
    >
      <div className="flex h-44 items-end gap-1.5">
        {data.map((d, i) => {
          const total = d.values.reduce((a, b) => a + b, 0);
          return (
            <div key={d.label + i} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-[0.625rem] text-ink-3 tabular-nums">{total || ""}</span>
              <div className="flex flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${(total / max) * 100}%` }}>
                {d.values.map((v, j) => (
                  <div key={j} className={parts[j].className} style={{ height: total ? `${(v / total) * 100}%` : 0 }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {data.map((d, i) => (
          <span key={d.label + i} className="min-w-0 flex-1 truncate text-center text-[0.625rem] text-ink-3">
            {i % 2 === data.length % 2 ? d.label : ""}
          </span>
        ))}
      </div>
      {parts.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-4 text-xs text-ink-2">
          {parts.map((p) => (
            <li key={p.name} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-sm", p.className)} />
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}
    </Figure>
  );
}

/** A percentage line over time; gaps where there is no data. */
export function Line({ title, caption, data }: { title: string; caption: string; data: { label: string; value: number | null }[] }) {
  const w = 300;
  const h = 120;
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const point = (v: number, i: number) => `${(i * step).toFixed(1)},${(h - (v / 100) * h).toFixed(1)}`;
  const segments: string[][] = [];
  data.forEach((d, i) => {
    if (d.value === null) segments.push([]);
    else (segments.at(-1) ?? segments[segments.push([]) - 1]).push(point(d.value, i));
  });
  return (
    <Figure title={title} caption={caption} table={<Table head={["Week", "Attendance %"]} rows={data.map((d) => [d.label, d.value ?? "No sessions"])} />}>
      <svg viewBox={`0 -6 ${w} ${h + 12}`} className="h-36 w-full overflow-visible text-brand" preserveAspectRatio="none">
        {[0, 50, 100].map((g) => (
          <line key={g} x1="0" x2={w} y1={h - (g / 100) * h} y2={h - (g / 100) * h} className="stroke-line" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        {segments.filter((s) => s.length).map((s, i) => (
          <polyline key={i} points={s.join(" ")} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        ))}
        {data.map((d, i) =>
          d.value === null ? null : <circle key={i} cx={i * step} cy={h - (d.value / 100) * h} r="2.5" fill="currentColor" />,
        )}
      </svg>
      <div className="mt-2 flex justify-between text-[0.625rem] text-ink-3">
        <span>{data[0]?.label}</span>
        <span>100% top line</span>
        <span>{data.at(-1)?.label}</span>
      </div>
    </Figure>
  );
}

/** Horizontal bars for categories (bars, not a donut, so values compare easily). */
export function Bars({ title, caption, data, empty }: { title: string; caption: string; data: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <Figure title={title} caption={caption} table={<Table head={["Category", "Count"]} rows={data.map((d) => [d.label, d.value])} />}>
      {data.length ? (
        <ul className="grid gap-3">
          {data.slice(0, 8).map((d) => (
            <li key={d.label} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2rem] items-center gap-3 text-sm">
              <span className="truncate text-ink-2">{d.label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-canvas-muted">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${(d.value / max) * 100}%` }} />
              </span>
              <span className="text-right text-ink-1 tabular-nums">{d.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-3">{empty}</p>
      )}
    </Figure>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Weekday by shift: darker squares mean more sessions. */
export function Heatmap({ title, caption, grid }: { title: string; caption: string; grid: { day: number; shift: Shift; count: number }[][] }) {
  const max = Math.max(1, ...grid.flat().map((c) => c.count));
  const tone = (count: number) =>
    count === 0 ? "bg-canvas-muted" : count / max < 0.34 ? "bg-highlight" : count / max < 0.67 ? "bg-tertiary" : "bg-brand";
  return (
    <Figure
      title={title}
      caption={caption}
      table={<Table head={["Day", ...grid[0].map((c) => SHIFTS[c.shift].label)]} rows={grid.map((row, i) => [DAYS[i], ...row.map((c) => c.count)])} />}
    >
      <div className="grid grid-cols-[2.5rem_repeat(3,minmax(0,1fr))] gap-1.5 text-xs">
        <span />
        {grid[0].map((c) => (
          <span key={c.shift} className="text-center text-ink-3">
            {SHIFTS[c.shift].label}
          </span>
        ))}
        {grid.map((row, i) => (
          <div key={i} className="contents">
            <span className="self-center text-ink-3">{DAYS[i]}</span>
            {row.map((c) => (
              <span key={c.shift} className={cn("grid h-8 place-items-center rounded-md tabular-nums", tone(c.count), c.count / max >= 0.67 ? "text-on-brand" : "text-ink-2")}>
                {c.count || ""}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Figure>
  );
}
