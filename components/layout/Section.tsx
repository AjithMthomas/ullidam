import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  canvas: "bg-canvas",
  muted: "bg-canvas-muted",
  brand: "bg-brand text-on-brand",
} as const;

export type SectionTone = keyof typeof TONES;

interface SectionProps extends ComponentProps<"section"> {
  tone?: SectionTone;
}

/**
 * "Whitespace as psychological oxygen": py-16 on phones, rising through
 * py-24 on tablets to py-36 on wide desktops. Alternate tones between
 * neighbouring sections so the full padding reads as calm, not empty.
 */
export function Section({ tone = "canvas", className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-16 sm:py-20 md:py-24 lg:py-32 xl:py-36", TONES[tone], className)}
      {...props}
    />
  );
}

export function Eyebrow({ children, onDark = false, className }: { children: ReactNode; onDark?: boolean; className?: string }) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-[0.18em] uppercase",
        onDark ? "text-accent-on-dark" : "text-accent-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}

interface SectionIntroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "start" | "center";
  className?: string;
}

/** Heading (set in capitals, written in sentence case) and a short lead, held to reading width. */
export function SectionIntro({ eyebrow, title, lead, align = "start", className }: SectionIntroProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow className="mb-5">{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-headline text-balance text-brand uppercase">{title}</h2>
      {lead ? <p className="mt-6 text-lead text-pretty text-ink-2">{lead}</p> : null}
    </div>
  );
}
