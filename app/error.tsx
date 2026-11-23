"use client";

import { useEffect } from "react";
import { MessageCircle, RotateCcw } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section } from "@/components/layout/Section";
import { Button, ButtonExternalLink } from "@/components/ui/Button";
import { whatsappHref } from "@/lib/whatsapp";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Section>
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>Something went wrong</Eyebrow>
          <h1 className="mt-6 font-display text-display text-balance text-brand">This page couldn’t load just now.</h1>
          <p className="mt-8 text-lead text-pretty text-ink-2">
            Please try again in a moment. If it keeps happening, our coordinator is one message away.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button onClick={() => retry()} size="lg">
              <RotateCcw />
              Try again
            </Button>
            <ButtonExternalLink href={whatsappHref()} variant="secondary" size="lg">
              <MessageCircle />
              Message our coordinator
            </ButtonExternalLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
