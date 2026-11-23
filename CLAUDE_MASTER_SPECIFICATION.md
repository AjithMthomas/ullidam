# ULLIDAM — MASTER ARCHITECTURAL SPECIFICATION & CLAUDE PRO DEVELOPMENT BLUEPRINT
> **Confidential & Proprietary Clinical UX & Operations Blueprint**  
> **Brand & Practice Name**: **ULLIDAM** — *"The Space Within"*  
> **Headquarters**: Kerala, India  
> **Target Demographic**: Malayalis in Kerala & The Global Diaspora (UAE/GCC, UK, North America, Europe, Australia) + Global English Speakers  
> **Core Clinical Population**: Adults Aged 18 and Above (Individual, Couples, Psychiatric, & Divorce Tracks) + Community Outreach & Training  
> **Core Psychological Principle**: **"Whitespace as Psychological Oxygen"** (High-spacing, Low Cognitive Load for Anxious/Depressed Minds)  
> **Deployment Target**: **Vercel** (Global Edge CDN, Serverless Route Handlers)  
> **Database & Operations**: **Google Sheets Engine** + **Counsellor Portal (`/portal`)**  
> **Key Benchmark Competitors**: `oppam.com` | `koott.in`  

---

## 1. OFFICIAL ORGANIZATIONAL CHARTER & MAIN OBJECTIVES

ULLIDAM is an online-based psychological and mental health platform established to provide accessible, ethical, and comprehensive mental health services with the following **6 Core Objectives**:

```
                                  ┌──────────────────────────────────────────────┐
                                  │                    ULLIDAM                   │
                                  │           Core Organizational Charter        │
                                  └──────────────────────┬───────────────────────┘
                                                         │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ 1. PSYCHOLOGICAL│ │ 2. PSYCHO-      │ │ 3. PSYCHIATRIC  │ │ 4. AWARENESS &  │ │ 5. INTERNSHIP & │
│    COUNSELLING  │ │    THERAPY      │ │    ASSISTANCE   │ │    PSYCHOED     │ │    TRAINING     │
│ Individual &    │ │ Evidence-       │ │ Consultations,  │ │ Workshops,      │ │ Practical       │
│ Couple sessions │ │ informed clinical││ Medication mgmt │ │ Seminars,       │ │ exposure for    │
│ for emotional   │ │ interventions   │ │ & medical       │ │ Community       │ │ psychology      │
│ clarity         │ │ (CBT/ACT/EFT)   │ │ evaluations     │ │ outreach        │ │ students        │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
                                                         │
                                                         ▼
                                        ┌─────────────────────────────────┐
                                        │      6. COMMUNITY OUTREACH      │
                                        │ Mental health literacy, stigma  │
                                        │ reduction & healthcare access   │
                                        └─────────────────────────────────┘
```

1. **Psychological Counselling**: Providing professional individual and couple counselling services to help clients navigate life transitions, relational strain, and personal overwhelm.
2. **Psychotherapy**: Offering evidence-informed psychotherapeutic interventions (CBT, ACT, Gottman Method, Somatic grounding) to promote sustained psychological well-being.
3. **Psychiatric Assistance**: Facilitating clinical psychiatric consultations, diagnostic assessments, medication management, and structured medical follow-up care.
4. **Mental Health Awareness**: Organising structured mental health awareness programmes, interactive workshops, corporate seminars, and digital psychoeducation initiatives.
5. **Internship and Training**: Providing structured internship opportunities, practical clinical exposure, case conferences, and training programmes for psychology students and aspiring mental health professionals.
6. **Community Outreach**: Promoting mental health literacy, actively dismantling societal stigma (*"What will people think?"*), and expanding direct access to care for underserved communities.

---

## 2. CLINICAL SERVICE TRACKS & TARGET POPULATION

