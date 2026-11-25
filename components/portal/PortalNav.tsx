"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { CalendarDays, ChartLine, ClipboardList, Ellipsis, Inbox, Settings, Sun, UserRound, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  href: Route;
  label: string;
  Icon: LucideIcon;
}

const MAIN: NavItem[] = [
  { href: "/portal/today", label: "Today", Icon: Sun },
  { href: "/portal/bookings", label: "Bookings", Icon: Inbox },
  { href: "/portal/schedule", label: "Schedule", Icon: CalendarDays },
  { href: "/portal/clients", label: "Clients", Icon: Users },
];
const MORE: NavItem[] = [
  { href: "/portal/analytics", label: "Analytics", Icon: ChartLine },
  { href: "/portal/profile", label: "Profile", Icon: UserRound },
  { href: "/portal/settings", label: "Settings", Icon: Settings },
];

const COORDINATOR: NavItem[] = [
  { href: "/portal/desk", label: "Desk", Icon: ClipboardList },
  { href: "/portal/settings", label: "Settings", Icon: Settings },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Desktop: a left rail with every section. Phones: four tabs and "More". */
export function PortalNav({ variant, role = "clinician" }: { variant: "rail" | "tabs"; role?: "clinician" | "coordinator" }) {
  const pathname = usePathname();
  const coordinator = role === "coordinator";

  if (variant === "rail") {
    return (
      <nav aria-label="Portal" className="mt-10 grid gap-1">
        {(coordinator ? COORDINATOR : [...MAIN, ...MORE]).map(({ href, label, Icon }, index) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[0.9375rem] transition-colors duration-200",
                !coordinator && index === MAIN.length && "mt-6",
                active ? "bg-highlight font-medium text-brand" : "text-ink-2 hover:bg-canvas-muted hover:text-ink-1",
              )}
            >
              <Icon className="size-[1.125rem]" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  const moreActive = MORE.some((item) => isActive(pathname, item.href)) || pathname === "/portal/more";
  return (
    <nav
      aria-label="Portal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className={cn("mx-auto grid max-w-lg", coordinator ? "grid-cols-2" : "grid-cols-5")}>
        {(coordinator ? COORDINATOR : [...MAIN, { href: "/portal/more" as Route, label: "More", Icon: Ellipsis }]).map(({ href, label, Icon }) => {
          const active = href === "/portal/more" ? moreActive : isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem]", active ? "font-medium text-brand" : "text-ink-3")}
              >
                <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", active && "bg-highlight")}>
                  <Icon className="size-[1.125rem]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
