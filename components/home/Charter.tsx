import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { OBJECTIVES, STIGMA_PHRASE } from "@/data/site-config";

/** The six official objectives, then the stigma our outreach exists to quiet. */
export function Charter() {
  return (
    <Section tone="muted">
      <Container>
        <SectionIntro
          eyebrow="Our charter"
          title="Six commitments behind every session."
          lead="Ullidam exists to make ethical, evidence-informed mental health care easy to reach, from Kerala to the furthest corners of the diaspora."
        />

        <ol className="reveal-group mt-14 grid gap-x-12 gap-y-14 sm:grid-cols-2 md:mt-16 lg:grid-cols-3 lg:gap-x-16 lg:gap-y-16">
          {OBJECTIVES.map((objective, index) => (
            <li key={objective.title} className="border-t border-line pt-8">
              <span className="font-display text-[2.25rem] leading-none text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-title text-brand">
                <Link
                  href={objective.href}
                  className="underline decoration-transparent underline-offset-[6px] transition-colors duration-300 hover:decoration-accent"
                >
                  {objective.title}
                </Link>
              </h3>
              <p className="mt-3 leading-relaxed text-pretty text-ink-2">{objective.summary}</p>
            </li>
          ))}
        </ol>

        <figure className="reveal mt-20 rounded-3xl bg-canvas p-8 md:mt-24 md:p-12 lg:p-16">
          <blockquote>
            <p className="font-display text-[1.75rem] leading-relaxed text-brand md:text-4xl md:leading-relaxed">
              &ldquo;{STIGMA_PHRASE.english}&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-6 max-w-2xl leading-relaxed text-pretty text-ink-2">
            For many of us, this one question keeps help out of reach. Our awareness and outreach work exists to quiet
            it, one conversation at a time.
          </figcaption>
        </figure>
      </Container>
    </Section>
  );
}
