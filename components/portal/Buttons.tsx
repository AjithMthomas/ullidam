"use client";

import { useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A button that runs a server action and shows its outcome inline.
 * The action returns { error?, message? }; the page refreshes itself.
 */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  confirm,
  className,
}: {
  action: () => Promise<{ error?: string; message?: string; ok?: boolean }>;
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "danger";
  confirm?: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ error?: string; message?: string }>({});
  return (
    <span className="inline-flex flex-col gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => setResult(await action()));
        }}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60",
          variant === "primary" && "bg-brand text-on-brand hover:bg-brand-soft",
          variant === "secondary" && "border border-line-strong bg-surface-raised text-ink-1 hover:border-brand/40",
          variant === "quiet" && "text-brand underline underline-offset-4",
          variant === "danger" && "border border-danger/30 text-danger hover:bg-danger/5",
          className,
        )}
      >
        {pending ? "Working…" : children}
      </button>
      {result.error ? (
        <span role="alert" className="text-xs leading-relaxed text-danger">
          {result.error}
        </span>
      ) : result.message ? (
        <span role="status" className="text-xs leading-relaxed text-ink-2">
          {result.message}
        </span>
      ) : null}
    </span>
  );
}
