---
name: Ullidam
description: Confidential online counselling, psychotherapy and psychiatry for Kerala and the Malayali diaspora.
colors:
  primary: "#1F3B2D"
  primary-hover: "#2F4C32"
  secondary: "#4E6B3A"
  secondary-ink: "#3B5835"
  tertiary: "#A8BD8E"
  tertiary-soft: "#DCE5D2"
  highlight: "#D7E59B"
  surface: "#F4F5EF"
  surface-muted: "#E8EEE2"
  surface-raised: "#FFFFFF"
  line: "#D7E0CA"
  line-strong: "#8FA67D"
  ink: "#17211B"
  ink-soft: "#455340"
  ink-muted: "#58674F"
  on-primary-muted: "#CFDBC1"
  night: "#101E17"
  night-soft: "#172C22"
  glow: "#E2AE5C"
  status-open: "#2E7D5B"
  status-fast: "#C27803"
  status-gone: "#858D89"
  danger: "#A4402B"
typography:
  hero:
    fontFamily: "Funnel Display, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.35rem + 4.6vw, 5.5rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.012em"
  display:
    fontFamily: "Funnel Display, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.75rem + 3.4vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Funnel Display, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 1.45rem + 1.9vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Funnel Display, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.2rem + 0.7vw, 1.75rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Funnel Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "Funnel Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Funnel Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  icon-well: "0.75rem"
  inset: "1rem"
  glass: "1.5rem"
  badge: "1.75rem"
  frame: "2rem"
  closing: "2.5rem"
  pill: "9999px"
spacing:
  gutter-sm: "20px"
  gutter-md: "32px"
  gutter-lg: "48px"
  card-sm: "32px"
  card-lg: "40px"
  grid-sm: "32px"
  grid-lg: "48px"
  section-sm: "64px"
  section-md: "96px"
  section-lg: "128px"
  section-xl: "144px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "0 32px"
    height: "56px"
  button-inverse:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "0 32px"
    height: "56px"
  button-inverse-hover:
    backgroundColor: "{colors.surface-muted}"
  button-secondary:
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  chip-filter:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  chip-filter-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  pill-badge:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  nav-link-lit:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.primary}"
  card-track:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.frame}"
    padding: "40px"
  card-trust-band:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.frame}"
    padding: "56px"
  card-film-glass:
    textColor: "{colors.ink}"
    rounded: "{rounded.glass}"
    padding: "20px"
  id-badge:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.badge}"
    width: "17.5rem"
    height: "30rem"
---

# Design System: Ullidam

## Overview

**Creative North Star: "Still Water at First Light"**

The system is Kerala Morning: deep palm shade, moss and sage leaves, a pale mist ground, and one thin line of dawn gold. It opens on "Here, Now", sharp photographs of a sunlit morning (a forest edge, grass at ground level, a dew drop), filling the whole screen, and everything after it lives on the mist ground, as if that light opened into the page. Density is low on purpose. Each screen carries one focal point, wide margins and short copy, because the reader is often anxious.

Form is soft and generous: big 2rem frames for photographs and cards, pills for every control, hairlines rather than boxes for lists. Titles are set in Funnel Display capitals, which gives the calm palette a firm, modern voice; text is Funnel Sans. Depth comes from tonal steps between mist, paper white and palm, with soft palm-tinted shadows only on things that float or hang. Dark glass appears where text sits over moving footage. A faint film grain sits over the whole page.

Motion is slow and physical. The homepage film is a scroll-scrubbed scene (GSAP and Lenis); component interactions use Motion springs; cards hang from a rope and swing like pendulums. Reduced motion is a complete version, not a degraded one: the framed still, a short paragraph, and plain lists.

Inner pages (services, therapists, diaspora, internships, awareness, portal) have not been redesigned in this world yet. They inherit these tokens through theme.ts and globals.css, but their compositions predate it.

**Key Characteristics:**
- Mist ground (surface) with palm green as the single strong colour; dawn gold only in thin accents.
- Funnel Display in capitals for hero, display and headline; sentence case for card titles.
- Rounded frames (2rem), pill buttons, pill nav and pill chips; no square corners on interactive elements.
- Dark glass only over footage; one frosted capsule header everywhere.
- Real photographs and footage, art-directed per breakpoint; no illustrations in the first viewport.
- Slow, calm easing (cubic-bezier(0.22, 1, 0.36, 1)) and springs; every motion has a reduced-motion form.

