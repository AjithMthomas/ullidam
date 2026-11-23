import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { TriageWidget } from "@/components/triage/TriageWidget";

/** "Where would you like to begin?" The guide, beside a breathing light to pace by. */
export function TriageSection() {
  return (
    <Section tone="muted" id="begin">
      <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <SectionIntro
            title="Not sure where to begin?"
            lead="Three gentle questions. We will suggest a track and a clinician. It is a starting point, never a diagnosis."
          />
          <div aria-hidden="true" className="mt-14 hidden items-center gap-6 lg:flex">
            <span className="relative flex size-24 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-accent/15 motion-safe:animate-inhale" />
              <span className="absolute inset-4 rounded-full bg-accent/25 motion-safe:animate-inhale [animation-delay:-0.6s]" />
              <span className="size-5 rounded-full bg-accent" />
            </span>
            <p className="max-w-[14rem] text-sm leading-relaxed text-ink-3">
              Breathe in as the light grows. Breathe out as it softens.
            </p>
          </div>
        </div>
        <TriageWidget />
      </Container>
    </Section>
  );
}
