import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  neutral: "border-line bg-canvas text-ink-2",
  muted: "border-transparent bg-canvas-muted text-ink-2",
  brand: "border-transparent bg-brand-mist text-brand",
  accent: "border-transparent bg-accent-mist text-accent-ink",
} as const;

interface PillProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}

/** Scannable badge for specialties, languages and short facts. */
export function Pill({ children, tone = "neutral", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm leading-snug",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
