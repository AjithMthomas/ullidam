# ULLIDAM — Cinematic Script

**Concept: from the storm outside to the space within.**

Old Kerala homes are built around a *nadumuttam*: an open courtyard at the heart of the house where the monsoon falls inside, quietly, and the light comes in. Ullidam means the space within. The site retells that idea as one continuous journey. A visitor arrives in the rain at dusk, carrying something heavy. They pass through a doorway into a calm, lit space. They leave at dawn, on the same water, with a clear next step.

Every page belongs to the same world, a Kerala backwater rendered live in the browser. Only the time of day changes.

## Visual language

| Element | Meaning | Where |
| --- | --- | --- |
| The backwater scene (hills, palms, water, a boat) | The visitor's inner landscape | Hero, closing, page heroes |
| Monsoon rain, rendered live | Overwhelm, noise, the weight carried | Hero, Act II |
| The arch (the logo's doorway) | A safe threshold; the space within | Logo, Act II, portrait frames, page heroes |
| The boat lamp (accent gold) | The self, still lit; the light within | Hero, closing, favicon |
| Navy night to beige surface to dawn light | Distress to safety to hope | Colour arc of the homepage (all colours from theme.ts) |

Nothing is a stock photograph of a stranger in distress. The only photographs are the clinicians, framed in arches, because the people you will actually meet should feel real.

## Motion principles

1. **The visitor is in control.** Story motion is scrubbed to their scroll; nothing plays at them.
2. **Slow and soft.** At least 600 ms for movement, calm ease-out curves, no bounce and no flashing.
3. **Breath, not spectacle.** Ambient loops (mist, the lamp, beacons) run on a 4 to 8 second breathing rhythm.
4. **Sound is opt-in.** Rain audio never autoplays.
5. **Reduced motion is a first-class version.** With `prefers-reduced-motion`, every scene is a still image, every pinned sequence becomes stacked panels, and smooth scrolling is off. Nothing is lost but the movement.

## Homepage storyboard

### Acts I and II: "Head Above Water" (replaces the dusk hero and the threshold)

The opening screen holds still for about three scrolls (components/story/HeadAboveWater.tsx; copy and images in data/story.ts).

| Scroll | Beat | What happens | Words |
| --- | --- | --- | --- |
| 0-10% | Under | A painterly portrait melting into white. The live water line sits across the eyes; colour is drained. The first scroll sends a ripple across the water. | Some days, it's hard to see clearly. |
| 10-37% | Mist | Real-time mist gathers over the water, then fills the screen; worries surface and dissolve. | What will people think? I should manage alone. |
| 37-58% | Breathe | A breathing guide; the mist thins with each breath. The cursor (or a tap) wipes the mist like a fogged window. The portrait changes inside the thickest mist. | You don't have to carry this alone. |
| 58-80% | Clear | The mist lifts from the water upward; colour returns; the water line falls below the chin; morning light warms. | Clarity returns, gently. |
| 80-100% | Arrival | Calm portrait; a single bird crosses the sky; the page continues. | A calm space for your mind. Find your therapist. |

Always available: chapter dots, Skip, and the header's Book a session. Returning visitors open on the calm ending with Replay. Reduced motion shows the calm ending, still.

### Act III — Within (finding a path)

**5. Four tracks of care.** Cards rise gently into place as they enter the screen.

**6. "Where would you like to begin?"** A three-question, 60-second guide: what weighs most, for how long, and how heavy it feels day to day. It suggests a track and a clinician, never a diagnosis. Choosing *I don't feel safe right now* replaces everything with crisis lines for the visitor's region.

**7. Resident faculty.** Four clinician ID badges clipped to a lanyard cord stretched across the page. Each hangs on a damped pendulum: a faint breeze keeps it alive, scrolling jostles the cord, brushing past nudges it, and a mouse can drag it to swing. Hover (or tap, or Enter) turns a badge over: the front is the ID (arch portrait, holographic seal that shimmers with the swing, registration number, barcode); the back gives the approach, languages, fee and booking. Fees switch between INR, AED and USD, detected from the visitor's time zone and remembered on their device only. Reduced motion: still badges, instant turn.

**8. Why Ullidam (bento).** Four living tiles:
- Privacy: no waiting rooms, no logins.
- Evidence: a slow ribbon of the modalities we use.
- Diaspora: live clocks for India, the Gulf, the UK and the US.
- WhatsApp: a booking conversation that types itself.

**9. Three steps.** Choose, pick two times, confirm on WhatsApp. A line draws between the steps as the visitor scrolls.

**10. Voices you may recognise.** Things people often say when they first reach out, followed by plain answers to the questions people actually ask.

**11. Our charter.** The six commitments, and the question our outreach exists to quiet: "What will people think?".

### Act IV — Dawn (the next step)

**12. Closing, "First light."** The opening scene returns at sunrise: rain stopped, mist lifting, the lamp still lit. *Whenever you are ready, we are here.*

**13. Crisis ribbon and footer.** A quiet line that shows the crisis number for the visitor's region first, with all lines a tap away.

## Inner pages: one world, different hours

| Page | Scene | Why |
| --- | --- | --- |
| Services and tracks | Morning, through an arch | Clarity; seeing the way ahead |
| Therapists | Portraits in arches | The people behind the doorway |
| NRI care | Night, a plane's light crossing far above the palms | Life between two places |
| Awareness | Evening, many small lamps on the water | Community; many lights together |
| Internships and careers | Early morning | Beginnings |
| First-timer's guide | Dawn | The first step |

## Performance budget

- Scenes are SVG generated at build time from a seeded pattern, plus one canvas for rain. No video files, and no image downloads for scenery.
- The scene geometry is defined once per visit (`<SceneSprite />` in the root layout); each scene only recolours it with `<use>`.
- Rain pauses when off screen or when the tab is hidden, and draws fewer drops on small screens.
- Lenis loads on every page; GSAP loads only on the homepage, where the story timelines live.
- Measured (production build, brotli): homepage HTML 32 KB and JavaScript 226 KB; inner pages about 20 KB HTML and 170 KB JavaScript.
