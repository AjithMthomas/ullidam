import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ButtonExternalLink, ButtonLink } from "@/components/ui/Button";
import { PHOTOS } from "@/data/photos";
import { siteConfig } from "@/data/site-config";
import { whatsappHref } from "@/lib/whatsapp";

/** Act IV, "First light": still Kerala backwaters under the closing message. */
export function ClosingDawn() {
  return (
    <section aria-labelledby="closing-title" className="px-2.5 pb-2.5 sm:px-4 sm:pb-4">
      <div className="relative isolate min-h-[108svh] overflow-hidden sm:min-h-[96svh] md:min-h-[86svh] rounded-[1.75rem] bg-canvas-muted md:rounded-[2.5rem]">
        <div className="absolute inset-0 -z-10">
          <Image
            src={PHOTOS.closing.src}
            alt={PHOTOS.closing.alt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: PHOTOS.closing.position }}
          />
        </div>
        {/* Morning mist over the far shore keeps every line of the message legible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--theme-surface)_94%,transparent)_0%,color-mix(in_oklab,var(--theme-surface)_86%,transparent)_58%,color-mix(in_oklab,var(--theme-surface)_40%,transparent)_80%,transparent_94%)]"
        />
        <div className="reveal mx-auto flex max-w-3xl flex-col items-center px-6 pt-20 text-center md:pt-28">
          <h2 id="closing-title" className="font-display text-hero text-balance text-brand uppercase">
            Whenever you are ready, we are here.
          </h2>
          <p className="mt-6 max-w-xl text-lead text-pretty text-ink-2">{siteConfig.confidentialityPromise}</p>
          <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <ButtonExternalLink href={whatsappHref()} size="lg">
              <MessageCircle />
              Message our coordinator
            </ButtonExternalLink>
            <ButtonLink href="/therapists" variant="secondary" size="lg" className="bg-canvas/60 backdrop-blur-md">
              Meet our therapists
              <ArrowRight />
            </ButtonLink>
          </div>
          <p className="mt-6 text-sm text-ink-3">WhatsApp {siteConfig.coordinator.display}</p>
        </div>
      </div>
    </section>
  );
}
