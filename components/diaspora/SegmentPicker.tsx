"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { SEGMENTS } from "@/data/diaspora";
import { springCalm } from "@/lib/motion";
import { DiasporaWhatsAppButton } from "./DiasporaWhatsAppButton";
import { setChoice, useChoice } from "./store";

/**
 * "Which sounds like you?": six situations as native radio chips (arrow keys
 * move and select, as radios do). The panel beside them answers with two
 * lines the visitor may recognise, how we help, and a WhatsApp action whose
 * message already carries the situation and their city.
 */
export function SegmentPicker() {
  const { segment } = useChoice();
  const active = SEGMENTS.find((item) => item.id === segment);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
      <fieldset>
        <legend className="font-display text-title text-brand">Which sounds like you?</legend>
        <p className="mt-2 text-sm text-ink-3">Choose what fits best. You can change it any time.</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {SEGMENTS.map((item) => (
            <label
              key={item.id}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong bg-surface-raised px-4.5 text-[0.9375rem] text-ink-1 transition-[background-color,border-color,color] duration-300 ease-calm select-none hover:border-brand/40 has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-on-brand has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent"
            >
              <input
                type="radio"
                name="diaspora-segment"
                value={item.id}
                checked={segment === item.id}
                onChange={() => setChoice({ segment: item.id })}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="min-h-[22rem] rounded-[2rem] bg-surface-raised p-7 ring-1 ring-line sm:p-9">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active?.id ?? "none"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={springCalm}
            className="flex h-full flex-col"
          >
            {active ? (
              <>
                <p className="text-xs font-semibold tracking-[0.16em] text-accent-ink uppercase">You might be thinking</p>
                <ul className="mt-5 grid gap-4">
                  {active.lines.map((line) => (
                    <li key={line} className="border-l-2 border-tertiary pl-4 font-display text-xl leading-snug text-pretty text-brand">
                      {line}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 leading-relaxed text-pretty text-ink-2">{active.help}</p>
                <Link
                  href={active.track.href}
                  className="group mt-3 inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-brand underline decoration-brand/25 underline-offset-4 hover:decoration-brand"
                >
                  About {active.track.name.toLowerCase()}
                  <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-1" />
                </Link>
              </>
            ) : (
              <>
                <p className="font-display text-xl leading-snug text-pretty text-brand">
                  Pick the situation closest to yours, and we will show you how we can help.
                </p>
                <p className="mt-4 leading-relaxed text-pretty text-ink-2">
                  Your choice only shapes the message below. Nothing is saved or sent until you send it yourself.
                </p>
              </>
            )}
            <div className="mt-auto pt-7">
              <DiasporaWhatsAppButton>{active ? "Send this message" : "Message us on WhatsApp"}</DiasporaWhatsAppButton>
              <p className="mt-3 text-sm text-ink-3">
                The message opens in WhatsApp, written for you. You can change it before sending, and delete the chat after.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
