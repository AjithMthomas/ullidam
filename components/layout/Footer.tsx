import Link from "next/link";
import { LifeBuoy, MapPin, MessageCircle } from "lucide-react";
import { SERVICE_TRACKS } from "@/data/services";
import { CRISIS_LINES, ORGANISATION_NAV, siteConfig, type NavItem } from "@/data/site-config";
import { whatsappHref } from "@/lib/whatsapp";
import { Container } from "./Container";
import { Logo } from "./Logo";

const CARE_NAV: NavItem[] = SERVICE_TRACKS.map((track) => ({ label: track.navLabel, href: track.href }));

function FooterColumn({ title, items }: { title: string; items: readonly NavItem[] }) {
  return (
    <div>
      <h2 className="text-xs font-semibold tracking-[0.18em] text-accent-on-dark uppercase">{title}</h2>
      <ul className="mt-6 flex flex-col gap-3.5">
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link href={item.href} className="text-on-brand-muted transition-colors duration-300 hover:text-on-brand">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer data-header-tone="dark" className="bg-brand text-on-brand">
      <Container className="pt-16 pb-16 sm:pt-20 md:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo tone="inverse" />
            <p className="mt-6 max-w-sm leading-relaxed text-pretty text-on-brand-muted">
              Online counselling, psychotherapy and psychiatric care, in Malayalam and English.
            </p>
          </div>

          <FooterColumn title="Care" items={CARE_NAV} />
          <FooterColumn title="Ullidam" items={ORGANISATION_NAV} />

          <div>
            <h2 className="text-xs font-semibold tracking-[0.18em] text-accent-on-dark uppercase">Contact</h2>
            <ul className="mt-6 flex flex-col gap-4 text-on-brand-muted">
              <li>
                <a
                  href={whatsappHref()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 transition-colors duration-300 hover:text-on-brand"
                >
                  <MessageCircle className="mt-0.5 size-5 shrink-0" />
                  <span>
                    WhatsApp coordinator
                    <span className="block whitespace-nowrap text-on-brand">{siteConfig.coordinator.display}</span>
                  </span>
                </a>
              </li>
              <li className="inline-flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0" />
                <span>
                  {siteConfig.headquarters}
                  <span className="block">Sessions online, worldwide</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div id="crisis-lines" className="mt-16 scroll-mt-28 rounded-3xl border border-on-brand/15 p-8 md:mt-20 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            <LifeBuoy className="size-7 shrink-0 text-accent-on-dark" />
            <div>
              <h2 className="font-medium">Ullidam is not an emergency service.</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-pretty text-on-brand-muted">
                If you are in danger or thinking of ending your life, please call your local emergency number or a
                crisis line now.
              </p>
              <ul className="mt-6 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {CRISIS_LINES.map((line) => (
                  <li key={line.region + line.number}>
                    <span className="text-on-brand-muted">
                      {line.region} &middot; {line.service}
                    </span>{" "}
                    <a
                      href={`tel:${line.tel}`}
                      className="font-semibold whitespace-nowrap underline decoration-on-brand/30 underline-offset-4 hover:decoration-on-brand"
                    >
                      {line.number}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-on-brand/15 pt-8 text-sm text-on-brand-muted md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {siteConfig.copyrightYear} {siteConfig.name}. {siteConfig.meaning}.
          </p>
          <p className="max-w-xl text-pretty md:text-right">
            For complete privacy, browse in a private window.
          </p>
        </div>
      </Container>
    </footer>
  );
}