## Colors

A restrained green family on a pale mist ground, with one warm note of dawn gold. All values live in `theme.ts` (palette, then roles) and reach CSS as `--theme-*` variables; Tailwind utilities map onto them in `app/globals.css`.

### Primary
- **Palm Shade** (primary): headings, primary buttons, the dark trust band, the footer, the logo, the back of the ID badge. The one strong colour on any screen.
- **Palm Shade, Lifted** (primary-hover): hover state of primary buttons only.

### Secondary
- **Moss** (secondary): icons, the steps progress line, active step numerals, focus rings and selection tint. Passes 4.5:1 on mist, so it may carry text.
- **Deep Moss** (secondary-ink): small secondary text, such as a track card's audience line and phase labels.

### Tertiary
- **Sage** (tertiary): soft fills such as accent pills; the mid tone of the badge clip.
- **Sage Mist** (tertiary-soft): pill badges (therapy approaches) and soft wells.
- **New Leaf** (highlight): the lit fill behind dark text: icon wells in glass cards, the step icon tile, the preferred-time row, avatar initials. Too pale for lines or text.

### Neutral
- **Morning Mist** (surface): the page ground, inverse buttons, text on palm and night. Also the browser theme colour.
- **Mist, Deeper** (surface-muted): alternate sections (clinicians, triage, voices) and photo placeholders.
- **Paper** (surface-raised): cards, chips and panels that sit above the ground; the lit nav pill.
- **Hairline** (line) and **Hairline, Strong** (line-strong): card borders, list dividers, chip borders.
- **Ink** (ink), **Ink Soft** (ink-soft), **Ink Muted** (ink-muted): text from strongest to quietest. All pass AA on surface and surface-muted (15.1, 7.5 and 5.5 to 1 on mist).
- **Leaf Mist** (on-primary-muted): secondary text on palm and inside dark glass.
- **Night** (night) and **Night, Soft** (night-soft): palm mixed toward black; the darkness of film scrims, dark glass and the dark header capsule.

### Accent
- **First Light** (glow): the dawn gold. The film's progress hairline, the sun glow and bloom at the end of the film, the small dot on the sample-profiles notice. Never text, never a fill larger than a dot or a line.

### Functional
- **Open / Filling fast / Unavailable / Danger** (status-open, status-fast, status-gone, danger): availability beacons and errors only. Keep them recognisable whatever the palette.

### Named Rules
**The One File Rule.** Every colour comes from `theme.ts`. New colours are new roles there, published as `--theme-*` variables; never an inline hex in a component.

**The Thin Gold Rule.** First Light (glow) appears as lines, dots and light, never as text or a filled surface. Its rarity is what makes the dawn read.

**The Lit Leaf Rule.** New Leaf (highlight) is a fill behind palm or ink text, never a line or text colour.

## Typography

