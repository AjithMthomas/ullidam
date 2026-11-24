import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { OpeningsList } from "@/components/sections/OpeningsList";
import { Pill } from "@/components/ui/Pill";
import { OPENINGS } from "@/data/careers";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at Ullidam for psychologists, psychiatrists and couple and divorce counsellors: online, in Malayalam and English.",
};

const VALUES = ["Ethical practice", "Evidence-informed care", "Cultural humility", "Malayalam fluency", "Steady supervision"];

/** A short heading, then the open roles straight away. */
export default function CareersPage() {
  return (
    <>
      <Section className="pt-28 pb-16 sm:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
        <Container className="max-w-5xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl motion-safe:animate-rise">
              <Eyebrow>Careers</Eyebrow>
              <h1 className="mt-4 font-display text-headline text-balance text-brand">Join a small team that takes care seriously.</h1>
              <p className="mt-4 text-pretty text-ink-2 md:text-lg">
                We are growing our team of counsellors, psychologists and psychiatrists. All roles are online, in Malayalam and English.
              </p>
            </div>
            <Link
              href="/internships"
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start text-sm font-medium text-brand underline decoration-brand/25 underline-offset-4 transition-colors duration-300 hover:decoration-brand lg:self-end"
            >
              Psychology student? See internships
              <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10 lg:mt-12">
            <h2 className="text-sm font-semibold tracking-[0.14em] text-accent-ink uppercase">
              Open positions <span className="text-ink-3">({OPENINGS.length})</span>
            </h2>
            <div className="mt-5">
              <OpeningsList openings={OPENINGS} />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="muted">
        <Container className="max-w-5xl">
          <SectionIntro
            eyebrow="What we value"
            title="The standards we hold each other to."
            lead="Our clients arrive at vulnerable moments. Everything about how we work is shaped by that responsibility."
          />
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {VALUES.map((value) => (
              <li key={value}>
                <Pill tone="brand">{value}</Pill>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <ClosingCta
        tone="canvas"
        title="Don't see your role?"
        lead="Send our coordinator a short note about your training and experience, and we will be in touch."
        message={WHATSAPP_MESSAGES.careers}
        showTherapistsLink={false}
      />
    </>
  );
}
