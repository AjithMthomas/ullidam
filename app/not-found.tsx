import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Section>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Page not found</Eyebrow>
          <h1 className="mt-6 font-display text-display text-balance text-brand">This page isn’t here.</h1>
          <p className="mt-8 text-lead text-pretty text-ink-2">
            The link may be outdated, or the page may have moved. Everything else is still here, a single step away.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/" size="lg">
              Return home
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary" size="lg">
              Explore our services
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
