import type { Metadata } from "next";

/**
 * The clinician portal: private, never indexed, no public site chrome
 * (components/layout/PublicOnly.tsx hides it on /portal), no analytics.
 * docs/specs/portal.md
 */
export const metadata: Metadata = {
  title: { default: "Therapist portal", template: "%s | Ullidam portal" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return children;
}
