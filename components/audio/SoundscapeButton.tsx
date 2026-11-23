"use client";

import { CloudRain, VolumeX } from "lucide-react";
import { toggleRain, useRainPlaying } from "@/lib/soundscape";
import { cn } from "@/lib/cn";

function Bars() {
  return (
    <span aria-hidden="true" className="flex h-3.5 items-end gap-[3px]">
      {[0, 0.35, 0.7, 0.2].map((delay) => (
        <span
          key={delay}
          className="h-full w-[2px] origin-bottom rounded-full bg-current motion-safe:animate-eq"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

/** Opt-in monsoon soundscape for the hero. Never autoplays. */
export function SoundscapeButton({ className }: { className?: string }) {
  const playing = useRainPlaying();
  return (
    <button
      type="button"
      onClick={toggleRain}
      className={cn(
        "group inline-flex h-12 items-center gap-3 rounded-full border border-on-brand/20 bg-night/30 pr-5 pl-1.5 text-sm font-medium text-on-brand backdrop-blur-md transition-colors duration-500 ease-calm hover:border-on-brand/40 hover:bg-night/50",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-on-brand/12 text-accent-on-dark">
        {playing ? <Bars /> : <CloudRain className="size-[1.125rem]" />}
      </span>
      {playing ? "Pause the rain" : "Listen to the rain"}
    </button>
  );
}

/** Appears in the header only while rain is playing, so it can be stopped from any page. */
export function RainHeaderToggle() {
  const playing = useRainPlaying();
  if (!playing) return null;
  return (
    <button
      type="button"
      onClick={toggleRain}
      className="inline-flex h-11 items-center gap-2 rounded-full border border-brand/15 px-3.5 text-sm font-medium text-brand transition-colors duration-300 hover:bg-brand-mist/60"
    >
      <VolumeX className="size-4" />
      <span className="hidden sm:inline">Pause rain</span>
      <span className="sr-only sm:hidden">Pause rain sound</span>
    </button>
  );
}
