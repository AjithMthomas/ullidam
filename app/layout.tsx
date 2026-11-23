import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans } from "next/font/google";
import { CrisisRibbon } from "@/components/layout/CrisisRibbon";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SceneSprite } from "@/components/scene/MonsoonScene";
import { IconDefaults } from "@/components/ui/IconDefaults";
import { siteConfig } from "@/data/site-config";
import { theme, themeCss } from "@/theme";
import "./globals.css";

// Fonts are self-hosted by next/font: no request ever reaches Google from a
// visitor's browser, which also keeps the visit private. One family pair,
// both variable: Funnel Display for titles (set in capitals), Funnel Sans for text.
const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel-display",
  display: "swap",
});

const funnelSans = Funnel_Sans({
  subsets: ["latin"],
  variable: "--font-funnel-sans",
  display: "swap",
});

const defaultTitle = `${siteConfig.name} — Online Counselling, Psychotherapy & Psychiatry`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: defaultTitle, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    title: defaultTitle,
    description: siteConfig.description,
  },
  // Stop phones from auto-linking licence numbers or prices as phone numbers.
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: theme.surface,
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${funnelDisplay.variable} ${funnelSans.variable}`}
    >
      <head>
        {/* Every colour on the site, from theme.ts. Inline, so nothing paints before the theme is known. */}
        <style id="ullidam-theme">{themeCss()}</style>
      </head>
      <body className="flex min-h-dvh flex-col bg-canvas font-sans text-ink-1">
        <IconDefaults>
          <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-on-brand"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 focus-visible:outline-none">
            {children}
          </main>
          <CrisisRibbon />
          <Footer />
          <FloatingWhatsApp />
          <SceneSprite />
          <SmoothScroll />
          </MotionProvider>
        </IconDefaults>
      </body>
    </html>
  );
}
