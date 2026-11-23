"use client";

import { useState } from "react";
import { IdCardRope } from "@/components/cinematic/IdCardRope";
import { Container } from "@/components/layout/Container";
import type { TrackId } from "@/data/services";
import type { Therapist } from "@/data/therapists";
import { cn } from "@/lib/cn";

const CHIPS: readonly { id: TrackId; label: string }[] = [
  { id: "individual", label: "Individual" },
  { id: "psychiatry", label: "Psychiatry" },
  { id: "couples", label: "Couples" },
  { id: "divorce", label: "Divorce" },
];

/** Track chips that light up the matching ID cards on the rope; the others dim. */
export function FacultyBrowser({ therapists }: { therapists: Therapist[] }) {
  const [track, setTrack] = useState<TrackId | null>(null);

  return (
    <>
      <Container>
        <div role="group" aria-label="Highlight clinicians by type of care" className="mt-10 flex flex-wrap gap-2">
          {CHIPS.map((chip) => {
            const on = track === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={on}
                onClick={() => setTrack(on ? null : chip.id)}
                className={cn(
                  "inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-300 ease-calm motion-safe:active:scale-[0.97]",
                  on
                    ? "border-brand bg-brand text-on-brand"
                    : "border-line-strong bg-surface-raised text-ink-2 hover:border-brand/40 hover:text-brand",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </Container>
      <div className="mt-6 md:mt-8">
        <IdCardRope therapists={therapists} highlight={track} />
      </div>
    </>
  );
}
