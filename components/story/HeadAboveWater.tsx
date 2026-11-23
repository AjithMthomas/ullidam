"use client";

import { getImageProps } from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronsDown, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { STORY_CHAPTERS, STORY_COPY, STORY_IMAGES, STORY_WORRIES } from "@/data/story";
import { getPracticeStats } from "@/data/therapists";
import { cn } from "@/lib/cn";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useStorySeen } from "@/lib/vault";
import { theme } from "@/theme";
import { Mist } from "./mist";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

/** One moment of the portrait, art-directed: a tall crop for phones, a wide one for larger screens. */
function Portrait({ moment, preload }: { moment: "under" | "above"; preload?: boolean }) {
  const image = STORY_IMAGES[moment];
  const common = { alt: image.alt, sizes: "100vw", preload };
  const { props: wide } = getImageProps({ ...common, ...image.wide });
  const { props: tall } = getImageProps({ ...common, ...image.tall });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={wide.srcSet} sizes="100vw" />
      <img
        {...tall}
        alt={tall.alt}
        draggable={false}
        className="story-portrait absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}

/**
 * "Head Above Water" (docs/cinematic-script.md). The screen holds still for
 * about three scrolls: the water line sits across the eyes, mist rolls in, the
 * visitor breathes and wipes it away, and it clears to reveal the same person
 * above the water, in colour, in morning light. Returning visitors open on
 * the calm ending; reduced motion shows that ending, still.
 */
export function HeadAboveWater() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [seen, setSeen] = useStorySeen();
  const [mode, setMode] = useState<"auto" | "story">("auto");
  const [chapter, setChapter] = useState(0);
  const calm = seen && mode === "auto";
  const stats = getPracticeStats();

  useGSAP(
    () => {
      const el = root.current;
      const st = stage.current;
      if (!el || !st) return;
      const q = gsap.utils.selector(el);
      const wide = () => window.matchMedia("(min-width: 768px)").matches;

      let mist: Mist | null = null;
      try {
        if (canvas.current) mist = new Mist(canvas.current, { fog: theme.surfaceRaised, cool: theme.tertiarySoft });
      } catch {
        st.dataset.mist = "css"; // no WebGL: a soft CSS haze stands in
      }

      let fog = 0;
      const fade = (selector: string, from: number, to: number, p: number) => {
        const v = from <= 0 ? 1 - smooth(clamp((p - (to - 0.05)) / 0.05)) : smooth(clamp((p - from) / 0.04)) * (to >= 1 ? 1 : 1 - smooth(clamp((p - (to - 0.04)) / 0.04)));
        for (const node of q(selector) as HTMLElement[]) {
          node.style.opacity = String(v);
          node.style.transform = `translateY(${((1 - v) * 14).toFixed(1)}px)`;
          node.style.visibility = v < 0.01 ? "hidden" : "visible";
        }
      };

      const apply = (p: number) => {
        const frame = wide() ? STORY_IMAGES.frame.wide : STORY_IMAGES.frame.tall;
        const gather = smooth(clamp((p - 0.1) / 0.23));
        const settle = smooth(clamp((p - 0.56) / 0.26));
        fog = gather * (1 - smooth(clamp((p - 0.56) / 0.22))) * (1 - 0.15 * smooth(clamp((p - 0.38) / 0.16)));
        st.style.setProperty("--water", String(frame.eyes + (frame.chin - frame.eyes) * settle));
        st.style.setProperty("--gray", ((0.7 + 0.3 * gather) * (1 - settle)).toFixed(3));
        st.style.setProperty("--swap", smooth(clamp((p - 0.43) / 0.05)).toFixed(3));
        st.style.setProperty("--warm", smooth(clamp((p - 0.62) / 0.26)).toFixed(3));
        st.style.setProperty("--fog", fog.toFixed(3));
        mist?.set(fog, -0.4 + 1.9 * smooth(clamp((p - 0.56) / 0.24)));

        fade('[data-beat="under"]', 0, 0.12, p);
        STORY_WORRIES.forEach((_, i) => fade(`[data-worry="${i}"]`, 0.14 + i * 0.025, 0.37, p));
        fade('[data-beat="breathe"]', 0.37, 0.56, p);
        fade('[data-beat="clear"]', 0.58, 0.79, p);
        fade('[data-beat="arrival"]', 0.8, 1, p);

        st.classList.toggle("is-rippled", p > 0.01);
        st.classList.toggle("is-flying", p > 0.84);
        setChapter(p < 0.1 ? 0 : p < 0.37 ? 1 : p < 0.58 ? 2 : 3);
        if (p > 0.97 && !seen) {
          setMode("story"); // keep the story mounted for the rest of this visit
          setSeen(true);
        }
      };

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK }, (context) => {
        if (!context.conditions?.motion || calm) {
          apply(1);
          return;
        }
        apply(0);
        mist?.start();
        trigger.current = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress),
          onToggle: (self) => (self.isActive ? mist?.start() : mist?.stop()),
        });
        return () => {
          trigger.current = null;
          mist?.stop();
        };
      });

      // Wipe the mist: a cursor trail on desktop, a tap on phones.
      const wipeAt = (event: PointerEvent) => {
        if (!mist || fog < 0.15) return;
        const rect = st.getBoundingClientRect();
        mist.wipe((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, event.pointerType === "mouse" ? 9 : 16);
      };
      const onMove = (event: PointerEvent) => event.pointerType === "mouse" && wipeAt(event);
      st.addEventListener("pointermove", onMove);
      st.addEventListener("pointerdown", wipeAt);
      const onResize = () => mist?.resize();
      window.addEventListener("resize", onResize);

      return () => {
        st.removeEventListener("pointermove", onMove);
        st.removeEventListener("pointerdown", wipeAt);
        window.removeEventListener("resize", onResize);
        mm.revert();
        mist?.destroy();
      };
    },
    { scope: root, dependencies: [calm], revertOnUpdate: true },
  );

  const skip = () => {
    const end = trigger.current?.end;
    if (end !== undefined) window.scrollTo({ top: end + 2, behavior: "smooth" });
  };
  const replay = () => {
    setMode("story");
    root.current?.scrollIntoView();
  };

  const initial = {
    "--pos-wide": STORY_IMAGES.frame.wide.position,
    "--pos-tall": STORY_IMAGES.frame.tall.position,
    "--water": STORY_IMAGES.frame.wide.eyes, "--gray": 0.7, "--swap": 0, "--warm": 0, "--fog": 0 } as CSSProperties;

  return (
    <section ref={root} aria-label="Welcome" className="relative bg-white">
      <div ref={stage} style={initial} className="story-stage relative h-svh overflow-hidden bg-white select-none">
        {/* The portrait: two moments of the same person, swapped inside the thickest mist. */}
        <div className="story-portrait-mask absolute inset-0">
          <Portrait moment="under" preload />
          <div className="absolute inset-0" style={{ opacity: "var(--swap)" }}>
            <Portrait moment="above" />
          </div>
        </div>

        {/* The water: below its line, the portrait is seen through tinted, wavering water. */}
        <div className="story-water absolute inset-x-0 bottom-0 overflow-hidden" aria-hidden="true">
          <div className="story-portrait-mask story-underwater absolute inset-x-0 bottom-0 h-svh">
            <Portrait moment="under" />
            <div className="absolute inset-0" style={{ opacity: "var(--swap)" }}>
              <Portrait moment="above" />
            </div>
          </div>
          <div className="story-water-tint absolute inset-0" />
          <div className="story-water-shimmer absolute inset-0 motion-safe:animate-shimmer" />
          <div className="story-surface absolute inset-x-0 top-0 h-px" />
        </div>
        <div aria-hidden="true" className="story-ripple pointer-events-none absolute left-1/2 h-8 w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/80" />
        <svg width="0" height="0" aria-hidden="true" className="absolute">
          <filter id="ullidam-underwater">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.045" numOctaves="2" seed="4" />
            <feDisplacementMap in="SourceGraphic" scale="16" />
          </filter>
        </svg>

        {/* Morning light, warming the scene as it clears. */}
        <div aria-hidden="true" className="story-warmth pointer-events-none absolute inset-0" />

        {/* The mist. */}
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="story-fog-fallback pointer-events-none absolute inset-0" />

        {/* Words */}
        <div className="pointer-events-none absolute inset-x-0 top-[13svh] z-10 px-6 text-center md:top-[15svh]">
          <div data-beat="under" className="mx-auto max-w-3xl">
            <h2 className="font-display text-display text-balance text-brand">{STORY_COPY.under.en}</h2>
          </div>
          <div data-beat="clear" className="invisible absolute inset-x-6 top-0 mx-auto max-w-3xl opacity-0">
            <h2 className="font-display text-display text-balance text-brand">{STORY_COPY.clear.en}</h2>
          </div>
          <div data-beat="arrival" className="pointer-events-auto invisible absolute inset-x-6 top-0 mx-auto max-w-3xl opacity-0">
            <StatusPulse
              status="open"
              label={`${stats.acceptingCount} therapists accepting new clients`}
              className="rounded-full border border-line bg-white/70 py-1.5 pr-4 pl-3 text-sm text-ink-2 backdrop-blur-md"
            />
            <h1 className="mt-5 font-display text-hero text-balance text-brand">{STORY_COPY.arrival.title}</h1>
            <p className="mx-auto mt-4 hidden max-w-xl text-lead text-pretty text-ink-2 md:block">{STORY_COPY.arrival.lead}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/therapists" size="lg">
                Find your therapist
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary" size="lg" className="bg-white/60 backdrop-blur-md">
                Explore our care
              </ButtonLink>
            </div>
          </div>
        </div>

        {STORY_WORRIES.map((worry, i) => (
          <p
            key={worry.text}
            data-worry={i}
            className="pointer-events-none invisible absolute z-10 text-[0.9375rem] text-ink-3 italic opacity-0 md:text-lg"
            style={{ left: `${worry.x}%`, top: `${worry.y}%` }}
          >
            {worry.text}
          </p>
        ))}

        <div data-beat="breathe" className="pointer-events-none invisible absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center opacity-0">
          <span aria-hidden="true" className="story-breath relative flex size-28 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-tertiary/60" />
            <span className="absolute inset-5 rounded-full bg-tertiary" />
          </span>
          <p className="story-breath-label mt-8 h-6 text-sm font-medium tracking-[0.2em] text-secondary-ink uppercase">
            <span>Breathe in</span>
            <span>Breathe out</span>
          </p>
          <h2 className="mt-6 max-w-2xl font-display text-headline text-balance text-brand">{STORY_COPY.breathe.en}</h2>
          <p className="mt-6 text-sm text-ink-3">
            <span className="hidden [@media(hover:hover)]:inline">Move your cursor to clear the mist.</span>
            <span className="[@media(hover:hover)]:hidden">Tap to clear the mist.</span>
          </p>
        </div>

        {/* A single bird crosses the cleared sky. */}
        <svg aria-hidden="true" viewBox="0 0 40 12" className="story-bird pointer-events-none absolute top-[24%] left-[-6%] z-10 w-10 text-brand/70">
          <path d="M0 8 Q10 -2 20 8 Q30 -2 40 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>

        {/* Chapters, skip and replay */}
        <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-between gap-4 px-5 md:bottom-8 md:px-12">
          <ol className="flex items-center gap-3" aria-label="Story chapters">
            {STORY_CHAPTERS.map((name, i) => (
              <li key={name} className="flex items-center gap-2" aria-current={!calm && chapter === i ? "step" : undefined}>
                <span
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500 ease-calm",
                    (calm ? 3 : chapter) === i ? "w-6 bg-brand" : "w-1.5 bg-brand/25",
                  )}
                />
                <span className={cn("hidden text-xs text-ink-3 md:inline", (calm ? 3 : chapter) !== i && "md:hidden")}>{name}</span>
              </li>
            ))}
          </ol>
          {calm ? (
            <button
              type="button"
              onClick={replay}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-sm font-medium text-brand backdrop-blur-md"
            >
              <RotateCcw className="size-4" />
              Replay the story
            </button>
          ) : (
            <button
              type="button"
              onClick={skip}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white/70 px-4 text-sm font-medium text-brand backdrop-blur-md"
            >
              Skip
              <ChevronsDown className="size-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
