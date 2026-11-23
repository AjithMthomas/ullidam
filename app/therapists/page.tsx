import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FacultyGrid } from "@/components/cinematic/FacultyGrid";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { THERAPISTS } from "@/data/therapists";

export const metadata: Metadata = {
  title: "Our Therapists",
  description:
    "Meet Ullidam's resident faculty: senior psychologists, a couples specialist and a consultant psychiatrist, all working online in Malayalam and English.",
};

export default function TherapistsPage() {
  return (
    <>
      <PageHero
        eyebrow="Resident faculty"
        title="Four specialists, carefully chosen."
        lead="Rather than a directory of hundreds, a small team of senior clinicians. Each works online, in Malayalam and English, wherever you are."
      />

      <Section tone="muted">
        <Container>
          <FacultyGrid therapists={THERAPISTS} columns={2} />
        </Container>
      </Section>

      <ClosingCta
        tone="canvas"
        title="Not sure who to choose?"
        lead="Tell our coordinator a little about what is happening. They will suggest the right person, in confidence."
        showTherapistsLink={false}
      />
    </>
  );
}
