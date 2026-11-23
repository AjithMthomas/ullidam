import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SoundscapeButton } from "@/components/audio/SoundscapeButton";
import { MonsoonScene } from "@/components/scene/MonsoonScene";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { getPracticeStats } from "@/data/therapists";
import { formatRating } from "@/lib/format";
import { HeroMotion } from "./HeroMotion";

/** A line of the title rising from behind a soft mask (pure CSS, so nothing waits on JavaScript). */
function Line({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
      <span className="block motion-safe:animate-line-up" style={{ animationDelay: `${delay}ms` }}>
        {children}
      </span>
    </span>
  );
}

function Rise({ children, delay, className }: { children: ReactNode; delay: number; className?: string }) {
  return (
    <div className={`motion-safe:animate-rise ${className ?? ""}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Act I, "Monsoon dusk": arrival in the rain. */
export function Hero() {
  const stats = getPracticeStats();

  return (
    <section aria-label="Welcome">
      <HeroMotion scene={<MonsoonScene variant="dusk" />}>
        <div
          data-hero-copy
          className="mx-auto flex h-full w-full max-w-6xl flex-col px-6 pt-24 pb-8 sm:px-10 md:pt-32 lg:px-14 lg:pt-36"
        >
          <Rise delay={100}>
            <StatusPulse
              status="open"
              label={`${stats.acceptingCount} therapists accepting new clients`}
              className="rounded-full border border-on-brand/15 bg-night/35 py-2 pr-4 pl-3 text-sm text-on-brand-muted backdrop-blur-md"
            />
          </Rise>

          <h1 className="mt-8 max-w-4xl font-display text-hero text-balance text-on-brand md:mt-10">
            <Line delay={250}>A calm space</Line>
            <Line delay={420}>for your mind.</Line>
          </h1>

          <Rise delay={700}>
            <p className="mt-6 max-w-lg text-lead text-pretty text-on-brand-muted">
              Confidential counselling, psychotherapy and psychiatric care, in Malayalam and English. No waiting
              rooms, no logins, and no one else needs to know.
            </p>
          </Rise>

          <Rise delay={900} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/therapists" variant="inverse" size="lg">
              Find your therapist
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/services" variant="outline-light" size="lg">
              Explore our care
            </ButtonLink>
          </Rise>

          <Rise delay={1150} className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-10">
            <SoundscapeButton />
            <dl className="hidden gap-10 text-on-brand md:flex">
              {[
                { label: "Client rating", value: formatRating(stats.averageRating) },
                { label: "Each session", value: "Private video" },
                { label: "Format", value: "Online 1-on-1" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col-reverse gap-1">
                  <dt className="text-xs tracking-[0.14em] text-on-brand-muted uppercase">{item.label}</dt>
                  <dd className="font-display text-2xl">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Rise>
        </div>
      </HeroMotion>
    </section>
  );
}
