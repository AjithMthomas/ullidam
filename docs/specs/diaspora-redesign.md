# Spec: `/diaspora` redesign — "Far from home"

Status: draft for review (2026-11-24). Workflow: CLAUDE.md section 9 (spec, fresh review, user approval, build, code-vs-spec check).

## 1. Goal

Make `/diaspora` the main way Malayalis abroad find Ullidam and send a first WhatsApp message. The page should:

1. **Recognise their life.** Name the specific pressures of living far from home so the visitor feels "they know my situation" within one screen.
2. **Make the mother-tongue promise concrete.** Feelings are easier to say in the language you first felt them in.
3. **Remove every practical doubt.** Time zones, shared rooms, which app to use, privacy from family back home.
4. **Make the first message effortless.** Use a pre-written WhatsApp message that already carries the visitor's situation and time zone.
5. **Turn visitors into referrers.** Let them share the page with someone abroad, with family in Kerala, or with a Malayali association.

**Success measure (once analytics exist):** the share of `/diaspora` visits that tap a WhatsApp action. No tracking is added in this build.

## 2. Audience

| Segment | Typical situation | Their words (recognition lines, not testimonials) |
|---|---|---|
| Working in the Gulf | Long shifts, a shared room, money sent home, years away from family | "I send money home every month. No one asks how I am." · "Twelve-hour shifts, a shared room, and nowhere private to cry." |
| Students abroad (UK, Canada, Australia, Europe) | Education loan in the parents' name, part-time work, isolation, culture shock | "The loan is in my parents' name. I can't fail." · "Everyone back home thinks I'm living the dream." |
| Nurses and healthcare workers | Shift work, burnout, caring for everyone but themselves | "I look after everyone on my shift. Then I go home to an empty flat." |
| Couples and families apart | Long-distance marriage, a spouse on a dependent visa, raising children alone in Kerala | "We talk every night, but we are drifting." · "I had a career in Kerala. Here I'm just someone's wife." |
| Parents raising children abroad | Two cultures at home, teenagers, grandparents far away | "My children are growing up in a world I don't fully understand." |
| Returning home | Re-entry after years away, not fitting in either place | "I came back after fifteen years, and I don't fit anywhere." |

Secondary audience: **family in Kerala** who are worried about someone abroad. This is the visitor whose device time zone is IST.

Recognition lines are presented as "You might recognise some of these", never as quotes from real clients (CLAUDE.md: no testimonials or invented claims).

## 3. Page flow (mobile first; every section designed at 390 x 844 first)

Each section keeps to one idea, two or three short sentences, and generous space (CLAUDE.md sections 3 and 8C).

### 3.1 Hero (first screen)
- **Eyebrow:** "For Malayalis abroad"
- **Headline:** "Far from home. Never far from someone who understands."
- **Lead:** "Online counselling in Malayalam, at an hour that fits your shift."
- **Primary action:** "Message us on WhatsApp". It uses the segment-aware prefilled message (3.3); before a segment is chosen, the diaspora default with the detected region.
- **Secondary action:** "How it works" (in-page link).
- **Clock chip:** "Your time 9:40 PM · Kerala 11:10 PM", from the device time zone only.
  - Server render shows Kerala time only; "your time" appears after hydration.
  - If the visitor is in India, the chip reads "Kerala 11:10 PM" with a link: "Worried about someone abroad?" (to 3.8).
- **Photo:**
  - A real, sharp photograph: a South Asian person on a phone or video call at night, by a window with city lights.
  - Text is never over a face.
  - Phones get an art-directed portrait crop (CLAUDE.md mobile rule).
- **Layout:** desktop is a split (text left, photo right, rounded); phones stack text first with the photo below the action. Primary action visible at 390 x 844 without scrolling.

### 3.2 "We know this life" (problems)
- **Heading:** "Life abroad carries things no one sees."
- **Body:** one short paragraph, then six problem tiles:
  - Loneliness
  - Pressure to provide
  - Missing family moments: festivals, illness, funerals
  - A marriage across distance
  - Burnout from shifts
  - Shame about struggling when you are "supposed to be doing well"
- **Tiles:** a title and one sentence each. No icon grid clichés (CLAUDE.md 8B): typographic tiles with a number, or a quiet line illustration from lucide at most.

### 3.3 "Which sounds like you?" (segment selector, the conversion core)
- **Prompt:** "Choose what fits you best"
- **Chips:** six chips, one per segment in section 2.
- **On selecting a chip:**
  - Two recognition lines for that segment
  - One sentence on how Ullidam helps
  - The suggested track, linked: individual, couples or divorce
  - An action, "Send this message", that opens WhatsApp prefilled, for example: "Hello Ullidam, I'm a nurse working in the UK (my time zone is Europe/London). I'd like to talk to someone in Malayalam."
