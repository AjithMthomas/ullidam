import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section, type SectionTone } from "@/components/layout/Section";
import { ButtonExternalLink, ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/data/site-config";
import { whatsappHref } from "@/lib/whatsapp";

interface ClosingCtaProps {
  title?: string;
  lead?: string;
  /** Pre-filled WhatsApp opener for this page's context. */
  message?: string;
  tone?: SectionTone;
  showTherapistsLink?: boolean;
}

/** The last word on every page: the confidentiality promise and one human way in. */
export function ClosingCta({
  title = "Whenever you are ready, we are here.",
  lead = siteConfig.confidentialityPromise,
  message,
  tone = "muted",
  showTherapistsLink = true,
}: ClosingCtaProps) {
  return (
    <Section tone={tone}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-headline text-balance text-brand">{title}</h2>
          <p className="mt-6 text-lead text-pretty text-ink-2">{lead}</p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <ButtonExternalLink href={whatsappHref(message)} size="lg">
              <MessageCircle />
              Message our coordinator
            </ButtonExternalLink>
            {showTherapistsLink ? (
              <ButtonLink href="/therapists" variant="secondary" size="lg">
                Meet our therapists
                <ArrowRight />
              </ButtonLink>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-ink-3">WhatsApp {siteConfig.coordinator.display}</p>
        </div>
      </Container>
    </Section>
  );
}
