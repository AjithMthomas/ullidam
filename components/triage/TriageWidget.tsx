"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LifeBuoy, MessageCircle, RotateCcw } from "lucide-react";
import { TRACK_ICONS } from "@/components/sections/trackIcons";
import { ButtonExternalLink } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { getTrack, type TrackId } from "@/data/services";
import { crisisLinesFor } from "@/data/site-config";
import { therapistsForTrack } from "@/data/therapists";
import { cn } from "@/lib/cn";
import { useRegion } from "@/lib/vault";
import { whatsappHref } from "@/lib/whatsapp";

type Answers = { concern?: string; duration?: string; weight?: string };

const STEPS = [
  {
    key: "concern",
    question: "What is weighing on you most right now?",
    options: [
      { value: "self", label: "My own thoughts and feelings", hint: "Anxiety, low mood, stress or burnout" },
      { value: "relationship", label: "My relationship or marriage", hint: "Conflict, distance or trust" },
      { value: "separation", label: "Separation or divorce", hint: "Deciding, going through it, or after" },
      { value: "medical", label: "Sleep, mood or symptoms that feel medical", hint: "Perhaps wondering about medication" },
    ],
  },
  {
    key: "duration",
    question: "How long has it felt this way?",
    options: [
      { value: "weeks", label: "A few weeks" },
      { value: "months", label: "A few months" },
      { value: "year", label: "More than a year" },
    ],
  },
  {
    key: "weight",
    question: "How heavy does it feel, day to day?",
    options: [
      { value: "manageable", label: "Manageable, but always there" },
      { value: "heavy", label: "Heavy on most days" },
      { value: "hard", label: "Hard to get through the day" },
      { value: "unsafe", label: "I don’t feel safe right now", hint: "Thoughts of harming yourself, or being harmed" },
    ],
  },
] as const;

const TRACK_FOR: Record<string, TrackId> = {
  self: "individual",
  relationship: "couples",
  separation: "divorce",
  medical: "psychiatry",
};

const DURATION_NOTE: Record<string, string> = {
  weeks: "Reaching out early is one of the kindest things you can do for yourself.",
  months: "A few months is a long time to carry something quietly.",
  year: "Carrying something for more than a year is exhausting. You have waited long enough.",
};

function recommend(answers: Answers) {
  const primary = TRACK_FOR[answers.concern ?? "self"] ?? "individual";
  const heavyAndLasting = answers.weight === "hard" && answers.duration !== "weeks";
  let secondary: TrackId | null = null;
  if (primary === "individual" && heavyAndLasting) secondary = "psychiatry";
  if (primary === "psychiatry") secondary = "individual";
  return { primary, secondary };
}

/**
 * A 60-second, three-question guide to the right track (spec Phase 2). It
 * suggests; it never diagnoses. Answers live only in this component's state:
 * nothing is stored or sent.
 */
