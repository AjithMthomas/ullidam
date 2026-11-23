"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * The header steps aside while the visitor reads downward and returns the
 * moment they scroll up, so cinematic sections get the whole screen. It also
 * reappears whenever keyboard focus enters it.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY) > 8) {
          setHidden(y > lastY && y > 180);
          lastY = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-hidden={hidden}
      className="sticky top-0 z-50 border-b border-line/70 bg-canvas/85 backdrop-blur-xl transition-transform duration-500 ease-calm data-[hidden=true]:not-focus-within:-translate-y-full"
    >
      {children}
    </header>
  );
}
