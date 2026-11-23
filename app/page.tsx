import { ClosingDawn } from "@/components/home/ClosingDawn";
import { FacultySection } from "@/components/home/FacultySection";
import { StepsStory } from "@/components/home/StepsStory";
import { TrackShowcase } from "@/components/home/TrackShowcase";
import { TriageSection } from "@/components/home/TriageSection";
import { TrustBento } from "@/components/home/TrustBento";
import { VoicesAndFaq } from "@/components/home/VoicesAndFaq";
import { FilmHero } from "@/components/film/FilmHero";

/**
 * "Kerala Morning" (docs/specs/homepage-redesign.md):
 *   1. The film: Kerala dawn, framed, then full screen as you scroll
 *   2. Three steps to your first session (a short scroll story)
 *   3. The clinicians (hanging ID cards), directly before the four tracks
 *   4. Four tracks of care, triage, why people trust Ullidam
 *   5. What people often tell us, questions, and the closing
 */
export default function HomePage() {
  return (
    <>
      <FilmHero />
      <StepsStory />
      <FacultySection />

      <TrackShowcase />

      <TriageSection />
      <TrustBento />
      <VoicesAndFaq />
      <ClosingDawn />
    </>
  );
}
