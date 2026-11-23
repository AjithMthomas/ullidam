# ULLIDAM — The Space Within

Online counselling, psychotherapy and psychiatric care for adults and couples in Kerala and the Malayali diaspora. The full blueprint lives in [CLAUDE_MASTER_SPECIFICATION.md](./CLAUDE_MASTER_SPECIFICATION.md); working rules in [CLAUDE.md](./CLAUDE.md).

**Status:** Phases 1 (foundations) and 2 (cinematic homepage, triage, faculty, therapist profiles) complete. Phase 3 adds the live slot matrix and dual-slot WhatsApp dispatch; Phase 4 the Google Sheets engine and counsellor portal.

The homepage story, every scene and every motion decision are scripted in [docs/cinematic-script.md](./docs/cinematic-script.md). Read it before changing anything cinematic.

## Stack

- Next.js 16.4 (App Router, Turbopack, Cache Components, typed routes), React 19.3, TypeScript `strict`
- Tailwind CSS 4.3, configured CSS-first in `app/globals.css` (no `tailwind.config.js`)
- GSAP 3.15 with ScrollTrigger (homepage scroll story only) and Lenis 1.3 (smooth scrolling everywhere)
- `next/font`: Fraunces, Plus Jakarta Sans, Manjari and Gayathri, all self-hosted
- `lucide-react` icons; `clsx` and `tailwind-merge` for class composition

## How the visuals work

- **One world, many hours.** `components/scene/MonsoonScene.tsx` draws the backwater (hills, palms, a lamp-lit boat) from a fixed seed, in five palettes: dusk, night, dawn, day and evening. Its geometry is sent once per visit by `<SceneSprite />` in the root layout; each scene recolours it with `<use>`. No photos or video are used for scenery.
- **Live, zero-download effects.** Rain is a canvas (`RainCanvas.tsx`); the rain *sound* is synthesised with the Web Audio API (`lib/soundscape.ts`) and never autoplays.
- **Three kinds of motion.** Above-the-fold entrances are pure CSS (nothing waits on JavaScript). Section reveals and the journey line use CSS scroll-driven animations. Only the pinned threshold story and hero parallax use GSAP.
- **Reduced motion is a complete version.** Lenis switches off, the threshold renders as three stacked panels, rain stops, and every animation is still.
- **Privacy.** Preferences (display currency) live in `lib/vault.ts` (localStorage only). Triage answers are never stored or sent.

> Next.js 16 differs from older versions. Before writing Next.js code, read the version-matched guides in `node_modules/next/dist/docs/` (see [AGENTS.md](./AGENTS.md)).

## Theming: one file

Every colour on the site comes from [theme.ts](./theme.ts). To retheme, edit it; nothing else.

1. **Palette:** the raw colours (currently navy, teal, sky blue, beige and white, plus the warm lamplight used only inside the illustrated scenes, and the functional status colours).
2. **Roles:** which colour does which job: `primary`, `secondary`, `tertiary`, `surface`, `ink` and so on. Shades such as hover states and the cinematic night are mixed from the palette automatically.

From there, `<style id="ullidam-theme">` in the root layout publishes each role as a CSS variable (`--theme-primary`...), `app/globals.css` maps Tailwind utilities onto them, and the scenes, rain, badges, favicon (`app/icon.tsx`) and browser address-bar colour read the same values. Use the role names in new code (`bg-primary`, `text-secondary`, `bg-surface-muted`); the older names (`brand`, `accent`, `canvas`, `ink-1`) are aliases of the same roles.

After changing a role, check contrast: body text needs 4.5:1 against `surface` and `surfaceMuted`. The `/design-system` page shows every role with its live ratio.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server at http://localhost:3000 |
| `npm run build` | Zero-Emoji guard, then production build. This is what Vercel runs. |
| `npm start` | Serve the production build |
| `npm run typecheck` | Generate route types, then `tsc --noEmit` |
| `npm run lint` | ESLint, failing on any warning |
| `npm run check:emoji` | Zero-Emoji guard on its own |
| `npm run verify` | All of the above, in order. Run before every push. |

`npx tsc --noEmit` on its own also works once route types exist (after any `dev`, `build` or `typecheck` run).

## Project structure

