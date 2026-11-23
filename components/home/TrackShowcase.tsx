import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SERVICE_TRACKS, type ServiceTrack } from "@/data/services";

/**
 * The homepage's four tracks of care. On large screens all four sit side by
 * side within one screen: a clean photograph, then the track's name, who it
 * is for and a short summary. On phones each track becomes a compact row
 * (photo, name, audience) so all four still fit in about one screen.
 */
export function TrackShowcase() {
  return (
    <Section id="services" className="lg:flex lg:min-h-svh lg:flex-col lg:justify-center lg:py-14 xl:py-16">
      <Container className="max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-end lg:gap-16">
          <h2 className="font-display text-headline text-balance text-brand uppercase">Four tracks of care</h2>
          <div>
            <p className="text-lead text-pretty text-ink-2">
              Whatever you are carrying, there is a clear place to begin. Our coordinator can always guide you.
            </p>
            <Link
              href="/services"
              className="group/all mt-4 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-brand underline decoration-brand/25 underline-offset-4 transition-colors duration-300 hover:decoration-brand"
            >
              Compare all services
              <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover/all:translate-x-1" />
            </Link>
          </div>
        </div>

        <ul className="reveal-group mt-10 grid gap-3 sm:gap-4 md:mt-14 md:grid-cols-2 md:gap-6 lg:mt-10 lg:grid-cols-4 lg:gap-5 xl:gap-6">
          {SERVICE_TRACKS.map((track) => (
            <li key={track.id} className="flex">
              <TrackTile track={track} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function TrackTile({ track }: { track: ServiceTrack }) {
  return (
    <article
      className={
        "group relative flex w-full items-center gap-4 rounded-[1.5rem] bg-surface-raised p-3 pr-4 ring-1 ring-line " +
        "transition-[box-shadow,transform] duration-500 ease-calm hover:shadow-float motion-safe:hover:-translate-y-1 " +
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-accent " +
        "md:flex-col md:items-stretch md:gap-0 md:overflow-hidden md:rounded-[1.75rem] md:p-0"
      }
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-canvas-muted sm:size-28 md:aspect-[4/3] md:h-auto md:w-full md:rounded-none lg:aspect-[16/10]">
        <Image
          src={track.photo.src}
          alt={track.photo.alt}
          fill
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 46vw, 112px"
          className="object-cover transition-transform duration-700 ease-calm motion-safe:group-hover:scale-[1.04]"
          style={{ objectPosition: track.photo.position }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:p-6 lg:p-5 xl:p-6">
        <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-accent-ink uppercase">Track {track.letter}</p>
        <h3 className="mt-1.5 font-display text-lg leading-[1.15] text-balance text-brand md:mt-3 md:text-[1.375rem] lg:text-xl xl:text-[1.375rem]">
          {/* Stretched link: the whole card is one large, forgiving tap target. */}
          <Link href={track.href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {track.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-ink-3 md:mt-2">{track.audience}</p>
        <p className="mt-3 hidden text-sm leading-relaxed text-pretty text-ink-2 md:block">{track.summary}</p>
        <div className="mt-auto hidden items-center justify-between pt-5 md:flex">
          <span className="text-sm font-medium text-brand">Explore</span>
          <ArrowCircle />
        </div>
      </div>

      <span className="md:hidden">
        <ArrowCircle />
      </span>
    </article>
  );
}

function ArrowCircle() {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 place-items-center rounded-full border border-brand/20 text-brand transition-[background-color,border-color,color,transform] duration-500 ease-calm group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand motion-safe:group-hover:rotate-45"
    >
      <ArrowUpRight className="size-[1.125rem]" />
    </span>
  );
}