ULLIDAM structures its clinical care into **4 Dedicated Service Tracks**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               ULLIDAM CLINICAL DIVISIONS                               │
├────────────────────────────┬─────────────────────────────┬─────────────────────────────┤
│ TRACK A: INDIVIDUAL CARE   │ TRACK B: PSYCHIATRIC CARE   │ TRACK C: RELATIONSHIPS      │
│ (Adults Aged 18 & Above)   │ (Medical & Neurobiology)    │ (Couples & Marital)         │
├────────────────────────────┼─────────────────────────────┼─────────────────────────────┤
│ • Individual Counselling   │ • Psychiatric Consultation  │ • Premarital Counselling    │
│ • Psychotherapy (CBT/ACT)  │ • Psychiatric Evaluation    │ • Marital Counselling       │
│ • Anxiety, Burnout, Mood   │ • Medication Management     │ • Relationship Reconciliation│
│ • Trauma & Life Adjustment │ • Longitudinal Follow-up    │ • Cross-Cultural / NRI Care │
├────────────────────────────┴─────────────────────────────┴─────────────────────────────┤
│ TRACK D: PRE-DIVORCE & DIVORCE COUNSELLING (Specialized Clinical Division)            │
│ ├─ Phase 1: Pre-Divorce Support (Emotional clarity, boundary setting, decision-making) │
│ ├─ Phase 2: During Divorce (Navigating legal stress, co-parenting, grief mediation)   │
│ └─ Phase 3: Post-Divorce Adjustment (Rebuilding self-worth, emotional identity reset)  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Track A: Individual Counselling & Psychotherapy
* **Target Population**: Adults aged 18 years and above.
* **Services**: Individual psychological counselling, evidence-based psychotherapy, emotional regulation, existential and career transition support.

### Track B: Psychiatric Services & Medical Oversight
* **Target Population**: Individuals requiring formal psychiatric evaluation, differential diagnostic assessment, prescription medication management, and ongoing medical follow-up care.
* **Clinical Focus**: Clinical depression, severe anxiety disorders, bipolar spectrum, complex trauma/PTSD, and insomnia/sleep architecture.

### Track C: Couple and Relationship Counselling
* **Target Population**: Committed partners, engaged couples, and married individuals.
* **Services**:
  1. **Premarital Counselling**: Aligning values, financial expectations, family boundaries, and communication patterns before marriage.
  2. **Marital Counselling**: Conflict resolution, healing intimacy ruptures, navigating joint-family pressures, and de-escalating chronic gridlock.
  3. **Relationship Counselling**: Cross-cultural dynamics, long-distance strain (Kerala—Gulf diaspora), and emotional reconnection.

### Track D: Specialized Pre-Divorce and Divorce Counselling
* **Target Population**: Individuals and couples contemplating, experiencing, or recovering from marital separation and legal divorce.
* **The 3-Phase Clinical Journey**:
  1. *Pre-Divorce Emotional Support*: Clarity sessions before taking irreversible legal steps; unpacking ambivalence and discerning if repair is possible.
  2. *Counselling During the Divorce Process*: De-escalating acute panic, handling family/societal stigma, emotional regulation through legal proceedings, and child-centric co-parenting strategies.
  3. *Post-Divorce Emotional Adjustment*: Healing post-separation grief, overcoming shame, rebuilding self-identity, and establishing healthy life autonomy.

---

## 3. SPATIAL DESIGN & LOW COGNITIVE LOAD PRINCIPLES

### 3.1 Whitespace as Psychological Oxygen
* **The Clinical Principle**: When a person is in emotional crisis, visual clutter induces cognitive claustrophobia and sensory overwhelm.
* **Spatial Specifications**:
  * **Desktop Spacing**: Generous section padding (`py-24 md:py-32 lg:py-36`), large grid gaps (`gap-8 md:gap-12 lg:gap-16`), and card inner padding (`p-8 md:p-12`).
  * **Mobile Spacing**: Unhurried mobile padding (`py-16 md:py-20`).
  * **Reading Width**: Text containers are strictly constrained to `max-w-xl` or `max-w-2xl` with `leading-relaxed` / `leading-loose`.

