import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Compass,
  Globe,
  HeartHandshake,
  Languages,
  LifeBuoy,
  Lock,
  MessageCircle,
  Shield,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Eyebrow, Section, SectionIntro } from "@/components/layout/Section";
import { Button, ButtonExternalLink, ButtonLink } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { StatusPulse } from "@/components/ui/StatusPulse";
import { siteConfig, STIGMA_PHRASE } from "@/data/site-config";
import { contrastRatio } from "@/lib/color";
import { cn } from "@/lib/cn";
import { whatsappHref } from "@/lib/whatsapp";
import { theme } from "@/theme";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

const CANVAS = theme.surface;

// Read live from theme.ts, so this guide always shows the current theme.
const COLORS = [
  { token: "canvas", hex: theme.surface, swatch: "bg-canvas", role: "surface: the page background" },
  { token: "canvas-muted", hex: theme.surfaceMuted, swatch: "bg-canvas-muted", role: "surfaceMuted: alternate sections" },
  { token: "line", hex: theme.line, swatch: "bg-line", role: "line: hairlines and card borders" },
  { token: "brand", hex: theme.primary, swatch: "bg-brand", role: "primary: headings, buttons, footer" },
  { token: "brand-soft", hex: theme.primaryHover, swatch: "bg-brand-soft", role: "primaryHover: hover states" },
  { token: "brand-mist", hex: theme.tertiarySoft, swatch: "bg-brand-mist", role: "tertiarySoft: icon wells, pills" },
  { token: "accent", hex: theme.secondary, swatch: "bg-accent", role: "secondary: numerals, icons, focus rings" },
  { token: "accent-ink", hex: theme.secondaryInk, swatch: "bg-accent-ink", role: "secondaryInk: eyebrows, small labels" },
  { token: "accent-mist", hex: theme.tertiary, swatch: "bg-accent-mist", role: "tertiary: soft tiles and chips" },
  { token: "ink-1", hex: theme.ink, swatch: "bg-ink-1", role: "ink: primary text" },
  { token: "ink-2", hex: theme.inkSoft, swatch: "bg-ink-2", role: "inkSoft: body copy" },
  { token: "ink-3", hex: theme.inkMuted, swatch: "bg-ink-3", role: "inkMuted: captions and metadata" },
  { token: "glow", hex: theme.glow, swatch: "bg-glow", role: "glow: lamplight in the scenes" },
  { token: "status-open", hex: theme.statusOpen, swatch: "bg-status-open", role: "statusOpen: StatusPulse available" },
  { token: "danger", hex: theme.danger, swatch: "bg-danger", role: "danger: form errors" },
] as const;

const TYPE_SCALE = [
  { token: "text-display", sample: "A calm space for your mind.", className: "font-display text-display text-brand" },
  { token: "text-headline", sample: "Six commitments behind every session.", className: "font-display text-headline text-brand" },
  { token: "text-title", sample: "Individual Counselling and Therapy", className: "font-display text-title text-brand" },
  { token: "text-lead", sample: "Short, validating sentences. Never a wall of text.", className: "text-lead text-ink-2" },
  { token: "text-base", sample: "Body copy sits at a relaxed line height within a 42rem reading width.", className: "leading-relaxed text-ink-2" },
] as const;

const SPACING = [
  { label: "Phone", value: "py-16", px: 64 },
  { label: "Large phone", value: "sm:py-20", px: 80 },
  { label: "Tablet", value: "md:py-24", px: 96 },
  { label: "Laptop", value: "lg:py-32", px: 128 },
  { label: "Desktop", value: "xl:py-36", px: 144 },
] as const;

const ICONS = [
  { name: "UserRound", Icon: UserRound },
  { name: "Stethoscope", Icon: Stethoscope },
  { name: "HeartHandshake", Icon: HeartHandshake },
  { name: "Compass", Icon: Compass },
  { name: "Shield", Icon: Shield },
  { name: "Lock", Icon: Lock },
  { name: "Globe", Icon: Globe },
  { name: "Languages", Icon: Languages },
  { name: "Video", Icon: Video },
  { name: "MessageCircle", Icon: MessageCircle },
  { name: "LifeBuoy", Icon: LifeBuoy },
  { name: "ArrowRight", Icon: ArrowRight },
] as const;

function Block({ eyebrow, title, lead, children }: { eyebrow: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-12 md:pt-16">
      <SectionIntro eyebrow={eyebrow} title={title} lead={lead} />
      <div className="mt-10 md:mt-12">{children}</div>
    </div>
  );
}

