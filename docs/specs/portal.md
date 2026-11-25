# Spec: Clinician Portal (`/portal`), plan

Status: draft for review (2026-11-25). Big feature, CLAUDE.md section 9: spec, fresh review, user approval, phased build, code-vs-spec review.
Sources: the user's brief, CLAUDE.md section 4, CLAUDE_MASTER_SPECIFICATION.md section 6, `docs/specs/booking-picker.md` (the sheet contract for availability).

---

## 1. Goal

One dashboard, the same for every clinician, showing only that clinician's data. Each clinician signs in with their own PIN and can:

- see today at a glance;
- manage bookings and their schedule;
- keep clients' records (add, view, edit, archive) and confidential session notes;
- follow their practice through statistics and charts;
- keep their public profile current.

Four clinicians at launch; adding a fifth means adding a row, not writing code.

**Principles**

1. **Privacy first.** These are mental-health records. Every design choice defaults to the safer option (sections 7 and 9).
2. **Same structure, own data.** One codebase and one layout. Every read and write is scoped to the signed-in clinician on the server.
3. **Calm and fast.** The same "Kerala Morning" design system as the public site. "Today" comes first, there are few elements per screen, and nothing looks like a generic admin template.
4. **Mobile equal.** Clinicians will check the day and write quick notes on phones (CLAUDE.md 8A).
5. **The Google Sheets engine** (CLAUDE.md section 4) stays the operational database. Sensitive fields are encrypted before they reach the sheet.

## 2. Roles

| Role | Who | Can |
|---|---|---|
| Clinician | Ananya, Akash, Sneha, Arun (sample profiles today) | Everything in this spec, only for their own clients, bookings, schedule and profile |
| Coordinator | Practice coordinator | Phase E: assign bookings, onboard clinicians, reset PINs, approve profile edits. Until then, edits the Sheet directly. |
| System | Public site | Reads open slots and published profiles only, never clients or notes |

## 3. Sign-in and session

- **Screen:** `/portal` shows the four clinicians as photo cards ("Who is signing in?"). The clinician picks theirs, then enters a 6-digit PIN on a keypad that works with touch and keyboard. The PIN is 6 digits rather than 4, because these are clinical records.
- **PIN storage:**
  - Each PIN is stored only as a scrypt hash with a salt, in the `Clinicians` tab.
  - PINs are never in code, the repo or the master spec. The example PINs in the master spec must not be used.
- **Lockout:**
  - 5 wrong attempts lock that clinician for 15 minutes.
  - Requests per IP are also throttled.
  - Every attempt, successful or not, is written to `Audit_Log`.
- **Session:**
  - A signed, encrypted token in an `httpOnly`, `Secure`, `SameSite=Strict` cookie (library: `jose`).
  - It lasts at most 12 hours; signing in again replaces it.
  - The secret is a 32-byte random `PORTAL_SESSION_SECRET` in Vercel env. The master spec's example secret must not be used.
- **Idle lock:** after 15 minutes without activity the screen locks (content blurred and removed from the page) and asks for the PIN again without losing the clinician's place.
- **Sign out:** clears the cookie. "Sign out everywhere" rotates the clinician's session version in the sheet.
- **Optional second step (decision D1):**
  - An authenticator-app code (TOTP) on top of the PIN, for new devices.
  - Recommended before real client data goes in.
- **Search engines:**
  - `/portal` is `noindex, nofollow`.
  - It is excluded from the sitemap and has no analytics.
  - Every portal response is sent with `Cache-Control: no-store`.

## 4. Navigation and screens

**Layout**
- **Desktop:** a left rail (Today, Bookings, Schedule, Clients, Analytics, Profile, Settings) with the clinician's name and photo.
- **Phones:** a bottom tab bar (Today, Bookings, Schedule, Clients, More).
- **Top bar:**
  - The page title.
  - A **"Hide names"** privacy toggle that blurs client names and contact details on screen, for shared spaces.
  - The lock button.

| Route | Screen |
|---|---|
| `/portal` | Sign-in |
| `/portal/today` | Today (home after sign-in) |
| `/portal/bookings` | Bookings |
| `/portal/schedule` | Schedule |
| `/portal/clients` | Clients list |
| `/portal/clients/new` | Add client |
| `/portal/clients/[clientId]` | Client record (profile, timeline, notes) |
| `/portal/clients/[clientId]/notes/[noteId]` | Session note editor |
| `/portal/analytics` | Analytics |
| `/portal/profile` | Public profile editor |
| `/portal/settings` | PIN, security, sessions |

