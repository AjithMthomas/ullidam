# Homepage redesign: "Kerala Morning"

Status: APPROVED by the user on 2026-11-23 (after the fresh review in section 11). Decisions: Charter dropped from the homepage; session length varies by service, so no "50 minutes" claim anywhere.

## 1. Goal

Replace the homepage's look and opening. A first-time visitor (often anxious, possibly abroad) should feel calm within seconds, understand that Ullidam is confidential online counselling, and see how to book in three steps. The page must look premium and made for a counselling practice, not a jewellery or generic wellness brand.

Not in scope now: inner pages (they follow once the homepage is approved), the booking engine, the Sheets backend, the portal.

## 2. Pinned by the user (overrides the skills)

- **Reference image** (sunlit green nature, framed hero, header inside the frame, uppercase sans headline, small glass cards, then a "3 steps" section with a photo collage and a numbered list). "The scrolling cinematic animation should start from some view like this." "The header also looks great, you may copy the same." "Below that there is 3 step, you may use the same layouting."
- **Film scene:** Kerala backwaters at dawn, real footage, plays as you scroll, calm and realistic.
- **Order:** film, then the three booking steps told as a story with images, then the Resident Faculty (keep the hanging ID cards, may add elements), then trust sections.
- **No reviews:** no testimonials or invented ratings. Trust comes from real signals and from "what people often tell us" reflections, labelled as such.
- **Standing rules:** no prices, English-only copy, Zero-Emoji, colours only through `theme.ts`, every animation respects reduced motion.

Impeccable's direction roll is skipped because the direction is pinned (`seed: none (pinned)`).

## 3. The world

**Kerala Morning.** Still backwater, palm shade, first light, wet green. The page lives in the colours of that footage: deep palm green, moss, sage, a pale new-leaf lime for highlights, a thin line of dawn gold, and a soft morning-mist white ground.

Skill inputs and how they were resolved:

| Skill | Suggested | Decision |
| --- | --- | --- |
| UI/UX Pro Max | Lavender/violet palette, Lora + Raleway, neumorphism | Rejected: violet is banned (our rules and Taste), neumorphism fails contrast. Kept its checklist (contrast, 44px targets, reduced motion, cursor and focus states). |
| Taste Skill | Clinic palettes (white + blue), Lora / Nunito or Instrument Sans | Palette: user's reference wins (Taste allows the client's own colours via `brand`). Type: its neo-grotesk lane, without its overused face. Kept its rules: real photographs, no captions, one section per screen, hover zoom 1.02-1.03, no invented reviews. |
| Impeccable | Avoid reflex faces (Fraunces, Plus Jakarta Sans, Instrument Sans...), no eyebrow labels, glass only as a specific effect, one authored motion moment | Applied: new faces, eyebrows removed except the one the reference shows, glass only where it sits over the film, the film is the one big motion moment. |

### Palette (proposal; goes into `theme.ts` roles)

| Name | Hex | Role |
| --- | --- | --- |
| Palm | `#1F3B2D` | primary: headings, primary buttons, dark bands |
| Moss | `#4E6B3A` | secondary: links, icons, active states |
| Sage | `#A8BD8E` | tertiary: soft fills, dividers on dark |
| New leaf | `#D7E59B` | highlight: active nav pill, step progress, chips |
| Dawn | `#E2AE5C` | thin accents only (sun, progress tick), never text |
| Mist | `#F4F5EF` | page ground |
| Paper | `#FFFFFF` | cards, raised surfaces |
| Ink | `#17211B` | body text |
| Ink soft | `#4A564D` | secondary text |
| Night | `#0F1A14` | scrims over video |

Contrast targets: Ink and Ink soft on Mist and Paper at least 7:1 and 4.5:1; white on Palm at least 10:1. Status colours stay as they are.

### Type

