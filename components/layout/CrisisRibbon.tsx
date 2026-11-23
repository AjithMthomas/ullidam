"use client";

import { LifeBuoy } from "lucide-react";
import { crisisLinesFor } from "@/data/site-config";
import { useRegion } from "@/lib/vault";
import { Container } from "./Container";

/**
 * Smart multi-country crisis ribbon (spec Phase 2): the visitor's own
 * region's line first, inferred from their device time zone; everyone else
 * is pointed to their local emergency number and the full list below.
 */
export function CrisisRibbon() {
  const region = useRegion();
  const line = crisisLinesFor(region)[0];
  const isLocal = line?.key === region;

  return (
    <aside aria-label="Crisis support" className="border-t border-line bg-canvas-muted">
      <Container className="flex flex-col gap-2 py-5 text-sm text-ink-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-3">
          <LifeBuoy className="mt-0.5 size-4 shrink-0 text-accent-ink" />
          <span>
            In crisis right now?{" "}
            {isLocal && line ? (
              <>
                {line.region} &middot; {line.service}:{" "}
                <a href={`tel:${line.tel}`} className="font-semibold text-brand underline underline-offset-4">
                  {line.number}
                </a>
              </>
            ) : (
              "Please call your local emergency number."
            )}
          </span>
        </p>
        <a href="#crisis-lines" className="font-medium text-brand underline-offset-4 hover:underline sm:shrink-0">
          All crisis lines
        </a>
      </Container>
    </aside>
  );
}
