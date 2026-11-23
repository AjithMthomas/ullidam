import Link from "next/link";
import type { MouseEventHandler } from "react";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/cn";

/** An arched doorway with a small light inside: the space within. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        d="M8.5 27.5V15a7.5 7.5 0 0 1 15 0v12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M5 27.5h22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="19.5" r="2.25" className="fill-accent" />
    </svg>
  );
}

interface LogoProps {
  tone?: "brand" | "inverse";
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function Logo({ tone = "brand", className, onClick }: LogoProps) {
  const inverse = tone === "inverse";
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${siteConfig.name}, home`}
      className={cn("inline-flex items-center gap-3 rounded-lg", className)}
    >
      <LogoMark className={cn("size-9 shrink-0", inverse ? "text-on-brand" : "text-brand")} />
      <span
        className={cn(
          "font-display text-[1.0625rem] leading-none font-medium tracking-[0.16em] uppercase",
          inverse ? "text-on-brand" : "text-brand",
        )}
      >
        {siteConfig.name}
      </span>
    </Link>
  );
}