- **Display:** Funnel Display, weight 500, tracking about -1%. Hero and section titles are written in sentence case in the source and set in capitals with CSS `text-transform` (screen readers read words, not letters). Smaller headings stay sentence case.
- **Text:** Funnel Sans, 400 / 500. Both are variable and available in `next/font/google` (checked against Next 16.4's font data), self-hosted, with fallback metrics to avoid layout shift.
- Replaces Fraunces and Plus Jakarta Sans site-wide. The `font-serif` token (63 uses) is renamed `--font-display` so inner pages switch cleanly; inner pages are screenshotted after the swap and get their own redesign later.

### Shape and material

Large rounded frames (`2rem`), pill buttons and pill nav, hairline borders. Glass (blur over the film) only on the header and the small hero cards that sit over moving video. Elsewhere: flat Mist and Paper grounds, one dark Palm band.

## 4. Sections, in order

### 4.1 Header (all pages)

As in the reference: logo left; a centred pill group of links with the active one in a **white** pill (Palm text); "Book a session" as a dark pill on the right; the rain soundscape toggle stays beside it. It is the one global fixed header, aligned to sit inside the film frame's inset on the homepage, not a separate copy. On the homepage no link is active; the white pill appears behind a link on hover and slides between links. Over the film: dark glass (Night at least 45% plus blur) with white text. Over light sections: light glass with Palm text. Hides on scroll down and returns on scroll up, except during the film, where it stays visible. Phones (down to 320px): logo, a short "Book" pill, menu button.

### 4.2 The film (pinned, about 3 screens)

> **Current (2026-11-23): "Here, Now"**. The user judged "Into the Light" (forest edge + dew) far better than "Unfolding" (fern) and asked for a new concept in that quality. The camera comes down from the wide morning view to the present moment, like grounding in therapy: forest edge (Pexels 37183183; tilt down, "Slow down for a moment."), ground level with the sun rising between trees (Pexels 16630712; "Come back to where you are."), a single dew drop (Pexels 2957860; "This is your space within."), then the light opens into the page. Full screen, minimal landing (headline, one button, one line).

> **Current (2026-11-23): "Unfolding"**. The user liked the quality of "Into the Light" (full screen, sharp photos, slow camera, minimal text) and asked for a better concept. Three sharp 3000 px macro photographs of a fern opening (Pexels 5180027 curled shoot, mirrored; 16627816 half-unfurled; 18044145 open fronds; `public/photos/hero-fern-*`). Full screen from the start. Landing: headline, one button, one line in the clear space beside the spiral. Scroll: push into the spiral ("It’s okay to start small."), focus pull onto the half-open frond ("Open up at your own pace."), the camera eases back as the fronds open ("Grow into yourself again."), then the light opens into the page.

> **Current (2026-11-23): "Into the Light"**, after "Into the Green" was judged unclear and too busy. Two sharp 3000 px photographs instead of compressed video (Pexels 37183183 sunlit forest edge, 2957860 dew on grass; `public/photos/hero-*`). The landing holds only the header, one headline, one button and one line. Scroll: a slow push toward the morning light, a soft focus pull onto the dew, then the light opens into the page; one short line per moment.

> **Current (2026-11-23): "Into the Green"**, built on the reference image's composition after "Still Water" was rejected ("build something like the reference"). Background: Pexels video 5692315 (misty forest, sunbeams; `public/film/forest-*`). Foreground: Pexels photo 34041307 (moss ridge, `public/photos/hero-moss.jpg`). First view: capitals headline centred at the top in light text, hairline callouts with dots in the moss for the four kinds of care, a glass pill ("Private and confidential. No account needed." + Book a session), glass cards on the corners. Scroll: 2.5D camera (moss slides past and softens, forest pushes in), lines "Step out of the noise for a while.", "Breathe the quiet. Let the light in.", "This is your space within.", then the light opens into the page.

> **Current (2026-11-23): "Still Water"** replaces "One Slow Breath" (judged not good enough). Footage: Pexels 7565821 (landscape) and 7565440 (portrait), graded toward sage and mist (files `public/film/water-*`). First view as in the reference: centred headline above pale water, four hairline-labelled links to the kinds of care, actions at the foot, glass cards on the corners. Scroll: drop after drop ("Some days, it’s one thing after another."), rings widening ("Give it a little time, and a little care…"), then perfect stillness ("…and the water settles. Everything becomes clear.") that becomes the page ground. No people, no places.

> **Revised 2026-11-23: "One Slow Breath" replaces the Kerala dawn footage** (the user found it felt like tourism). Footage: Pexels video 6246037, first 3.6 s: a woman by a window, eyes closed, then she opens her eyes, settled (files `public/film/breath-*`). Light treatment: dark text on a soft mist fade. On scroll the frame opens and a ring guides one breath ("Let’s take one slow breath together", then Breathe in, Hold, Breathe out); her eyes open as the breath ends with "When you’re ready, we’re here."; the light then opens from her face into the page. The Kerala-specific notes below are kept for history.


- **First view (the reference's composition):** the footage sits inside a rounded frame inset from the window edges, header inside it at the top. Headline across the frame, set in capitals: "A calm space for your mind." One line below that also serves search: "Confidential online counselling, psychotherapy and psychiatric care, for Kerala and Malayalis worldwide." Primary button "Book a session", secondary "Meet our clinicians". Two small glass cards on the lower corners, both true facts:
  - left: "Your time and ours", a clock pair (visitor local + IST), rendered in the browser only (the server cannot know the visitor's zone); one clock when the visitor is in IST; no live-region announcements;
  - right: "Confidential one-to-one video sessions", with a lock icon.
- **Legibility over video:** a Night scrim (at least 35%, stronger behind the headline) and dark glass cards (Night at least 45%, white text). Contrast is checked on sampled frames from the encoded clip, not assumed.
- **On scroll:** the frame grows to full screen, the headline and cards drift up and fade (and become inert, so keyboard focus cannot land on hidden buttons), and the footage moves from the sunlit palm-lined shore, across open still water, to the sun rising behind palm fronds. Three short lines appear one at a time near the bottom of the frame, over the scrim:
  1. "Breathe out. You're somewhere quiet now."
  2. "Whatever you're carrying, you can set it down here."
  3. "When you're ready, we're here."
  All three lines are always in the DOM in reading order; only their visibility animates.
- **Exit:** line 3 fades out first; then the sunrise blooms into the Mist ground, carrying the reader into the three steps. While the frame shows video the section's `data-header-tone` is "dark"; the film sets it to "light" from its own progress once the bloom passes halfway (the header reads the element under it, so the film must update its own attribute).
- **Skip:** the first focusable control after the header; it calls Lenis's `scrollTo` (not `window.scrollTo`, which fights Lenis).
- **Footage:** Pexels 6203545 ("River in Kerala, India", 13 s, 1920x1080, Pexels licence). **Reversed at encode time** with ffmpeg so scrolling down plays the file forwards (backward seeking in H.264 stutters). Keyframe every 10 frames, no B-frames, no audio. Wide 1600x900 at 20 fps for desktop (about 5 MB; water and palm movement does not compress smaller without visible loss), tall 608x1080 crop for phones (about 2.5 MB). If scrubbing still stutters on a device, fall back to crossfading four poster frames keyed to scroll progress.
- **When video is not used:** reduced motion, Save-Data on, a slow connection, or iOS Low Power Mode (detected when the priming `play()` is refused). In all of these the posters carry the story.

### 4.3 Three steps to your first session (pinned story, about 3 screens)

Reference layout: small pill label "How it works" (the one eyebrow kept, as pinned), uppercase title "THREE STEPS TO YOUR FIRST SESSION", then a two-column stage:

- **Left:** the numbered list. As you scroll, the current step turns Palm and medium weight, gets `aria-current="step"`, and a Moss line (not New leaf or Dawn, which are too faint on Mist) fills beside it. All step text is in the DOM in reading order at all times. Copy matches today's flow:
  1. Choose your clinician: browse our clinicians, or let our coordinator suggest the right person.
  2. Share two times: tell our coordinator a preferred time and a backup, in your own time zone.
  3. Confirm on WhatsApp: the coordinator confirms one and a private video link follows.
- **Right:** a photo collage in fixed aspect boxes (no layout shift) that changes with each step (crossfade and a gentle 1.03 scale), each with one small fragment drawn in code and marked "Example":
  1. Woman browsing her phone in a chair (Pexels 4307697) + a mini clinician card (placeholder clinician's name and track; no availability dot until live slots exist).
  2. A hand marking a calendar (Pexels 5408684) + two example notes "Preferred" and "Backup".
  3. A woman smiling at her phone (Pexels 27176011) + a plain chat bubble from "Ullidam coordinator" (no WhatsApp logo or styling).
- **Fact row** (the reference's stats row, true facts only): "No account needed", "Private video sessions", "Malayalam and English".
- Button: "Find your clinician".

### 4.4 Resident Faculty (kept)

The hanging ID-card rope stays as it is, re-coloured by the new tokens. Additions: a one-line intro ("Every clinician works in Malayalam and English"; no other languages are claimed, since those come from placeholder data); a "Not sure who to choose? We'll match you" pill linking to WhatsApp; the four track names as small filter chips that highlight the matching cards. The clinicians themselves remain placeholders until the practice supplies its real team. The current hero's "4.98 / 5.0 from 1,555+ rated sessions" and "N therapists accepting new clients" lines are deleted (placeholder figures).

### 4.5 Four tracks of care

The four track cards with their photos, in the new style (uppercase card titles, flat Paper cards, hover lift 2px, photo zoom 1.03).

### 4.6 Not sure where to start? (triage)

The existing three-question triage, restyled. Its safety branch stays exactly as it is.

### 4.7 Why people trust Ullidam (no reviews)

- A dark Palm band: "No waiting rooms. No logins. No one else needs to know." with the chair-by-the-window photo.
- Three plain facts in a row: registered clinicians (wording to be confirmed by the practice); evidence-informed therapies, listed statically and limited to the charter's modalities (CBT, ACT, EFT, Gottman Method), with no auto-scrolling marquee; sessions in your time zone (clocks).

### 4.8 What people often tell us + FAQ

The existing first-session reflections, clearly titled "What people often tell us in a first session" and footnoted "Shared to help you feel less alone. These are not reviews." Then the FAQ accordion.

### 4.9 Closing

The Kerala backwaters photograph, "Whenever you're ready, we're here.", the WhatsApp button and "Meet our clinicians". The Charter (six objectives) is dropped from the homepage (user decision); it lives on inner pages.

## 5. Motion and micro-interactions

- **One big moment:** the film (GSAP ScrollTrigger + Lenis, scrubbed video). **One smaller story:** the three steps (pinned, steps advance with scroll).
- **Two pins, one engine:** Lenis is driven from `gsap.ticker` (`autoRaf: false`, `lagSmoothing(0)`); the film's trigger is created before the steps' trigger (`refreshPriority`), and `ScrollTrigger.refresh()` runs after `document.fonts.ready` and the posters load.
- **Micro-interactions (Motion, `lib/motion.ts` springs):** buttons press to 0.97 and spring back (`springSnappy`); linked cards lift 2px; photos zoom 1.03 inside their frame; the active nav pill slides between links (shared layout); FAQ items open with a spring; chips and links underline-draw; the WhatsApp bubble types in once when step 3 becomes active.
- No scroll-jacking beyond the two pinned sections. Nothing tilts. No card fades in on every section.

## 6. States and edge cases

- **Loading:** posters render immediately (server-rendered `<picture>`); video loads after first paint; if it never loads, the scroll story still works over the poster.
- **Reduced motion:** no pinning, no video. The hero shows the dawn poster with the headline; the three lines show as one quiet paragraph; the steps show as a static list with all three photos; springs off.
- **Phones:** tall crop, shorter pin (about 2.5 screens), cards stack under the headline, steps become a vertical story with the photo above each step.
- **iOS:** videos primed on first touch so scrubbed frames paint (existing technique).
- **Resize and rotation:** pins and crops recalculate; posters swap by media query.
- **Back navigation:** returning to the homepage may land at the top of the film rather than mid-film (pin spacers are rebuilt after the browser restores scroll); accepted. There is never a blank frame, because a poster is always behind the video.
- **LCP:** the first poster is served through `next/image` (AVIF/WebP) with high fetch priority.
- **No JavaScript:** all content visible in reading order.
- **Header over video:** dark glass with white text, keeping 4.5:1 over the brightest frame (scrim under the header area).
- **Very wide screens:** 1080p footage upscaled; a light grain and scrim hide softness.

## 7. Performance budget

Film: desktop about 5 MB (1600x900, 20 fps), phone about 2.5 MB, no audio, loaded only after first paint and skipped on Save-Data or slow connections. Photos through `next/image` (AVIF/WebP). Two variable font families. GSAP only on the homepage. Lighthouse performance 85+ on mobile.

## 8. Acceptance checks

1. First view matches the reference's composition: framed footage, header inside, uppercase headline, two glass cards, primary action visible without scrolling at 1440x900 and 390x844.
2. Scrolling plays the Kerala footage smoothly in reverse and ends in light; Skip works.
3. Three steps advance with scroll, each with its own photo and fragment; reduced motion shows all three.
4. Faculty ID cards behave exactly as before, in the new colours.
5. No reviews, ratings presented as reviews, prices, Malayalam script or emoji anywhere.
6. Text contrast 4.5:1 or better everywhere, including over video; touch targets 44px.
7. `npm run verify` passes; Impeccable's design hook reports nothing material.
8. Impeccable finish review run on desktop and mobile captures; DESIGN.md written from the result.

## 9. Assets

| Use | Source |
| --- | --- |
| Film | Pexels video 6203545 |
| Step 1 | Pexels photo 4307697 |
| Step 2 | Pexels photo 5408684 |
| Step 3 | Pexels photo 27176011 |
| Trust band, closing, track cards | already in `data/photos.ts` |

All Pexels licence (free commercial use, no attribution). They are stand-ins until the practice has its own photography and footage.

## 10. Open questions for the user

1. Charter (six objectives) on the homepage: compact strip, or drop it from the homepage?
2. "Registered clinicians" wording in the trust row needs the practice's real registrations before launch.
3. The site says every session is 50 minutes. Confirm that holds for psychiatry and couples sessions too.

## 11. Fresh review: what changed

A reviewer with no context checked this spec against PRODUCT.md, CLAUDE.md and the code. All eight must-fix findings are resolved above:

1. Reverse playback: the clip is reversed at encode time, keyframes every 10 frames, poster fallback.
2. Step 2 no longer describes a slot picker that does not exist.
3. Facts from placeholder data removed: no clinician count, no extra languages, no availability dot, and the hero's placeholder rating and "accepting" lines are deleted.
4. Modalities limited to the charter's four, shown statically.
5. Contrast over video: minimum scrim and glass opacities, line 3 ends before the bloom, checked on sampled frames.
6. Header tone inside the film is set from the film's own progress.
7. Active nav pill is white; the step indicator uses Moss plus weight and `aria-current`, not colour alone.
8. Two pins: creation order, refresh timing, Lenis on the GSAP ticker, Skip uses Lenis.

Also adopted: inert faded controls, DOM-order text, Skip early in tab order, browser-only clocks, CSS capitals, the `--font-display` token rename, Save-Data and Low Power Mode fallbacks, LCP and layout-shift measures, a true fact row, header behaviour at 320px and during the film, and search-friendly wording under the headline.
