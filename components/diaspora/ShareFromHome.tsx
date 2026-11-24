"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { ButtonExternalLink } from "@/components/ui/Button";
import { SHARE_NOTE } from "@/data/diaspora";
import { siteConfig } from "@/data/site-config";
import { shareHref } from "@/lib/whatsapp";

const PAGE_URL = `${siteConfig.url}/diaspora`;

/**
 * For family in Kerala: share this page with someone abroad. WhatsApp's share
 * link has no number, so the sender picks the contact; the note is gentle and
 * non-diagnostic because it lands in the other person's chat. Copying the link
 * needs JavaScript; without it, the address is shown as text.
 */
export function ShareFromHome() {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PAGE_URL);
      setCopied("done");
    } catch {
      setCopied("failed");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <ButtonExternalLink href={shareHref(`${SHARE_NOTE} ${PAGE_URL}`)} size="lg">
          <WhatsAppLogo />
          Share on WhatsApp
        </ButtonExternalLink>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-14 items-center gap-2.5 rounded-full border border-brand/20 px-7 text-base font-medium text-brand transition-colors duration-300 hover:border-brand/40 hover:bg-brand-mist/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {copied === "done" ? <Check className="size-[1.125rem]" /> : <Link2 className="size-[1.125rem]" />}
          {copied === "done" ? "Link copied" : "Copy link"}
        </button>
      </div>
      <p role="status" className="mt-3 text-sm text-ink-3">
        {copied === "failed" ? (
          <>
            Copy this address: <span className="font-medium break-all text-ink-1 select-all">{PAGE_URL}</span>
          </>
        ) : copied === "done" ? (
          "Link copied. Paste it into any chat."
        ) : (
          <span className="break-all">{PAGE_URL}</span>
        )}
      </p>
    </div>
  );
}
