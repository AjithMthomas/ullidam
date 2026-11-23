"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A section link stays active on its sub-pages (/services lights up on /services/couples). */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, children, className }: { href: Route; children: ReactNode; className?: string }) {
  const isActive = isActivePath(usePathname(), href);
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-full px-4 py-2.5 text-[0.9375rem] font-medium text-ink-2 transition-colors duration-300 ease-calm hover:bg-brand-mist/60 hover:text-brand",
        isActive && "bg-brand-mist/70 text-brand",
        className,
      )}
    >
      {children}
    </Link>
  );
}