```
app/                  Routes. Every page is statically prerendered.
  globals.css         Design tokens (@theme), base styles, keyframes
  layout.tsx          Fonts, metadata, smooth scroll, Header, Footer
  design-system/      Living style guide (hidden on production deployments)
  therapists/[slug]/  60/40 profile with the sticky booking station
components/
  ui/                 Primitives: Button, StatusPulse, Pill, IconDefaults
  layout/             Container, Section, Header (hides on scroll), MobileMenu, Footer, CrisisRibbon
  sections/           Page building blocks: PageHero, TrackGrid, TrackPage, FeatureGrid, ClosingCta
  home/               Homepage acts: Hero, TriageSection, FacultySection, Journey, TrustBento, VoicesAndFaq, ClosingDawn
  cinematic/          Threshold (pinned story), TherapistCard (3D tilt), FacultyGrid, BookingCard
  scene/              MonsoonScene + SceneSprite, RainCanvas
  triage/             TriageWidget (three questions, safety branch)
  motion/, audio/     SmoothScroll (Lenis), SoundscapeButton
data/                 Hot-swappable content: site-config, services, therapists, pricing, faq
docs/                 cinematic-script.md (the storyboard)
lib/                  cn, format, whatsapp, color, gsap, smooth, vault, region, soundscape, random
scripts/              check-zero-emoji.mjs
```

## Design rules the code enforces

- **Zero-Emoji Standard.** `scripts/check-zero-emoji.mjs` scans every text file and fails the build on any emoji, flag, keycap or emoji-style glyph (stars, check marks, filled dots). Malayalam, including its joiner characters, passes. `CLAUDE.md` is the only exempt file, because it quotes banned emoji as examples.
- **Icons.** Every lucide icon inherits `strokeWidth={1.5}` from `components/ui/IconDefaults.tsx`. Icons are decorative (`aria-hidden`) unless given a label.
- **Ratings and status.** Ratings are typographic (`4.97 / 5.0`). Availability uses `<StatusPulse status="open" | "fast" | "gone" />`, which stops pulsing for reduced-motion users.
- **Palette.** Tailwind's default colours are removed, so only the clinical tokens exist. Contrast ratios are documented in `globals.css` and shown live on `/design-system`. The spec's accent `#C27803` is 3.3:1 on canvas, so it is used only for large numerals, beacons and focus rings; small accent text uses `accent-ink` (`#8F5704`, 5.7:1).
- **Spacing.** `<Section>` applies the spec's rhythm (py-16 on phones up to py-36 on wide screens). Cards use `p-8 md:p-10 lg:p-12`, grids `gap-8 md:gap-12 lg:gap-16`, and text stays within `max-w-2xl`.
- **Links.** `typedRoutes` is on, so a link to a page that does not exist is a type error.

## Content and data

All dummy content is isolated in `data/` (spec Rule 7). Fees live in named tiers in `data/pricing.ts`, which therapists reference, and headline figures on the homepage (average rating, starting fee, therapists accepting clients) are computed from `data/therapists.ts`.

**Before launch, the practice must verify** the crisis helplines in `data/site-config.ts` (`CRISIS_LINES`), replace the placeholder therapists, credentials and photographs, and approve all clinical copy, including the triage wording in `components/triage/TriageWidget.tsx`.

The "Voices you may recognise" lines in `data/faq.ts` are common first-session reflections, **not testimonials**. Never present them as client reviews; Indian medical conduct rules restrict testimonial advertising.

## Environment variables

Copy `.env.example` to `.env.local`. On Vercel, set the same keys under Project Settings > Environment Variables. Phase 1 only reads the three `NEXT_PUBLIC_*` values, and each has a safe default. The Google Sheets and portal secrets are used from Phase 3 onward. Generate `COUNSELLOR_PORTAL_SECRET` randomly; never reuse the example value from the specification.

## Deploying to Vercel

1. Push the repository to GitHub, GitLab or Bitbucket and import it in Vercel. The Next.js preset needs no changes; Vercel runs `npm run build`, which includes the Zero-Emoji guard.
2. Add the environment variables above.
3. `/design-system` is available on local and preview deployments, and returns 404 on production (`VERCEL_ENV=production`).
4. When Phase 3 adds API routes, consider setting the function region to Mumbai (`bom1`) for lower latency to Kerala.
