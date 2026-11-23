"use client";

import { usePathname } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/data/site-config";
import { cn } from "@/lib/cn";
import { whatsappHref } from "@/lib/whatsapp";

/**
 * The coordinator's WhatsApp number, always within reach at the bottom right
 * of every page. On therapist profiles a mobile booking bar already sits at
 * the foot of the screen, so the button lifts above it there.
 */
export function FloatingWhatsApp() {
  const pathname = usePathname();
  const aboveBookingBar = pathname.startsWith("/therapists/");

  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message our coordinator on WhatsApp, ${siteConfig.coordinator.display} (opens in a new tab)`}
      className={cn(
        "group fixed right-4 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-brand pr-5 pl-3.5 text-on-brand",
        "shadow-float ring-1 ring-on-brand/15 select-none",
        "transition-[background-color,transform] duration-300 ease-calm hover:bg-brand-soft",
        "motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.97] motion-safe:active:duration-100",
        "motion-safe:animate-settle [animation-delay:600ms] sm:right-6 sm:h-14 sm:pr-6 sm:pl-4",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent",
        aboveBookingBar
          ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6"
          : "bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6",
      )}
    >
      {/* A speech bubble with a handset: the familiar WhatsApp shape, drawn with lucide icons. */}
      <span aria-hidden="true" className="relative grid size-6 place-items-center">
        <MessageCircle className="size-6" />
        <Phone className="absolute size-2.5" strokeWidth={2.25} />
      </span>
      <span className="text-[0.9375rem] font-medium tabular-nums whitespace-nowrap">
        {siteConfig.coordinator.display}
      </span>
    </a>
  );
}
