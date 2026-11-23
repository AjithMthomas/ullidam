"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { FILM, FILM_COPY } from "@/data/film";
import { PRIMARY_CTA } from "@/data/site-config";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * "Here, Now" (docs/specs/homepage-redesign.md, section 4.2). A quiet, minimal
 * landing: one sharp photograph filling the screen, the header floating over
 * it, one headline, one line, one button. Scrolling brings the camera down
 * from the wide morning view to the present moment: it tilts down toward the
 * grass ("Slow down for a moment"), lowers to ground level as the sun rises
 * between the trees ("Come back to where you are"), then focuses on a single
 * glowing dew drop ("This is your space within") before the light opens into
 * the page. Reduced motion: the still frame and the lines as one sentence.
 */
export function FilmHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = (selector: string) => el.querySelector<HTMLElement>(selector);
      const wide = q("[data-shot='wide']");
      const ground = q("[data-shot='ground']");
      const drop = q("[data-shot='drop']");
      const hero = q("[data-hero]");
      const cue = q("[data-cue]");
      const shade = q("[data-shade]");
      const light = q("[data-light]");
      const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-line]"));
      if (!wide || !ground || !drop || !hero || !cue || !shade || !light) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MOTION_OK, large: "(min-width: 768px)" }, (context) => {
        const { motion, large } = context.conditions as { motion: boolean; large: boolean };
        if (!motion) return;

        const shown = (p: number, from: number, to: number, f = 0.04) =>
          smooth(clamp((p - from) / f)) * (1 - smooth(clamp((p - (to - f)) / f)));
        /** A shot arriving: fades in, pulls focus from soft to sharp, and settles from `from` to `to` scale. */
        const arrive = (node: HTMLElement, p: number, start: number, end: number, from: number, to: number) => {
          const t = smooth(clamp((p - start) / (end - start)));
          node.style.opacity = smooth(clamp((p - start) / 0.1)).toFixed(3);
          node.style.filter = `blur(${(9 * (1 - smooth(clamp((p - start) / 0.14)))).toFixed(2)}px)`;
          node.style.transform = `scale(${(from + (to - from) * t).toFixed(4)})`;
        };

        const apply = (p: number) => {
          const seg = (from: number, to: number) => smooth(clamp((p - from) / (to - from)));
          // The landing steps aside as the camera starts to move.
          const out = seg(0.02, 0.12);
          hero.style.opacity = (1 - out).toFixed(3);
          hero.style.transform = `translateY(${(-32 * out).toFixed(1)}px)`;
          hero.inert = out > 0.95;
          cue.style.opacity = (1 - seg(0, 0.05)).toFixed(3);
          shade.style.opacity = (1 - 0.6 * out).toFixed(3);

          // 1. Wide: the camera pushes in and tilts down toward the sunlit grass.
          const tilt = seg(0, 0.44);
          wide.style.transform = `translateY(${(-6 * tilt).toFixed(2)}%) scale(${(1.08 + 0.12 * tilt).toFixed(4)})`;
          wide.style.filter = `brightness(${(1 + 0.06 * tilt).toFixed(3)})`;
          // 2. Ground level: the camera lowers into the grass as the sun rises between the trees.
          arrive(ground, p, 0.34, 0.7, 1.14, 1.0);
          // 3. The present moment: focus on a single dew drop.
          arrive(drop, p, 0.64, 0.94, 1.1, 1.0);

          const showing = [shown(p, 0.12, 0.34), shown(p, 0.44, 0.62), shown(p, 0.72, 0.88)];
          lines.forEach((line, i) => {
            const o = showing[i];
            line.style.opacity = o.toFixed(3);
            line.style.transform = `translateY(${((1 - o) * 12).toFixed(1)}px)`;
          });

          // The light opens into the page.
          const b = seg(0.88, 0.98);
          light.style.opacity = Math.min(1, b * 1.5).toFixed(3);
          light.style.transform = `scale(${(0.35 + 2.8 * b).toFixed(4)})`;
          el.dataset.headerTone = b > 0.6 ? "light" : "dark";
          el.dataset.headerStay = p < 0.98 ? "true" : "false";
        };

        apply(0);
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * (large ? 3.2 : 2.6)}`,
          pin: true,
          scrub: true,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });
        void document.fonts.ready.then(() => ScrollTrigger.refresh());
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // GSAP wraps the pinned section in a spacer element; this host div keeps
  // React's own DOM bookkeeping (siblings, streaming) on a node it owns.
  return (
    <div className="film-host">
      <section
        ref={root}
        aria-label="Welcome"
        data-header-tone="dark"
        data-header-stay="true"
        className="film relative h-svh overflow-hidden bg-canvas motion-reduce:h-auto motion-reduce:overflow-visible"
      >
        <div className="relative h-full motion-reduce:h-svh">
          <div className="absolute inset-0 overflow-hidden bg-night">
            {FILM.shots.map((shot, index) => (
              <div
                key={shot.key}
                data-shot={shot.key}
                className={index === 0 ? "absolute inset-0 scale-[1.08]" : "absolute inset-0 opacity-0 motion-reduce:hidden"}
                style={{ transformOrigin: shot.focus }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  preload={index === 0}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: shot.position }}
                />
              </div>
            ))}
            <div aria-hidden="true" data-shade className="film-shade absolute inset-0" />
            <div aria-hidden="true" data-light className="film-light absolute inset-0 opacity-0" />
          </div>

          {/* The whole landing: one headline, one line, one action. */}
          <div
            data-hero
            className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-7 pb-24 sm:px-10 md:pb-20 lg:px-16 lg:pb-24"
          >
            <h1 className="max-w-4xl font-display text-[clamp(2.6rem,1.2rem+4.6vw,5.75rem)] leading-[0.95] tracking-[-0.015em] text-balance text-on-brand uppercase motion-safe:animate-settle">
              {FILM_COPY.title}
            </h1>
            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8 motion-safe:animate-settle [animation-delay:120ms]">
              <ButtonLink href={PRIMARY_CTA.href} variant="inverse" size="lg" className="self-start">
                {PRIMARY_CTA.label}
                <ArrowRight />
              </ButtonLink>
              <p className="max-w-sm text-base leading-relaxed text-pretty text-on-brand/90">{FILM_COPY.lead}</p>
            </div>
          </div>

          <span
            aria-hidden="true"
            data-cue
            className="absolute right-8 bottom-28 z-10 hidden h-12 w-px overflow-hidden bg-white/30 md:block lg:right-16 motion-reduce:hidden"
          >
            <span className="film-cue block h-1/2 w-full bg-white" />
          </span>
        </div>

        {/* One short line per photograph; every line stays in the DOM, only visibility animates. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 px-6 text-center motion-reduce:hidden">
          <p className="mx-auto grid max-w-3xl place-items-center font-display text-headline text-balance">
            {FILM_COPY.lines.map((line) => (
              <span
                key={line.text}
                data-line
                className={`film-line col-start-1 row-start-1 ${line.light ? "film-line-light text-on-brand" : "film-line-dark text-brand"}`}
              >
                {line.text}
              </span>
            ))}
          </p>
        </div>
        <p className="hidden bg-canvas px-6 py-16 text-center font-display text-title text-balance text-brand motion-reduce:block">
          {FILM_COPY.still}
        </p>
      </section>
    </div>
  );
}