**Display Font:** Funnel Display (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Funnel Sans (with ui-sans-serif, system-ui, sans-serif)

**Character:** One variable family pair, self-hosted through next/font. Funnel Display at weight 500 in capitals gives the calm palette a confident, architectural voice; Funnel Sans keeps text plain and easy to read.

### Hierarchy
- **Hero** (500, clamp 2.5rem to 5.5rem, 0.98): uppercase. The film headline and the closing line only.
- **Display** (500, clamp 2.5rem to 4.5rem, 1.06): uppercase. The steps story heading.
- **Headline** (500, clamp 1.875rem to 3rem, 1.12): uppercase. Every section heading (through SectionIntro), the trust band's statement, and the three film lines (in sentence case).
- **Title** (500, clamp 1.375rem to 1.75rem, 1.25): sentence case. Card titles, step titles, the "first words" list.
- **Lead** (400, clamp 1.0625rem to 1.25rem, 1.7): the paragraph under a heading; held to `max-w-xl` / `max-w-2xl`.
- **Body** (400, 1rem, relaxed 1.625): card copy, answers; held to about `max-w-md` / `max-w-xl`.
- **Label** (500, 0.875rem): buttons, nav links, chips, glass-card titles. Small numerals (clocks, step numbers) use tabular figures; clock times are set in Funnel Display.

### Named Rules
**The Capitals For Headings Rule.** Hero, display and headline headings are written in sentence case in the source and set uppercase in CSS; titles and body never are.

**The Reading Width Rule.** Leads stop at `max-w-xl` to `max-w-2xl`; headings are balanced (`text-balance`) and paragraphs pretty-wrapped.

## Layout

One centred container (`max-w-6xl`, gutters 20px, 32px from 640px, 48px from 1024px). The film and header span wider (`max-w-7xl`). Sections breathe on a stepped vertical rhythm: 64px on phones, 80px, 96px from 768px, 128px from 1024px, 144px from 1280px. Neighbouring sections alternate surface and surface-muted so the padding reads as calm, not empty.

Grids are few and wide: the four tracks are two columns from 768px with 48px to 64px gaps; the trust facts are three columns from 1024px; questions and triage use an asymmetric two-column split (about 0.9 to 1.1) with the intro sticky on desktop. Card padding is 32px rising to 40px (56px on the trust band).

Scroll scenes are part of the layout. The film pins for 3.2 viewport heights (2.5 on phones). The steps story pins a 300svh track on desktop with motion, laying steps (4 columns), the photo collage (5) and the facts (3) on a 12-column grid; on phones, tablets and reduced motion it becomes a plain list. The ID-card rope scrolls horizontally with snap points. Breakpoints are Tailwind's defaults (640, 768, 1024, 1280px); photographs and footage are art-directed with a tall crop below 768px and a wide crop above.

Touch targets are at least 44px: chips and the header button are 44px tall, md buttons 48px, lg buttons 56px.

## Elevation & Depth

Mostly tonal. Depth comes from stepping mist, deeper mist, paper white and palm, with hairline borders on cards. Shadows are soft, palm-tinted (`--theme-shadow`) and appear only on things that float or hang: a card on hover, the floating flow fragment, the hanging badges, the scrolled header capsule. Over footage, dark glass (night at 52% with an 18px blur) replaces shadow. A 4.5% fractal-noise grain covers the whole page for analogue warmth.

### Shadow Vocabulary
- **Card** (`0 1px 2px shadow/5%, 0 10px 28px -18px shadow/26%`): primary buttons at rest, track cards on hover, the step icon tile.
- **Float** (`0 1px 2px shadow/9%, 0 14px 32px -12px shadow/36%`): the "Example" flow fragment beside the step photograph.
- **Badge** (`0 34px 60px -32px shadow/60%`): the hanging clinician ID cards; a long drop that reads as distance from the wall.
- **Capsule** (`0 10px 40px -18px shadow/40%` on light, `0 10px 40px -16px black/60%` on dark): the header once it gathers into a capsule.

### Named Rules
**The Glass Over Footage Rule.** Light glass (film-glass-light) is for cards sitting over moving footage. On the light page, the only frosted surface is the header capsule and the small chips laid over photographs.

**The Flat At Rest Rule.** Cards sit flat with a hairline; a shadow arrives on hover or when something genuinely floats or hangs.

## Shapes

Soft and large. Every interactive element is a full pill: buttons, nav links, the nav group, chips, the header capsule, the skip-intro button. Containers step down in radius as they nest: the film frame is a clip-path inset of 8px with a 24px radius on phones (12px and 32px from 768px) that opens to full screen as you scroll; cards and large photographs use 2rem; ID badges and list photographs 1.75rem; glass cards 1.5rem; photographs inside cards, phase tiles and the flow fragment 1rem; icon wells 0.75rem. The closing section is a 1.75rem (2.5rem from 768px) rounded panel inset from the window, echoing the opening frame. Lists divide with hairlines, never boxes. The badge portrait is an arch (fully rounded top, 1rem bottom).

## Components

### Buttons
Calm, round and solid.
- **Shape:** full pill (9999px).
- **Primary:** palm fill, mist text, card shadow; 48px tall with 24px sides (md) or 56px with 32px sides (lg). Icons 18px after the label.
- **Hover / Focus:** lifts 1px and shifts to primary-hover over 300ms on the calm ease; press scales to 0.97 for 100ms. Focus shows a 2px moss outline offset 3px.
- **Inverse:** mist fill, palm text; the main action over the film and on the dark header.
- **Outline light:** a glassy outline for dark scenes (mist border at 30%, night at 25%, 12px blur).
- **Secondary:** palm text inside a palm hairline at 20%, filling with sage mist on hover. **Quiet:** text only, sage mist on hover.

### Chips
- **Style:** filter chips are 44px pills, paper fill, strong hairline, ink-soft label.
- **State:** pressed chips turn palm with mist text (`aria-pressed`); unmatched ID cards dim.
- **Pill badges:** non-interactive pills (sage mist or deeper mist, 6px by 14px padding) for approaches and focus areas.

### Cards / Containers
- **Corner Style:** 2rem.
- **Background:** paper on the mist ground; the trust band is palm with mist text, paired edge to edge with a photograph.
- **Shadow Strategy:** flat with a hairline at rest; card shadow and a 2px lift on hover (track cards).
- **Border:** 1px hairline, strengthening on hover.
- **Internal Padding:** 32px, 40px from 768px; track cards 28px rising to 40px.
- **Track card:** a 16:9 photograph (1rem radius) with a frosted icon well top left and a "Track A" pill bottom right; title, deep-moss audience line, summary; phase tiles or pill badges; a stretched "Explore" link makes the whole card the target, its arrow sliding 4px on hover.

### Navigation
- **Header:** fixed, three parts (logo, centred link group, Book button). At the top of a page they float apart; once scrolled they gather into one frosted pill capsule (`max-w-5xl`, 24px blur). Tone follows the section beneath (`data-header-tone`): dark glass with white text over the film, mist glass with ink text elsewhere. It hides on scroll down and returns on scroll up, unless the section asks it to stay (`data-header-stay`).
- **Links:** 40px pills, 14px medium. A white pill slides between the hovered or current link (Motion `layoutId`, springSnappy); the lit link turns palm.
- **Mobile:** links collapse into a menu below 1024px; the button shortens to "Book".

### The Film Frame (signature)
Three sharp 3000 px photographs (Pexels 37183183 forest edge in morning sun, 16630712 grass at ground level with the sun rising between trees, 2957860 dew on grass), never compressed video, filling the screen edge to edge with the header floating over it (dark tone: white logo, translucent white glass nav). The landing is minimal: a capitals headline in light text at the bottom left, a Book a session button and one line, over soft deep-green shades only at the top (header) and foot (headline) (film-shade). Scroll moves a camera down to the present moment: a push and tilt toward the grass, a lowering to ground level (focus pull, blur to sharp), a focus pull onto one dew drop, one short centred line per photograph (light over the forest and grass, dark over the dew), then the light (film-light) opens into the page ground. Reduced motion: the still and the lines as one sentence.

### The Steps Collage (signature)
Three steps on the left with a 2px line that fills in moss as you read; the current step brightens and gets `aria-current`. In the centre, a 4:5 photograph in a 2rem frame cross-fades per step, with a New Leaf icon tile overlapping its left edge and a paper "Example" fragment of the real flow floating off its lower right (float shadow). Facts and the clinician button sit on the right.

### The ID-Card Rope (signature)
Clinician badges (17.5rem by 30rem, 1.75rem radius, badge shadow) hang from a sagging coir rope on theme-coloured metal clips, each a damped pendulum resting a few degrees off straight. They can be dragged to swing and turned over (a 700ms 3D flip) to a palm back with how the clinician works. The front carries a faint security print, an arched portrait, the registration number and a barcode drawn from it.

## Do's and Don'ts

### Do:
- **Do** take every colour from a `theme.ts` role; add a role there before using a new colour.
- **Do** set hero, display and headline headings in Funnel Display capitals at weight 500, and card titles in sentence case.
- **Do** make every control a pill at least 44px tall (buttons 48px or 56px).
- **Do** keep the opening minimal and the photograph sharp: one headline, one line, one action, and a shade only where text sits.
- **Do** use `cubic-bezier(0.22, 1, 0.36, 1)` for CSS transitions and springCalm, springSnappy or springCinematic for Motion; keep GSAP and Lenis for scroll-scrubbed scenes.
- **Do** give every animation a complete reduced-motion form (Motion through `<MotionProvider reducedMotion="user">`, GSAP through `MOTION_OK`).
- **Do** use lucide-react icons at strokeWidth 1.5, in moss on light ground and new-leaf on palm.
- **Do** alternate surface and surface-muted between neighbouring sections.

### Don't:
- **Don't** use First Light (glow) as text or as a filled surface.
- **Don't** put a dark wash over the footage; the film stays light.
- **Don't** use emojis, star ratings, prices or currency anywhere.
- **Don't** add small uppercase kicker or eyebrow lines above section headings; the heading stands alone.
- **Don't** nest cards in cards or build identical icon, title and text card grids.
- **Don't** use gradient text, purple or blue gradients, or glowing blobs; gradients are for scrims and light over footage only.
- **Don't** place text over a face in a photograph.
