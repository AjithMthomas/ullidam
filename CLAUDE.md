# CLAUDE PROJECT INSTRUCTIONS — ULLIDAM

> **Platform**: ULLIDAM — *"The Space Within"*  
> **Master Architecture Document**: See [`CLAUDE_MASTER_SPECIFICATION.md`](./CLAUDE_MASTER_SPECIFICATION.md) for full blueprints, database schemas, and component code.  
> **Deployment Target**: **Vercel** (Global Edge CDN, Serverless Route Handlers)  

---

## 1. OFFICIAL ORGANIZATIONAL CHARTER & 6 CORE OBJECTIVES
ULLIDAM is an online psychological and mental health platform built around **6 Main Objectives**:
1. **Psychological Counselling**: Professional individual and couple counselling.
2. **Psychotherapy**: Evidence-informed interventions (CBT, ACT, EFT, Gottman) to promote well-being.
3. **Psychiatric Assistance**: Clinical consultations, diagnostic assessments, medication management & follow-up care.
4. **Mental Health Awareness**: Programmes, workshops, corporate seminars, and psychoeducation initiatives.
5. **Internship and Training**: Practical clinical exposure and training for psychology students and aspiring professionals.
6. **Community Outreach**: Mental health literacy, actively dismantling societal stigma (*"What will people think?"*).

---

## 2. THE 4 CLINICAL SERVICE DIVISIONS
1. **Track A: Individual Counselling and Therapy**: Adults aged 18+ (Anxiety, Depression, Burnout, Trauma, Life Transitions).
2. **Track B: Psychiatric Services**: Psychiatric consultation, medical evaluation, pharmacotherapy/medication management & follow-up.
3. **Track C: Couple and Relationship Counselling**: Premarital, Marital, and Relationship reconciliation counselling.
4. **Track D: Pre-divorce and Divorce Counselling**:
   - Emotional support before divorce (clarity & discernment).
   - Counselling during the divorce process (legal stress, child co-parenting).
   - Post-divorce emotional adjustment (rebuilding identity & self-worth).

---

## 3. PSYCHOLOGICAL SPACING & COPYWRITING PRINCIPLES

### A. Whitespace as Psychological Oxygen
* **We are designing for people with upset, anxious, and overwhelmed minds**. Cramped layouts trigger cognitive panic.
* **Vertical Spacing**: Enforce generous padding: `py-24 md:py-32` on desktop, `py-16 md:py-20` on mobile.
* **Card & Section Padding**: `p-8 md:p-10 lg:p-12`. Large gaps: `gap-8 md:gap-12`.
* **Reading Width**: Strictly constrain text blocks to `max-w-xl` or `max-w-2xl` with `leading-relaxed` / `leading-loose`.

### B. Low Cognitive Load ("Less Is More")
* **People with anxiety and depression cannot read long essays or walls of text**.
* Keep copy **short, validating, and empathetic** (maximum 2 to 3 sentences per block).
* Use scannable bullet points, pill badges, and clean numerical metrics (`4.97 / 5.0`, `50 Mins`, `₹1,499`).
* Address Kerala societal stigma head-on: *"100% Confidential. No clinic waiting rooms. No relatives or employers will ever know."*

---

## 4. DATABASE & COUNSELLOR DASHBOARD (GOOGLE SHEETS ENGINE)
Instead of expensive database hosting, Ullidam uses **Google Sheets** as a lightweight, zero-maintenance operational database:
1. **Sheet 1: `Bookings_Log`**: Stores client name/alias, WhatsApp number, service track, timezone, primary & backup slots, status, and Google Meet link.
2. **Sheet 2: `Therapist_Schedule`**: Live availability matrix (Morning/Afternoon/Evening shifts) that feeds the public slot picker.
3. **Sheet 3: `Clinical_Records`**: Confidential counsellor notes, diagnostic impressions (ICD-11/DSM-5 categories), and treatment plans.
4. **Counsellor Portal (`/portal`)**: A clean, PIN-isolated dashboard where therapists:
   - Toggle their open/blocked slots (instantly updating the public booking grid).
   - View today's sessions and launch Google Meet.
   - Log session notes and clinical diagnosis after each session (isolated strictly to their own patients).

---

## 5. STRICT CODING & CLINICAL STANDARDS

### A. The Zero-Emoji Standard (Absolute)
- **Do NOT use Unicode OS emojis** (e.g. 🧠, 🌿, ✨, 💚, 📞, 📅, ⭐, ⚠️) anywhere in UI, code, or data.
- Use `lucide-react` with `strokeWidth={1.5}`.
- Use `<StatusPulse status="open" />` for live availability beacons.
- Use typographic numerical ratings: `4.97 / 5.0` (never stars).

### B. Typography & Clinical Design Tokens
- **Serif Font**: `Fraunces` with Malayalam fallback fonts (`Manjari`, `Gayathri`).
- **Sans-Serif Font**: `Plus Jakarta Sans` or `Inter`.
- **Colors**:
  - `--canvas: #FBF9F5` (Warm linen sand)
  - `--canvas-muted: #F2EEE5` (Soft card background)
  - `--brand: #1A3835` / `#284739` (Deep Kerala monsoonal pine)
  - `--accent: #C27803` / `#C97252` (Laterite clay / terracotta gold)
  - `--ink-1: #1B2421` (High-contrast charcoal green)

