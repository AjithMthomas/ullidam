"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * A 6-digit PIN field: one real input (numeric keyboard on phones, works with
 * a keyboard and password managers), drawn as six boxes that fill as you type.
 */
export function PinInput({
  name,
  label,
  autoFocus = false,
  className,
}: {
  name: string;
  label: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name={name}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="peer absolute inset-0 h-full w-full cursor-text opacity-0"
        />
        <div
          aria-hidden="true"
          className="grid grid-cols-6 gap-2 rounded-2xl peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "grid h-14 place-items-center rounded-xl border bg-surface-raised transition-colors duration-200",
                index < value.length ? "border-brand" : "border-line-strong",
                index === value.length && "border-brand/60 ring-2 ring-highlight",
              )}
            >
              {index < value.length ? <span className="size-3 rounded-full bg-brand" /> : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
