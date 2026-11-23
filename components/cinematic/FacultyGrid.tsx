"use client";

import type { Therapist } from "@/data/therapists";
import { cn } from "@/lib/cn";
import { TherapistCard } from "./TherapistCard";

export function FacultyGrid({ therapists, columns = 4 }: { therapists: Therapist[]; columns?: 2 | 4 }) {
  return (
    <div
      className={cn(
        "grid gap-8 sm:grid-cols-2 md:gap-10",
        columns === 4 && "xl:grid-cols-4 xl:gap-8",
      )}
    >
      {therapists.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  );
}
