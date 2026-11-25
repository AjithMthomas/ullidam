"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { PHOTOS, type Photo } from "@/data/photos";
import { getTrack } from "@/data/services";
import { THERAPISTS } from "@/data/therapists";
import { cn } from "@/lib/cn";
import { PalmShade } from "./PalmShade";
import { springCalm } from "@/lib/motion";

interface Step {
  title: string;
  body: string;
  photo: Photo;
}

const STEPS: readonly Step[] = [
  {
    title: "Choose your therapist",
    body: "Browse our therapists, or let our coordinator suggest the right person for you.",
    photo: PHOTOS.stepChoose,
  },
  {
    title: "Share two times",
    body: "Tell our coordinator a preferred time and a backup, in your own time zone.",
    photo: PHOTOS.stepTimes,
  },
  {
    title: "Confirm on WhatsApp",
    body: "The coordinator confirms one, and a private video link follows.",
    photo: PHOTOS.stepConfirm,
  },
];

/** The reference's stats row, with true facts only: a quiet label over a short value. */
const FACTS = [
  { label: "Account", value: "None needed" },
  { label: "Sessions", value: "Video or audio" },
  { label: "Languages", value: "Malayalam, English" },
] as const;

/** A small piece of the real flow beside each photograph. Marked as an example. */
function Fragment({ step }: { step: number }) {
  if (step === 0) {
    const clinician = THERAPISTS[0];
    return (
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-highlight font-display text-sm text-brand">
          {clinician.name.replace(/^Dr\.?\s+/, "").slice(0, 1)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink-1">{clinician.name}</span>
          <span className="block truncate text-xs text-ink-3">{getTrack(clinician.trackFocus[0]).name}</span>
        </span>
      </div>
    );
  }
  if (step === 1) {
    return (
      <ul className="grid gap-1.5 text-xs">
        <li className="flex items-center justify-between gap-3 rounded-lg bg-highlight/70 px-2.5 py-1.5">
          <span className="text-ink-2">Preferred</span>
          <span className="font-medium text-ink-1">Tue, 7:00 PM</span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-2.5 py-1.5">
          <span className="text-ink-2">Backup</span>
          <span className="font-medium text-ink-1">Thu, 8:30 PM</span>
        </li>
      </ul>
    );
  }
  return (
    <div>
      <p className="text-[0.6875rem] font-medium text-secondary">Ullidam coordinator</p>
      <p className="mt-1 rounded-xl rounded-tl-sm bg-canvas px-3 py-2 text-xs leading-snug text-ink-1">
        Tuesday at 7:00 PM is confirmed. Your private video link will follow here.
      </p>
    </div>
  );
}

function Heading() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold tracking-[0.24em] text-accent-ink uppercase">
        How it works
      </p>
      <h2 className="mt-3.5 font-serif text-3xl font-medium tracking-tight text-balance text-brand md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        Three steps to your first session
      </h2>
      <p className="mt-3 text-sm text-pretty text-ink-2 md:text-base">
        Simple, private, and scheduled entirely around your day.
      </p>
    </div>
  );
}

/**
 * "Three steps to your first session": a short scroll story after the film,
 * composed like the homepage reference. Desktop: a compact, centred stage stays
 * in view while the reader scrolls; the step list (bottom left) marks the
 * current step, the photograph (centre) changes with it, and the facts row sits
 * top right. Phones and reduced motion: the same steps as a plain list.
 */
export function StepsStory() {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setCurrent(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const step = STEPS[current];

  return (
    <section aria-label="How it works: three steps to your first session" className="bg-canvas">
      {/* Desktop with motion: the compact stage stays in view through the three steps. */}
      <div ref={track} className="relative hidden h-[280svh] lg:motion-safe:block">
        <div className="sticky top-0 isolate flex h-svh flex-col justify-center pt-20">
          <PalmShade />
          <div className="mx-auto w-full max-w-5xl px-8">
            <Heading />

            <div className="mt-12 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-12 xl:mt-14">
              {/* Bottom left: the steps, with the current one marked. */}
              <ol className="self-end border-t border-line">
                {STEPS.map((item, index) => {
                  const active = index === current;
                  return (
                    <li
                      key={item.title}
                      aria-current={active ? "step" : undefined}
                      className="border-b border-line py-3.5"
                    >
                      <p className="flex items-baseline gap-3">
                        <span
                          className={cn(
                            "text-xs tabular-nums transition-colors duration-500",
                            active ? "text-secondary" : "text-ink-3",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "text-[0.9375rem] transition-colors duration-500",
                            active ? "font-medium text-brand" : "text-ink-3",
                          )}
                        >
                          {item.title}
                        </span>
                      </p>
                      {/* Every description stays in the DOM; only the current one opens. */}
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows,opacity] duration-500 ease-calm",
                          active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <p className="overflow-hidden pl-7 text-sm leading-relaxed text-pretty text-ink-2">
                          <span className="block pt-1.5">{item.body}</span>
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Centre: the photograph, an icon tile at its top left, the example at its bottom right. */}
              <div className="relative w-[17.5rem] xl:w-[19rem]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-line bg-canvas-muted">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={current}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ ...springCalm, opacity: { duration: 0.6 } }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={step.photo.src}
                        alt={step.photo.alt}
                        fill
                        sizes="320px"
                        loading="lazy"
                        className="object-cover"
                        style={{ objectPosition: step.photo.position }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`fragment-${current}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={springCalm}
                    className="absolute -right-24 bottom-6 w-52 rounded-2xl border border-line bg-surface-raised p-3.5 shadow-float"
                  >
                    <p className="mb-2 text-[0.6875rem] font-medium text-ink-3">Example</p>
                    <Fragment step={current} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Top right: the facts row, then the action. */}
              <div className="self-start pt-2">
                <dl className="grid grid-cols-3 gap-4 border-t border-line pt-4">
                  {FACTS.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-xs text-ink-3">{fact.label}</dt>
                      <dd className="mt-1 text-sm leading-snug font-medium text-ink-1">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <ButtonLink href="/therapists" className="mt-7 h-11 px-5 text-sm">
                  Find your therapist
                  <ArrowRight />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phones, tablets and reduced motion: the same story as a list. */}
      <div className="relative isolate overflow-hidden py-16 sm:py-20 md:py-24 lg:motion-safe:hidden">
        <PalmShade variant="list" />
        <Container>
          <Heading />
          <ol className="mx-auto mt-12 grid max-w-xl gap-10 md:mt-14">
            {STEPS.map((item, index) => (
              <li key={item.title} className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-7">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-line bg-canvas-muted sm:aspect-[4/5]">
                  <Image
                    src={item.photo.src}
                    alt={item.photo.alt}
                    fill
                    sizes="(min-width: 640px) 176px, 90vw"
                    className="object-cover"
                    style={{ objectPosition: item.photo.position }}
                  />
                </div>
                <div>
                  <span className="text-xs tabular-nums text-secondary">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-1 font-display text-title text-brand">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-2">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <dl className="mx-auto mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-line pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs text-ink-3">{fact.label}</dt>
                <dd className="mt-1 text-sm leading-snug font-medium text-ink-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/therapists">
              Find your therapist
              <ArrowRight />
            </ButtonLink>
          </div>
        </Container>
      </div>
    </section>
  );
}
