"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/**
 * Makes every Motion animation follow the visitor's reduced-motion setting:
 * movement and scaling are switched off, gentle fades remain.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
