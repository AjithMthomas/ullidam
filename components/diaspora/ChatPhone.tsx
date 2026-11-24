"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { BadgeCheck, Clock, Mic, ShieldCheck, Smile } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { placeForZone } from "@/data/diaspora";
import { THERAPISTS } from "@/data/therapists";
import { springCalm } from "@/lib/motion";
import { formatDay, formatTime, IST, instantAt, useTick } from "@/lib/time";
import { useEffectiveZone } from "./store";

const FALLBACK_ZONE = "Asia/Dubai";
/** Local hours to try for the example, evenings first; the first that lands in Kerala daytime (9 AM to 9 PM) wins. */
const CANDIDATE_HOURS = [20, 19, 21, 18, 17, 9, 8, 10, 7, 11, 12, 13, 14, 15, 16];
const FACES = THERAPISTS.slice(0, 4);

function exampleSlot(zone: string, now: Date): Date {
  for (const hour of CANDIDATE_HOURS) {
    const at = instantAt(zone, hour, now);
    const keralaHour = Number(new Intl.DateTimeFormat("en-US", { timeZone: IST, hour: "numeric", hourCycle: "h23" }).format(at));
    if (keralaHour >= 9 && keralaHour <= 21) return at;
  }
  return instantAt(zone, 20, now);
}

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.75, delayChildren: 0.45 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: springCalm },
};

/**
 * The /diaspora hero: a phone showing an example WhatsApp conversation with
 * the Ullidam care team, built from the visitor's own city (device time zone,
 * or a city picked further down the page). Trust markers sit inside the
 * screen: confidential, registered clinicians, their time zone, and the
 * clinicians' faces (sample profiles). Labelled as an example, never as a
 * real chat. The messages arrive one by one; with reduced motion they fade.
 */
export function ChatPhone() {
  const zone = useEffectiveZone() ?? FALLBACK_ZONE;
  const tick = useTick();
  const place = (placeForZone(zone) ?? "Dubai").split(" / ")[0];
  const at = tick === null ? null : exampleSlot(zone, new Date());

  return (
    <figure className="relative mx-auto w-full max-w-[20rem] lg:max-w-[21rem]">
      <ReplyBubble />

      <div
        role="img"
        aria-label={`Example WhatsApp conversation: someone in ${place} asks to talk in Malayalam, and the Ullidam care team replies with a time in their city and in Kerala.`}
        className="relative rounded-[3rem] bg-ink-1 p-2.5 shadow-float"
      >
        <span aria-hidden="true" className="absolute top-2.5 left-1/2 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-1" />
        <div className="flex h-[35rem] flex-col overflow-hidden rounded-[2.4rem] bg-canvas">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-line bg-surface-raised px-4 pt-8 pb-2.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
              <LogoMark className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-ink-1">
                Ullidam care team <BadgeCheck className="size-3.5 text-brand" />
              </span>
              <span className="block text-[0.6875rem] text-ink-3">Replies in Malayalam or English</span>
            </span>
            <WhatsAppLogo className="size-5 text-whatsapp" />
          </div>

          {/* Trust markers */}
          <ul className="flex justify-center gap-5 border-b border-line/70 py-2 text-[0.625rem] text-ink-3">
            {[
              { Icon: ShieldCheck, label: "Confidential" },
              { Icon: BadgeCheck, label: "Registered clinicians" },
              { Icon: Clock, label: "Your time zone" },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-0.5">
                <Icon className="size-4 text-brand" />
                {label}
              </li>
            ))}
          </ul>

          {/* The conversation */}
          <motion.ul
            variants={list}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-1 flex-col gap-2 overflow-hidden px-3 py-3.5 text-[0.8125rem] leading-snug"
          >
            <motion.li variants={item} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-highlight px-3 py-2 text-ink-1">
              Hi, I&rsquo;m in {place}. Can I talk to someone in Malayalam?
            </motion.li>
            <motion.li variants={item} className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-surface-raised px-3 py-2 text-ink-1 ring-1 ring-line">
              Of course. A registered clinician will talk with you, privately.
            </motion.li>
            <motion.li variants={item} className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-surface-raised px-3 py-2.5 ring-1 ring-line">
              <span className="block text-[0.6875rem] font-semibold tracking-wide text-accent-ink uppercase">Our clinicians</span>
              <span className="mt-1.5 flex -space-x-2.5">
                {FACES.map((therapist) => (
                  <span key={therapist.id} className="relative size-9 overflow-hidden rounded-full bg-tertiary ring-2 ring-surface-raised">
                    <Image src={therapist.image} alt="" fill sizes="36px" className="object-cover object-top" />
                  </span>
                ))}
              </span>
              <span className="mt-1.5 block text-[0.6875rem] text-ink-3">Malayalam and English. Sample profiles.</span>
            </motion.li>
            <motion.li variants={item} className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-surface-raised px-3 py-2 text-ink-1 ring-1 ring-line">
              {at ? (
                <>
                  How about {formatDay(zone, at)} {formatTime(zone, at)} in {place}? That is {formatTime(IST, at)} in Kerala.
                </>
              ) : (
                "Share two times that suit you, and we will confirm one."
              )}
            </motion.li>
            <motion.li variants={item} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-highlight px-3 py-2 text-ink-1">
              Thank you. That really helps.
            </motion.li>
          </motion.ul>

          {/* Input bar (decorative) */}
          <div aria-hidden="true" className="flex items-center gap-2.5 border-t border-line bg-surface-raised px-3.5 py-2.5 text-ink-3">
            <Smile className="size-5" />
            <span className="flex-1 rounded-full bg-canvas-muted px-4 py-1.5 text-[0.8125rem]">Type a message</span>
            <Mic className="size-5" />
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-ink-3">Example conversation</figcaption>
    </figure>
  );
}

/**
 * "A real person replies": a speech bubble resting on the phone's top-left
 * corner, with a small portrait that gently cross-fades between our
 * clinicians while the bubble floats. Still under reduced motion.
 */
function ReplyBubble() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((current) => (current + 1) % FACES.length), 2800);
    return () => clearInterval(id);
  }, [reduce]);

  const face = FACES[index];

  return (
    <motion.div
      aria-hidden="true"
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-20 -mb-6 ml-2 flex w-fit items-center gap-3 rounded-[1.75rem] rounded-bl-md bg-surface-raised py-2.5 pr-5 pl-2.5 shadow-card ring-1 ring-line lg:-ml-14"
    >
      <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-tertiary ring-2 ring-highlight">
        <AnimatePresence initial={false}>
          <motion.span
            key={face.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image src={face.image} alt="" fill sizes="44px" className="object-cover object-top" />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="max-w-[11.5rem] font-display text-base leading-snug text-brand">A real person replies, in Malayalam.</span>
    </motion.div>
  );
}
