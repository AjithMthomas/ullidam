import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { PHOTOS } from "@/data/photos";

const STEPS = [
  { title: "Choose your clinician", body: "Browse four specialists, or let our coordinator suggest the right person." },
  { title: "Pick two times", body: "A preferred slot and a backup, arranged around your local time." },
  { title: "Confirm on WhatsApp", body: "Our coordinator confirms one, and a private video link follows." },
];

/** How it works: a quiet room on one side, three plain steps on the other. */
export function Journey() {
  const photo = PHOTOS.journey;
  return (
    <Section tone="muted">
      <Container className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-line bg-canvas lg:mx-0">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
            style={{ objectPosition: photo.position }}
          />
        </div>

        <div>
          <SectionIntro
            eyebrow="How it works"
            title="Three steps. No forms, no passwords."
            lead="Just a conversation, arranged around you."
          />
          <ol className="reveal-group mt-12 space-y-9 md:mt-14">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-6">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas font-display text-xl text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-title text-brand">{step.title}</h3>
                  <p className="mt-2 max-w-md leading-relaxed text-pretty text-ink-2">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <ButtonLink href="/therapists" size="lg">
              Find your therapist
              <ArrowRight />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
