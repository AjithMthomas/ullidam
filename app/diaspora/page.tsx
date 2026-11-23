import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { PageHero } from "@/components/sections/PageHero";
import { PHOTOS } from "@/data/photos";
import { Pill } from "@/components/ui/Pill";
import { DIASPORA_TIME_ZONES } from "@/data/site-config";
import { WHATSAPP_MESSAGES } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "NRI & Gulf Malayali Support",
  description:
    "Online counselling in Malayalam for NRIs in the Gulf, UK, US, Europe and Australia, scheduled in your local time.",
};

const CONCERNS = [
  "Long-distance marriages",
  "Loneliness and homesickness",
  "Work pressure abroad",
  "Parenting across two cultures",
  "Family expectations back home",
  "Returning to Kerala",
];

export default function DiasporaPage() {
  return (
    <>
      <PageHero
        photo={PHOTOS.diaspora}
        eyebrow="NRI & Gulf care"
        title="Care that keeps your time zone."
        lead="For Malayalis in the Gulf, the UK, North America, Europe and Australia. Sessions in Malayalam, at an hour that suits your day, with clinicians who understand both worlds."
      />

      <Section tone="muted">
        <Container>
          <SectionIntro
            eyebrow="Wherever you are"
            title="Your local time, with IST alongside."
            lead="Tell us where you are and we will schedule around your working day, not ours."
          />
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 md:mt-16 md:gap-12 lg:grid-cols-4 lg:gap-16">
            {DIASPORA_TIME_ZONES.map((zone) => (
              <li key={zone.label} className="border-t border-line-strong pt-8">
                <p className="font-display text-headline text-brand">{zone.label}</p>
                <p className="mt-2 text-ink-2">{zone.region}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionIntro
              eyebrow="Life between two places"
              title="What we often help with."
              lead="Distance changes marriages, families and the way stress is carried. You do not have to explain the context; we already know it."
            />
            <ul className="mt-10 flex flex-wrap gap-2.5">
              {CONCERNS.map((concern) => (
                <li key={concern}>
                  <Pill tone="brand">{concern}</Pill>
                </li>
              ))}
            </ul>
          </div>

          <div className="self-start rounded-3xl bg-canvas-muted p-8 md:p-10 lg:p-12">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">Global scheduling</p>
            <p className="mt-6 font-display text-display text-brand">Your hours</p>
            <p className="mt-2 text-lead text-ink-2">
              Confidential online video consultation
            </p>
            <p className="mt-6 leading-relaxed text-pretty text-ink-3">
              Scheduled directly in your local time across Gulf, European, UK, US, or Australian working hours.
            </p>
          </div>
        </Container>
      </Section>

      <ClosingCta message={WHATSAPP_MESSAGES.diaspora} />
    </>
  );
}