### 3.2 Low Cognitive Load Copywriting ("Less Is More")
* **Text Brevity**: Every section must communicate its message in **2 to 3 concise, validating sentences**.
* **Visual Scannability**: Use scannable bullet points, pill badges, and high-contrast numerical highlights (`4.97 / 5.0`, `50 Mins`, `₹1,499`).
* **Tone**: Empathetic, warm, grounded, dignified. No medical patronizing; no dismissive casualness.

---

## 4. STRICT ARCHITECTURAL & CLINICAL RULES (NON-NEGOTIABLE)

### Rule 1: The Zero-Emoji Standard (Zero Exceptions)
* **Never use Unicode OS emojis** anywhere in UI components, code, markdown, or JSON.
* Emojis degrade clinical gravity and render inconsistently across phone models.
* **Replacements**:
  - Status beacons: Custom CSS `StatusPulse` component (`open`, `fast`, `gone`).
  - Icons: `lucide-react` with a consistent `strokeWidth={1.5}`.
  - Ratings: Typographic numerical format: `4.97 / 5.0 (340+ sessions)`.

### Rule 2: Zero-Login Public Funnel with `UllidamVault`
* Clients never encounter a login wall or registration form to book therapy.
* Client preferences, saved therapist bookmarks, upcoming booking records, and private reflection notes are stored strictly in client-side `localStorage` via `UllidamVault`.
* Zero passwords; zero account fatigue.

### Rule 3: Diaspora-First Timezone Engine
* Auto-detects visitor timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) and provides 1-click toggles for:
  - **IST** (India: UTC+5:30)
  - **GST** (Gulf / UAE: UTC+4:00)
  - **GMT / BST** (UK / Western Europe: UTC+0:00 / UTC+1:00)
  - **EST / PST** (US / Canada: UTC-5:00 / UTC-8:00)
* Slot matrices dynamically recalculate and display dual timestamps (Visitor Local + IST).

### Rule 4: Structured Dual-Slot WhatsApp Dispatch Funnel
* Target Practice Coordinator: **`+91 85909 25353`** (International format: `918590925353`).
* Requires **Dual Slot Selection**: Primary Preferred Slot + Alternative Backup Slot (ensuring a 98% immediate confirmation rate without back-and-forth messaging).
* Desktop users are presented with a high-resolution QR Code (`qrcode.react`) alongside a WhatsApp Web deep-link and an "Instant Copy" button.

### Rule 5: Emergency Quick-Exit & Client Safety
* Individuals browsing in volatile domestic spaces can press `ESC` or click the persistent Quick-Exit button.
* Instantly executes `window.location.replace("https://en.wikipedia.org/wiki/Weather")` to scrub browser history.

### Rule 6: Ambient Rain Soundscape Engine
* Live Web Audio API pink noise synthesis filtered to simulate gentle Kerala monsoon rain.
* Zero external MP3/WAV audio files required; instant startup with zero bandwidth overhead.

### Rule 7: Modular Dummy Data Architecture
* All therapist biographies, credentials, Unsplash photo links, and pricing tiers are isolated into clean config files (`data/therapists.ts`, `data/pricing.ts`, `data/site-config.ts`).
* Real client photos, RCI numbers, and voice recordings can be hot-swapped in seconds without touching UI logic.

---

## 5. VERCEL DEPLOYMENT ARCHITECTURE & CONFIGURATION

Ullidam is deployed to **Vercel** for high availability, zero cold starts, and global CDN edge caching across India, the Middle East, Europe, and North America.

### 5.1 Vercel Environment Variables (`.env.production`)
```bash
# Public Configuration
NEXT_PUBLIC_APP_NAME="Ullidam"
NEXT_PUBLIC_APP_URL="https://ullidam.com"
NEXT_PUBLIC_WHATSAPP_COORDINATOR="918590925353"

# Google Sheets Backend Engine
GOOGLE_SHEETS_SPREADSHEET_ID="your_google_sheet_id_here"
GOOGLE_SERVICE_ACCOUNT_EMAIL="ullidam-ops@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_APPS_SCRIPT_WEBHOOK_URL="https://script.google.com/macros/s/.../exec"

# Counsellor Portal Master Secret
COUNSELLOR_PORTAL_SECRET="ullidam_clinical_vault_2026"
```

