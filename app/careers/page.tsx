import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { FeatureGrid, type Feature } from "@/components/sections/FeatureGrid";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";
import { Pill } from "@/components/ui/Pill";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Careers & Clinical Fellowships",
  description:
    "Join Ullidam's clinical team: psychologists, psychiatrists and couple and family therapists committed to ethical, evidence-informed care.",
};

const ROLES: Feature[] = [
  {
    title: "Clinical psychologists",
    description: "RCI-registered psychologists experienced in evidence-informed individual therapy.",
  },
  {
    title: "Psychiatrists",
    description: "Registered medical practitioners with postgraduate qualifications in psychiatry.",
  },
  {
    title: "Couple and family therapists",
    description: "Clinicians trained in systemic, emotion-focused or Gottman approaches.",
  },
  {
    title: "Clinical fellowships",
    description: "Supervised fellowships for early-career clinicians ready to deepen their practice.",
  },
];

const VALUES = ["Ethical practice", "Evidence-informed care", "Cultural humility", "Malayalam fluency", "Steady supervision"];

export default function CareersPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.careers}
        eyebrow="Careers & clinical fellowships"
        title="Join a small team that takes care seriously."
        lead="We are building a senior, close-knit team of psychologists, psychotherapists and psychiatrists. If you share our standards of ethical, evidence-informed care, we would like to hear from you."
      />

      <Section tone="muted">
        <Container>
          <SectionIntro eyebrow="Roles we welcome" title="Where you might fit." />
          <div className="mt-14 md:mt-16">
            <FeatureGrid items={ROLES} />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
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
        title="Introduce yourself."
        lead="Send our coordinator a short note about your training and experience, and we will be in touch."
        message={WHATSAPP_MESSAGES.careers}
        showTherapistsLink={false}
      />
    </>
  );
}