Any `clientId` or `noteId` that isn't the signed-in clinician's returns the same 404 as one that doesn't exist, so the portal never confirms that another clinician's record exists.

### 4.1 Today
- **Greeting and date:** "Good morning, Ananya. Tuesday 26 November."
- **Today's sessions** in time order. Each shows:
  - Time in IST, plus the client's local time if different
  - Client alias, track, session number and format (video or audio)
  - Actions: **Join** (the Meet link), **Open record**, **Write note**
  - A soft countdown to the next session
- **Needs attention:**
  - Completed sessions without a note after 24 hours
  - New booking requests assigned to the clinician
  - Clients flagged moderate or high risk with no contact in 14 days
- **Four key numbers:**
  - Sessions this week
  - Upcoming in the next 7 days
  - Active clients
  - Attendance rate (90 days)

### 4.2 Bookings
- **Tabs:** Requests, Upcoming, Past.
- **Each booking shows:**
  - Client alias (or "New client" before a record exists)
  - Track and format
  - Primary and backup slots
  - Client time zone
  - Status and Meet link
- **Status flow:** Requested, Confirmed, then Completed, No-show, Cancelled or Rescheduled.
- **Clinician actions:**
  - Mark Completed or No-show; this prompts to write the note.
  - Add or change the Meet link.
  - Add a private booking note.
  - Request a reschedule; this flags it to the coordinator.
- **Who confirms (decision D3):**
  - Confirming a request (choosing primary or backup) is a coordinator action by default.
  - The clinician confirms only if the practice decides so.
- **New client:** "Create client record" converts a first booking into a client record.

### 4.3 Schedule
- **14-day grid:** dates down the side, Morning, Afternoon and Evening shifts across, each with its slot times (IST).
  - One tap toggles a shift or a single slot open or blocked.
  - Booked slots show the client alias and can't be blocked.
- **Weekly pattern:** "My usual week" sets the default shifts per weekday and generates dated rows for the next 14 days.
- **Leave:** a date range blocks every slot and shows "On leave" on the public profile.
- **Feeds the public booking picker:** `getAvailability()` in `data/schedule.ts` switches from the sample pattern to these rows through `/api/availability`. That route returns only `{day, time, shift}` and strips client IDs.
- **Phones:** one day at a time with a date strip, as in the public booking card.

### 4.4 Clients (add, view, edit, archive)
- **List:**
  - Search by alias; filter by status (Active, Paused, Discharged, Archived), track and risk level.
  - Each row shows the alias, track, last session, next session and a risk dot.
- **Client record:**
  - **Profile:** alias, full name, WhatsApp, email, date of birth (with an 18+ check), gender (optional), country and time zone, preferred language, track, referral source, emergency contact (optional).
  - **Consent:** the date it was recorded and the consent version.
  - **Status and tags.**
  - **Timeline:** sessions, notes, measures and status changes, newest first.
  - **Current plan:** goals and the next session focus.
- **Delete is archive:** a soft delete with a reason. Records are kept for the legal retention period (section 9). Permanent erasure on a client's request is a coordinator action that checks retention obligations first.
- **Duplicate check** on WhatsApp number when adding a client; it compares hashed numbers, since the number itself is encrypted.

### 4.5 Session notes (clinical records)
- **One note per session.** The format is the clinician's choice: SOAP, DAP or free text.
  - **SOAP:** Subjective, Objective, Assessment, Plan.
  - **DAP:** Data, Assessment, Plan.
- **Each note has these fields:**
  - **Presenting concerns.**
  - **Observations.**
  - **Assessment and diagnostic impression:** an ICD-11 code and label, marked provisional or confirmed, chosen from a searchable list.
  - **Modalities used:** CBT, ACT, EFT, Gottman, MBCT and others.
  - **Plan:** interventions, homework and next-session focus.
  - **Risk:** None, Low, Moderate or High, with risk notes and safety-plan steps.
  - **Measures (optional, decision D4):** PHQ-9 and GAD-7 scores.