---

## 6. GOOGLE SHEETS DATABASE & COUNSELLOR DASHBOARD (`/portal`)

Ullidam uses **Google Sheets** as a lightweight, zero-maintenance operational database:

### 6.1 The Three-Sheet Architecture

#### Sheet 1: `Bookings_Log` (Client Appointments & Inquiries)
* `Timestamp | Booking_ID | Client_Name | WhatsApp_Number | Service_Track (Individual / Couples / Psychiatry / Divorce) | Country_Timezone | Therapist_ID | Primary_Slot | Backup_Slot | Status | Payment_Status | Meeting_Link`

#### Sheet 2: `Therapist_Schedule` (Live Availability Matrix)
* `Therapist_ID | Date | Slot_Time_IST | Shift (Morning/Afternoon/Evening) | Is_Available (TRUE/FALSE) | Booked_Client_ID`

#### Sheet 3: `Clinical_Records` (Confidential Diagnosis & Session Notes)
* `Record_ID | Session_Date | Therapist_ID | Client_Identifier | Clinical_Diagnosis (ICD-11/DSM-5) | Modalities_Employed | Session_Notes | Risk_Assessment | Follow_Up_Plan`

### 6.2 Counsellor Portal Architecture (`/portal`)
* **PIN-Isolated Access**: Each therapist enters their individual PIN (e.g., `Dr. Ananya: 8492`, `Dr. Arun: 4198`). Clinicians **only view their own clients** and notes.
* **Schedule Controller**: 1-tap toggles for Morning, Afternoon, and Evening shifts across the next 14 days.
* **Clinical Diagnosis Logger**: Confidential post-session form to record diagnostic impressions, modalities utilized, and follow-up plans.

---

## 7. COMPLETE SITE ROUTING & PAGE SPECIFICATIONS

```
ullidam-platform/
├── app/
│   ├── layout.tsx                     # Root layout (Fonts, Lenis Provider, Header, Footer, QuickExit)
│   ├── page.tsx                       # Homepage (7-Stage Clinical Narrative + Triage Quiz)
│   ├── globals.css                    # Tailwind tokens & keyframe animations
│   │
│   ├── services/
│   │   ├── page.tsx                   # Comprehensive Overview of the 4 Service Tracks
│   │   ├── individual/page.tsx        # Track A: Individual Counselling & Psychotherapy (18+)
│   │   ├── psychiatry/page.tsx        # Track B: Psychiatric Consultation & Medication Evaluation
│   │   ├── couples/page.tsx           # Track C: Premarital, Marital & Relationship Counselling
│   │   └── divorce/page.tsx           # Track D: Pre-Divorce, During Divorce & Post-Divorce Support
│   │
│   ├── therapists/
│   │   ├── page.tsx                   # Resident Faculty Directory (Interactive filters)
│   │   └── [slug]/page.tsx            # 60/40 Profile & Sticky Live Booking Station
│   │
│   ├── diaspora/
│   │   └── page.tsx                   # Dedicated NRI & Gulf Malayali Support Hub
│   │
│   ├── internships/
│   │   └── page.tsx                   # Internship Opportunities & Training for Psychology Students
│   │
│   ├── awareness/
│   │   └── page.tsx                   # Workshops, Seminars, Psychoeducation & Community Outreach
│   │
│   ├── guide/
│   │   └── page.tsx                   # First-Timer's Field Guide to Therapy
│   │
│   ├── intake/
│   │   └── page.tsx                   # 2-Minute Pre-Session Confidential Intake Form
│   │
│   ├── careers/
│   │   └── page.tsx                   # Clinical Fellowships & Recruitment Portal
│   │
│   ├── portal/
│   │   └── page.tsx                   # Counsellor Dashboard (Availability & Diagnosis Entry)
│   │
│   └── api/
│       ├── bookings/route.ts          # Google Sheets booking recorder
│       ├── availability/route.ts      # Live slot sync with Google Sheets
│       ├── portal/route.ts            # Counsellor slot updates & diagnosis notes handler
│       ├── intake/route.ts            # Client intake questionnaire submission
│       └── internships/route.ts       # Student internship application handler
```

