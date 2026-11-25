"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { RainCanvas, type RainControl } from "@/components/scene/RainCanvas";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const THOUGHTS = [
  { text: "What will people think?", x: 7, y: 15 },
  { text: "Will anyone understand?", x: 62, y: 12 },
  { text: "I should be able to handle this.", x: 64, y: 76 },
  { text: "Not now. Maybe later.", x: 9, y: 80 },
  { text: "Everyone else seems fine.", x: 70, y: 30, wide: true },
  { text: "I can’t sleep again.", x: 5, y: 34, wide: true },
  { text: "I don’t want to be a burden.", x: 34, y: 89 },
  { text: "Should we stay together?", x: 74, y: 57, wide: true },
  { text: "Is it my fault?", x: 10, y: 60, wide: true },
] as const;

const MODALITIES = ["CBT", "ACT", "Emotion-Focused Therapy", "Gottman Method", "EMDR", "CBT-I", "MBCT"];

/** Arch geometry for the current viewport: a doorway standing on the lower edge. */
function arch() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const width = Math.min(Math.max(w * 0.27, 220), w * 0.66, 430);
  const height = Math.min(h * 0.6, width * 1.6);
  const side = (w - width) / 2;
  const bottom = h * 0.08;
  const top = h - bottom - height;
  return { width, height, side, bottom, top };
}

/**
 * Act II, "The threshold" (docs/cinematic-script.md). Three stacked panels by
 * default; when motion is welcome it becomes one pinned stage scrubbed by the
 * visitor's scroll: the weight, the doorway, and the space within.
 */