- **Visitor control:** the visitor can edit the message in WhatsApp before sending; we tell them so ("You can change it before you send").
- **Accessibility:** a radiogroup (arrow keys move, Space selects). Nothing is selected on load; the panel shows a neutral prompt.
- **Storage:** the chosen segment is not stored anywhere except the outgoing WhatsApp text.

### 3.4 "Why your mother tongue matters"
- **Heading:** "Some feelings only make sense in Malayalam."
- **Three short points:**
  1. **No translating your feelings.** Say it the way you feel it.
  2. **No explaining the culture.** Joint families, marriage pressure, "what will people think": we already know.
  3. **No judgement.** Whatever you are carrying.
- **Optional (decision Q1):** one transliterated Malayalam line in Latin script as a pull quote. Malayalam script stays banned.

### 3.5 "Built around your clock" (time-zone helper)
- **City list:**
  - Device time zone is detected and offered first.
  - The visitor can switch city: Dubai/Abu Dhabi, Riyadh/Jeddah, Doha, Kuwait, Muscat, Bahrain, London, Dublin, New York, Toronto, Sydney, Singapore, Kerala.
- **Shown for the chosen city:**
  - Their current time and Kerala time, side by side.
  - A small "If you're free at…" picker: pick an hour and see the IST equivalent ("8:00 PM in Dubai is 9:30 PM in Kerala").
- **Timing note:** "Tell us two times that suit you. Our coordinator matches them to a clinician's schedule." No promise of specific hours until the practice confirms (open item C1).
- **Weekend note (factual, confirm C2):**
  - The UAE weekend is Saturday and Sunday.
  - Saudi Arabia, Qatar, Kuwait, Oman and Bahrain have Friday and Saturday.
  - "We schedule around your weekend, not ours" only if the practice confirms weekend sessions.
- **Clock behaviour:** all conversions use `Intl.DateTimeFormat` with IANA zones, so daylight saving in the UK, US, Canada and Australia is handled automatically. The live clock reuses the 15-second tick from `LiveClocks`.

### 3.6 "Private, even in a shared room"
Practical privacy for people who live in shared accommodation or with family:
- Join from your phone with earphones. A parked car, a quiet corner or a walk all work.
- We never contact your family. No one in Kerala needs to know.
- The coordinator's messages use plain wording (confirm C3).
- Nothing to install beyond the video link's app (confirm C4: Google Meet on phones).
- **Gulf note (confirm C5):** WhatsApp voice and video calls are restricted in the UAE and some Gulf countries, so sessions use a private video link instead; messaging on WhatsApp works.

### 3.7 How it works (NRI version, three steps)
1. **Message us on WhatsApp.** Text is enough; no call needed.
2. **Share two times in your time zone.** We confirm one, with Kerala time alongside.
3. **Join a private video link from your phone.** Couples in two countries can each join from their own phone (confirm C6).

### 3.8 "Worried about someone abroad?" (family in Kerala)
- **Copy:** "If someone you love abroad seems tired, distant or not themselves, you can share this page with them. Sometimes a message from home is the first step."
- **Action:** "Share on WhatsApp" opens `https://wa.me/?text=` with a gentle pre-written note and the page URL. No number is needed and the visitor picks the contact. A secondary action copies the link to the clipboard.
- **India visitors:** for time zone IST, this section is also linked from the hero chip.

### 3.9 Clinicians
- **Heading:** "Clinicians who understand both worlds"
- **Content:** a compact strip of two to four clinician cards (reusing `TherapistDirectoryCard`, or a smaller variant), labelled "Sample profiles". Link: "See all clinicians".

### 3.10 For Malayali associations and employers (growth channel)
- **Copy:** "Bring a mental health session to your Samajam, church group, nurses' association or workplace." Online talks and workshops, in Malayalam.
- **Action:** WhatsApp prefilled ("Hello Ullidam, I'm with a Malayali association in Dubai and would like to ask about a session for our members.") and a link to `/awareness`.
- Confirm C7 that the practice offers this to groups abroad.

### 3.11 NRI questions (FAQ)
Six questions at most, as an accordion of native `details` elements:
1. Can I book from the Gulf, UK, US or Australia? (Yes, online; any country.)
2. What do I need for a session? (A phone, earphones, the video link.)
3. Will my family in Kerala find out? (No; we never contact anyone without your consent, except where safety law requires; see C8.)
4. Can my spouse and I join from different countries? (C6)
5. Do you offer sessions on Fridays or weekends? (C2)
6. What if I'm in crisis right now? (Show region-first crisis lines from `crisisLinesFor`, plus "call your local emergency number".)

