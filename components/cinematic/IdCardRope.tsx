"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type RefObject } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, MessageCircle, Repeat2, RotateCcw, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { LogoMark } from "@/components/layout/Logo";
import { StatusPulse } from "@/components/ui/StatusPulse";
import type { Therapist } from "@/data/therapists";
import type { TrackId } from "@/data/services";
import { therapistRequestMessage, whatsappHref } from "@/lib/whatsapp";
import { theme } from "@/theme";

/* ------------------------------------------------------------------ */
/* Physics: each card is a damped pendulum hanging from a coir rope.   */
/* ------------------------------------------------------------------ */
const REST_ANGLES = [-3.5, 2.5, -2, 3.2]; // a clip never holds a card perfectly straight
const STIFFNESS = 26; // pendulum spring (deg/s^2 per degree): a slow, calm sway
const DAMPING = 2.4;
const MAX_DRAG = 28; // degrees
const ROPE_Y = 20; // where the rope meets the clips, inside the track
const SAG = 30; // resting sag of the rope at its middle
const SAG_STIFFNESS = 38;
const SAG_DAMPING = 6.5;

interface Swing {
  angle: number;
  vel: number;
  rest: number;
  dragging: boolean;
  lastAngle: number;
  lastTime: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const prefersStill = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** A deterministic barcode drawn from the registration number (integer maths only, so SSR matches). */
function Barcode({ value, className }: { value: string; className?: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  for (const char of value) {
    const code = char.charCodeAt(0);
    bars.push({ x, w: 1 + (code % 3) });
    x += 2 + (code % 3) + ((code >> 2) % 2);
  }
  return (
    <svg viewBox={`0 0 ${x} 20`} preserveAspectRatio="none" aria-hidden="true" className={className}>
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} width={bar.w} height="20" fill="currentColor" />
      ))}
    </svg>
  );
}

/** A metal badge clip (colours from theme.ts). Its ring sits on the rope; its plate grips the card's slot. */
function Clip() {
  return (
    <svg viewBox="0 0 36 64" aria-hidden="true" className="pointer-events-none absolute -top-2 left-1/2 z-20 h-16 w-9 -translate-x-1/2">
      <defs>
        <linearGradient id="ullidam-clip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={theme.clipLight} />
          <stop offset="0.5" stopColor={theme.clipMid} />
          <stop offset="1" stopColor={theme.clipDark} />
        </linearGradient>
      </defs>
      <circle cx="18" cy="8" r="6.4" fill="none" stroke="url(#ullidam-clip)" strokeWidth="2.6" />
      <rect x="15" y="14" width="6" height="18" rx="2" fill="url(#ullidam-clip)" />
      <rect x="6" y="28" width="24" height="30" rx="6" fill="url(#ullidam-clip)" />
      <rect x="11" y="49" width="14" height="3" rx="1.5" fill={theme.clipDark} opacity="0.7" />
    </svg>
  );
}

const securityPrint = {
  backgroundImage:
    "repeating-radial-gradient(circle at 0% 100%, transparent 0 9px, color-mix(in oklab, var(--theme-primary) 6%, transparent) 9px 10px), repeating-radial-gradient(circle at 100% 0%, transparent 0 13px, color-mix(in oklab, var(--theme-secondary) 8%, transparent) 13px 14px)",
};

interface IdCardProps {
  therapist: Therapist;
  index: number;
  hangRef: (el: HTMLDivElement | null) => void;
  swingRef: (el: HTMLDivElement | null) => void;
  swings: RefObject<Swing[]>;
  hangEls: RefObject<(HTMLDivElement | null)[]>;
}

