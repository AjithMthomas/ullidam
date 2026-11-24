"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { InstagramLogo, LinkedInLogo, WhatsAppLogo } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/cn";
import { whatsappHref } from "@/lib/whatsapp";

interface ContactLink {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
}

/**
 * WhatsApp, Instagram and LinkedIn as a slim rail fixed to the middle of the
 * right edge, on every page. Small icons, but each link keeps a 44 px touch
 * target. Over the landing area the rail matches the site (deep green); past
 * it, the rail turns light and WhatsApp shows its own green.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const past = usePastLanding(pathname);

  const links: ContactLink[] = [
    { key: "whatsapp", label: `WhatsApp our coordinator, ${siteConfig.coordinator.display}`, href: whatsappHref(), Icon: WhatsAppLogo },
    { key: "instagram", label: "Ullidam on Instagram", href: siteConfig.social.instagram, Icon: InstagramLogo },
    { key: "linkedin", label: "Ullidam on LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedInLogo },
  ];

  return (
    <nav
      aria-label="Contact and social links"
      className={cn(
        "fixed top-1/2 right-0 z-40 -translate-y-1/2 overflow-hidden rounded-l-2xl shadow-card ring-1 backdrop-blur-md transition-[background-color,box-shadow] duration-500 ease-calm",
        past ? "bg-surface-raised/90 ring-line" : "bg-brand/90 ring-on-brand/15",
      )}
    >
      <ul className="flex flex-col py-1">
        {links.map(({ key, label, href, Icon }) => (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (opens in a new tab)`}
              className={cn(
                "grid size-11 place-items-center transition-[color,background-color,transform] duration-300 ease-calm",
                "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-safe:hover:scale-110",
                past
                  ? cn("hover:bg-canvas-muted", key === "whatsapp" ? "text-whatsapp" : "text-ink-1")
                  : "text-on-brand hover:bg-on-brand/10",
              )}
            >
              <Icon className={key === "whatsapp" ? "size-[1.1875rem]" : "size-[1.0625rem]"} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** True once the visitor has scrolled past the landing area of the current page. */
function usePastLanding(pathname: string) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      // The homepage film is pinned, so its host (pin spacer included) is the landing.
      const landing = document.querySelector(".film-host");
      const next = landing
        ? landing.getBoundingClientRect().bottom < window.innerHeight * 0.5
        : window.scrollY > window.innerHeight * 0.8;
      setPast(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return past;
}
