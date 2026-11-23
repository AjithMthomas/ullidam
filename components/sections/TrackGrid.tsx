import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { SERVICE_TRACKS, type ServiceTrack } from "@/data/services";
export function TrackCard({ track }: { track: ServiceTrack }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-line bg-surface-raised p-7 transition-[border-color,box-shadow,transform] duration-500 ease-calm hover:border-line-strong hover:shadow-card motion-safe:hover:-translate-y-0.5 md:p-9 lg:p-10">
      <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-canvas-muted">
        <Image
          src={track.photo.src}
          alt={track.photo.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.03]"
          style={{ objectPosition: track.photo.position }}
        />
        <span className="absolute right-3 bottom-3 rounded-full bg-canvas/90 px-3 py-1 text-xs font-semibold text-brand backdrop-blur-md">
          Track {track.letter}
        </span>
      </div>

      <h3 className="font-display text-title text-balance text-brand">{track.name}</h3>
      <p className="mt-2 text-sm font-medium text-accent-ink">{track.audience}</p>
      <p className="mt-5 leading-relaxed text-pretty text-ink-2">{track.summary}</p>

      {track.phases ? (
        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {track.phases.map((phase) => (
            <li key={phase.step} className="rounded-2xl bg-canvas-muted px-4 py-3.5">
              <span className="block text-xs font-semibold tracking-[0.14em] text-accent-ink uppercase">
                {phase.step}
              </span>
              <span className="mt-1 block text-sm leading-snug text-ink-2">{phase.title}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Common concerns">
          {track.focusAreas.slice(0, 3).map((area) => (
            <li key={area}>
              <Pill tone="muted">{area}</Pill>
            </li>
          ))}
        </ul>
      )}

      {/* Stretched link: the whole card is one large, forgiving tap target. */}
      <Link
        href={track.href}
        className="mt-auto inline-flex items-center gap-2 pt-10 font-medium text-brand after:absolute after:inset-0 after:rounded-3xl"
      >
        Explore<span className="sr-only"> {track.name}</span>
        <ArrowRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

export function TrackGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
      {SERVICE_TRACKS.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  );
}
