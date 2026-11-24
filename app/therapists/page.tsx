import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { TherapistDirectoryCard } from "@/components/sections/TherapistDirectoryCard";
import { THERAPISTS } from "@/data/therapists";

export const metadata: Metadata = {
  title: "Our Therapists",
  description:
    "Meet Ullidam's resident faculty: senior psychologists, a couples specialist and a consultant psychiatrist, all working online in Malayalam and English.",
};

/** A short heading, then the clinicians straight away: the cards start on the first screen. */
export default function TherapistsPage() {
  return (
    <>
      <Section className="pt-28 pb-16 sm:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
        <Container className="max-w-5xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl motion-safe:animate-rise">
              <Eyebrow>Resident faculty</Eyebrow>
              <h1 className="mt-4 font-display text-headline text-balance text-brand">Four specialists, carefully chosen.</h1>
              <p className="mt-4 text-pretty text-ink-2 md:text-lg">
                A small team of senior clinicians. Each works online, in Malayalam and English, wherever you are.
              </p>
            </div>
            <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line-strong bg-surface-raised px-3.5 py-1.5 text-sm text-ink-2 lg:self-end">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-glow" />
              Sample profiles, shown while our team&rsquo;s details are finalised
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-md gap-6 md:max-w-none md:grid-cols-2 lg:mt-12 lg:gap-8">
            {THERAPISTS.map((therapist) => (
              <TherapistDirectoryCard key={therapist.id} therapist={therapist} />
            ))}
          </div>
        </Container>
      </Section>

      <ClosingCta
        tone="muted"
        title="Not sure who to choose?"
        lead="Tell our coordinator a little about what is happening. They will suggest the right person, in confidence."
        showTherapistsLink={false}
      />
    </>
  );
}
