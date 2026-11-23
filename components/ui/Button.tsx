import Link from "next/link";
import type { Route } from "next";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "inverse" | "outline-light";
export type ButtonSize = "md" | "lg";

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const BASE =
  "inline-flex shrink-0 select-none items-center justify-center gap-2.5 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-calm " +
  // Micro-interactions: a 1px step up on hover, a press on click (springy return).
  "motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] motion-safe:active:duration-100 " +
  "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.125rem] [&_svg]:shrink-0";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-on-brand shadow-card hover:bg-brand-soft",
  secondary: "border border-brand/20 text-brand hover:border-brand/40 hover:bg-brand-mist/60",
  quiet: "text-brand hover:bg-brand-mist/70",
  inverse: "bg-canvas text-brand hover:bg-canvas-muted",
  // For dark cinematic scenes: a glassy outline that keeps the scene visible.
  "outline-light": "border border-on-brand/30 bg-night/25 text-on-brand backdrop-blur-md hover:border-on-brand/55 hover:bg-night/45",
};

// Both sizes meet the 44px minimum touch target; md is 48px, lg is 56px.
const SIZES: Record<ButtonSize, string> = {
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonStyles({ variant = "primary", size = "md", className }: StyleOptions = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = StyleOptions & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

/** In-app navigation. `href` is checked against real routes (typedRoutes). */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  ...props
}: StyleOptions & AnchorProps & { href: Route }) {
  return <Link href={href} className={buttonStyles({ variant, size, className })} {...props} />;
}

/** Off-site links such as WhatsApp: new tab, no opener, no referrer. */
export function ButtonExternalLink({
  href,
  variant,
  size,
  className,
  ...props
}: StyleOptions & AnchorProps & { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
