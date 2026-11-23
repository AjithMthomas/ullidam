import Image from "next/image";
import { BadgeCheck, EyeOff, FlaskConical, Globe } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { PHOTOS } from "@/data/photos";
import { siteConfig } from "@/data/site-config";
import { LiveClocks } from "./LiveClocks";

/** The charter's psychotherapy approaches (CLAUDE.md, objective 2). Only confirmed ones. */
const MODALITIES = ["Cognitive Behavioural Therapy", "Acceptance and Commitment Therapy", "Emotion-Focused Therapy", "Gottman Method"];

/**
 * Why people trust Ullidam, without reviews: a dark band for privacy, then three
 * plain facts. Every line here must stay true; the clinician wording waits on
 * the practice's real registrations before launch.
 */
export function TrustBento() {
  return (
    <Section>
      <Container>
        <SectionIntro
          title="Why people trust Ullidam"
          lead="Privacy, proper care and distance: the three worries people bring most often, answered plainly."
        />

        <article className="mt-14 grid overflow-hidden rounded-[2rem] bg-brand text-on-brand md:mt-16 md:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
            <EyeOff className="size-6 text-accent-on-dark" />
            <h3 className="mt-6 font-display text-headline text-balance uppercase">
              No waiting rooms. No logins. No one else needs to know.
            </h3>
            <p className="mt-5 max-w-md text-lead text-pretty text-on-brand-muted">{siteConfig.confidentialityPromise}</p>
          </div>
          <div className="relative min-h-72 md:min-h-[26rem]">
            <Image
              src={PHOTOS.trust.src}
              alt={PHOTOS.trust.alt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              style={{ objectPosition: PHOTOS.trust.position }}
            />
          </div>
        </article>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-line bg-surface-raised p-8 md:p-10">
            <BadgeCheck className="size-6 text-secondary" />
            <h3 className="mt-6 font-display text-title text-brand">Trained, registered clinicians</h3>
            <p className="mt-3 leading-relaxed text-pretty text-ink-2">
              Psychologists and a psychiatrist, each with their qualifications shown on their profile.
            </p>
          </article>

          <article className="rounded-[2rem] border border-line bg-surface-raised p-8 md:p-10">
            <FlaskConical className="size-6 text-secondary" />
            <h3 className="mt-6 font-display text-title text-brand">Approaches with evidence behind them</h3>
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Therapies we use">
              {MODALITIES.map((m) => (
                <li key={m} className="rounded-full bg-tertiary-soft px-3.5 py-1.5 text-sm text-ink-1">
                  {m}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[2rem] border border-line bg-surface-raised p-8 md:p-10">
            <Globe className="size-6 text-secondary" />
            <h3 className="mt-6 font-display text-title text-brand">Your time zone, not ours</h3>
            <div className="mt-5">
              <LiveClocks />
            </div>
          </article>
        </div>
      </Container>
    </Section>
  );
}