---

## 8. DUMMY-READY MODULAR RESIDENT FACULTY MODEL

Aligned with the 4 Service Tracks in `data/therapists.ts`:

```typescript
// data/therapists.ts
export interface Therapist {
  id: string;
  slug: string;
  name: string;
  title: string;
  license: string;             // Official RCI / MCI Registration Code
  experienceYears: number;
  rating: number;              // Displayed numerically: 4.97 / 5.0 (Zero-Emoji)
  reviewCount: number;
  languages: string[];
  trackFocus: ('individual' | 'psychiatry' | 'couples' | 'divorce')[];
  specialties: string[];
  modalities: string[];
  pricing: {
    inr: number;
    aed: number;
    usd: number;
  };
  availabilityStatus: 'open' | 'fast' | 'gone'; // Powers StatusPulse
  nextAvailableText: string;
  bio: string;
  approach: string;
  firstSessionGuide: string;
  education: string[];
  image: string;               // Unsplash placeholder, hot-swappable
  voiceIntroAudio?: string;    // Path in public/audio/intros/
}

export const THERAPISTS: Therapist[] = [
  {
    id: 'ananya-menon',
    slug: 'dr-ananya-menon',
    name: 'Dr. Ananya Menon',
    title: 'Senior Consultant Clinical Psychologist',
    license: 'RCI-CRR-A84920',
    experienceYears: 11,
    rating: 4.97,
    reviewCount: 340,
    languages: ['Malayalam', 'English', 'Hindi'],
    trackFocus: ['individual'],
    specialties: ['Anxiety & Panic', 'Workplace Burnout', 'Health Anxiety', 'OCD'],
    modalities: ['Cognitive Behavioural Therapy (CBT)', 'Mindfulness-Based Cognitive Therapy (MBCT)', 'Exposure & Response Prevention (ERP)'],
    pricing: { inr: 1499, aed: 75, usd: 25 },
    availabilityStatus: 'open',
    nextAvailableText: 'Available Today',
    bio: 'Specializing in adult individual psychotherapy, Dr. Ananya combines structured CBT with warm, culturally grounded empathy for working professionals in Kerala and the diaspora.',
    approach: 'Therapy with me is a collaborative laboratory where we map cognitive triggers and build measurable behavioral resilience.',
    firstSessionGuide: 'We map your primary distress triggers, establish safety anchors, and draft a tailored 6-week roadmap without judgment.',
    education: ['Ph.D. Clinical Psychology — NIMHANS Bangalore', 'M.Sc. Clinical Psychology — Manipal Academy'],
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'akash-mohan',
    slug: 'akash-mohan',
    name: 'Akash Mohan',
    title: 'Licensed Clinical Psychologist (M.Phil)',
    license: 'RCI-CRR-B71204',
    experienceYears: 7,
    rating: 4.94,
    reviewCount: 215,
    languages: ['Malayalam', 'English'],
    trackFocus: ['individual'],
    specialties: ["Men's Mental Health", 'Adult ADHD', 'Identity & Life Transitions', 'Depression'],
    modalities: ['Acceptance & Commitment Therapy (ACT)', 'Behavioral Activation', 'Compassion-Focused Therapy'],
    pricing: { inr: 1299, aed: 65, usd: 20 },
    availabilityStatus: 'open',
    nextAvailableText: 'Available Tomorrow',
    bio: 'Akash specializes in helping men and young adults navigate emotional vulnerability, career stagnation, and adult neurodivergence in a shame-free space.',
    approach: 'We strip away therapeutic jargon and look honestly at what is holding you back, developing practical, value-aligned behavioral steps.',
    firstSessionGuide: 'We examine your life baseline, clarify core values, and address how ADHD or depressive patterns interfere with what matters most.',
    education: ['M.Phil Clinical Psychology — IMHANS Calicut', 'M.Sc. Psychology — University of Calicut'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sneha-varghese',
    slug: 'sneha-varghese',
    name: 'Sneha Varghese',
    title: 'Senior Consultant Psychotherapist — Couples & Families',
    license: 'RCI-CRR-S90118',
    experienceYears: 13,
    rating: 4.99,
    reviewCount: 480,
    languages: ['Malayalam', 'English', 'Tamil'],
    trackFocus: ['couples', 'divorce'],
    specialties: ['Couples & Marital Therapy', 'Pre-Divorce & Divorce Adjustment', 'Premarital Counseling', 'Family Conflict'],
    modalities: ['Gottman Method (Level 2 Trained)', 'Emotion-Focused Therapy (EFT)', 'Systemic Family Therapy'],
    pricing: { inr: 1599, aed: 80, usd: 28 },
    availabilityStatus: 'fast',
    nextAvailableText: 'Filling Fast (2 Slots Left)',
    bio: 'A veteran relationship clinician leading Ullidam’s Couple and Pre-Divorce/Divorce counseling division, helping partners de-escalate crisis and rebuild self-worth.',
    approach: 'In relationship work, the dynamic itself is my focus. I illuminate toxic cycles and guide either healthy repair or compassionate separation.',
    firstSessionGuide: 'A structured relationship audit examining conflict cycles, repair attempts, and emotional safety.',
    education: ['M.Phil Psychiatric Social Work — NIMHANS', 'Gottman Clinical Training Institute Level 2'],
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'dr-arun-kallada',
    slug: 'dr-arun-kallada',
    name: 'Dr. Arun Kallada',
    title: 'Consultant Psychiatrist & Neuropsychology Lead',
    license: 'MCI-KMC-41982',
    experienceYears: 15,
    rating: 4.98,
    reviewCount: 520,
    languages: ['Malayalam', 'English', 'Hindi'],
    trackFocus: ['psychiatry'],
    specialties: ['Psychiatric Consultation', 'Medication Management', 'Clinical Depression', 'Complex Trauma & PTSD', 'Insomnia'],
    modalities: ['Neurobiological Assessment', 'Pharmacotherapy', 'EMDR (Trained)', 'Sleep Architecture CBT-I'],
    pricing: { inr: 1799, aed: 90, usd: 30 },
    availabilityStatus: 'open',
    nextAvailableText: 'Available in 2 Days',
    bio: 'Dr. Arun leads Ullidam’s Psychiatric Services, providing medical evaluations, diagnostic assessments, and evidence-based medication management.',
    approach: 'We look at the brain and body as an integrated electrical and emotional circuit, combining careful medical oversight with psychotherapeutic support.',
    firstSessionGuide: 'A comprehensive medical, psychiatric, and sleep evaluation to identify biological contributors before mapping medication or therapy.',
    education: ['MD Psychiatry — Govt Medical College Trivandrum', 'Fellowship in Neuropsychiatry — London UK'],
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800'
  }
];
```

