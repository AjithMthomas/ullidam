"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Public-site chrome (header, footer, floating links, smooth scroll) stays out of the clinician portal. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/portal") ? null : children;
}