/** Living style guide for the Phase 1 review. Hidden from production deployments. */
export default function DesignSystemPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <Section>
      <Container className="flex flex-col gap-20 md:gap-24">
        <div className="max-w-3xl">
          <Eyebrow>Phase 1 &middot; Internal</Eyebrow>
          <h1 className="mt-6 font-display text-display text-balance text-brand">Design system</h1>
          <p className="mt-8 max-w-2xl text-lead text-pretty text-ink-2">
            Tokens and primitives for {siteConfig.name}. Whitespace is treated as psychological oxygen: generous
            spacing, short copy, and nothing that competes for attention. Visible in development and preview
            deployments only.
          </p>
        </div>

        <Block
          eyebrow="Colour"
          title="Clinical calm palette"
          lead="Contrast is measured against the canvas. Text needs 4.5:1; large display text and non-text elements need 3:1."
        >
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((color) => {
              const ratio = contrastRatio(color.hex, CANVAS);
              const verdict = ratio >= 4.5 ? "Text safe" : ratio >= 3 ? "Large text & UI" : "Surface only";
              return (
                <li key={color.token} className="overflow-hidden rounded-2xl border border-line bg-canvas">
                  <div className={cn("h-20 border-b border-line", color.swatch)} />
                  <div className="p-5">
                    <p className="font-medium text-ink-1">{color.token}</p>
                    <p className="mt-1 text-sm text-ink-3">
                      {color.hex.toUpperCase()} &middot; {ratio.toFixed(2)}:1 &middot; {verdict}
                    </p>
                    <p className="mt-2 text-sm text-ink-2">{color.role}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block
          eyebrow="Typography"
          title="Fraunces and Plus Jakarta Sans"
          lead="An editorial serif for warmth and a geometric sans for clarity. All copy is in English."
        >
          <ul className="flex flex-col gap-10">
            {TYPE_SCALE.map((type) => (
              <li key={type.token} className="grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
                <code className="text-sm text-ink-3">{type.token}</code>
                <p className={cn("text-balance", type.className)}>{type.sample}</p>
              </li>
            ))}
            <li className="grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
              <code className="text-sm text-ink-3">font-display quote</code>
              <div>
                <p className="font-display text-2xl leading-relaxed text-brand md:text-3xl md:leading-relaxed">
                  &ldquo;{STIGMA_PHRASE.english}&rdquo;
                </p>
              </div>
            </li>
          </ul>
        </Block>

        <Block
          eyebrow="Space"
          title="Whitespace as psychological oxygen"
          lead="Section padding grows with the screen. Cards use p-8 to p-12, grids gap-8 to gap-16, and text never runs wider than max-w-2xl."
        >
          <ul className="flex flex-col gap-4">
            {SPACING.map((step) => (
              <li key={step.value} className="grid grid-cols-[7rem_6rem_minmax(0,1fr)] items-center gap-4 text-sm">
                <span className="text-ink-2">{step.label}</span>
                <code className="text-ink-3">{step.value}</code>
                <span className="h-3 rounded-full bg-brand-mist" style={{ width: `${(step.px / 144) * 100}%` }} />
              </li>
            ))}
          </ul>
        </Block>

        <Block eyebrow="Actions" title="Buttons" lead="Pill-shaped, at least 48px tall, and never more than two side by side.">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="quiet">Quiet</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <ButtonLink href="/therapists" size="lg">
                Find your therapist
                <ArrowRight />
              </ButtonLink>
              <ButtonExternalLink href={whatsappHref()} variant="secondary" size="lg">
                <MessageCircle />
                Message our coordinator
              </ButtonExternalLink>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-brand p-8">
              <Button variant="inverse">Inverse on brand</Button>
            </div>
          </div>
        </Block>

        <Block
          eyebrow="Beacons"
          title="StatusPulse"
          lead="A slow breathing pulse replaces emoji dots. Shape and text, not colour alone, carry the meaning; motion stops for reduced-motion users."
        >
          <div className="flex flex-col gap-5 text-ink-2">
            <StatusPulse status="open" label="Available today" />
            <StatusPulse status="fast" label="Filling fast (2 slots left)" />
            <StatusPulse status="gone" label="Fully booked this week" />
          </div>
        </Block>

        <Block eyebrow="Labels" title="Pills and ratings" lead="Ratings are always typographic, never stars.">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2.5">
              <Pill>Neutral</Pill>
              <Pill tone="muted">Muted</Pill>
              <Pill tone="brand">Brand</Pill>
              <Pill tone="accent">Accent</Pill>
            </div>
            <p className="font-display text-2xl text-brand">
              4.97 / 5.0 <span className="font-sans text-base text-ink-3">(340+ rated sessions)</span>
            </p>
          </div>
        </Block>

        <Block
          eyebrow="Iconography"
          title="Lucide at a 1.5 stroke"
          lead="Every icon inherits strokeWidth 1.5 from one provider. Unicode emoji are rejected by the build."
        >
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-6">
            {ICONS.map(({ name, Icon }) => (
              <li key={name} className="flex flex-col items-center gap-3 rounded-2xl border border-line p-6 text-center">
                <Icon className="size-7 text-brand" />
                <span className="text-xs text-ink-3">{name}</span>
              </li>
            ))}
          </ul>
        </Block>
      </Container>
    </Section>
  );
}
