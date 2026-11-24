import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ButtonExternalLink } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { VoiceNote } from "@/components/ui/VoiceNote";
import type { Therapist } from "@/data/therapists";
import { therapistRequestMessage, whatsappHref } from "@/lib/whatsapp";

/**
 * A clinician in the /therapists directory: a pale band with name, title and
 * portrait; the areas they help with as a scrolling row of chips; a short
 * voice introduction; three facts; and when they are next free, with a
 * booking action. Add `voiceIntroAudio` to a clinician in data/therapists.ts
 * and their voice note becomes playable.
 */
export function TherapistDirectoryCard({ therapist }: { therapist: Therapist }) {
  const profile = `/therapists/${therapist.slug}` as Route;
  const [firstLanguage, ...otherLanguages] = therapist.languages;

  return (
    <article className="flex flex-col overflow-hidden rounded-[1.75rem] bg-surface-raised ring-1 ring-line transition-shadow duration-500 ease-calm hover:shadow-float">
      <header className="flex min-h-36 items-end justify-between gap-4 bg-highlight px-6 pt-6">
        <div className="min-w-0 pb-6">
          <h2 className="font-display text-[1.375rem] leading-tight text-balance text-ink-1">
            <Link href={profile} className="hover:underline hover:decoration-1 hover:underline-offset-4">
              {therapist.name}
            </Link>
          </h2>
          <p className="mt-1.5 text-sm leading-snug text-pretty text-ink-2">{therapist.title}</p>
        </div>
        <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-t-full bg-tertiary">
          <Image src={therapist.image} alt={`Portrait of ${therapist.name}`} fill sizes="96px" className="object-cover object-top" />
        </div>
      </header>

      <div className="flex flex-1 flex-col px-6 pb-6">
        {/* What they help with: one scrolling row, edges softly faded. */}
        <ul
          aria-label={`What ${therapist.name} helps with`}
          tabIndex={0}
          className="-mx-6 flex gap-2 overflow-x-auto border-b border-line px-6 py-5 [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)] [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
        >
          {therapist.specialties.map((specialty) => (
            <li
              key={specialty}
              className="shrink-0 rounded-full border border-line-strong px-4 py-2 text-sm whitespace-nowrap text-ink-1"
            >
              {specialty}
            </li>
          ))}
        </ul>

        {/* Their voice, then the full profile. */}
        <div className="flex items-center gap-3 border-b border-line py-5">
          <VoiceNote src={therapist.voiceIntroAudio} seed={therapist.id} name={therapist.name} className="flex-1" />
          <Link
            href={profile}
            className="inline-flex h-11 shrink-0 items-center rounded-full border border-ink-1/80 px-4 text-sm font-medium text-ink-1 transition-colors duration-300 hover:bg-ink-1 hover:text-surface-raised"
          >
            View profile<span className="sr-only">: {therapist.name}</span>
          </Link>
        </div>

        <dl className="grid grid-cols-3 gap-2 border-b border-line py-5">
          <Fact value={`${therapist.experienceYears}+ yrs`} label="Experience" />
          <Fact value={firstLanguage} label={otherLanguages.length ? `+${otherLanguages.length} more` : "Language"} />
          <Fact value="Video" label="or audio call" />
        </dl>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <div className="min-w-0">
            <p className="text-sm text-ink-3">Next available</p>
            <StatusPulse status={therapist.availabilityStatus} label={therapist.nextAvailableText} className="mt-1 font-medium text-ink-1" />
          </div>
          <ButtonExternalLink
            href={whatsappHref(therapistRequestMessage(therapist.name))}
            className="px-6 text-sm tracking-[0.08em] uppercase"
            aria-label={`Book a session with ${therapist.name} on WhatsApp (opens in a new tab)`}
          >
            Book now
          </ButtonExternalLink>
        </div>
      </div>
    </article>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-canvas-muted px-3 py-2.5">
      <dt className="sr-only">{label}</dt>
      <dd className="text-sm font-semibold text-ink-1">{value}</dd>
      <dd aria-hidden="true" className="mt-0.5 text-xs text-ink-3">
        {label}
      </dd>
    </div>
  );
}
