import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Feature {
  title: string;
  description: string;
  icon?: LucideIcon;
}

/** Scannable title-and-sentence grid: one idea per item, two to four per row. */
export function FeatureGrid({ items, columns = 2 }: { items: readonly Feature[]; columns?: 2 | 3 | 4 }) {
  return (
    <ul
      className={cn(
        "grid gap-x-8 gap-y-12 sm:grid-cols-2 md:gap-x-12 lg:gap-x-16",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
      )}
    >
      {items.map(({ title, description, icon: Icon }) => (
        <li key={title} className="border-t border-line-strong pt-8">
          {Icon ? <Icon className="mb-6 size-6 text-accent" /> : null}
          <h3 className="font-display text-title text-balance text-brand">{title}</h3>
          <p className="mt-3 max-w-md leading-relaxed text-pretty text-ink-2">{description}</p>
        </li>
      ))}
    </ul>
  );
}