export function TriageWidget() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  const region = useRegion();

  // Move focus to each new question, but never on first load.
  useEffect(() => {
    if (interacted.current) headingRef.current?.focus();
  }, [step]);

  const choose = (key: string, value: string) => {
    interacted.current = true;
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setStep(key === "weight" && value === "unsafe" ? 99 : step + 1);
  };
  const back = () => {
    interacted.current = true;
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    interacted.current = true;
    setAnswers({});
    setStep(0);
  };

  const current = STEPS[step];
  const progress = Math.min(step, 3);

  return (
    <div className="rounded-[2rem] border border-line bg-canvas p-7 shadow-card sm:p-10 lg:p-12">
      <div className="flex items-center justify-between gap-4">
        <ol className="flex gap-1.5" aria-label={`Question ${Math.min(progress + 1, 3)} of 3`}>
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className={cn(
                "h-1.5 w-10 rounded-full transition-colors duration-500 ease-calm",
                i < progress || step === 99 ? "bg-brand" : i === progress && step < 3 ? "bg-accent" : "bg-line",
              )}
            />
          ))}
        </ol>
        <p className="text-sm text-ink-3">About a minute &middot; nothing is stored</p>
      </div>

      <div aria-live="polite">
        {current ? (
          <div key={current.key} className="mt-10 motion-safe:animate-rise">
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-title text-balance text-brand focus-visible:outline-none">
              {current.question}
            </h3>
            <ul className={cn("mt-8 grid gap-3", current.options.length === 4 && "sm:grid-cols-2")}>
              {current.options.map((option) => {
                const isUnsafe = option.value === "unsafe";
                const selected = answers[current.key] === option.value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => choose(current.key, option.value)}
                      className={cn(
                        "group flex h-full w-full flex-col items-start rounded-2xl border px-5 py-4 text-left transition-[border-color,background-color] duration-300 ease-calm",
                        isUnsafe
                          ? "border-danger/25 hover:border-danger/50 hover:bg-danger/5"
                          : "border-line hover:border-brand/35 hover:bg-brand-mist/50",
                        selected && "border-brand bg-brand-mist/60",
                      )}
                    >
                      <span className={cn("font-medium", isUnsafe ? "text-danger" : "text-ink-1")}>{option.label}</span>
                      {"hint" in option ? <span className="mt-1 text-sm text-ink-3">{option.hint}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            {step > 0 ? (
              <button type="button" onClick={back} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-brand">
                <ArrowLeft className="size-4" />
                Back
              </button>
            ) : null}
          </div>
        ) : step === 99 ? (
          <div className="mt-10 motion-safe:animate-rise">
            <LifeBuoy className="size-8 text-danger" />
            <h3 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-title text-balance text-brand focus-visible:outline-none">
              Please reach out for immediate support, right now.
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-2">
              You deserve help today, not after a booking. If you are in danger, call your local emergency number. These
              lines are free and answered by trained people.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {crisisLinesFor(region).map((line) => (
                <li key={line.region + line.number}>
                  <a
                    href={`tel:${line.tel}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line px-5 py-4 transition-colors hover:border-brand/40"
                  >
                    <span className="text-sm text-ink-2">
                      {line.region} &middot; {line.service}
                    </span>
                    <span className="font-display text-xl text-brand">{line.number}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-ink-3">
              When you are safe, our coordinator can help you find ongoing care.
            </p>
            <button type="button" onClick={restart} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-brand">
              <RotateCcw className="size-4" />
              Start again
            </button>
          </div>
        ) : (
          <Result answers={answers} onRestart={restart} headingRef={headingRef} />
        )}
      </div>
    </div>
  );
}

function Result({
  answers,
  onRestart,
  headingRef,
}: {
  answers: Answers;
  onRestart: () => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { primary, secondary } = recommend(answers);
  const track = getTrack(primary);
  const Icon = TRACK_ICONS[primary];
  const clinicians = therapistsForTrack(primary);

  return (
    <div className="mt-10 motion-safe:animate-rise">
      <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-mist text-brand">
        <Icon className="size-6" />
      </span>
      <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">A good place to begin</p>
      <h3 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-title text-balance text-brand focus-visible:outline-none">
        Track {track.letter}: {track.name}
      </h3>
      <p className="mt-4 max-w-xl leading-relaxed text-pretty text-ink-2">
        {DURATION_NOTE[answers.duration ?? "weeks"]}{" "}
        {secondary
          ? `Many people also find that ${getTrack(secondary).navLabel.toLowerCase()} alongside helps.`
          : "Your first session is simply a conversation."}
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {clinicians.map((t) => (
          <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas-muted px-5 py-3.5">
            <span>
              <span className="block font-medium text-ink-1">{t.name}</span>
              <span className="block text-sm text-ink-3">{t.title}</span>
            </span>
            <StatusPulse status={t.availabilityStatus} label={t.nextAvailableText} className="text-sm text-ink-2" />
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonExternalLink href={whatsappHref(`Hello Ullidam, I would like to begin with ${track.name}.`)}>
          <MessageCircle />
          Message our coordinator
        </ButtonExternalLink>
        <Link
          href={track.href}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-medium text-brand hover:bg-brand-mist/70"
        >
          Explore Track {track.letter}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-ink-3">A starting point, not a diagnosis.</p>
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-brand">
          <RotateCcw className="size-4" />
          Start again
        </button>
      </div>
    </div>
  );
}