### C. Public Booking & Client Safety
- **Zero-Login Funnel**: Public users book in 3 clicks with no account creation. Data cached in browser `UllidamVault` (`localStorage`).
- **Diaspora Timezone Engine**: Auto-detects browser timezone and displays dual timestamps (Visitor Local + IST) for Gulf (GST), UK (GMT), and US (EST).
- **Dual-Slot WhatsApp Dispatch**: Dispatches to Coordinator **`+91 85909 25353`** with Primary & Backup slots.
- **Safety Quick Exit**: `ESC` key or floating shield redirects to Wikipedia Weather with history replacement.
- **Rain Soundscape**: Web Audio API pink noise synthesizer for live relaxation (zero audio file weight).

---

## 6. COMPLETE SITE ROUTING & PAGE SPECIFICATIONS
* `/` — Homepage (7-stage narrative, 200vh pinned stage, 60s triage quiz, 4 service tracks overview, faculty cards).
* `/services` — Comprehensive clinical directory.
* `/services/individual` — Track A: Individual Counselling and Therapy (Adults 18+).
* `/services/psychiatry` — Track B: Psychiatric Services.
* `/services/couples` — Track C: Premarital, Marital & Relationship Counselling.
* `/services/divorce` — Track D: Pre-Divorce, During Divorce & Post-Divorce Adjustment.
* `/therapists` & `/therapists/[slug]` — Resident faculty directory & 60/40 sticky booking station.
* `/diaspora` — Dedicated NRI & Gulf Malayali Support Hub.
* `/internships` — Psychology Student Training & Practical Exposure Applications.
* `/awareness` — Mental Health Workshops, Corporate Seminars & Community Outreach.
* `/portal` — Counsellor Dashboard (PIN-isolated slot management & diagnosis logging).

---

## 7. VERCEL DEPLOYMENT & COMMANDS
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npx tsc --noEmit

# Production build (Verify 0 errors before Vercel push)
npm run build

# Start production server
npm start
```

---

## 8. DESIGN AUTHORITY & ZERO AI SLOP

### A. Who decides what
- **Visual design** (fonts, colours, layout, imagery, motion style): the installed design skills decide, and they **override sections 3 and 5B of this file**. Skills: `impeccable` (critique, audit, polish), `design-taste-frontend` (art direction), `ui-ux-pro-max` (palettes, font pairings, UX rules).
- **Everything else stays with this file and the master spec**: content and tone, privacy, clinical safety, the Zero-Emoji Standard, routing, data and booking rules.
- **The user's direct instructions override both.** Standing directives from the user (2026-11-23), which override sections 3B, 5B and 5C above:
  - **Zero-Price:** no prices, currency figures or currency switchers anywhere. Show the care format and length instead (`data/session.ts`).
  - **English-only:** no Malayalam script in the rendered page and no Malayalam fonts. Saying in English that sessions are offered in Malayalam is fine.
  - The homepage opens with "The Film" (`components/film/FilmHero.tsx`), not the older Hero + Threshold. The hanging ID-card faculty section stays, directly before the four tracks.
  - Photographs come from `data/photos.ts` (files in `public/photos`).
  - **Mobile is equal priority (2026-11-24):** most visitors will come on phones. Every page, image and animation must look as sharp and considered on a phone (check at 390 x 844) as on desktop. Full-screen photos get art-directed portrait crops cut from the full-resolution original (never a stretched slice of a landscape photo); camera moves and zooms are gentler on small screens; UI work is not done until it has been checked on a phone as well as on desktop.
- Colours still change only through `theme.ts` (one global colour file); new tokens go there, never inline hex values.

### B. Banned (AI slop)
- Purple/blue gradient cards, gradient text, glowing blobs, decorative lines that don't divide anything, generic dashboard widgets, cards nested in cards, identical icon-title-text card grids.
- Filler words: "seamless", "robust", "empower", "elevate", "unlock", "leverage", "cutting-edge", "transform your", "journey" used as marketing.
- Placeholder-looking imagery. Use only clear, sharp, real images; never put text over a face.

### C. Required
- Generous whitespace and an editorial rhythm: few elements per screen, one clear focal point.
- Strong type contrast: text meets WCAG AA at minimum (4.5:1 body, 3:1 large); aim for AAA on body copy.
- Touch targets at least 44 x 44 px.
- Before calling UI work done, critique it against the design skills (Impeccable's design hook runs automatically after each edit).

### D. Motion
- **GSAP + Lenis**: scroll-driven scenes only (the homepage film).
- **Motion** (`motion/react`): component interactions, using the spring presets in `lib/motion.ts` (`springCalm`, `springSnappy`, `springCinematic`).
- Every animation respects `prefers-reduced-motion` (`<MotionProvider>` in the root layout handles Motion; GSAP code checks `MOTION_OK`).

---

## 9. WORKFLOW FOR BIG FEATURES (spec first, fresh review)
For large work only (booking engine, Google Sheets engine, counsellor portal, homepage or page redesigns). Small fixes go straight to code.
1. **Spec**: write `docs/specs/<feature>.md` before coding: goal, user flow, every state (loading, empty, error, success), edge cases, acceptance checks.
2. **Fresh review**: a subagent with no chat history reviews the spec for gaps and edge cases. Revise the spec.
3. **Build** only once the spec is agreed. Afterwards, a fresh subagent checks the code against the spec.
