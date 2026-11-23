"use client";

import { LucideProvider } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Every lucide-react icon in the app inherits strokeWidth 1.5 (spec Rule 1)
 * from this provider, so individual icons never need to repeat it.
 */
export function IconDefaults({ children }: { children: ReactNode }) {
  return <LucideProvider strokeWidth={1.5}>{children}</LucideProvider>;
}
