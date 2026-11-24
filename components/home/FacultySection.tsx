import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { THERAPISTS } from "@/data/therapists";
import { whatsappHref } from "@/lib/whatsapp";
import { FacultyBrowser } from "./FacultyBrowser";

/** The people who will listen: clinician ID badges hanging on a lanyard cord. */
export function FacultySection() {
  return (
    <Section id="faculty" tone="muted" className="overflow-x-clip">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          title="The clinicians who will listen"
          lead="Every clinician works online, in Malayalam and English. Turn a card over to see how they work."
        />
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-12 shrink-0 items-center gap-2.5 self-start rounded-full border border-line-strong bg-surface-raised pr-5 pl-2 text-sm font-medium text-brand transition-[border-color,transform] duration-300 ease-calm hover:border-brand/40 motion-safe:hover:-translate-y-0.5 lg:self-end"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-highlight">
            <MessageCircle className="size-4" />
          </span>
          Not sure who to choose? We&rsquo;ll match you
        </a>
      </Container>
      <Container>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-raised px-3.5 py-1.5 text-sm text-ink-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-glow" />
          Sample profiles, shown while our team&rsquo;s details are finalised
        </p>
      </Container>
      <FacultyBrowser therapists={THERAPISTS} />
      <Container className="mt-8 flex justify-center md:mt-10">
        {/* A pill with the clinicians' faces: the link says who you will meet before you click. */}
        <Link
          href="/therapists"
          className="group inline-flex h-14 items-center gap-3.5 rounded-full bg-surface-raised py-2 pr-2 pl-2.5 text-[0.9375rem] font-medium text-brand shadow-card ring-1 ring-line transition-[box-shadow,transform] duration-500 ease-calm hover:shadow-float motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-4 sm:text-base"
        >
          <span aria-hidden="true" className="flex -space-x-2.5">
            {THERAPISTS.slice(0, 4).map((therapist) => (
              <span
                key={therapist.slug}
                className="relative size-9 overflow-hidden rounded-full bg-canvas-muted ring-2 ring-surface-raised transition-transform duration-500 ease-calm motion-safe:group-hover:translate-x-0.5"
              >
                <Image src={therapist.image} alt="" fill sizes="36px" className="object-cover object-top" />
              </span>
            ))}
          </span>
          Compare our clinicians
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-brand text-on-brand transition-colors duration-500 ease-calm group-hover:bg-brand-soft"
          >
            <ArrowRight className="size-4 transition-transform duration-500 ease-calm motion-safe:group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Container>
    </Section>
  );
}
