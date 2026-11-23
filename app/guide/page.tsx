import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { FeatureGrid, type Feature } from "@/components/sections/FeatureGrid";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";

export const metadata: Metadata = {
  title: "Your First Therapy Session, Explained",
  description:
    "What happens when you book with Ullidam: choosing a therapist, picking a time and joining a private online session.",
};

const STEPS = [
  {
    title: "Choose a therapist",
    description:
      "Browse our four specialists, or tell our coordinator what is happening and let them suggest the right fit.",
  },
  {
    title: "Pick two time slots",
    description: "Share a preferred time and a backup. Our coordinator confirms one of them with you on WhatsApp.",
  },
  {
    title: "Join from anywhere",
    description: "Your session happens over private video. You set the pace, and you never share more than you are ready to.",
  },
];

const REASSURANCES: Feature[] = [
  {
    title: "Is it confidential?",
    description:
      "Yes. What you share stays with your clinician. The only exception is a serious risk to your safety or someone else’s, which your therapist explains at the start.",
  },
  {
    title: "Do I need an account?",
    description: "No. There are no logins and no passwords. You book through a simple WhatsApp message.",
  },
  {
    title: "What if I don’t know what to say?",
    description: "That is very common. Your therapist will guide the conversation; one sentence is enough to begin.",
  },
];

export default function GuidePage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.guide}
        eyebrow="First-timer’s guide"
        title="Your first session, gently explained."
        lead="Starting therapy can feel uncertain. Here is exactly what happens, so nothing comes as a surprise."
      />

      <Section tone="muted">
        <Container>
          <SectionIntro eyebrow="Three steps" title="From first message to first session." />
          <ol className="mt-14 grid gap-x-8 gap-y-12 md:mt-16 md:grid-cols-3 md:gap-x-12 lg:gap-x-16">
            {STEPS.map((step, index) => (
              <li key={step.title} className="border-t border-line-strong pt-8">
                <span className="font-display text-[2.25rem] leading-none text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-display text-title text-brand">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty text-ink-2">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro eyebrow="Good to know" title="The questions most people carry." />
          <div className="mt-14 md:mt-16">
            <FeatureGrid items={REASSURANCES} columns={3} />
          </div>
        </Container>
      </Section>

      <ClosingCta />
    </>
  );
}
