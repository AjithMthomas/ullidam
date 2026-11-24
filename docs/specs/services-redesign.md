# Spec: `/services` redesign: every service in its place

Status: requested by the user ("plan and redesign", 2026-11-24). Fresh review runs in parallel with the build (CLAUDE.md section 9).

## Goal
Present all of Ullidam's care so a first-time visitor understands three things:
1. **What each service is.** Counselling, psychotherapy and psychiatry are different, and most people don't know how.
2. **Who each service is for.** The four tracks and their audiences.
3. **Why it matters**, and how to begin.

The page also shows the whole charter: the six objectives, including the three programmes beyond the therapy room (awareness, internship and training, community outreach).

Sources: the user's charter text, sections 1 and 2 (the six objectives; tracks A to D and their target populations), and `data/services.ts`.

## Page flow (mobile first; each block one idea, short copy)

1. **Hero (compact, the first screen shows the tracks).**
   - Headline: "Care for whatever you are carrying."
   - Lead: "Counselling, psychotherapy and psychiatric care for adults and couples. Online, private, in Malayalam and English, by video or audio call."
   - Four quick-jump chips: A Individual, B Psychiatric, C Couples, D Divorce. These are anchors to the chapters.
   - A secondary line: "Not sure where you fit? Our coordinator will guide you" (WhatsApp).
2. **"Three kinds of care, explained."** Plain-language differences:
   - **Counselling:** talk through what is happening now; find clarity and ways to cope.
   - **Psychotherapy:** deeper, structured work on long-standing patterns, using approaches such as CBT, ACT, EFT and the Gottman Method.
   - **Psychiatric care:** a medical doctor; assessment, diagnosis, medication when needed, and follow-up. It often works alongside therapy.

   Each gets a "Often helps when…" line. The section ends with "You don't have to choose correctly. We'll help you start in the right place."
3. **The four tracks as chapters** (A to D, charter order), each in its own section with an anchor id:
   - Letter and name; who it is for (the charter's target population); a photo.
   - "What you might be facing": three to five focus areas.
   - "What we offer": the track's offerings, titles only.
   - **Track D:** the three phases (before, during and after divorce) as a small sequence.
   - **Actions:** "Explore Track X" (the track page) and "Ask about this track" (WhatsApp, neutral opener).
   - **Layout:** photo and text alternate sides on desktop and stack on phones. Each chapter fits about one screen on desktop.
   - **Track B note:** "Medication, if needed, is prescribed and reviewed by a psychiatrist."
4. **"Beyond the therapy room."** The other three charter objectives, as typographic rows (not icon cards). Each has a one-line description and a link:
   - Mental health awareness: workshops, seminars, psychoeducation. Links to `/awareness`.
   - Internship and training: for psychology students and early-career professionals. Links to `/internships`.
   - Community outreach: mental health literacy, less stigma, wider access. Links to `/awareness`.
5. **"Good to know"** (four short facts, no claims beyond the charter):
   - Adults 18 and over
   - Video or audio call
   - Malayalam, English or a mix
   - Confidential; no clinic visit
6. **Closing:** "Not sure where to begin?" with the WhatsApp coordinator action (existing `ClosingCta`).

## States
- The page is static server-rendered content with no loading or error states.
- Anchor jumps land below the fixed header (`scroll-mt`).
- Under reduced motion there are no reveal animations; content is visible.

## Rules
- Zero-Price; Zero-Emoji (lucide only); English-only.
- No invented claims or testimonials; psychiatric copy stays factual.
- Colours only from `theme.ts`; touch targets of at least 44 px; text AA or better.
- Mobile checked at 390 x 844 with no horizontal overflow; desktop at 1440 x 900.
- Banned patterns: identical icon-card grids, gradient blobs, nested cards.

## Acceptance
1. All six objectives and all four tracks appear, with the charter's audiences.
2. The chips jump to each chapter; each chapter links to its track page.
3. No horizontal overflow at 390 px; the hero's chips are visible on the first phone screen.
4. Type check, lint and build pass; phone and desktop screenshots reviewed.
