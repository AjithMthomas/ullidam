import { FacultyGrid } from "@/components/cinematic/FacultyGrid";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { Pill } from "@/components/ui/Pill";
import { getTrack, type TrackId } from "@/data/services";
import { therapistsForTrack } from "@/data/therapists";
import { trackRequestMessage } from "@/lib/whatsapp";
import { ClosingCta } from "./ClosingCta";
import { FeatureGrid } from "./FeatureGrid";
import { PageHero } from "./PageHero";

/**
 * Shared layout for the four service-track pages, driven by data/services.ts.
 * Each track page stays a thin file so Phase 3 can give it a bespoke layout.
 */
export function TrackPage({ id }: { id: TrackId }) {
  const track = getTrack(id);
  const therapists = therapistsForTrack(id);

  return (
    <>
      <PageHero
        photo={track.photo}
        eyebrow={`Track ${track.letter} · ${track.audience}`}
        title={track.name}
        lead={track.summary}
      >
        <ul className="flex flex-wrap gap-2" aria-label="Common concerns">
          {track.focusAreas.map((area) => (
            <li key={area}>
              <Pill tone="brand">{area}</Pill>
            </li>
          ))}
        </ul>
      </PageHero>

      <Section tone="muted">
        <Container>
          {track.phases ? (
            <>
              <SectionIntro
                eyebrow="A three-phase journey"
                title="Support before, during and after."
                lead="You can begin at any phase. Many people start with a single clarity session and decide what comes next from there."
              />
              <ol className="mt-14 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-12 lg:gap-16">
                {track.phases.map((phase, index) => (
                  <li key={phase.step} className="border-t border-line-strong pt-8">
                    <span className="font-display text-[2.25rem] leading-none text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-6 text-xs font-semibold tracking-[0.18em] text-accent-ink uppercase">{phase.step}</p>
                    <h3 className="mt-2 font-display text-title text-brand">{phase.title}</h3>
                    <p className="mt-3 leading-relaxed text-pretty text-ink-2">{phase.description}</p>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <SectionIntro eyebrow="How we help" title="What your sessions can include." />
              <div className="mt-14 md:mt-16">
                <FeatureGrid items={track.offerings} />
              </div>
            </>
          )}
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionIntro
            eyebrow="Your clinicians"
            title={therapists.length === 1 ? "The specialist for this track." : "The specialists for this track."}
          />
          <div className="mt-12 md:mt-14">
            <FacultyGrid therapists={therapists} columns={2} />
          </div>
        </Container>
      </Section>

      <ClosingCta message={trackRequestMessage(track.name)} />
    </>
  );
}