---

## 9. STEP-BY-STEP IMPLEMENTATION ROADMAP FOR CLAUDE PRO

### Phase 1: Brand, Design System & Vercel Foundations
1. Initialize Next.js 15+ App Router, React 19, TypeScript (`strict: true`).
2. Configure Tailwind CSS with generous spatial utilities (`py-24`, `py-32`, `max-w-2xl` reading widths).
3. Set up typography: `Fraunces` (serif) + `Plus Jakarta Sans` (sans-serif) + Malayalam fallback fonts.
4. Implement UI base primitives: `StatusPulse.tsx`, `Button.tsx`, `QuickExit.tsx`. Verify **Zero-Emoji Rule**.

### Phase 2: Cinematic Homepage Narrative & Triage
1. Mount `@studio-freight/lenis` (or `lenis/react`) for smooth momentum scrolling.
2. Build `components/cinematic/PinnedStage.tsx` with GSAP `ScrollTrigger` pinning over 200vh for the 3-phase empathetic journey.
3. Build `components/triage/TriageWidget.tsx` (60-second 3-step calm assessment matching to the 4 Service Tracks).
4. Build `components/cinematic/TherapistCard.tsx` with 3D perspective mouse tilt.
5. Build the Trust Bento Grid, 3-Step Journey, Client Voices FAQ, and Smart Multi-Country Crisis Ribbon.

