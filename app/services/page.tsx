import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { ButtonExternalLink, ButtonLink } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { BEYOND_THERAPY, CARE_KINDS, GOOD_TO_KNOW } from "@/data/care";
import { SERVICE_TRACKS, type ServiceTrack } from "@/data/services";
import { cn } from "@/lib/cn";
import { whatsappHref } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Counselling, psychotherapy and psychiatric care for adults and couples: individual therapy, psychiatric services, couple counselling and pre-divorce and divorce support. Online, in Malayalam and English.",
};

const anchor = (track: ServiceTrack) => `track-${track.letter.toLowerCase()}`;

/**
 * Services (docs/specs/services-redesign.md): what each kind of care is, the
 * four tracks as chapters (who each is for, what it covers), the charter's
 * work beyond the therapy room, and how to begin.
 */
export default function ServicesPage() {
  return (
    <>
      {/* 1. A short promise, then a way straight to each track. */}
      <Section className="pt-28 pb-14 sm:pt-32 md:pb-16 lg:pt-36 lg:pb-20">
        <Container>
          <div className="max-w-3xl motion-safe:animate-rise">
            <h1 className="font-display text-display text-balance text-brand">Care for whatever you are carrying.</h1>
            <p className="mt-6 max-w-2xl text-lead text-pretty text-ink-2">
              Counselling, psychotherapy and psychiatric care for adults and couples. Online, private, in Malayalam and English,
              by video or audio call.
            </p>
          </div>
          <nav aria-label="Jump to a track" className="mt-10">
            <ul className="flex flex-wrap gap-2.5">
              {SERVICE_TRACKS.map((track) => (
                <li key={track.id}>
                  <a
                    href={`#${anchor(track)}`}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line-strong bg-surface-raised py-1.5 pr-4.5 pl-1.5 text-[0.9375rem] text-ink-1 transition-[border-color,background-color] duration-300 ease-calm hover:border-brand/40 hover:bg-canvas-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="grid size-8 place-items-center rounded-full bg-highlight text-sm font-semibold text-brand">{track.letter}</span>
                    {track.navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-6 text-sm text-ink-3">
            Not sure where you fit?{" "}
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand"
            >
              Our coordinator will guide you
            </a>
            .
          </p>
        </Container>
      </Section>

      {/* 2. The difference between the three kinds of care, in plain words. */}
      <Section tone="muted">
        <Container>
          <h2 className="max-w-3xl font-display text-headline text-balance text-brand">Three kinds of care, explained.</h2>
          <p className="mt-5 max-w-2xl text-lead text-pretty text-ink-2">Many people are unsure which one they need. Here is the difference.</p>
          <ol className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
            {CARE_KINDS.map((kind, index) => (
              <li key={kind.title} className="border-t border-line-strong pt-6">
                <span className="font-display text-sm text-ink-3 tabular-nums">0{index + 1}</span>
                <h3 className="mt-2 font-display text-title text-brand">{kind.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty text-ink-2">{kind.body}</p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-pretty text-ink-2">
                  <span className="font-medium text-ink-1">Often helps when </span>
                  {kind.helps}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-2xl leading-relaxed text-pretty text-ink-2">
            You do not have to choose correctly. Tell us what is happening, and we will help you start in the right place.
          </p>
        </Container>
      </Section>

      {/* 3. The four tracks, one chapter each. */}
      {SERVICE_TRACKS.map((track, index) => (
        <TrackChapter key={track.id} track={track} flip={index % 2 === 1} tone={index % 2 === 1 ? "muted" : "canvas"} />
      ))}

      {/* 4. The rest of the charter. */}
      <Section>
        <Container>
          <h2 className="max-w-3xl font-display text-headline text-balance text-brand">Beyond the therapy room.</h2>
          <p className="mt-5 max-w-2xl text-lead text-pretty text-ink-2">
            Ullidam also works to make mental health easier to talk about, and to train the people who will care for others.
          </p>
          <ul className="mt-12 border-t border-line">
            {BEYOND_THERAPY.map((item) => (
              <li key={item.title} className="border-b border-line">
                <Link
                  href={item.href}
                  className="group grid gap-2 py-7 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_auto] md:items-center md:gap-10 md:py-8"
                >
                  <span className="font-display text-title text-brand">{item.title}</span>
                  <span className="leading-relaxed text-pretty text-ink-2">{item.body}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-brand">
                    {item.cta}
                    <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 5. Four facts worth knowing before you start. */}
      <Section tone="muted" className="py-14 sm:py-16 md:py-20 lg:py-20 xl:py-24">
        <Container>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
            {GOOD_TO_KNOW.map((fact) => (
              <div key={fact.label} className="border-t border-line-strong pt-5">
                <dt className="text-sm text-ink-3">{fact.label}</dt>
                <dd className="mt-1.5 font-display text-lg leading-snug text-pretty text-brand">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <ClosingCta
        tone="canvas"
        title="Not sure where to begin?"
        lead="Tell our coordinator a little about what is happening. They will suggest the right track and clinician, in confidence."
      />
    </>
  );
}

function TrackChapter({ track, flip, tone }: { track: ServiceTrack; flip: boolean; tone: "canvas" | "muted" }) {
  return (
    <Section id={anchor(track)} tone={tone} className="scroll-mt-20">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className={cn("relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-canvas-muted lg:aspect-[5/4]", flip && "lg:order-2")}>
          <Image
            src={track.photo.src}
            alt={track.photo.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            style={{ objectPosition: track.photo.position }}
          />
        </div>

        <div>
          <p className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-brand font-display text-lg text-on-brand">{track.letter}</span>
            <span className="text-sm font-medium text-accent-ink">{track.audience}</span>
          </p>
          <h2 className="mt-5 font-display text-headline text-balance text-brand">{track.name}</h2>
          <p className="mt-4 max-w-xl leading-relaxed text-pretty text-ink-2">{track.summary}</p>

          <h3 className="mt-8 text-sm font-medium text-ink-2">What you might be facing</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {track.focusAreas.slice(0, 5).map((area) => (
              <li key={area}>
                <Pill tone="muted">{area}</Pill>
              </li>
            ))}
          </ul>

          {track.phases ? (
            <>
              <h3 className="mt-8 text-sm font-medium text-ink-2">Support at every stage</h3>
              <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                {track.phases.map((phase) => (
                  <li key={phase.step} className="rounded-2xl bg-surface-raised px-4 py-3.5 ring-1 ring-line">
                    <span className="block text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">{phase.step}</span>
                    <span className="mt-1 block text-sm leading-snug text-ink-1">{phase.title}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h3 className="mt-8 text-sm font-medium text-ink-2">What we offer</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {track.offerings.map((offering) => (
                  <li key={offering.title} className="flex gap-3 text-[0.9375rem] leading-snug text-ink-1">
                    <span aria-hidden="true" className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-tertiary" />
                    {offering.title}
                  </li>
                ))}
              </ul>
            </>
          )}

          {track.id === "psychiatry" ? (
            <p className="mt-6 text-sm leading-relaxed text-ink-3">Medication, if needed, is prescribed and reviewed by a psychiatrist.</p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={track.href} size="lg">
              Explore Track {track.letter}
              <ArrowRight />
            </ButtonLink>
            <ButtonExternalLink href={whatsappHref()} variant="secondary" size="lg">
              <WhatsAppLogo />
              Ask on WhatsApp
            </ButtonExternalLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
