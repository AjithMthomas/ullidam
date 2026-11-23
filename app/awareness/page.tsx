import type { Metadata } from "next";
import { BookOpen, Briefcase, Megaphone, Users } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { FeatureGrid, type Feature } from "@/components/sections/FeatureGrid";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";
import { STIGMA_PHRASE } from "@/data/site-config";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Mental Health Awareness & Community Outreach",
  description:
    "Workshops, corporate seminars, psychoeducation and community outreach that make mental health easier to talk about in Kerala and beyond.",
};

const PROGRAMMES: Feature[] = [
  {
    icon: Users,
    title: "Workshops",
    description: "Interactive sessions on stress, emotional health and relationships for colleges, communities and families.",
  },
  {
    icon: Briefcase,
    title: "Corporate seminars",
    description: "Practical sessions on burnout, workplace stress and psychological safety for teams and leaders.",
  },
  {
    icon: BookOpen,
    title: "Psychoeducation",
    description: "Clear, stigma-free resources that explain common conditions and when to seek help.",
  },
  {
    icon: Megaphone,
    title: "Community outreach",
    description: "Mental health literacy programmes that widen access to care for underserved communities.",
  },
];

export default function AwarenessPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.awareness}
        eyebrow="Awareness & community outreach"
        title="Making mental health easier to talk about."
        lead="Workshops, seminars and community programmes that replace silence with understanding. Delivered online, in Malayalam and English."
      />

      <Section tone="muted">
        <Container>
          <SectionIntro eyebrow="Programmes" title="Four ways we bring care to people." />
          <div className="mt-14 md:mt-16">
            <FeatureGrid items={PROGRAMMES} columns={4} />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-3xl">
            <p className="font-display text-[1.75rem] leading-relaxed text-brand md:text-4xl md:leading-relaxed">
              &ldquo;{STIGMA_PHRASE.english}&rdquo;
            </p>
            <p className="mt-8 max-w-2xl text-lead text-pretty text-ink-2">
              In Kerala, this question keeps many people from ever asking for help. Every programme we run is designed
              to make that question a little quieter.
            </p>
          </div>
        </Container>
      </Section>

      <ClosingCta
        title="Invite us to your organisation."
        lead="Tell us about your college, workplace or community group, and we will shape a programme around it."
        message={WHATSAPP_MESSAGES.awareness}
        showTherapistsLink={false}
      />
    </>
  );
}