Emits `FAQPage` JSON-LD (only questions whose answers are confirmed).

### 3.12 Closing
Reuse `ClosingCta` with the diaspora message, a privacy line, and the crisis note. The floating WhatsApp button also uses the diaspora message on this page (C9: confirm we want per-page openers).

## 4. Ideas for more first messages (summary)

1. **Segment-aware prefilled messages (3.3).** The visitor doesn't have to write the hardest first sentence.
2. **Time-zone helper (3.5).** It answers "will they be awake when I'm free?" before it is asked.
3. **Share from Kerala (3.8).** Families back home become a referral channel.
4. **Associations and employers (3.10).** One workshop reaches dozens of people.
5. **Search and link previews.**
   - Metadata targeting "Malayalam counselling online UAE / Dubai / Saudi / UK / Canada".
   - An Open Graph image designed for WhatsApp link previews; most NRIs will meet the page as a forwarded link.
   - `areaServed` in JSON-LD.
6. **Later, not in this build:** country pages (`/diaspora/uae`, `/diaspora/uk`), and a Malayalam voice welcome from a clinician (uses `VoiceNote` once recordings exist).

## 5. States

| Element | Loading / server render | Empty / not chosen | Error / unsupported | Success |
|---|---|---|---|---|
| Clock chip | Kerala time only | n/a | `Intl` failure: show "Kerala time (IST)" without the clock | Your time + Kerala time |
| Segment selector | All chips visible, none selected | Neutral prompt and default WhatsApp action | n/a (static content) | Lines, track link and prefilled action for that segment |
| Time-zone helper | Kerala preselected until hydration | n/a | Unknown zone: fall back to the city list with "Choose your city" | Two clocks and the converted hour |
| Share (3.8) | Buttons render as links (work without JS) | n/a | Clipboard denied: show the URL selected for manual copy | "Link copied" (polite live region) |
| FAQ | Native `details`, works without JS | n/a | n/a | n/a |

## 6. Edge cases
- **Time zones:**
  - Half-hour and 45-minute zones: India +5:30, Nepal +5:45, Newfoundland -3:30. Format conversions with `Intl` and never add hours by hand.
  - Daylight-saving transitions: the converted hour may cross midnight, so show the day ("9:30 PM Thu in Kerala").
  - The device time zone can be wrong on VPNs. The visitor can always change city.
- **Messages:**
  - The prefilled WhatsApp text must stay under about 1,000 characters and be URL-encoded (`whatsappHref`).
  - Never include personal data beyond what the visitor chose: segment and time zone name.
- **Reduced motion:** no scroll-driven film here. Small Motion transitions on the segment panel only, using `springCalm`, disabled by `MotionConfig`.
- **Privacy:** no cookies or analytics; the segment and city live in component state only. The time zone is read from the device, never from IP.
- **Rules:**
  - Zero-Price: no fees, "free", currency or insurance figures.
  - English-only: no Malayalam script (see Q1 for transliteration).
- **Crisis lines:** must show the clinical sign-off caveat until verified (project open question).

## 7. Visual direction
- **Within the existing system:** "Kerala Morning" theme, Funnel Display / Funnel Sans, `theme.ts` tokens only.
- **Distinct feeling:** evening. Late light and city windows, the hour most NRIs reach out.
  - The page can use the `night` / `nightSoft` tokens for one deep section (3.2 or 3.4) to mark the change from day to evening, while body text keeps AA/AAA contrast.
- **Photography:**
  - Two to three real, sharp photographs: night-window phone call (hero), nurse after a shift or student in a winter coat (3.3 panel art per segment if good images exist; otherwise none), Kerala home detail for 3.8.
  - Each needs a portrait crop for phones.
- **No banned patterns:** no gradient blobs or icon-card grids. One focal point per screen.
- **Motion:** gentle. Chip selection uses `layoutId` for the active pill (as in the header nav), and the panel content cross-fades. Nothing loops except the live clock text.

## 8. Build notes
- `app/diaspora/page.tsx` stays a server component. Client islands:
  - `DiasporaClock` (hero chip)
  - `SegmentPicker` (3.3)
  - `TimeHelper` (3.5)
  - `ShareFromHome` (3.8)
- New data file: `data/diaspora.ts` holds segments, problem tiles, FAQ, cities and IANA zones.
- New message helpers in `lib/whatsapp.ts`: `diasporaMessage(segment?, timeZone?)` and `shareHref(text)` (the `wa.me/?text=` form without a number).
- Reuse: `ClosingCta`, `TherapistDirectoryCard`, `crisisLinesFor`, `detectTimeZone`, the `LiveClocks` tick pattern.
- Performance:
  - The hero image is eager; the rest are lazy.
  - No new libraries. Client JS for the islands stays small (no date library; `Intl` only).

