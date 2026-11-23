# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Adults aged 18 and above who need psychological or psychiatric support, served equally (no single primary audience):

- **Adults in Kerala** seeking private counselling, often for the first time, and often held back by stigma ("What will people think?"). Concerns: anxiety, depression, burnout, trauma, life transitions.
- **The Malayali diaspora** in the Gulf, UK and US, who want a Malayalam-speaking therapist from home, in their own time zone.
- **People needing psychiatric care**: consultation and assistance, evaluation, medication management and follow-up.
- **Couples**: premarital, marital and relationship counselling.
- **People facing divorce**: before (clarity and discernment), during (legal stress, co-parenting) and after (rebuilding identity and self-worth).

Many arrive anxious, low or overwhelmed. Their job: find out, privately and without pressure, whether this is the right help, then book a first session.

Secondary audiences: psychology students applying for internships and training; organisations booking workshops and corporate seminars; the practice's counsellors, who use the private portal.

## Product Purpose

ULLIDAM (ഉള്ളിടം, "The Space Within"). The official charter below was supplied by the user and is the authoritative wording; use its service names exactly.

**Aim:** to provide accessible and comprehensive mental health services through an online-based psychological and mental health platform, ULLIDAM.

**Main objectives**

1. **Psychological Counselling:** providing professional individual and couple counselling services.
2. **Psychotherapy:** offering evidence-informed psychotherapeutic interventions to promote psychological well-being (the project spec names CBT, ACT, EFT and Gottman).
3. **Psychiatric Assistance:** facilitating psychiatric consultations, assessments and appropriate mental health support.
4. **Mental Health Awareness:** organising mental health awareness programmes, workshops, seminars and psychoeducation initiatives.
5. **Internship and Training:** providing internship opportunities, practical exposure and training programmes for psychology students and aspiring mental health professionals.
6. **Community Outreach:** promoting mental health literacy, reducing stigma and improving access to mental health services.

**Target population and services**

- **A. Individual Counselling and Therapy:** adults aged 18 years and above; individual psychological counselling; individual psychotherapy.
- **B. Psychiatric Services:** individuals requiring psychiatric consultation and assistance; individuals requiring psychiatric evaluation, medication management and follow-up care.
- **C. Couple and Relationship Counselling:** premarital counselling; marital counselling; relationship counselling.
- **D. Pre-divorce and Divorce Counselling:** emotional and psychological support before divorce; counselling during the divorce process; post-divorce emotional adjustment and support.

Success: a visitor in distress feels safe enough to book, reaches the right track and therapist quickly, and nobody else ever needs to know.

## Positioning

What Ullidam can claim that its neighbours (for example Koott) cannot all claim together:

- **Malayalam and English, with diaspora hours**: times shown in the visitor's own zone alongside IST, for the Gulf, UK and US.
- **Total confidentiality**: no account, no login, no clinic waiting room; booking goes through WhatsApp.
- **Psychiatry with therapy**: psychiatric consultation and medication management under the same roof as counselling.
- **Divorce specialism**: dedicated support before, during and after divorce.
- *Open:* the user marked a further differentiator ("Other") that has not been stated yet.

## Operating Context

- Visitors book in about three clicks with no sign-up. The request goes by WhatsApp to the practice coordinator (+91 85909 25353) with a primary and a backup slot. Preferences stay in the browser only (`UllidamVault`, localStorage).
- Sessions run on Google Meet.
- A short triage quiz routes visitors to a track and has a safety branch for crisis.
- Planned: Google Sheets as the operational database (bookings log, therapist schedule, confidential clinical records), and a PIN-protected counsellor portal (`/portal`) for slot management and session notes.
- Deployed on Vercel.

## Capabilities and Constraints

- Built: homepage (scroll-driven film opening, triage, faculty cards, tracks, FAQ), the four track pages, therapist directory and profiles with a booking card, diaspora, internships and awareness pages, and a synthesised rain soundscape (never autoplays).
- Not yet built: live slot matrix, WhatsApp dispatch, the Sheets engine and the portal.
- **Zero-Emoji Standard** across UI, code and data: use icons and typographic ratings instead.
- **Zero-Price Standard** (user directive, 2026-11-23): no prices, currency figures or currency switchers anywhere. Show the care format and length instead ("50 mins per session", "Confidential 1-on-1 video consultation"); fees are discussed privately with the coordinator.
- **English-only copy** (user directive, 2026-11-23): no Malayalam script anywhere in the rendered page, and no Malayalam fonts are loaded. Saying in English that sessions are available in Malayalam is still correct.
- The **Quick Exit** button and Esc shortcut were removed at the user's request; do not re-add them.
- **No testimonials**: Indian medical conduct rules restrict testimonial advertising. The "Voices" section uses common first-session reflections, never client reviews.
- Do not promise "zero storage": bookings will be logged in Google Sheets.
- Crisis helplines and the triage wording need clinical sign-off before launch.

## Brand Commitments

- Name: ULLIDAM, with the Malayalam ഉള്ളിടം and the line "The Space Within".
- Voice: short, validating and empathetic; at most two or three sentences per block; plain words, no corporate filler.
- Stigma is addressed head-on: "100% confidential. No clinic waiting rooms. No relatives or employers will ever know."
- Every colour comes from one file, `theme.ts`, so the whole site can be re-themed in one place.

## Evidence on Hand

- **All therapists, credentials, photographs, fees, ratings and session counts are placeholders** (`data/therapists.ts`, `data/pricing.ts`). This includes the "4.98 / 5.0 from 1,555+ rated sessions" line. Never present any of them as real; the practice will supply the real team and figures later.
- No testimonials, case studies, press or partner logos exist. Do not invent them.
- The homepage footage is stock video (Pexels licence) in `public/film/`.
- The logo is drawn in `components/layout/Logo.tsx`.

## Product Principles

1. **Safety and privacy before persuasion.** Confidentiality is a promise kept in every flow: no logins, minimal data, nothing that pressures.
2. **Calm over clever.** Visitors may be overwhelmed. One thing at a time, few words, a clear next step.
3. **Truth only.** No figures, credentials or reviews that the practice cannot stand behind.
4. **Home, wherever you are.** Malayalam and English, and diaspora time zones, are first-class, not add-ons.
5. **Whole care under one roof.** Counselling, psychotherapy, psychiatry, couples and divorce support. Help each visitor reach the right track quickly.

## Accessibility & Inclusion

- Designed for people in distress: low cognitive load, short copy, no flashing or sudden motion.
- Reduced motion is a complete, calm version of every page, not a broken one.
- Text meets WCAG AA at minimum (4.5:1 body, 3:1 large); touch targets are at least 44 x 44 px.
- Copy is English only (see Capabilities and Constraints).