export function Threshold({ dawn }: { dawn: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const rain = useRef<RainControl>({ intensity: 1 });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = root.current;
        if (!el) return;
        el.classList.add("is-cinematic");
        const q = gsap.utils.selector(el);
        const outline = q("[data-arch-outline]");

        const layout = () => {
          const a = arch();
          gsap.set(outline, { top: a.top, left: a.side, width: a.width, height: a.height });
        };
        layout();
        ScrollTrigger.addEventListener("refreshInit", layout);

        const archClip = () => {
          const a = arch();
          return `inset(${a.top}px ${a.side}px ${a.bottom}px ${a.side}px round ${a.width / 2}px ${a.width / 2}px 0px 0px)`;
        };

        rain.current.intensity = 1;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.4}`,
            pin: true,
            scrub: 0.9,
            invalidateOnRefresh: true,
          },
        });

        // Beat one: the weight grows heavier; thoughts gather.
        tl.fromTo(q("[data-weight]"), { fontWeight: 300 }, { fontWeight: 820, duration: 2.2 }, 0)
          .fromTo(q("[data-thought]"), { opacity: 0.35 }, { opacity: 0.9, y: (i) => (i % 2 ? -26 : 26), duration: 2, stagger: 0.06 }, 0)
          // The thoughts drift inward and dissolve: heard, and set down.
          .to(
            q("[data-thought]"),
            {
              x: (_, target: HTMLElement) => (0.5 - Number(target.dataset.x) / 100) * window.innerWidth * 0.55,
              y: (_, target: HTMLElement) => (0.5 - Number(target.dataset.y) / 100) * window.innerHeight * 0.55,
              scale: 0.6,
              opacity: 0,
              duration: 1.4,
              stagger: 0.04,
            },
            2.2,
          )
          .to(q("[data-beat1]"), { autoAlpha: 0, y: -50, duration: 1 }, 2.5)
          .to(rain.current, { intensity: 0.45, duration: 1.6 }, 2.2)
          // Beat two: a doorway rises, with dawn inside it.
          .fromTo(outline, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3 }, 3.2)
          .fromTo(q("[data-arch-window]"), { opacity: 0, clipPath: archClip }, { opacity: 1, duration: 1.1 }, 3.6)
          .fromTo(q("[data-beat2] > *"), { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.18 }, 4)
          // Beat three: the doorway opens to hold everything. The rain stops.
          .to(q("[data-beat2] > *"), { autoAlpha: 0, y: -30, duration: 0.7 }, 6.1)
          .to(outline, { opacity: 0, duration: 0.5 }, 6.1)
          .to(q("[data-arch-window]"), { clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)", duration: 1.9, ease: "power2.inOut" }, 6.2)
          .to(rain.current, { intensity: 0, duration: 1.3 }, 6.2)
          .fromTo(q("[data-layer-within]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1 }, 7.9)
          .fromTo(q("[data-beat3] > *"), { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.16 }, 8.3)
          .to({}, { duration: 1.2 });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", layout);
          el.classList.remove("is-cinematic");
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="threshold-title" className="threshold group relative bg-night text-on-brand">
      {/* Layer one: the weight */}
      <div className="threshold-layer relative flex min-h-[90svh] flex-col items-center justify-center overflow-hidden bg-night px-6 py-24">
        <RainCanvas control={rain} className="absolute inset-0" />
        <div data-beat1 className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <h2 id="threshold-title" className="font-display text-display text-balance">
            For a long time, you have carried the{" "}
            <span data-weight className="font-[700] text-accent-on-dark group-[.is-cinematic]:font-[300]">
              weight
            </span>{" "}
            alone.
          </h2>
        </div>
        <ul
          aria-label="Thoughts many people carry"
          className="relative z-10 mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-3 group-[.is-cinematic]:contents"
        >
            {THOUGHTS.map((thought) => (
              <li
                key={thought.text}
                data-thought
                data-x={thought.x}
                data-y={thought.y}
                style={{ "--x": `${thought.x}%`, "--y": `${thought.y}%` } as CSSProperties}
                className={cn(
                  "thought rounded-full border border-on-brand/12 px-4 py-2 text-sm text-on-brand-muted group-[.is-cinematic]:border-0 group-[.is-cinematic]:px-0 group-[.is-cinematic]:text-[0.9375rem] group-[.is-cinematic]:italic",
                  "wide" in thought && "group-[.is-cinematic]:max-md:hidden",
                )}
              >
                {thought.text}
              </li>
            ))}
        </ul>
      </div>

      {/* Layer two: the doorway */}
      <div className="threshold-layer relative flex min-h-[100svh] flex-col items-center justify-center gap-12 overflow-hidden bg-night px-6 py-24 group-[.is-cinematic]:bg-transparent md:flex-row md:gap-20">
        <div
          data-beat2
          className="relative z-10 max-w-sm text-center md:text-left group-[.is-cinematic]:absolute group-[.is-cinematic]:inset-x-6 group-[.is-cinematic]:top-[10svh] group-[.is-cinematic]:mx-auto md:group-[.is-cinematic]:inset-x-auto md:group-[.is-cinematic]:top-1/2 md:group-[.is-cinematic]:left-[6vw] md:group-[.is-cinematic]:mt-[-7rem] md:group-[.is-cinematic]:max-w-[min(32vw,26rem)]"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-on-dark uppercase">The doorway</p>
          <h3 className="mt-5 font-display text-headline text-balance">There is a space where you can set it down.</h3>
          <p className="mt-5 text-lead text-on-brand-muted">Confidential. Unhurried. In your language.</p>
        </div>
        <div
          data-arch-window
          className="relative aspect-[3/4] w-[min(76vw,380px)] shrink-0 overflow-hidden rounded-t-full group-[.is-cinematic]:absolute group-[.is-cinematic]:inset-0 group-[.is-cinematic]:aspect-auto group-[.is-cinematic]:w-auto group-[.is-cinematic]:rounded-none"
        >
          <div className="absolute inset-0">{dawn}</div>
        </div>
        <div
          data-arch-outline
          aria-hidden="true"
          className="pointer-events-none absolute hidden rounded-t-full border-[1.5px] border-accent-on-dark/80 shadow-[0_0_60px_-10px_color-mix(in_oklab,var(--theme-glow)_60%,transparent)] group-[.is-cinematic]:block"
        />
      </div>

      {/* Layer three: within */}
      <div
        data-layer-within
        className="threshold-layer relative flex min-h-[90svh] items-center bg-canvas px-6 py-24 text-ink-1"
      >
        <div data-beat3 className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-ink uppercase">Within</p>
          <h3 className="mt-6 font-display text-display text-balance text-brand">And a way forward, grounded in evidence.</h3>
          <p className="mx-auto mt-7 max-w-xl text-lead text-pretty text-ink-2">
            Approaches proven by research, offered with warmth by therapists who understand where you come from.
          </p>
          <ul className="mt-10 flex flex-wrap justify-center gap-2.5" aria-label="Therapies we use">
            {MODALITIES.map((modality) => (
              <li key={modality} className="rounded-full bg-brand-mist px-4 py-2 text-sm font-medium text-brand">
                {modality}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