## 9. Acceptance checks
1. At 390 x 844, the headline, lead and primary WhatsApp action are visible without scrolling. Same at 1440 x 900.
2. Choosing each of the six segments shows its lines, and the WhatsApp link opens with a message that names that segment and the visitor's time zone.
3. The time helper shows correct times for London, New York and Sydney in both daylight-saving and standard months. Check by setting the device clock or by unit-checking the formatter against fixed dates.
4. The share action opens WhatsApp with the note and page URL; copy-link works and announces "Link copied".
5. Keyboard only: the chips work as a radiogroup, the FAQ opens with Enter and Space, and focus rings are visible.
6. No prices, Malayalam script or emoji (`scripts/check-zero-emoji.mjs`); text contrast AA or better; touch targets at least 44 px.
7. Reduced motion: no animation beyond instant state changes.
8. The page has the `FAQPage` JSON-LD and the Open Graph image; the WhatsApp link preview shows the title, description and image.
9. `npx tsc --noEmit`, lint and `npm run build` pass; phone and desktop screenshots reviewed.

## 10. Open items for the practice

**Decision for the user:**
- **Q1:** Allow one or two transliterated Malayalam lines in Latin script (for example "Manassu thurannu samsarikkam", "open your heart and talk")? This would relax the English-only directive. Default if not decided: English only.

**Facts the practice must confirm before the related copy goes live.** Until confirmed, the build uses the neutral fallback wording given in brackets.

| # | Fact to confirm | Neutral fallback until confirmed |
|---|---|---|
| C1 | Session hours offered for Gulf, UK and US evenings, and early mornings | "Tell us two times; we match them" |
| C2 | Friday and weekend sessions | Omit the weekend promise |
| C3 | Coordinator messages use plain, discreet wording | Omit |
| C4 | Sessions on Google Meet; what clients need installed | "A private video link" |
| C5 | That session links work in the UAE and Saudi Arabia, where WhatsApp calls are restricted | Omit the Gulf note |
| C6 | Couples can join from two locations | Omit |
| C7 | Workshops for associations and employers abroad | Keep the section, but phrase it as "ask us about" |
| C8 | The confidentiality exceptions wording | Use the site's existing privacy line |
| C9 | Per-page floating WhatsApp openers | Keep the global message |

## 11. Revisions after the fresh review (2026-11-24, built)

The user approved the build ("build it"). The fresh review's must-fix items and most should-fix items are in the build:

- **Safer wording:**
  - Prefilled messages are neutral: never marriage, divorce or diagnosis words.
  - The visitor's city is readable, never a raw IANA zone name.
  - "You can delete the chat after" sits next to each send action.
- **Hedged claims:**
  - FAQ 1 is "the coordinator will tell you what is possible where you live", with a note that a local doctor may need to prescribe.
  - Privacy wording is "without your consent", with the safety exception.
  - No promised hours or weekends, no calling-restriction countries, no "nothing to install".
- **Crisis help:** "Not an emergency service" sits beside the hero action. The crisis lines are always visible (not in an accordion), all regions are shown, and a family member is told to contact emergency services where the person lives.
- **Family section:** we cannot contact an adult on the family's behalf; families can ask the coordinator for guidance. The share note is non-diagnostic.
- **One shared state:** a small store (`components/diaspora/store.ts`) holds segment, picked city and picked hour. Every WhatsApp action on the page reads it. The time helper's city and hour go into the message ("I'm usually free around 8:00 PM London time").
- **Structure:**
  - The problem tiles are merged into the recognition section as one editorial sentence, so there is no tile grid.
  - "How it works" is merged with the time helper.
  - The employer pitch is removed; the community section says "faith groups".
- **Segment picker:** native radio inputs styled as chips, with an `aria-live` panel.
- **Parent segment:** says "our care is for adults".
- **Clinicians:** a compact strip without availability or scarcity labels.
- **Time zones:**
  - The city list is expanded (Houston/Dallas, California, Brisbane, Kuala Lumpur and more).
  - Any device zone that isn't listed shows as "Your time (City)".
- **Link previews:** page-level Open Graph with a discreet title, plus `opengraph-image.tsx`.
- **Header:** no eyebrow above the headline.

**Still open for the practice:**
- C1 to C9.
- **C10:** cross-border rules (licensing and prescriptions) by country.
- **C11:** coordinator reply hours, to state on the page.
- **C12:** verify the extra crisis lines suggested by the reviewer before adding them: Australia, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain, Ireland, Singapore.
- **C13:** an email contact for countries where WhatsApp or Google Meet is blocked.
