import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section } from "@/components/layout/Section";
import type { Photo } from "@/data/photos";

interface PageHeroProps {
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  /** A photograph, framed in the brand's arch beside the heading. */
  photo?: Photo;
  children?: ReactNode;
}

/** Opening block for inner pages: one heading, one short lead, and a photograph in the arch. */
export function PageHero({ eyebrow, title, lead, photo, children }: PageHeroProps) {
  return (
    <Section className="pt-28 sm:pt-32 md:pt-36 lg:pt-40">
      <Container className={photo ? "grid items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20" : undefined}>
        <div className="max-w-3xl">
          <div className="motion-safe:animate-rise">
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h1 className="mt-6 font-display text-display text-balance text-brand motion-safe:animate-rise [animation-delay:120ms]">
            {title}
          </h1>
          <p className="mt-8 max-w-2xl text-lead text-pretty text-ink-2 motion-safe:animate-rise [animation-delay:240ms]">
            {lead}
          </p>
          {children ? <div className="mt-10 motion-safe:animate-rise [animation-delay:360ms]">{children}</div> : null}
        </div>
        {photo ? (
          <div className="relative isolate mx-auto w-[min(78vw,360px)] motion-safe:animate-rise [animation-delay:300ms] lg:w-full lg:max-w-sm">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] bg-canvas-muted shadow-float">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                preload
                sizes="(min-width: 1024px) 384px, 78vw"
                className="object-cover"
                style={{ objectPosition: photo.position }}
              />
            </div>
            <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-t-full rounded-b-[2.5rem] border border-line" />
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
