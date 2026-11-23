import type { Metadata } from "next";
import { BookOpen, GraduationCap, MessagesSquare, Users } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { FeatureGrid, type Feature } from "@/components/sections/FeatureGrid";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";
import { Pill } from "@/components/ui/Pill";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Internships & Training for Psychology Students",
  description:
    "Supervised internships, case conferences and training programmes for psychology students and aspiring mental health professionals.",
};

const OFFERINGS: Feature[] = [
  {
    icon: Users,
    title: "Supervised clinical exposure",
    description: "Observe structured clinical work, always with client consent and strict confidentiality.",
  },
  {
    icon: MessagesSquare,
    title: "Case conferences",
    description: "Discuss anonymised cases with clinicians and see how a formulation comes together.",
  },
  {
    icon: BookOpen,
    title: "Training programmes",
    description: "Build skills in counselling foundations, assessment and evidence-informed approaches.",
  },
  {
    icon: GraduationCap,
    title: "Mentorship",
    description: "Guidance from practising psychologists on ethics, supervision and career paths.",
  },
];

const ELIGIBLE = [
  "Undergraduate psychology students",
  "Postgraduate psychology students",
  "Aspiring mental health professionals",
];

export default function InternshipsPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.internships}
        eyebrow="Internship & training"
        title="Learn the practice of care, under supervision."
        lead="Structured internships and training for psychology students and aspiring mental health professionals. Practical exposure, guided by experienced clinicians."
      />

      <Section tone="muted">
        <Container>
          <SectionIntro eyebrow="The programme" title="What you will gain." />
          <div className="mt-14 md:mt-16">
            <FeatureGrid items={OFFERINGS} columns={4} />
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro
            eyebrow="Who can apply"
            title="Open to students and early-career practitioners."
            lead="No prior clinical experience is expected. Curiosity, care and a commitment to ethics are."
          />
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {ELIGIBLE.map((group) => (
              <li key={group}>
                <Pill tone="brand">{group}</Pill>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <ClosingCta
        title="Ask about the next cohort."
        lead="Message our coordinator with your course and year of study, and we will share dates and requirements."
        message={WHATSAPP_MESSAGES.internships}
        showTherapistsLink={false}
      />
    </>
  );
}
