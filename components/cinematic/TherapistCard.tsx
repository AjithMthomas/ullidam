"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRef, type PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { StatusPulse } from "@/components/ui/StatusPulse";
import type { Therapist } from "@/data/therapists";
import { formatRating } from "@/lib/format";

const MAX_TILT = 7;

/**
 * Faculty card with a gentle 3D tilt toward the cursor and a soft light that
 * follows it. Pointer moves write CSS variables directly (no React renders);
 * touch input and reduced motion get a still card.
 */
export function TherapistCard({ therapist }: { therapist: Therapist }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--rx", `${((0.5 - y) * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${((x - 0.5) * MAX_TILT * 1.2).toFixed(2)}deg`);
    card.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    cardRef.current?.style.setProperty("--rx", "0deg");
    cardRef.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <article className="group relative [perspective:1100px]" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        ref={cardRef}
        className="relative flex h-full flex-col rounded-[2rem] border border-line bg-canvas p-2.5 transition-[transform,box-shadow] duration-500 ease-calm [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d] group-hover:shadow-float group-hover:duration-200"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[1.5rem] bg-brand-mist">
          <Image
            src={therapist.image}
            alt={`Portrait of ${therapist.name}`}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 42vw, 90vw"
            className="object-cover transition-transform duration-700 ease-calm group-hover:scale-[1.04]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at var(--mx, 50%) var(--my, 30%), color-mix(in oklab, var(--theme-surface-raised) 28%, transparent), transparent 50%)" }}
          />
          <div className="absolute inset-x-3 bottom-3 flex">
            <StatusPulse
              status={therapist.availabilityStatus}
              label={therapist.nextAvailableText}
              className="rounded-full bg-canvas/90 px-3.5 py-1.5 text-xs font-medium text-ink-1 backdrop-blur-md"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3.5 pt-6 pb-4 [transform:translateZ(28px)]">
          <h3 className="font-display text-title text-brand">{therapist.name}</h3>
          <p className="mt-1.5 text-sm leading-snug text-pretty text-ink-3">{therapist.title}</p>
          <p className="mt-4 text-sm text-ink-2">{therapist.specialties.slice(0, 2).join(" · ")}</p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-5">
            <p>
              <span className="block font-display text-base text-brand">Video</span>
              <span className="text-xs text-ink-3">one-to-one</span>
            </p>
            <p className="text-right">
              <span className="block font-display text-base text-brand">{formatRating(therapist.rating)}</span>
              <span className="text-xs text-ink-3">{therapist.reviewCount}+ rated</span>
            </p>
          </div>

          <Link
            href={`/therapists/${therapist.slug}` as Route}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand after:absolute after:inset-0 after:rounded-[2rem]"
          >
            View profile<span className="sr-only"> of {therapist.name}</span>
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-calm group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
