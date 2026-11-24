"use client";

import type { ReactNode } from "react";
import { WhatsAppLogo } from "@/components/ui/BrandIcons";
import { ButtonExternalLink, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useDiasporaHref } from "./store";

/** A WhatsApp action that always carries the visitor's current choices on /diaspora. */
export function DiasporaWhatsAppButton({
  children = "Message us on WhatsApp",
  variant = "primary",
  size = "lg",
  className,
}: {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const href = useDiasporaHref();
  return (
    <ButtonExternalLink href={href} variant={variant} size={size} className={className}>
      <WhatsAppLogo />
      {children}
    </ButtonExternalLink>
  );
}
