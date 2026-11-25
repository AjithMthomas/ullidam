"use client";

import { createContext, use, useActionState, useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { touchAction, unlockAction, type FormState } from "@/app/portal/actions";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { PinInput } from "./PinInput";

const LOCK_AFTER_MS = 15 * 60_000; // the server refuses at 20
const PING_EVERY_MS = 4 * 60_000;
const CHECK_EVERY_MS = 20_000;

interface PortalUi {
  hideNames: boolean;
  toggleHideNames: () => void;
  lock: () => void;
}

const PortalContext = createContext<PortalUi | null>(null);

/** "Hide names" is a per-device convenience: kept in localStorage, or in memory if storage is blocked. */
const HIDE_KEY = "portal:hideNames";
const hideListeners = new Set<() => void>();
let hideInMemory = false;

function readHide(): boolean {
  try {
    return window.localStorage.getItem(HIDE_KEY) === "1";
  } catch {
    return hideInMemory;
  }
}

function writeHide(value: boolean) {
  hideInMemory = value;
  try {
    window.localStorage.setItem(HIDE_KEY, value ? "1" : "0");
  } catch {
    /* storage blocked: the in-memory value is used */
  }
  hideListeners.forEach((listener) => listener());
}

function subscribeHide(listener: () => void) {
  hideListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    hideListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function usePortalUi(): PortalUi {
  const value = use(PortalContext);
  if (!value) throw new Error("usePortalUi must be used inside PortalProvider");
  return value;
}

/**
 * The portal's client-side guard rails:
 * - Idle lock: after 15 minutes without input the content is removed from the
 *   page and a PIN is needed. (The server also refuses an idle session.)
 * - Keep-alive: while the clinician is active, a quiet ping every few
 *   minutes keeps the server session fresh.
 * - "Hide names": blurs client names and contact details for shared spaces.
 */
export function PortalProvider({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(false);
  const hideNames = useSyncExternalStore(subscribeHide, readHide, () => false);
  const lastActivity = useRef(0);
  const lastPing = useRef(0);

  useEffect(() => {
    lastActivity.current = Date.now();
    lastPing.current = Date.now();
  }, []);

  const toggleHideNames = useCallback(() => writeHide(!readHide()), []);

  const lock = useCallback(() => setLocked(true), []);

  useEffect(() => {
    const mark = () => {
      lastActivity.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, mark, { passive: true }));
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (locked) return;
      if (now - lastActivity.current > LOCK_AFTER_MS) {
        setLocked(true);
        return;
      }
      if (lastActivity.current > lastPing.current && now - lastPing.current > PING_EVERY_MS) {
        lastPing.current = now;
        void touchAction().then((result) => {
          if (!result.ok) window.location.replace("/portal?idle=1");
        });
      }
    }, CHECK_EVERY_MS);
    return () => {
      events.forEach((name) => window.removeEventListener(name, mark));
      window.clearInterval(timer);
    };
  }, [locked]);

  const unlocked = useCallback(() => {
    lastActivity.current = Date.now();
    lastPing.current = Date.now();
    setLocked(false);
  }, []);

  return (
    <PortalContext value={{ hideNames, toggleHideNames, lock }}>
      {locked ? <LockScreen onUnlock={unlocked} /> : children}
    </PortalContext>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(unlockAction, {});

  useEffect(() => {
    if (state.ok) onUnlock();
  }, [state.ok, onUnlock]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-canvas px-5">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand text-on-brand">
          <Lock className="size-6" />
        </span>
        <h1 className="mt-6 font-display text-title text-brand">Locked for privacy</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">The portal locked after 15 quiet minutes. Enter your PIN to continue where you were.</p>
        <form action={action} className="mt-8 text-left">
          <PinInput name="pin" label="Your PIN" autoFocus />
          {state.error ? (
            <p role="alert" className="mt-3 text-sm text-danger">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={pending}>
            {pending ? "Checking…" : "Unlock"}
          </Button>
        </form>
        <a href="/portal" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-3 underline underline-offset-4">
          <LogoMark className="size-4" />
          Not you? Sign in as someone else
        </a>
      </div>
    </div>
  );
}

/** Text that may identify a client: blurred while "Hide names" is on. */
export function Sensitive({ children, className }: { children: ReactNode; className?: string }) {
  const { hideNames } = usePortalUi();
  return (
    <span className={cn("transition-[filter] duration-300", hideNames && "blur-[6px] select-none", className)} aria-hidden={hideNames || undefined}>
      {children}
    </span>
  );
}
