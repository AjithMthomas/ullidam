import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { ChatPhone } from "@/components/diaspora/ChatPhone";
import { DiasporaClock } from "@/components/diaspora/DiasporaClock";
import { DiasporaWhatsAppButton } from "@/components/diaspora/DiasporaWhatsAppButton";
import { SegmentPicker } from "@/components/diaspora/SegmentPicker";
import { ShareFromHome } from "@/components/diaspora/ShareFromHome";
import { TimeHelper } from "@/components/diaspora/TimeHelper";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { ButtonExternalLink, buttonStyles } from "@/components/ui/Button";
import {
  ASSOCIATION_MESSAGE,
  FAMILY_GUIDANCE_MESSAGE,
  MOTHER_TONGUE,
  NRI_FAQS,
  NRI_STEPS,
  PRIVACY,
  PROBLEMS,
} from "@/data/diaspora";
import { CRISIS_LINES, siteConfig } from "@/data/site-config";
import { THERAPISTS } from "@/data/therapists";
import { whatsappHref } from "@/lib/whatsapp";

const SHARE_TITLE = "A space to talk, in Malayalam";
const SHARE_DESCRIPTION = "For Malayalis living abroad. Private, online, at a time that suits you.";

export const metadata: Metadata = {
  title: "Malayalam Counselling Online for NRIs: Gulf, UK, US, Canada, Australia",
  description:
    "Private online counselling in Malayalam for Malayalis abroad: UAE, Saudi Arabia, Qatar, Kuwait, Oman, UK, Ireland, US, Canada and Australia. Message us on WhatsApp.",
  alternates: { canonical: "/diaspora" },
  // The link preview lands in someone's chat (often forwarded by family), so it stays discreet.
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    url: "/diaspora",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: NRI_FAQS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

/**
 * "Far from home" (docs/specs/diaspora-redesign.md): recognise the life,
 * make the mother-tongue promise, remove the practical doubts (time zones,
 * shared rooms, privacy), and make the first WhatsApp message effortless.
 */
export default function DiasporaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      {/* 1. Hero: one promise, one action, the visitor's clock. */}
      <Section className="pt-28 pb-16 sm:pt-32 md:pb-20 lg:pt-36 lg:pb-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div className="motion-safe:animate-rise">
            <h1 className="font-display text-display text-balance text-brand">
              Far from home. Never far from someone who understands.
            </h1>
            <p className="mt-6 max-w-xl text-lead text-pretty text-ink-2">
              Online counselling in Malayalam for Malayalis living abroad. Tell us when you are free, and we will find a time.
            </p>
            {/* One line on every phone: compact buttons and a shorter label below sm. */}
            <div className="mt-8 flex items-center gap-2 sm:gap-3">
              <DiasporaWhatsAppButton className="h-12 px-5 text-[0.9375rem] sm:h-14 sm:px-8 sm:text-base">
                <span className="sm:hidden">WhatsApp us</span>
                <span className="hidden sm:inline">Message us on WhatsApp</span>
              </DiasporaWhatsAppButton>
              <a
                href="#how"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className: "h-12 px-5 text-[0.9375rem] sm:h-14 sm:px-8 sm:text-base",
                })}
              >
                How it works
              </a>
            </div>
            <div className="mt-6">
              <DiasporaClock />
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-3">
              Ullidam is not an emergency service. If you are in danger now,{" "}
              <a href="#crisis" className="font-medium text-brand underline underline-offset-4">
                see crisis lines
              </a>{" "}
              or call your local emergency number.
            </p>
          </div>
          <ChatPhone />
        </Container>
      </Section>

      {/* 2. Recognition: the weight of life abroad, then "which sounds like you?". */}
      <Section tone="muted">
        <Container>
          <h2 className="max-w-3xl font-display text-headline text-balance text-brand">Life abroad carries things no one sees.</h2>
          <p className="mt-8 max-w-3xl font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-snug text-pretty text-ink-2">
            {PROBLEMS.join(" ")}
          </p>
          <div className="mt-14 md:mt-16">
            <SegmentPicker />
          </div>
        </Container>
      </Section>

      {/* 3. The mother-tongue promise: the one deep section. */}
      <Section tone="brand" data-header-tone="dark">
        <Container>
          <h2 className="max-w-3xl font-display text-headline text-balance">Some feelings only make sense in Malayalam.</h2>
          <ul className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
            {MOTHER_TONGUE.map((point) => (
              <li key={point.title} className="border-t border-on-brand/20 pt-6">
                <h3 className="text-lg font-medium">{point.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty text-on-brand-muted">{point.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 4. Time zones and how it works. */}
      <Section id="how" className="scroll-mt-24">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-headline text-balance text-brand">Your time, and Kerala&rsquo;s.</h2>
            <p className="mt-5 max-w-md text-lead text-pretty text-ink-2">Three simple steps, from wherever you are.</p>
            <ol className="mt-10 grid gap-7">
              {NRI_STEPS.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4">
                  <span className="grid size-9 place-items-center rounded-full bg-highlight text-sm font-semibold text-brand tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-ink-1">{step.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-pretty text-ink-2">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <TimeHelper />
        </Container>
      </Section>

      {/* 5. Privacy, for shared rooms and watchful families. */}
      <Section tone="muted">
        <Container>
          <h2 className="max-w-3xl font-display text-headline text-balance text-brand">Private, even in a shared room.</h2>
          <ul className="mt-12 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-12">
            {PRIVACY.map((point) => (
              <li key={point.title} className="border-t border-line-strong pt-6">
                <h3 className="text-lg font-medium text-ink-1">{point.title}</h3>
                <p className="mt-3 leading-relaxed text-pretty text-ink-2">{point.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 6. For family in Kerala. */}
      <Section id="family" className="scroll-mt-24">
        <Container>
          <div className="grid gap-10 rounded-[2rem] bg-highlight/45 p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:p-14">
            <div>
              <h2 className="font-display text-headline text-balance text-brand">Worried about someone abroad?</h2>
              <p className="mt-5 max-w-lg text-lead text-pretty text-ink-2">
                If someone you love seems tired, distant or not themselves, you can share this page with them. Sometimes a
                message from home is the first step.
              </p>
            </div>
            <div className="lg:pt-2">
              <ShareFromHome />
              <ul className="mt-8 grid gap-3 text-[0.9375rem] leading-relaxed text-ink-2">
                <li>
                  We cannot contact an adult on your behalf, but you can{" "}
                  <a
                    href={whatsappHref(FAMILY_GUIDANCE_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand underline underline-offset-4"
                  >
                    ask our coordinator for guidance
                  </a>
                  .
                </li>
                <li>If you think they are in danger now, contact emergency services where they live.</li>
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* 7. The clinicians (sample profiles, no availability claims). */}
      <Section tone="muted">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-headline text-balance text-brand">Meet our therapists.</h2>
              <p className="mt-4 text-pretty text-ink-2 md:text-lg">Every session in Malayalam, English or a mix.</p>
            </div>
            <p className="inline-flex items-center gap-2 self-start rounded-full border border-line-strong bg-surface-raised px-3.5 py-1.5 text-sm text-ink-2 md:self-end">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-glow" />
              Sample profiles, shown while our team&rsquo;s details are finalised
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {THERAPISTS.map((therapist) => (
              <li key={therapist.id}>
                <Link
                  href={`/therapists/${therapist.slug}` as Route}
                  className="group flex h-full items-center gap-4 rounded-[1.5rem] bg-surface-raised p-4 ring-1 ring-line transition-shadow duration-500 ease-calm hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:flex-col lg:items-start lg:p-5"
                >
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-t-full bg-tertiary lg:h-24 lg:w-20">
                    <Image src={therapist.image} alt="" fill sizes="80px" className="object-cover object-top" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg leading-tight text-brand group-hover:underline group-hover:underline-offset-4">
                      {therapist.name}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-ink-3">{therapist.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/therapists"
            className="group mt-8 inline-flex min-h-11 items-center gap-2 font-medium text-brand underline decoration-brand/25 underline-offset-4 hover:decoration-brand"
          >
            See all therapists
            <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-1" />
          </Link>
        </Container>
      </Section>

      {/* 8. Community groups abroad. */}
      <Section>
        <Container>
          <div className="flex flex-col gap-8 border-y border-line py-12 md:flex-row md:items-center md:justify-between md:py-14">
            <div className="max-w-2xl">
              <h2 className="font-display text-title text-balance text-brand">Bring a session to your Samajam or community group.</h2>
              <p className="mt-3 leading-relaxed text-pretty text-ink-2">
                Ask us about online talks in Malayalam for Malayali associations, faith groups and student societies abroad.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonExternalLink href={whatsappHref(ASSOCIATION_MESSAGE)} variant="secondary" size="lg">
                <WhatsAppLogo />
                Ask on WhatsApp
              </ButtonExternalLink>
              <Link
                href="/awareness"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline decoration-brand/25 underline-offset-4 hover:decoration-brand"
              >
                About our awareness work
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9. Questions, with crisis lines always visible beside them. */}
      <Section tone="muted">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-headline text-balance text-brand">Questions from abroad.</h2>
            <ul className="mt-10 grid gap-3">
              {NRI_FAQS.map((faq) => (
                <li key={faq.q}>
                  <details className="group rounded-[1.25rem] bg-surface-raised ring-1 ring-line open:shadow-card">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-[1.25rem] px-5 py-4 font-medium text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-6 [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <span aria-hidden="true" className="text-xl leading-none text-brand transition-transform duration-300 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 leading-relaxed text-pretty text-ink-2 sm:px-6">{faq.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>

          <aside id="crisis" aria-labelledby="crisis-heading" className="scroll-mt-24 self-start rounded-[1.75rem] bg-surface-raised p-7 ring-1 ring-line sm:p-8">
            <h2 id="crisis-heading" className="font-display text-title text-brand">
              In crisis right now?
            </h2>
            <p className="mt-3 leading-relaxed text-pretty text-ink-2">
              Ullidam is not an emergency service. Call your local emergency number, or one of these lines.
            </p>
            <ul className="mt-6 grid gap-3">
              {CRISIS_LINES.map((line) => (
                <li key={`${line.region}-${line.number}`}>
                  <a
                    href={`tel:${line.tel}`}
                    className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-canvas-muted px-4 py-3 transition-colors duration-300 hover:bg-tertiary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium text-ink-1">{line.region}</span>
                      <span className="block text-ink-3">{line.service}</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 font-semibold text-brand tabular-nums">
                      <Phone className="size-4" />
                      {line.number}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </Section>

      {/* 10. Closing: one message is enough. */}
      <Section>
        <Container className="max-w-3xl text-center">
          <h2 className="font-display text-headline text-balance text-brand">You do not have to carry it alone.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lead text-pretty text-ink-2">Send one message. We will take it from there, in Malayalam.</p>
          <div className="mt-9 flex justify-center">
            <DiasporaWhatsAppButton />
          </div>
          <p className="mt-5 text-sm text-ink-3">WhatsApp {siteConfig.coordinator.display}</p>
        </Container>
      </Section>
    </>
  );
}
