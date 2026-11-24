# Spec: therapist booking picker (format, date, two times)

Status: approved by the user's direct request (2026-11-24); fresh review runs in parallel with the build. Part of Phase 3 (booking engine). CLAUDE.md section 9.

## Goal
On `/therapists/[slug]`, the booking card (right column; on phones, the card plus the sticky bar) lets a visitor:

1. Choose **video** or **audio call**.
2. Pick from the clinician's **available dates**.
3. Pick **up to two times**: a preferred time and a backup (the spec's dual-slot dispatch).
4. Send one WhatsApp request to the coordinator that carries all of it.

The coordinator still confirms; nothing is booked automatically.

## Data
- `data/schedule.ts` holds each clinician's weekly pattern and the slot times per shift, all in IST.
- Its shape mirrors the planned Google Sheet `Therapist_Schedule`: therapist id, weekday, shift (morning, afternoon, evening).
- In Phase 4, a fetch from the sheet replaces the sample object, through the same `getWeeklySchedule(id)` function.
- The clinicians' own dashboards (`/portal`) come later and will write to that sheet; same format for every clinician, with their own stats and records.

Until live schedules exist, the card says: "Sample availability until live schedules launch. Our coordinator confirms."

## Behaviour
- **Format:** a two-option radio (Video, Audio call). Default: Video.
- **Dates:**
  - The next 14 days, starting today in IST.
  - Days with no slots are shown but disabled, marked "Unavailable" for screen readers.
  - Today only offers slots that start at least 3 hours from now.
  - The first available date is selected after hydration.
- **Times:**
  - The selected date's slots, grouped by shift.
  - Each shows IST time and, when the visitor's device zone is not IST, their local time too ("6:30 PM IST, 1:00 PM London"), as in the diaspora timezone engine.
- **Picking:**
  - The first tap is Preferred and the second is Backup; tapping a picked slot removes it.
  - With two picked, other slots are disabled until one is removed.
  - Picks can be on different dates.
- **Summary** under the times: "Preferred: Tue 26 Nov, 6:30 PM IST" and "Backup: …".
- **Action:** "Request on WhatsApp". The message is "Hello Ullidam, I would like to request a confidential {video|audio} session with {name}.", then:
  - With picks: "Preferred: …. Backup: …."
  - The visitor's city, when it isn't IST.
  - With no picks: the same request without times, so the action always works.
- **Phones:** the sticky bar shows "Pick a time" (scrolls to the card) until a time is picked, then the summary and "Request".

## States
- **Server and before hydration:** format radio works; dates show a neutral "Loading available dates" block of fixed height; the request button links to the plain request.
- **No available dates in 14 days:** "No open times in the next two weeks. Message us and we will find one."
- **Error:** none to handle; the data is static, and Phase 4 will add fetch states.

## Rules
- Zero-Price: no fees anywhere.
- Zero-Emoji: lucide icons only.
- Touch targets of at least 44 px.
- Colours only from `theme.ts`.
- Reduced motion respected.
- Mobile checked at 390 x 844.
- Use neutral wording in the message (no diagnosis words).

## Acceptance
1. Pick a format, a date and two times; the WhatsApp text contains the format, both times with dates in IST, and the city when it isn't IST.
2. Disabled days and the third slot can't be picked.
3. Keyboard: the radios and slot buttons are reachable and announce their state.
4. Screenshots at 1440 x 900 and 390 x 844.