- **Writing and editing:**
  - Drafts autosave to the server every few seconds, never to browser storage.
  - A note can be edited freely for 72 hours. After that it locks, and changes are added as dated **addenda**, which is standard clinical practice.
  - Every save and every view is written to `Audit_Log`.
- **Clinical-safety prompts:**
  - Choosing High risk shows a reminder of the practice's escalation steps and crisis lines.
  - High risk also flags the client on Today until there has been contact. The escalation text needs clinical sign-off.

### 4.6 Analytics

Charts follow the `dataviz` skill (one system, accessible, works in light and dark). Each chart has a short plain-English caption and a data table for screen readers.

| Chart or figure | Definition |
|---|---|
| Sessions per week (last 12 weeks), columns | Completed bookings per IST week |
| Attendance and cancellations (12 weeks), line | Completed ÷ (completed + no-show); cancelled ÷ all booked |
| New vs returning clients (by month), stacked columns | A first-ever completed session that month counts as new |
| Hours delivered (month) | Sum of session durations |
| Track mix, horizontal bars | Active clients per track (bars rather than a donut, for readability) |
| When you work, weekday by shift heatmap | Completed sessions in the last 90 days |
| Where clients are, horizontal bars | Active clients by country (diaspora reach) |
| Schedule use | Booked slots ÷ open slots, last and next 4 weeks |
| Outcome trends (if D4 is yes) | Per-client PHQ-9 and GAD-7 sparklines on the client record, plus the average change for clients with 2 or more measures |

The range picker offers 4 weeks, 12 weeks, 6 months and 12 months. Empty state: "Your charts fill in as you complete sessions."

### 4.7 Profile
- **Editable:** the fields the public `/therapists` pages show (photo, title, bio, approach, first-session guide, specialties, modalities, languages, education, voice intro).
- **Not editable here:** registration number; it is coordinator only.
- **Publishing:** with live preview of the public card; edits go live when published. Decision D5: immediately, or after coordinator review (recommended).
- **Source of truth:** `data/therapists.ts` moves to the `Clinicians` tab (public fields only). The site reads it at build time and revalidates when a clinician publishes.

### 4.8 Settings
- Change PIN (needs the current PIN).
- Set up an authenticator (if D1 is yes).
- Session length and idle-lock time, within limits.
- "Sign out everywhere".
- Download my data: the clinician's own records, encrypted, available to the coordinator only (Phase E).

## 5. States (every screen)

| State | Behaviour |
|---|---|
| Loading | Skeletons the size of the final content; no layout shift. Sheets reads take 0.3 to 1 s, so data streams in by section. |
| Empty | One calm sentence and one action ("No sessions today. Your next one is Thursday." / "Add your first client"). |
| Error (Sheets unreachable or quota) | "We couldn't reach your records. Nothing was lost; try again in a moment." A retry button; unsaved note drafts stay in the editor. |
| Saving | Inline "Saving…", then "Saved 10:42". Nothing changes until confirmed. Conflicts are detected by row version. |
| Locked (idle) | Content removed from view, PIN prompt; returns to the same place. |
| Signed out or expired | Back to `/portal` with "Please sign in again". |
| Not yours, or missing | The same 404. |

## 6. Data model (Google Sheets is the database: decided by the user, 2026-11-25)

**Two spreadsheets, so the most sensitive data has its own, tighter sharing.** Both are owned by the practice's Google account.

| Spreadsheet | Tabs | Shared with |
|---|---|---|
| **Ullidam Operations** | `Clinicians`, `Weekly_Pattern`, `Therapist_Schedule`, `Bookings_Log` | The service account; the coordinator may edit, since they log WhatsApp bookings here |
| **Ullidam Clinical Vault** | `Clients`, `Clinical_Records`, `Audit_Log` | The service account only, plus one named admin for recovery. No day-to-day human access: clinicians use the portal. |

**How the sheets behave as a database**

- **Layout:** one tab per table. Row 1 is a frozen header whose names match the code exactly, and one row is one record. Formulas, merged cells and manual formatting stay out of data tabs; the app owns them.
- **IDs:** generated by the app, never by row number, for example `CL-7F3K9Q` (client), `RC-…` (record), `BK-…` (booking). Rows are found by ID, so sorting or deleting rows by hand can never point the app at the wrong record.
- **Reads:** each screen makes one `batchGet` of the ranges it needs. The app filters by `Clinician_ID` on the server and keeps an in-memory index from ID to row number, refreshed on each request. This is comfortable up to tens of thousands of rows; past that, see Risks.
- **Writes:**
  - New records are appended (`values.append`).
  - Edits update one row by its index after checking `Row_Version`. If someone else changed the row, the save stops and asks to reload, so it never silently overwrites.
  - Deletes are soft: `Status = Archived` or `Deleted_Reason`. Rows are never removed.
