"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const MESSAGES = [
  { from: "you", text: "Hello Ullidam, I would like a session with Dr. Ananya Menon." },
  { from: "coordinator", text: "Of course. Which two times suit you best?" },
  { from: "you", text: "Thursday 4:00 PM, or Friday 11:00 AM as a backup." },
  { from: "coordinator", text: "Thursday at 4:00 PM is confirmed. Your private video link will follow." },
] as const;

/** An illustrative booking conversation that types itself once it scrolls into view. */
export function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        MESSAGES.forEach((_, i) => {
          timers.push(setTimeout(() => setTyping(true), 500 + i * 1700));
          timers.push(
            setTimeout(() => {
              setTyping(false);
              setShown(i + 1);
            }, 1300 + i * 1700),
          );
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  const visible = reduced ? MESSAGES.length : shown;

  return (
    <div ref={ref} className="flex min-h-[19rem] flex-col justify-end gap-2.5" aria-label="Example booking conversation on WhatsApp" role="img">
      {MESSAGES.map((message, i) => (
        <p
          key={message.text}
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-snug",
            message.from === "you" ? "self-end rounded-br-md bg-brand text-on-brand" : "self-start rounded-bl-md bg-canvas text-ink-1",
            i < visible ? "motion-safe:animate-rise" : "hidden",
          )}
        >
          {message.text}
          {message.from === "you" ? <CheckCheck className="ml-1.5 inline size-3.5 text-accent-on-dark" /> : null}
        </p>
      ))}
      {typing && visible < MESSAGES.length ? (
        <span className={cn("flex gap-1 rounded-2xl bg-canvas px-4 py-3", MESSAGES[visible].from === "you" ? "self-end" : "self-start")}>
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} className="size-1.5 rounded-full bg-ink-3 motion-safe:animate-breathe-quick" style={{ animationDelay: `${d}s` }} />
          ))}
        </span>
      ) : null}
    </div>
  );
}
