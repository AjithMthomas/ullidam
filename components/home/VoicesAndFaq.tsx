import { Plus } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, SectionIntro } from "@/components/layout/Section";
import { FAQ, FIRST_WORDS } from "@/data/faq";

/** Voices you may recognise (not testimonials), then plain answers. */
export function VoicesAndFaq() {
  return (
    <>
      <Section tone="muted">
        <Container>
          <SectionIntro
            title="What people often tell us in a first session"
            lead="Shared to help you feel less alone. These are common reflections, not reviews."
          />
          <ul className="reveal-group mt-14 grid gap-x-16 md:mt-16 md:grid-cols-2">
            {FIRST_WORDS.map((words) => (
              <li key={words} className="border-t border-line-strong py-7 font-display text-title leading-snug text-balance text-brand">
                {words}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <SectionIntro
            title="The questions most people carry"
            lead="Plain answers. If yours is not here, our coordinator is one message away."
          />
          <div className="divide-y divide-line-strong/70 border-y border-line-strong/70">
            {FAQ.map((item) => (
              <details key={item.question} className="faq-item group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-xl text-brand">
                  {item.question}
                  <Plus className="size-5 shrink-0 text-ink-3 transition-transform duration-500 ease-calm group-open:rotate-45" />
                </summary>
                <p className="max-w-xl pb-7 leading-relaxed text-pretty text-ink-2">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
