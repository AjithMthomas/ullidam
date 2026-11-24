/**
 * ULLIDAM THEME: the one file that colours the entire site.
 *
 * To retheme, change the palette below (and, if you like, which palette
 * colour plays which role). Everything else follows automatically: Tailwind
 * utilities, buttons, cards, the illustrated scenes, the rain, the clinician
 * badges, the favicon and the browser's address-bar colour.
 *
 * After changing a role, run `npm run verify`: contrast against the page
 * surface matters for anxious and low-vision readers (text needs 4.5:1).
 */

/* 1. THE PALETTE: the raw colours. "Kerala Morning": still backwater, palm shade, first light. */
export const palette = {
  /** Deep palm shade. */
  palm: "#1F3B2D",
  moss: "#4E6B3A",
  sage: "#A8BD8E",
  /** Pale new-leaf green: highlights and active fills behind dark text. */
  newLeaf: "#D7E59B",
  /** Morning mist: the page ground. */
  mist: "#F4F5EF",
  white: "#FFFFFF",
  /** Body text. */
  ink: "#17211B",
  /** The one warm note: first light over the water. Thin accents only, never text. */
  dawn: "#E2AE5C",
  /** Functional signals: keep these recognisable whatever the palette. */
  available: "#2E7D5B",
  fillingFast: "#C27803",
  /** WhatsApp's own brand green, for the floating chat button only. */
  whatsapp: "#25D366",
  unavailable: "#858D89",
  danger: "#A4402B",
} as const;

/* Helpers for derived shades (pure maths, identical on server and client). */
const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
/** Blend `a` toward `b` by `amount` (0 to 1). */
export function mix(a: string, b: string, amount: number): string {
  const from = channels(a);
  const to = channels(b);
  return `#${from.map((v, i) => Math.round(v + (to[i] - v) * amount).toString(16).padStart(2, "0")).join("")}`;
}
const BLACK = "#000000";
const p = palette;

/* 2. THE ROLES: what each colour does. Change these to re-cast the palette. */
export const theme = {
  /** Headings, primary buttons, dark bands, the footer, the logo. */
  primary: p.palm,
  primaryHover: mix(p.palm, p.moss, 0.35),
  /** Links, icons, active lines, focus rings. Passes 4.5:1 on the surface, so text is allowed. */
  secondary: p.moss,
  /** Secondary for small text (labels): a little deeper than moss. */
  secondaryInk: mix(p.moss, p.palm, 0.4),
  /** Soft backgrounds: icon wells, pills, chips. */
  tertiary: p.sage,
  tertiarySoft: mix(p.sage, p.white, 0.6),
  /** New-leaf highlight: active fills behind dark text only (too pale for lines or text). */
  highlight: p.newLeaf,

  /** The page itself. */
  surface: p.mist,
  /** Alternate sections, so long pages breathe. */
  surfaceMuted: mix(p.sage, p.white, 0.74),
  /** Cards and panels that sit above the page. */
  surfaceRaised: p.white,
  line: mix(p.sage, p.mist, 0.62),
  lineStrong: mix(p.sage, p.palm, 0.18),

  /** Text: strongest to quietest. All pass 4.5:1 on surface and surfaceMuted. */
  ink: p.ink,
  inkSoft: mix(p.ink, p.sage, 0.32),
  inkMuted: mix(p.ink, p.sage, 0.45),

  /** Text and accents on primary or night backgrounds. */
  onPrimary: p.mist,
  onPrimaryMuted: mix(p.sage, p.white, 0.45),
  accentOnDark: p.newLeaf,

  /** Darkness under text that sits over the film. */
  night: mix(p.palm, BLACK, 0.5),
  nightSoft: mix(p.palm, BLACK, 0.25),

  /** First light: thin warm accents. */
  glow: p.dawn,

  /** Status beacons and errors. */
  statusOpen: p.available,
  statusFast: p.fillingFast,
  statusGone: p.unavailable,
  danger: p.danger,

  /** The floating WhatsApp button once the visitor has scrolled past the landing. */
  whatsapp: p.whatsapp,

  /** Shadow tint (used at low opacity). */
  shadow: mix(p.palm, BLACK, 0.45),

  /** Materials of the clinician badges on the homepage. */
  lanyard: p.palm,
  lanyardTwist: p.moss,
  clipLight: p.white,
  clipMid: p.sage,
  clipDark: p.moss,
} as const;

export type ThemeRole = keyof typeof theme;

/** CSS custom properties for every role: `--theme-primary`, `--theme-surface-muted`, ... */
export function themeCss(): string {
  const toKebab = (name: string) => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const vars = Object.entries(theme)
    .map(([role, value]) => `--theme-${toKebab(role)}:${value};`)
    .join("");
  return `:root{${vars}}`;
}
