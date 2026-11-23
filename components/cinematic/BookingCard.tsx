"use client";

import { MessageCircle } from "lucide-react";
import { ButtonExternalLink } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { SESSION_LENGTH_NOTE, SESSION_MODE } from "@/data/session";
import type { Therapist } from "@/data/therapists";
import { therapistRequestMessage, whatsappHref } from "@/lib/whatsapp";

/**
 * The sticky booking station (40% column).
 */
export function BookingCard({ therapist }: { therapist: Therapist }) {
  const href = whatsappHref(therapistRequestMessage(therapist.name));

  return (
    <>
      <div className="rounded-[2rem] border border-line bg-canvas p-7 shadow-card md:p-9">
        <StatusPulse status={therapist.availabilityStatus} label={therapist.nextAvailableText} className="text-sm font-medium text-ink-2" />
        <div className="mt-7">
          <p>
            <span className="block font-display text-display leading-none text-brand">
              Video
            </span>
            <span className="mt-2 block text-sm text-ink-3">
              Private one-to-one session. {SESSION_LENGTH_NOTE}
            </span>
          </p>
        </div>
        <dl className="mt-8 grid gap-3 border-t border-line pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Format</dt>
            <dd className="text-ink-1">{SESSION_MODE}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Languages</dt>
            <dd className="text-right text-ink-1">{therapist.languages.join(", ")}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-3">Registration</dt>
            <dd className="text-ink-1">{therapist.license}</dd>
          </div>
        </dl>
        <ButtonExternalLink href={href} size="lg" className="mt-8 w-full">
          <MessageCircle />
          Request a session
        </ButtonExternalLink>
        <p className="mt-4 text-center text-sm leading-relaxed text-ink-3">
          Share a preferred time and a backup. Our coordinator confirms one on WhatsApp.
        </p>
      </div>

      {/* Phones: the request is always one tap away. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <p className="text-sm">
            <span className="block font-display text-lg text-brand">Video session</span>
            <span className="text-ink-3">Private and one-to-one</span>
          </p>
          <ButtonExternalLink href={href}>
            <MessageCircle />
            Request a session
          </ButtonExternalLink>
        </div>
      </div>
    </>
  );
}
