"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

const BARS = 30;
const STOP_OTHERS = "ullidam:voice-play";

/** A steady, speech-like waveform, the same on every visit for the same seed. */
function waveform(seed: string): number[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: BARS }, (_, i) => {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const envelope = Math.sin((Math.PI * (i + 1)) / (BARS + 1)) * 0.55 + 0.45;
    return Math.max(0.18, envelope * (0.35 + ((h >>> 0) % 1000) / 1540));
  });
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * A clinician's short voice introduction: play button, waveform and time.
 * Without `src` (until the real recordings arrive) it shows the same design,
 * marked "Coming soon", and cannot be played. Audio loads only on first play,
 * and starting one voice note pauses any other.
 */
export function VoiceNote({ src, seed, name, className }: { src?: string; seed: string; name: string; className?: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const bars = waveform(seed);

  useEffect(() => {
    if (!src) return;
    const stop = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== seed) audio.current?.pause();
    };
    window.addEventListener(STOP_OTHERS, stop);
    return () => window.removeEventListener(STOP_OTHERS, stop);
  }, [src, seed]);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) {
      window.dispatchEvent(new CustomEvent(STOP_OTHERS, { detail: seed }));
      void el.play();
    } else {
      el.pause();
    }
  };

  return (
    <div className={cn("flex h-11 min-w-0 items-center gap-3 rounded-full bg-canvas-muted pr-4 pl-1.5", className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={!src}
        aria-label={src ? `${playing ? "Pause" : "Play"} ${name}'s voice introduction` : `${name}'s voice introduction, coming soon`}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-on-brand transition-[background-color,transform] duration-300 ease-calm hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:bg-brand/45 motion-safe:active:scale-95"
      >
        {playing ? <Pause className="size-3.5 fill-current" /> : <Play className="ml-0.5 size-3.5 fill-current" />}
      </button>

      <div aria-hidden="true" className="flex h-6 min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
        {bars.map((height, i) => (
          <span
            key={i}
            className={cn(
              "w-[2px] shrink-0 rounded-full transition-colors duration-200",
              i / BARS < progress ? "bg-ink-1" : "bg-ink-3/45",
            )}
            style={{ height: `${Math.round(height * 100)}%` }}
          />
        ))}
      </div>

      <span className="shrink-0 text-xs text-ink-3 tabular-nums">{src ? clock(elapsed) : "Coming soon"}</span>

      {src ? (
        <audio
          ref={audio}
          src={src}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setProgress(0);
            setElapsed(0);
          }}
          onTimeUpdate={(event) => {
            const el = event.currentTarget;
            setElapsed(el.currentTime);
            setProgress(el.duration ? el.currentTime / el.duration : 0);
          }}
        />
      ) : null}
    </div>
  );
}