function IdCard({ therapist, index, hangRef, swingRef, swings, hangEls }: IdCardProps) {
  const [hovered, setHovered] = useState(false);
  const [toggled, setToggled] = useState(false);
  const flipped = hovered || toggled;
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPointer = useRef("");
  const moveFocus = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const firstName = therapist.name.replace(/^Dr\.\s*/, "").split(" ")[0];

  // Keyboard users follow the card: focus lands on whichever side is now facing them.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (toggled ? backButton.current : frontButton.current)?.focus({ preventScroll: true });
  }, [toggled]);

  const swing = () => swings.current[index];

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    // A short pause, so sweeping the cursor across the rope does not flip every card.
    hoverTimer.current = setTimeout(() => setHovered(true), 160);
  };
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimer.current);
    setHovered(false);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    lastPointer.current = e.pointerType;
    if (e.pointerType !== "mouse" || e.button !== 0 || prefersStill()) return;
    if ((e.target as HTMLElement).closest("a, [data-no-drag]")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swing();
    const d = drag.current;
    if (d && d.id === e.pointerId) {
      if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
        d.moved = true;
        s.dragging = true;
        s.lastAngle = s.angle;
        s.lastTime = performance.now();
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      if (d.moved) {
        // The card follows the cursor around its clip, like lifting a hanging badge.
        const box = hangEls.current[index]?.getBoundingClientRect();
        if (!box) return;
        const angle = clamp((Math.atan2(-(e.clientX - (box.left + box.width / 2)), e.clientY - box.top) * 180) / Math.PI, -MAX_DRAG, MAX_DRAG);
        const now = performance.now();
        s.vel = (angle - s.lastAngle) / Math.max((now - s.lastTime) / 1000, 0.008);
        s.lastAngle = angle;
        s.lastTime = now;
        s.angle = angle;
        return;
      }
    }
    // Brushing past gives the card a gentle push in the direction of travel.
    if (e.pointerType === "mouse" && !s.dragging) s.vel += clamp(e.movementX * 0.3, -5, 5);
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const s = swing();
    if (s.dragging) {
      s.dragging = false;
      s.vel = clamp(s.vel, -240, 240);
    }
    drag.current = null;
  };

  const onFrontClick = (e: MouseEvent) => {
    const keyboard = e.detail === 0;
    // Mouse users turn cards over by hovering; taps and the keyboard toggle.
    if (!keyboard && lastPointer.current === "mouse") return;
    moveFocus.current = keyboard;
    setToggled((t) => !t);
    if (!prefersStill()) swing().vel += index % 2 ? 40 : -40; // a little flourish as it turns
  };
  const turnBack = (e: MouseEvent) => {
    moveFocus.current = e.detail === 0;
    setToggled(false);
  };
  const onBackKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !toggled) return;
    e.preventDefault();
    moveFocus.current = true;
    setToggled(false);
  };
  // On touch screens, tapping the back (anywhere but its links) turns the card over again.
  const onBackClick = (e: MouseEvent) => {
    if (lastPointer.current === "mouse" || !toggled) return;
    if ((e.target as HTMLElement).closest("a, button")) return;
    setToggled(false);
  };

  const profileHref = `/therapists/${therapist.slug}` as Route;

  return (
    <div ref={hangRef} className="relative shrink-0 snap-center">
      <div
        ref={swingRef}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative origin-top touch-pan-x pt-10 select-none"
        style={{ transform: `rotate(${REST_ANGLES[index % REST_ANGLES.length]}deg)` }}
      >
        <Clip />
        <div className="[perspective:1400px]">
          <div
            data-flipped={flipped}
            className="relative h-[30rem] w-[17.5rem] transition-transform duration-700 ease-calm [transform-style:preserve-3d] data-[flipped=true]:[transform:rotateY(180deg)] motion-reduce:transition-none"
          >
            {/* ---------------- Front: the ID badge ---------------- */}
            <div
              inert={flipped}
              className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-canvas shadow-badge [backface-visibility:hidden]"
            >
              <div aria-hidden="true" className="absolute inset-0" style={securityPrint} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light"
                style={{
                  background: "linear-gradient(115deg, transparent 32%, color-mix(in oklab, var(--theme-surface-raised) 95%, transparent) 46%, transparent 60%)",
                  backgroundSize: "260% 100%",
                  backgroundPosition: "calc(50% + var(--tilt, 0) * 9%) 0",
                }}
              />
              <div className="relative mx-auto mt-3.5 h-2.5 w-14 rounded-full bg-canvas-muted shadow-[inset_0_1px_2px_color-mix(in_oklab,var(--theme-shadow)_30%,transparent)]" />

              <div className="relative mt-4 flex items-center justify-between px-5">
                <span className="flex items-center gap-1.5">
                  <LogoMark className="size-6 text-brand" />
                  <span className="font-display text-[0.6875rem] font-medium tracking-[0.22em] text-brand">ULLIDAM</span>
                </span>
                <span className="rounded-full bg-brand px-2.5 py-1 text-[0.5625rem] font-semibold tracking-[0.18em] text-on-brand uppercase">
                  Therapist
                </span>
              </div>

              <div className="relative mx-auto mt-4 aspect-[4/5] w-[60%]">
                <div className="relative h-full w-full overflow-hidden rounded-t-full rounded-b-2xl bg-brand-mist ring-4 ring-canvas">
                  <Image
                    src={therapist.image}
                    alt={`Portrait of ${therapist.name}`}
                    fill
                    draggable={false}
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                {/* Holographic verified seal: its colours shift as the card swings. */}
                <span
                  aria-hidden="true"
                  className="absolute -right-5 -bottom-3 flex size-12 items-center justify-center rounded-full shadow-card ring-2 ring-canvas"
                  style={{
                    background:
                      "conic-gradient(from calc(var(--tilt, 0) * 14deg), var(--theme-surface-raised), var(--theme-tertiary), var(--theme-secondary), var(--theme-tertiary-soft), var(--theme-surface-raised))",
                  }}
                >
                  <ShieldCheck className="size-5 text-brand" />
                </span>
              </div>

              <div className="relative mt-4 px-5 text-center">
                <h3 className="font-display text-[1.3125rem] leading-tight text-brand">{therapist.name}</h3>
                <p className="mx-auto mt-1 line-clamp-2 max-w-[14rem] text-xs leading-snug text-ink-3">{therapist.title}</p>
                <StatusPulse
                  status={therapist.availabilityStatus}
                  label={therapist.nextAvailableText}
                  className="mt-3 text-[0.75rem] font-medium text-ink-2"
                />
              </div>

              <div className="relative mt-auto border-t border-dashed border-line-strong px-5 pt-3 pb-3.5">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-[0.625rem] leading-tight">
                    <span className="block tracking-[0.16em] text-ink-3 uppercase">Reg. no.</span>
                    <span className="mt-0.5 block font-medium text-ink-1 tabular-nums">{therapist.license}</span>
                  </p>
                  <Barcode value={therapist.license} className="h-7 w-24 text-ink-1/85" />
                </div>
                <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[0.6875rem] text-ink-3">
                  <Repeat2 className="size-3.5" />
                  <span className="hidden [@media(hover:hover)]:inline">Hover to turn over &middot; drag to swing</span>
                  <span className="[@media(hover:hover)]:hidden">Tap to turn over</span>
                </p>
              </div>

              <button
                ref={frontButton}
                type="button"
                onClick={onFrontClick}
                aria-expanded={flipped}
                aria-label={`Turn over ${therapist.name}'s card for profile, languages and booking`}
                className="absolute inset-0 rounded-[1.75rem] focus-visible:outline-offset-4"
              />
            </div>

            {/* ---------------- Back: the details ---------------- */}
            <div
              inert={!flipped}
              onKeyDown={onBackKey}
              onClick={onBackClick}
              className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] bg-brand px-5 pb-5 text-on-brand shadow-badge [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "repeating-radial-gradient(circle at 100% 100%, transparent 0 11px, color-mix(in oklab, var(--theme-on-primary) 5%, transparent) 11px 12px)",
                }}
              />
              <div className="relative mx-auto mt-3.5 h-2.5 w-14 rounded-full bg-night shadow-[inset_0_1px_2px_color-mix(in_oklab,var(--theme-shadow)_70%,transparent)]" />

              <div className="relative mt-4 flex items-center justify-between gap-3">
                <p className="font-display text-lg leading-tight">{therapist.name}</p>
                {toggled ? (
                  <button
                    ref={backButton}
                    type="button"
                    data-no-drag
                    onClick={turnBack}
                    aria-label="Turn the card back over"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-on-brand/25 text-on-brand-muted hover:text-on-brand"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                ) : null}
              </div>

              <p className="relative mt-4 text-[0.625rem] font-semibold tracking-[0.2em] text-accent-on-dark uppercase">How I work</p>
              {/* shrink-0: the quote is clamped by lines, never squeezed by the fixed card height. */}
              <p className="relative mt-2 line-clamp-5 shrink-0 font-display text-[0.875rem] leading-snug">
                &ldquo;{therapist.approach}&rdquo;
              </p>

              <ul className="relative mt-4 flex shrink-0 flex-wrap gap-1.5" aria-label="Specialties">
                {therapist.specialties.slice(0, 2).map((specialty) => (
                  <li key={specialty} className="rounded-full border border-on-brand/20 px-2.5 py-1 text-[0.6875rem] text-on-brand-muted">
                    {specialty}
                  </li>
                ))}
              </ul>
              <p className="relative mt-3 text-xs text-on-brand-muted">{therapist.languages.join(" · ")}</p>

              <div className="relative mt-auto flex items-end justify-between gap-3 border-t border-on-brand/15 pt-4">
                <p>
                  <span className="block font-display text-2xl leading-none">Video</span>
                  <span className="mt-1 block text-[0.6875rem] text-on-brand-muted">Private one-to-one session</span>
                </p>
                <StatusPulse status={therapist.availabilityStatus} className="mb-1" />
              </div>

              <div className="relative mt-4 grid gap-2">
                <a
                  href={whatsappHref(therapistRequestMessage(therapist.name))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-canvas text-sm font-medium text-brand transition-colors hover:bg-canvas-muted"
                >
                  <MessageCircle className="size-4" />
                  Request a session
                </a>
                <Link
                  href={profileHref}
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-on-brand/30 text-sm font-medium text-on-brand transition-colors hover:border-on-brand/60"
                >
                  Meet {firstName}
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Resident faculty as clinician ID badges clipped to a coir rope. Cards sway
 * on a damped pendulum, react to the cursor and to scrolling, can be dragged
 * to swing, and turn over (hover, tap or keyboard) to show session details and booking.
 * Reduced motion: still cards and an instant turn.
 */
export function IdCardRope({ therapists, highlight = null }: { therapists: Therapist[]; highlight?: TrackId | null }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<SVGPathElement>(null);
  const twistRef = useRef<SVGPathElement>(null);
  const hangEls = useRef<(HTMLDivElement | null)[]>([]);
  const swingEls = useRef<(HTMLDivElement | null)[]>([]);
  const swings = useRef<Swing[]>(
    therapists.map((_, i) => {
      const rest = REST_ANGLES[i % REST_ANGLES.length];
      return { angle: rest, vel: 0, rest, dragging: false, lastAngle: rest, lastTime: 0 };
    }),
  );
  const [edges, setEdges] = useState({ start: false, end: false });

  // One animation loop for the rope and every card; it sleeps off screen.
  useEffect(() => {
    const track = trackRef.current;
    const rope = ropeRef.current;
    const twist = twistRef.current;
    if (!track || !rope || !twist) return;

    let width = 0;
    let anchors: number[] = [];
    let sag = SAG;
    let sagVel = 0;
    let frame = 0;
    let last = 0;
    let visible = false;
    let lastScroll = window.scrollY;

    const measure = () => {
      width = track.clientWidth;
      anchors = hangEls.current.map((el) => (el && width ? (el.offsetLeft + el.offsetWidth / 2) / width : 0.5));
    };
    const render = () => {
      const d = `M0 ${ROPE_Y} Q${(width / 2).toFixed(1)} ${(ROPE_Y + 2 * sag).toFixed(2)} ${width} ${ROPE_Y}`;
      rope.setAttribute("d", d);
      twist.setAttribute("d", d);
      swings.current.forEach((s, i) => {
        const t = anchors[i] ?? 0.5;
        const hang = hangEls.current[i];
        const swingEl = swingEls.current[i];
        if (hang) hang.style.transform = `translateY(${(4 * sag * t * (1 - t)).toFixed(2)}px)`;
        if (swingEl) {
          swingEl.style.transform = `rotate(${s.angle.toFixed(3)}deg)`;
          swingEl.style.setProperty("--tilt", s.angle.toFixed(2));
        }
      });
    };
    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
      last = now;

      // Scrolling jostles the rope: it dips, and the cards swing together.
      const y = window.scrollY;
      const dy = y - lastScroll;
      lastScroll = y;
      if (dy !== 0) {
        const kick = clamp(dy * 0.05, -9, 9);
        swings.current.forEach((s) => {
          if (!s.dragging) s.vel += kick * (0.6 + Math.random() * 0.4);
        });
        sagVel += Math.min(Math.abs(dy) * 0.5, 40);
      }
      sagVel += (-SAG_STIFFNESS * (sag - SAG) - SAG_DAMPING * sagVel) * dt;
      sag += sagVel * dt;

      swings.current.forEach((s) => {
        if (s.dragging) return;
        if (Math.random() < dt * 0.3) s.vel += (Math.random() - 0.5) * 7; // a faint breeze
        s.vel += (-STIFFNESS * (s.angle - s.rest) - DAMPING * s.vel) * dt;
        s.angle += s.vel * dt;
      });
      render();
    };
    const run = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (!prefersStill() && visible && !document.hidden) frame = requestAnimationFrame(step);
    };

    const resize = new ResizeObserver(() => {
      measure();
      render();
    });
    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastScroll = window.scrollY;
      run();
    });
    resize.observe(track);
    viewport.observe(track);
    document.addEventListener("visibilitychange", run);
    measure();
    render();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      viewport.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, []);

  // Show the arrows only when the rope is wider than the screen.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const update = () =>
      setEdges({
        start: scroller.scrollLeft > 4,
        end: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4,
      });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    scroller.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", update);
    };
  }, []);

  const nudge = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: direction * 300, behavior: prefersStill() ? "auto" : "smooth" });
  };

  return (
    <div>
      <Container className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm text-ink-3">
          <Repeat2 className="size-4 text-accent" />
          <span className="hidden [@media(hover:hover)]:inline">Hover over a card to turn it over. Drag one to set it swinging.</span>
          <span className="[@media(hover:hover)]:hidden">Tap a card to turn it over. Swipe to meet everyone.</span>
        </p>
      </Container>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="snap-x snap-mandatory overflow-x-auto overscroll-x-contain pt-16 pb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div ref={trackRef} className="relative mx-auto flex w-max min-w-full justify-center gap-8 px-8 pt-5 md:gap-12 md:px-16">
            <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full overflow-visible">
              {/* A twisted lanyard cord: a base strand with a lighter twist laid over it (colours from theme.ts). */}
              <path ref={ropeRef} fill="none" stroke={theme.lanyard} strokeWidth="3.2" strokeLinecap="round" />
              <path ref={twistRef} fill="none" stroke={theme.lanyardTwist} strokeWidth="3.2" strokeDasharray="2.5 4" strokeLinecap="round" />
            </svg>
            {therapists.map((therapist, i) => (
              <div
                key={therapist.id}
                data-dimmed={highlight !== null && !therapist.trackFocus.includes(highlight)}
                className="transition-[opacity,filter] duration-500 ease-calm data-[dimmed=true]:opacity-40 data-[dimmed=true]:saturate-50"
              >
                <IdCard
                  therapist={therapist}
                  index={i}
                  swings={swings}
                  hangEls={hangEls}
                  hangRef={(el) => {
                    hangEls.current[i] = el;
                  }}
                  swingRef={(el) => {
                    swingEls.current[i] = el;
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {edges.start ? (
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Previous therapists"
            className="absolute top-1/2 left-3 z-30 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/90 text-brand shadow-card backdrop-blur-md md:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        {edges.end ? (
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="More therapists"
            className="absolute top-1/2 right-3 z-30 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/90 text-brand shadow-card backdrop-blur-md md:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
