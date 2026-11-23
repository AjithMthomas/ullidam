import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";
import { TrackGrid } from "@/components/sections/TrackGrid";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Individual therapy for adults, psychiatric care, couples counselling and pre-divorce and divorce support. Four clear tracks of online care.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.services}
        eyebrow="Our services"
        title="Four tracks of care, one calm way in."
        lead="Every person arrives carrying something different. Our care is organised into four clear tracks, so you can find the right help without searching."
      />

      <Section tone="muted">
        <Container>
          <TrackGrid />
        </Container>
      </Section>

      <ClosingCta
        tone="canvas"
        title="Not sure where to begin?"
        lead="Tell our coordinator a little about what is happening. They will suggest the right track and therapist, in confidence."
      />
    </>
  );
}
