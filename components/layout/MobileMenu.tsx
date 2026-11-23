"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { NavItem } from "@/data/site-config";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { isActivePath } from "./NavLink";

interface MobileMenuProps {
  items: readonly NavItem[];
  cta: NavItem;
  className?: string;
  triggerClassName?: string;
}

/**
 * Full-screen menu built on a native modal <dialog>: focus is trapped, the
 * page behind is inert, and Esc closes it.
 */
export function MobileMenu({ items, cta, className, triggerClassName }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const open = () => {
    dialogRef.current?.showModal();
    closeRef.current?.focus();
  };
  const close = () => dialogRef.current?.close();

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        aria-controls="site-menu"
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full border border-brand/15 px-4 text-sm font-medium text-brand transition-colors duration-300 ease-calm hover:bg-brand-mist/60",
          triggerClassName,
        )}
      >
        <Menu className="size-5" />
        Menu
      </button>

      <dialog
        id="site-menu"
        ref={dialogRef}
        // Safari never focuses a button on tap, so the browser has nothing to
        // restore; return focus to the trigger explicitly so VoiceOver users
        // keep their place.
        onClose={() => triggerRef.current?.focus()}
        aria-label="Site menu"
        data-lenis-prevent
        className="m-0 h-dvh max-h-none w-full max-w-none bg-canvas p-0 text-ink-1 opacity-0 transition-[opacity,display,overlay] transition-discrete duration-300 ease-calm backdrop:bg-transparent open:opacity-100 starting:open:opacity-0"
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-line/70">
            <Container className="flex h-[4.5rem] items-center justify-between">
              <Logo onClick={close} />
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-brand/15 px-4 text-sm font-medium text-brand"
              >
                <X className="size-5" />
                Close
              </button>
            </Container>
          </div>

          <Container className="flex flex-1 flex-col overflow-y-auto py-10">
            <nav aria-label="Main">
              <ul className="flex flex-col">
                {items.map((item) => {
                  const isActive = isActivePath(pathname, item.href);
                  return (
                    <li key={item.href} className="border-b border-line/60">
                      <Link
                        href={item.href}
                        onClick={close}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between py-5 font-display text-[1.625rem] text-brand",
                          isActive && "text-accent-ink",
                        )}
                      >
                        {item.label}
                        <ArrowRight className="size-5 text-ink-3" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-auto flex flex-col gap-4 pt-12">
              <ButtonLink href={cta.href} onClick={close} size="lg">
                {cta.label}
              </ButtonLink>
            </div>
          </Container>
        </div>
      </dialog>
    </div>
  );
}