- **Protection:**
  - Dropdown validation on the enumerated columns (Status, Shift, Risk_Level, Track, Format) catches manual-edit mistakes.
  - Protected ranges on the Vault tabs, so only the service account can edit.
  - Google's version history remains as an extra undo.
- **Backups:** a small Apps Script time trigger (daily) copies both spreadsheets to a restricted Drive folder and keeps 30 days.
- **Concurrency:** a clinician edits only their own rows, and the coordinator rarely touches the same row at the same moment. Row versions cover the rare collision.

**Data rules:**
- All dates and times are stored as plain text: `YYYY-MM-DD` and `HH:MM` in IST.
- Every row has `Row_Version` (an incrementing number) and `Updated_At`.
- Encrypted fields hold `v1:<iv>:<ciphertext>:<tag>` (AES-256-GCM).

| Tab | Columns | Encrypted |
|---|---|---|
| `Clinicians` | Clinician_ID, Display_Name, Slug, PIN_Hash, PIN_Salt, Failed_Attempts, Locked_Until, Session_Version, TOTP_Secret, Active, then the public profile fields | TOTP_Secret |
| `Clients` | Client_ID, Clinician_ID, Alias, Full_Name, WhatsApp, WhatsApp_Hash, Email, DOB, Gender, Country, Time_Zone, Language, Track, Referral, Consent_Date, Consent_Version, Emergency_Contact, Status, Risk_Level, Tags, Archived_Reason, Created_At | Full_Name, WhatsApp, Email, DOB, Emergency_Contact |
| `Bookings_Log` | Booking_ID, Created_At, Client_ID, Client_Name, WhatsApp_Number, Service_Track, Format, Country_Timezone, Therapist_ID, Primary_Slot, Backup_Slot, Confirmed_Slot, Status, Meeting_Link, Clinician_Note | Client_Name, WhatsApp_Number, Clinician_Note |
| `Therapist_Schedule` | Therapist_ID, Date, Slot_Time_IST, Shift, Is_Available, Booked_Client_ID, Reason | none (the public API strips Booked_Client_ID) |
| `Clinical_Records` | Record_ID, Client_ID, Therapist_ID, Booking_ID, Session_Date, Format, Note_Format, Note_Body, Diagnosis_Code, Diagnosis_Label, Diagnosis_Status, Modalities, Risk_Level, Risk_Notes, PHQ9, GAD7, Locked_At, Parent_Record_ID (addenda), Deleted_Reason | Note_Body, Diagnosis_Label, Risk_Notes |
| `Weekly_Pattern` | Therapist_ID, Weekday, Shift, Active | none |
| `Audit_Log` | Timestamp, Clinician_ID, Action, Entity, Entity_ID, IP_Hash, Result | none (no clinical content, ever) |

The column names extend the master spec's (section 6.1).

**Why encrypt in the app:**
- Sheets has no per-row permissions.
- Anyone who opens the spreadsheet (an admin, a mis-shared link, a Google export) would otherwise see clinical notes in plain text.
- Encryption with a key held only in Vercel env (`RECORDS_ENCRYPTION_KEY`) means the sheet alone reveals nothing clinical.
- Keys are versioned (`v1:`) so they can be rotated.

## 7. Architecture

- **Server-only data layer:** `lib/portal/` holds `sheets.ts` (Google Sheets API via the service account), `crypto.ts`, `auth.ts`, `audit.ts` and `repo/*.ts`. Every file imports `server-only`.
  - **Clinician scoping:** every repo function takes the `clinicianId` from the verified session, never from the request.
- **Reads and writes:**
  - Reads and mutations run in Server Components and Server Actions, so client components never receive raw rows.
  - Responses contain only the fields that screen needs, decrypted on the server.
- **Route protection:**
  - Next 16 `proxy.ts` (formerly middleware) redirects unauthenticated `/portal/*` requests.
  - Every Server Action checks the session again.
  - `/api/availability` is public and read-only.
