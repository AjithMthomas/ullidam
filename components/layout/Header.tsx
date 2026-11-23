"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { RainHeaderToggle } from "@/components/audio/SoundscapeButton";
import { ButtonLink } from "@/components/ui/Button";
import { MAIN_NAV, PRIMARY_CTA } from "@/data/site-config";
import { cn } from "@/lib/cn";
import { springSnappy } from "@/lib/motion";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

/**
 * The header from the homepage reference: the logo on its own, a centred pill
 * group of links (a white pill slides to the hovered or current link), and a
 * dark "Book a session" pill. At the top of a page the three parts float
 * separately; once the page scrolls they gather into one glass capsule.
 *
 * Tone comes from the section beneath it (data-header-tone="dark" gives dark
 * glass and white text). A section can ask the header to stay visible while it
 * is underneath (data-header-stay="true"), as the homepage film does.
 */
export function Header() {
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const probe = () => {
      const header = document.querySelector("header");
      const y = (header?.getBoundingClientRect().height ?? 80) * 0.6;
      const below = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !el.closest("header"));
      const section = below?.closest<HTMLElement>("[data-header-tone]");
      setTone(section?.dataset.headerTone === "dark" ? "dark" : "light");
      return section?.dataset.headerStay === "true";
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const keep = probe();
        setCompact(y > 24 && !keep);
        if (Math.abs(y - lastY) > 8) {
          setHidden(!keep && y > lastY && y > 180);
          lastY = y;
        }
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  const isDark = tone === "dark";
  const active = MAIN_NAV.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.href ?? null;
  const lit = hovered ?? active;

  return (
    <header
      data-hidden={hidden}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-4 transition-transform duration-500 ease-calm data-[hidden=true]:not-focus-within:-translate-y-[140%] sm:px-5 md:px-6 md:pt-6"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex w-full items-center justify-between gap-3 rounded-full border transition-[max-width,padding,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-calm",
          compact
            ? "max-w-5xl py-1.5 pr-1.5 pl-4 backdrop-blur-2xl backdrop-saturate-150 md:pl-5"
            : "max-w-7xl border-transparent bg-transparent px-2 py-1 sm:px-4 md:px-7 lg:px-10",
          compact &&
            (isDark
              ? "border-white/12 bg-night/55 shadow-[0_10px_40px_-16px_rgb(0_0_0/0.6)]"
              : "border-white/70 bg-canvas/75 shadow-[0_10px_40px_-18px_color-mix(in_oklab,var(--theme-shadow)_40%,transparent)]"),
        )}
      >
        <Logo tone={isDark ? "inverse" : "brand"} className="shrink-0 [&_svg]:size-8" />

        <nav aria-label="Main" className="hidden lg:block">
          <ul
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "flex items-center gap-0.5 rounded-full border p-1 transition-[background-color,border-color] duration-500",
              compact
                ? "border-transparent bg-transparent"
                : isDark
                  ? "border-white/25 bg-white/12 backdrop-blur-md"
                  : "border-line bg-surface-raised/75 backdrop-blur-xl",
            )}
          >
            {MAIN_NAV.map((item) => {
              const isLit = lit === item.href;
              return (
                <li key={item.href} className="relative">
                  {isLit ? (
                    <motion.span
                      layoutId="nav-pill"
                      transition={springSnappy}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_2px_10px_-4px_rgb(0_0_0/0.25)]"
                    />
                  ) : null}
                  <Link
                    href={item.href}
                    aria-current={active === item.href ? "page" : undefined}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    className={cn(
                      "relative z-10 inline-flex h-10 items-center rounded-full px-4 text-sm font-medium transition-colors duration-300",
                      isLit ? "text-brand" : isDark ? "text-white/85 hover:text-white" : "text-ink-2 hover:text-brand",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "hidden sm:inline-flex",
              isDark && "[&_button]:border-white/25 [&_button]:text-on-brand [&_button:hover]:bg-white/10",
            )}
          >
            <RainHeaderToggle />
          </span>
          <ButtonLink
            href={PRIMARY_CTA.href}
            variant={isDark ? "inverse" : "primary"}
            className="h-11 px-4 text-sm shadow-none sm:px-5"
          >
            <span className="sm:hidden">Book</span>
            <span className="hidden sm:inline">{PRIMARY_CTA.label}</span>
          </ButtonLink>
          <MobileMenu
            items={MAIN_NAV}
            cta={PRIMARY_CTA}
            className="lg:hidden"
            triggerClassName={cn("h-11", isDark && "border-white/20 text-on-brand hover:bg-white/10")}
          />
        </div>
      </div>
    </header>
  );
}
