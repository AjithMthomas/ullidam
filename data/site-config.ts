import type { Route } from "next";
import type { Region } from "@/lib/region";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

/** Practice coordinator in international format without "+", as wa.me expects. */
export const COORDINATOR_WHATSAPP = digitsOnly(
  process.env.NEXT_PUBLIC_WHATSAPP_COORDINATOR || "918590925353",
);

function formatInternationalNumber(digits: string): string {
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "Ullidam",
  nameMalayalam: "",
  meaning: "The Space Within",
  tagline: "A calm space for your mind",
  taglineMalayalam: "",
  description:
    "Confidential online counselling, psychotherapy and psychiatric care for adults and couples, in Malayalam and English. Based in Kerala, available wherever you are.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://ullidam.com",
  headquarters: "Kerala, India",
  copyrightYear: 2026,
  coordinator: {
    whatsapp: COORDINATOR_WHATSAPP,
    display: formatInternationalNumber(COORDINATOR_WHATSAPP),
  },
  confidentialityPromise:
    "100% Confidential. No clinic waiting rooms. No relatives or employers will ever know.",
} as const;

export interface NavItem {
  label: string;
  href: Route;
}

export const MAIN_NAV: readonly NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Therapists", href: "/therapists" },
  { label: "NRI Care", href: "/diaspora" },
  { label: "Awareness", href: "/awareness" },
  { label: "Internships", href: "/internships" },
];

export const PRIMARY_CTA: NavItem = { label: "Book a session", href: "/therapists" };

export const ORGANISATION_NAV: readonly NavItem[] = [
  { label: "Our therapists", href: "/therapists" },
  { label: "NRI & Gulf care", href: "/diaspora" },
  { label: "Awareness & outreach", href: "/awareness" },
  { label: "Internships & training", href: "/internships" },
  { label: "First-timer’s guide", href: "/guide" },
  { label: "Careers", href: "/careers" },
];

export interface Objective {
  title: string;
  summary: string;
  href: Route;
}

/** The official charter: ULLIDAM's six core objectives. */
export const OBJECTIVES: readonly Objective[] = [
  {
    title: "Psychological Counselling",
    summary: "Individual and couple sessions that bring clarity to transitions, relationships and overwhelm.",
    href: "/services/individual",
  },
  {
    title: "Psychotherapy",
    summary: "Evidence-informed therapy, including CBT, ACT, EFT and the Gottman Method, for lasting well-being.",
    href: "/services",
  },
  {
    title: "Psychiatric Assistance",
    summary: "Consultations, diagnostic assessment, medication management and steady follow-up care.",
    href: "/services/psychiatry",
  },
  {
    title: "Mental Health Awareness",
    summary: "Workshops, corporate seminars and psychoeducation that make mental health easier to talk about.",
    href: "/awareness",
  },
  {
    title: "Internship & Training",
    summary: "Supervised practical exposure and training for psychology students and early-career professionals.",
    href: "/internships",
  },
  {
    title: "Community Outreach",
    summary: "Mental health literacy and wider access to care, especially where stigma keeps people silent.",
    href: "/awareness",
  },
];

/** "What will people think?" The stigma our outreach works to quiet. */
export const STIGMA_PHRASE = {
  english: "What will people think?",
} as const;

export interface TimeZoneOption {
  label: string;
  region: string;
  /** Standard-time offset for display; IANA zones drive real conversions (DST-aware). */
  offset: string;
  ianaZones: string[];
}

/**
 * Diaspora time-zone toggles (spec Rule 3), consumed by the Phase 3 timezone
 * engine. GST (UTC+4) covers the UAE and Oman only; Saudi Arabia, Qatar,
 * Kuwait and Bahrain run on UTC+3 and are handled by visitor auto-detection.
 */
export const DIASPORA_TIME_ZONES: readonly TimeZoneOption[] = [
  { label: "IST", region: "India", offset: "UTC+5:30", ianaZones: ["Asia/Kolkata"] },
  { label: "GST", region: "UAE & Oman", offset: "UTC+4:00", ianaZones: ["Asia/Dubai"] },
  { label: "GMT / BST", region: "UK & Western Europe", offset: "UTC+0:00", ianaZones: ["Europe/London"] },
  {
    label: "EST / PST",
    region: "US & Canada",
    offset: "UTC−5:00 / −8:00",
    ianaZones: ["America/New_York", "America/Los_Angeles"],
  },
];

export interface CrisisLine {
  /** Matches lib/region.ts, so a visitor's own lines can be shown first. */
  key: Region;
  region: string;
  service: string;
  number: string;
  tel: string;
}

/**
 * Safety-critical. Every number must be verified by the clinical lead before
 * launch and re-checked at least once a year. Only regions with a verified
 * line are listed; everyone else is asked to call their local emergency number.
 */
export const CRISIS_LINES: readonly CrisisLine[] = [
  { key: "india", region: "India", service: "Tele-MANAS, free, 24/7", number: "14416", tel: "14416" },
  { key: "india", region: "India", service: "Emergency", number: "112", tel: "112" },
  { key: "uae", region: "UAE", service: "Emergency", number: "999", tel: "999" },
  { key: "uk", region: "UK", service: "Samaritans, free, 24/7", number: "116 123", tel: "116123" },
  { key: "northAmerica", region: "US & Canada", service: "Suicide & Crisis Lifeline", number: "988", tel: "988" },
];

/** The visitor's own lines first, then everyone else's. */
export function crisisLinesFor(region: Region): CrisisLine[] {
  const own = CRISIS_LINES.filter((line) => line.key === region);
  return [...own, ...CRISIS_LINES.filter((line) => line.key !== region)];
}