- **Caching:**
  - Public data (open slots, published profiles) uses tag-based caching, revalidated on change.
  - Client, booking and note data is never put in a shared cache.
- **Sheets limits:** the API allows about 300 reads per minute per project. Each screen batches its reads (`batchGet`) and writes append or update single rows with a row-version check. That is ample for 4 to 20 clinicians.
- **Meet links:** pasted by the coordinator or clinician at first. Automatic creation through the Google Calendar API comes later.
- **Libraries (new):**
  - `googleapis` (or the lighter `google-auth-library` with REST calls)
  - `jose` for the session token
  - `recharts` for charts, loaded only on `/portal/analytics`
  - `server-only`
  - Node's built-in `crypto` for scrypt and AES-GCM
- **Tests:** add `vitest` for security-critical units only:
  - encryption round-trip and tamper detection
  - PIN hashing and lockout
  - clinician isolation (a repo call with another clinician's ID returns nothing)

## 8. Design direction

- The same tokens, fonts and components as the public site, from `theme.ts`, Funnel Display and Funnel Sans.
- Calmer and denser than marketing pages, but still generous.
- No dashboard-widget slop:
  - Numbers set as type, not in icon tiles.
  - Charts in quiet palette colours.
  - Today laid out as a timeline, not a grid of cards.
- Risk shown with shape and colour together (dot plus label), never colour alone.
- Every action has a 44 px touch target.
- Keyboard first on desktop: `/` for search, `n` for a new note on a client record.
- The **"Hide names"** privacy toggle and the idle lock are visible features, part of the trust the portal shows clinicians.

## 9. Privacy, clinical safety and law (needs the practice's legal and clinical review)

- **India:**
  - **Digital Personal Data Protection Act 2023:** consent, purpose limits, security safeguards, breach notification, right to erasure balanced against legal retention.
  - **Mental Healthcare Act 2017, section 23:** confidentiality of mental-health information.
  - **Telemedicine Practice Guidelines 2020:** psychiatry and prescriptions.
  - Medical record retention (commonly at least 3 years); the practice must set the policy.
- **Clients abroad:** UK and EU clients bring GDPR obligations; this is noted, not solved here.
- **Built-in safeguards:**
  - Encryption of personal and clinical fields
  - Least-privilege access (each clinician sees only their own)
  - An audit trail
  - Idle lock and no browser storage of records
  - No analytics or third-party scripts on `/portal`
  - Backups: a daily copy of the spreadsheet to a restricted Drive folder, kept encrypted
- **Never:** real client data in development; use clearly fake seed data.

## 10. Phased build (each phase shippable and reviewed)

| Phase | Scope | Done when |
|---|---|---|
| A. Foundations | Google Cloud project, service account and spreadsheet with tabs; env vars; `lib/portal` (sheets, crypto, auth, audit); sign-in with PIN and lockout; portal shell (rail, bottom tabs, idle lock, "Hide names"); noindex; vitest for crypto, auth and isolation | Each of the 4 clinicians signs in with their own PIN and sees their own empty shell; 5 wrong PINs lock; another clinician's URL gives 404; tests pass |
| B. Today, Schedule, Bookings | Schedule grid, weekly pattern, leave; `/api/availability` feeds the public booking picker; bookings list and status actions; Today timeline with Join | Blocking a shift removes it from the public picker within a minute; marking a session complete moves it to Past and prompts for a note |
| C. Clients and notes | Add, view, edit and archive clients; record timeline; note editor (SOAP, DAP, free) with autosave, 72-hour lock and addenda; ICD-11 picker; risk and escalation prompt; audit of views and edits | A note round-trips encrypted (the sheet shows ciphertext); a locked note accepts only addenda; archive keeps the record |
| D. Analytics and Profile | KPI numbers and charts (4.6) with accessible tables; profile editor with preview and publish into `/therapists` | Charts match hand-counted seed data; a published bio appears on the public profile |
| E. Hardening and coordinator | Authenticator second step; coordinator desk (assign bookings, onboard and reset); exports; backups; `/security-review`; fresh code-vs-spec review | Security review findings fixed; a backup restore works |

## 11. Setup the practice must do (I can't do these from here)

1. A Google account for the practice: a Google Workspace account is recommended over a personal Gmail.
2. A Google Cloud project, with the Sheets API enabled and a service account. Download its key, create the two spreadsheets (Operations and Clinical Vault), and share them as section 6 describes. I'll provide a setup script that creates every tab, header, dropdown and protected range.
3. Generate the secrets and add them to `.env.local` and Vercel:
   - `PORTAL_SESSION_SECRET` (32 random bytes)
   - `RECORDS_ENCRYPTION_KEY` (32 random bytes)
   - Keep a copy of the encryption key somewhere safe and offline: lose the key and the encrypted notes are unrecoverable.
4. Each clinician chooses their own 6-digit PIN at first sign-in, using a one-time setup code from the coordinator.

## 12. Decisions for the user

| # | Decision | Recommendation |
|---|---|---|
| D1 | PIN only, or PIN plus an authenticator code on new devices | PIN plus authenticator before real client data |
| D2 | Where the data lives | **Decided: Google Sheets** (two spreadsheets, Operations and Clinical Vault, section 6), with app-side encryption of personal and clinical fields |
| D3 | Who confirms booking requests | The coordinator confirms; clinicians see and complete |
| D4 | Track PHQ-9 and GAD-7 outcome scores | Yes, optional per session; it powers the outcome charts |
| D5 | Profile edits go live immediately or after review | After coordinator review |
| D6 | Coordinator desk now (Phase E) or later | Later; the coordinator uses the Sheet directly until then |
| D7 | Record retention period and erasure policy | The practice's clinical and legal lead decides; the app enforces it |

## 13. Risks

- **Loss of the encryption key** makes notes unreadable. Mitigation: the offline key copy and the backup procedure.
- **Sheets latency and quotas:** batching, streaming UI and row versions. All Sheets access sits behind the repository functions in `lib/portal/repo`. If the practice ever outgrows Sheets (well past roughly 20 clinicians or 50,000 note rows), only that layer changes; the screens stay the same.
- **Service-account key leak** gives access to the whole sheet, but clinical fields stay encrypted. Rotate the key and use env-only storage.
- **Placeholder clinicians:** real profiles, PINs and photos replace them before launch.

## 14. Revisions after the fresh review (2026-11-25)

The user approved the plan ("ok start"); a fresh reviewer then found serious gaps. These revisions change the plan.

### Built in Phase A
- **Sign-in secrets in the Vault.** `Clinician_Auth` (PIN hash, lockout, session version, setup code) is in the Clinical Vault; Operations keeps only the public card fields.
- **PIN pepper.** PINs are keyed with an env-only `PIN_PEPPER` before scrypt, so a copied hash can't be cracked offline.
- **Server-enforced idle limit and session length.**
  - The token carries last activity and sign-in time; the server refuses a session after 20 idle minutes or 12 hours from sign-in.
  - The page sends a keep-alive while the clinician is active.
  - Session versions are checked on every request, with a 60-second cache per instance.
  - Changing the PIN bumps the version.
  - Sign-out reloads the page fully.
- **Single PIN counter.** Idle-unlock, PIN change and setup codes all use the same lockout counter.
- **Encryption** covers every Clients and Clinical_Records field except IDs, clinician ID, status and dates. Associated data binds each value to its tab, row and column.
- **First sign-in.** One-time setup codes: hashed, single use, 24 hours. The clinician chooses their own PIN.
- **Portal chrome.** The public header, footer, floating links and smooth scroll are hidden on `/portal`; the proxy guard and no-index/no-store headers are in place.
- **Tests.** vitest covers encryption, tampering, moved ciphertext, pepper, forged and expired tokens, idle, lockout, separation between clinicians, and setup codes.

### Changed for later phases
- **Hard gate:** no real client data until Phase E passes. That means mandatory authenticator (TOTP) sign-in, backups with a tested restore, a security review and a coordinator account.
- **Lockout abuse and races:**
  - A Vercel Firewall rate-limit rule on `/portal`.
  - Lockout only on untrusted devices, using a trusted-device cookie.
  - Contended writes (lockout counter, slots, bookings) go through an Apps Script endpoint under `LockService`.
- **Sheets quota (60 requests a minute per service account):**
  - About 2 calls per request.
  - Autosave every 20 to 30 seconds and on leaving a field.
  - One audit row per view session.
  - Public data served from cache, with backoff on 429 errors.
- **Rows:**
  - Rows are addressed by developer metadata, not row number.
  - An `onEdit` trigger bumps versions on hand edits.
  - The setup script formats every data column as plain text.
- **Keys and accounts:**
  - Two service accounts (Operations, Vault), keyless via Workload Identity Federation.
  - Production secrets scoped to Production only, with fake-data spreadsheets for previews.
  - Per-client data keys, so erasing a client destroys their key, which also covers copies in version history and backups.
- **Coordinator:** a minimal coordinator desk moves into Phase B (entering bookings, confirming a slot and booking together, seeing contact details). Without it, encrypted bookings have no working path. **Decision D8.**
- **Notes:**
  - Draft, then Sign (Signed_At, Author_ID).
  - A `Note_Versions` tab keeps pre-lock history.
  - "Entered in error" replaces delete.
  - Very long note bodies are capped or chunked.
- **New tabs:**
  - `Cases`: couples and co-care, with a "transfer care" action.
  - `Medications` and `Prescriptions`: Track B, with identity verification on first consults.
  - Follow_Up_Due on records.
- **Risk:**
  - The client's level is the latest signed assessment, with a "Log contact" action.
  - High risk alerts the clinical lead without clinical content.
  - A PHQ-9 item 9 score above 0 forces the risk prompt.
- **Schedule:**
  - A daily cron job extends the 14-day window and archives past rows.
  - Duration_Min on bookings.
  - Confirming or cancelling updates the booking and its slot in one locked write.
- **Public site data:** served by server `use cache` getters (`cacheTag`, 60-second `cacheLife`) passed into BookingCard as props; `data/therapists.ts` stays as the fallback. Photo storage is still to be decided.
- **Minors, consent, retention:**
  - Under-18 clients are blocked, with a referral message.
  - Consent method, recorded-by and withdrawal fields (added).
  - Retention_Until and a purge job.
  - Client record export (Mental Healthcare Act section 25).
- **Audit:** hash-chained rows, "Recent sign-ins and access" in Settings, new-device alert, a yearly log roll.
- **Everyday tools:** Join for audio sessions (tap to call), message a late client, ad-hoc and crisis sessions, cancellation and reschedule fields, and an "unsaved" banner.

### New decision
| # | Decision | Recommendation |
|---|---|---|
| D8 | Bookings and encryption | Build a minimal coordinator desk in Phase B, so the coordinator never types into the encrypted sheet |

## 15. Build status (2026-11-25): Phases A to D built on the local stand-in

**Built**
- Sign-in and security (Phase A).
- Today, Bookings, Schedule and a minimal coordinator desk (Phase B, D8 accepted).
- Client records and session notes (Phase C).
- Analytics and the profile editor with coordinator approval (Phase D).

**Checks:** 20 vitest tests pass, covering clinician isolation for every mutation, encryption at rest, under-18 and consent rules, signed-note lock and hand-counted analytics. Every screen was exercised in a browser at 1440 x 900 and 390 x 844.

**Deliberate changes from the plan**
- **Availability model.** A weekly pattern plus dated overrides (`data/schedule.ts` `daySlots`), shared by the portal and the public booking card. This replaces generated dated rows, so no rolling cron job is needed and rows don't pile up. A whole-day override uses `Slot_Time_IST = "ALL"`.
- **Notes lock when signed**, not after 72 hours. Drafts are editable and autosave to the server; later changes are addenda; a mistaken note is marked "Entered in error". This makes the `Note_Versions` tab unnecessary.
- **Charts** are dependency-free server-rendered SVG and HTML, with an accessible table each, instead of recharts.
- **Profile edits** are saved as drafts (`Draft_*` columns). The coordinator approves them into the live columns that `/therapists/[slug]` reads through cached `publicProfile()`, with `data/therapists.ts` as the fallback.
- **The coordinator** signs in like a clinician (a `Role` column) and sees only the Desk and Settings. Clinical screens redirect the coordinator to the Desk.

**Still open (Phase E and the hard gate before real data)**
- Authenticator (TOTP) sign-in.
- The Google Sheets setup with two service accounts and the setup script.
- Apps Script locked writes for slots, bookings and lockout.
- Backups and a tested restore.
- Audit hash chain and "recent access".
- Cases (couples and co-care), Medications and Prescriptions, client export.
- A security review.
