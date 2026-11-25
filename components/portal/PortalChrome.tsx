"use client";

import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import { Eye, EyeOff, Lock, LogOut } from "lucide-react";
import { signOutAction, signOutEverywhereAction } from "@/app/portal/actions";
import { LogoMark } from "@/components/layout/Logo";
import { cn } from "@/lib/cn";
import { usePortalUi } from "./PortalProvider";

/** The top bar: brand on phones, "Hide names" and "Lock now" everywhere. */
export function TopBar() {
  const { hideNames, toggleHideNames, lock } = usePortalUi();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-line bg-canvas/90 px-5 py-3 backdrop-blur-md sm:px-8 lg:justify-end lg:px-12">
      <Link href="/portal/today" className="mr-auto flex min-h-11 items-center gap-2 text-brand lg:hidden">
        <LogoMark className="size-6" />
        <span className="font-display text-lg">Ullidam</span>
        <span className="text-xs text-ink-3">Portal</span>
      </Link>
      <IconButton onClick={toggleHideNames} pressed={hideNames} label={hideNames ? "Show names" : "Hide names"}>
        {hideNames ? <EyeOff className="size-[1.125rem]" /> : <Eye className="size-[1.125rem]" />}
      </IconButton>
      <IconButton onClick={lock} label="Lock now">
        <Lock className="size-[1.125rem]" />
      </IconButton>
    </div>
  );
}

function IconButton({ children, label, onClick, pressed }: { children: ReactNode; label: string; onClick: () => void; pressed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-3.5 text-sm text-ink-2 transition-colors hover:bg-canvas-muted hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-accent",
        pressed && "bg-highlight text-brand",
      )}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Sign-out ends the session on the server, then reloads fully so nothing stays in the browser's memory. */
export function SignOutButton({ everywhere = false, className }: { everywhere?: boolean; className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await (everywhere ? signOutEverywhereAction() : signOutAction());
          window.location.replace(everywhere ? "/portal?signedOut=1" : "/portal");
        })
      }
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 text-[0.9375rem] text-ink-2 transition-colors hover:bg-canvas-muted hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60",
        className,
      )}
    >
      <LogOut className="size-[1.125rem]" />
      {pending ? "Signing out…" : everywhere ? "Sign out on every device" : "Sign out"}
    </button>
  );
}