### Phase 3: Service Track Pages & Live Booking Station
1. Implement the 4 Dedicated Service Pages:
   - `/services/individual` (Adults 18+ Individual Therapy)
   - `/services/psychiatry` (Psychiatric Evaluation & Medication Management)
   - `/services/couples` (Premarital & Marital Counselling)
   - `/services/divorce` (Pre-Divorce, During Divorce & Post-Divorce Support)
2. Implement `app/therapists/[slug]/page.tsx` with the 60/40 asymmetric layout.
3. Build `BookingPanel.tsx`, `SlotMatrix.tsx`, and `TimezoneLabel.tsx` with timezone auto-detection.
4. Wire up dual-slot selection, WhatsApp dispatch, and desktop QR code modal (`WhatsAppModal.tsx`).

### Phase 4: Operations, Community, Counsellor Portal & Vercel Verification
1. Build `app/portal/page.tsx` with PIN-isolated therapist dashboard (14-day schedule controller + confidential diagnosis logger).
2. Build `app/diaspora/page.tsx` tailored for Gulf/UK/US Malayalis.
3. Build `app/internships/page.tsx` for psychology student practical exposure and training applications.
4. Build `app/awareness/page.tsx` for workshops, seminars, and psychoeducation initiatives.
5. Build `app/intake/page.tsx` for the 2-minute pre-session questionnaire.
6. Build `components/audio/SoundscapeButton.tsx` (Web Audio API rain synthesis).
7. Final verification: `npm run build` with 0 TypeScript/lint warnings, fully verified for Vercel deployment.

---

## 10. DEVELOPER AUDIT CHECKLIST

Before marking any milestone complete, verify:
- [ ] **Official Objectives**: Are the 6 core objectives (Counselling, Psychotherapy, Psychiatry, Awareness, Internships, Outreach) integrated?
- [ ] **4 Service Tracks**: Are Individual, Psychiatric, Couple, and Pre-Divorce/Divorce services clearly represented with dedicated paths?
- [ ] **Spatial Generosity**: Does the site feel open and uncrowded with generous vertical padding (`py-24`+ on desktop, `py-16`+ on mobile)?
- [ ] **Low Cognitive Load**: Is the copy concise, empathetic, and free of overwhelming text walls?
- [ ] **Vercel Deployability**: Does `npm run build` complete with 0 errors and optimal serverless routes?
- [ ] **Zero-Emoji Rule**: Has every Unicode emoji been replaced with Lucide SVG icons or StatusPulse beacons?
- [ ] **Zero-Login Funnel**: Can clients view slots and book via WhatsApp in 3 clicks without account creation?
- [ ] **Diaspora Support**: Does the timezone engine automatically convert slot times for Gulf (GST), UK (GMT), and US (EST)?
- [ ] **Google Sheets Integration**: Are client bookings and counsellor availability/diagnosis records routed cleanly to Google Sheets?
- [ ] **Counsellor Portal Isolation**: Does `/portal` isolate client views by clinician PIN?
- [ ] **Emergency Quick Exit**: Does pressing `ESC` instantly redirect to Wikipedia Weather with history purge?
- [ ] **Audio Engine**: Does the rain soundscape synthesize live in Web Audio API with zero asset download latency?
- [ ] **Modular Data**: Are all dummy biographies and pricing tiers decoupled in `data/` for rapid future replacement?
