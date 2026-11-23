import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AvailabilityStatus = "open" | "fast" | "gone";

const STATUS: Record<AvailabilityStatus, { dot: string; halo: string | null; label: string }> = {
  open: {
    dot: "bg-status-open",
    halo: "bg-status-open motion-safe:animate-breathe",
    label: "Available",
  },
  fast: {
    dot: "bg-status-fast",
    halo: "bg-status-fast motion-safe:animate-breathe-quick",
    label: "Filling fast",
  },
  // Hollow and still: shape, not only colour, tells "gone" apart.
  gone: {
    dot: "border-[1.5px] border-status-gone bg-transparent",
    halo: null,
    label: "Fully booked",
  },
};

interface StatusPulseProps {
  status: AvailabilityStatus;
  /** Visible text beside the beacon. Without it, the status is announced to screen readers only. */
  label?: ReactNode;
  className?: string;
}

/**
 * Live availability beacon: a CSS breathing pulse that replaces emoji dots
 * (spec Rule 1). The pulse stops entirely for prefers-reduced-motion.
 */
export function StatusPulse({ status, label, className }: StatusPulseProps) {
  const style = STATUS[status];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} data-status={status}>
      <span aria-hidden="true" className="relative inline-flex size-2.5 shrink-0">
        {style.halo ? <span className={cn("absolute inset-0 rounded-full opacity-0", style.halo)} /> : null}
        <span className={cn("relative inline-flex size-2.5 rounded-full", style.dot)} />
      </span>
      {label ? <span>{label}</span> : <span className="sr-only">{style.label}</span>}
    </span>
  );
}
