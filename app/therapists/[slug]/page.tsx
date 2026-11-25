import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, BadgeCheck, GraduationCap } from "lucide-react";
import { BookingCard } from "@/components/cinematic/BookingCard";
import { publicAvailability, publicProfile } from "@/lib/portal/public";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section } from "@/components/layout/Section";
import { Pill } from "@/components/ui/Pill";
import { getTrack } from "@/data/services";
import { THERAPISTS } from "@/data/therapists";
import { formatNumber, formatRating } from "@/lib/format";

export function generateStaticParams() {
  return THERAPISTS.map((therapist) => ({ slug: therapist.slug }));
}

function findTherapist(slug: string) {
  return THERAPISTS.find((therapist) => therapist.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/therapists/[slug]">): Promise<Metadata> {
  const therapist = findTherapist((await params).slug);
  if (!therapist) return { title: "Therapist not found" };
  return { title: `${therapist.name}, ${therapist.title}`, description: therapist.bio };
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reveal border-t border-line pt-10">
      <h2 className="text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** 60/40 profile: clinical authority on the left, the sticky booking station on the right. */
export default async function TherapistProfilePage({ params }: PageProps<"/therapists/[slug]">) {
  const base = findTherapist((await params).slug);
  if (!base) notFound();
  // Live text and schedule from the clinician portal (cached; sample data if not connected).
  const [profile, availability] = await Promise.all([publicProfile(base.id), publicAvailability(base.id)]);
  const therapist = profile ? { ...base, ...profile } : base;

  return (
    <Section className="pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      <Container>
        <Link href="/therapists" className="inline-flex items-center gap-2 text-sm font-medium text-ink-3 hover:text-brand">
          <ArrowLeft className="size-4" />
          All therapists
        </Link>

        <div className="mt-10 grid gap-14 pb-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20 lg:pb-0">
          <div>
            <div className="grid items-end gap-10 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden rounded-t-full rounded-b-[2rem] bg-brand-mist shadow-float motion-safe:animate-rise">
                <Image
                  src={therapist.image}
                  alt={`Portrait of ${therapist.name}`}
                  fill
                  priority
                  sizes="(min-width: 640px) 320px, 80vw"
                  className="object-cover"
                />
              </div>
              <div className="motion-safe:animate-rise [animation-delay:150ms]">
                <Eyebrow>{therapist.title}</Eyebrow>
                <h1 className="mt-5 font-display text-headline text-balance text-brand">{therapist.name}</h1>
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-ink-2">
                  <BadgeCheck className="size-4 text-status-open" />
                  Registered &middot; {therapist.license}
                </p>
                <p className="mt-3 text-sm text-ink-3">
                  {therapist.experienceYears} years in practice &middot; {formatRating(therapist.rating)} from{" "}
                  {formatNumber(therapist.reviewCount)}+ rated sessions
                </p>
              </div>
            </div>

            <div className="mt-16 flex flex-col gap-12">
              <Block title="About">
                <p className="max-w-2xl text-lead text-pretty text-ink-2">{therapist.bio}</p>
              </Block>
              <Block title="How I work">
                <blockquote className="max-w-2xl font-display text-title leading-snug text-balance text-brand">
                  &ldquo;{therapist.approach}&rdquo;
                </blockquote>
              </Block>
              <Block title="Your first session">
                <p className="max-w-2xl leading-relaxed text-pretty text-ink-2">{therapist.firstSessionGuide}</p>
              </Block>
              <Block title="Focus areas">
                <ul className="flex flex-wrap gap-2.5">
                  {therapist.specialties.map((specialty) => (
                    <li key={specialty}>
                      <Pill tone="brand">{specialty}</Pill>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-sm text-ink-3">
                  Part of{" "}
                  {therapist.trackFocus.map((id, i) => {
                    const track = getTrack(id);
                    return (
                      <span key={id}>
                        {i > 0 ? " and " : ""}
                        <Link href={track.href} className="font-medium text-brand underline-offset-4 hover:underline">
                          Track {track.letter}: {track.navLabel}
                        </Link>
                      </span>
                    );
                  })}
                </p>
              </Block>
              <Block title="Approaches">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {therapist.modalities.map((modality) => (
                    <li key={modality} className="rounded-2xl bg-canvas-muted px-5 py-4 text-ink-1">
                      {modality}
                    </li>
                  ))}
                </ul>
              </Block>
              <Block title="Training">
                <ul className="flex flex-col gap-3">
                  {therapist.education.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-ink-2">
                      <GraduationCap className="mt-0.5 size-5 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </div>

          <aside aria-label={`Book a session with ${therapist.name}`} className="lg:sticky lg:top-28 lg:self-start">
            <BookingCard therapist={therapist} availability={availability} />
          </aside>
        </div>
      </Container>
    </Section>
  );
}
