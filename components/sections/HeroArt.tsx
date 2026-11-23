/**
 * Nested arches, an open doorway with a small light inside: the brand's
 * "space within". The light breathes on an 8-second cycle (4s in, 4s out)
 * and stays still for prefers-reduced-motion.
 */
export function HeroArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 560" fill="none" aria-hidden="true" className={className}>
      <path d="M20 560V250a220 220 0 0 1 440 0v310Z" className="fill-brand-mist" />
      <path d="M90 560V270a150 150 0 0 1 300 0v290Z" className="fill-canvas" />
      <path d="M160 560V295a80 80 0 0 1 160 0v265Z" className="fill-canvas-muted" />
      <circle
        cx="240"
        cy="332"
        r="24"
        className="origin-center fill-accent [transform-box:fill-box] motion-safe:animate-inhale"
      />
      <path d="M0 559.25h480" strokeWidth="1.5" className="stroke-line-strong" />
    </svg>
  );
}
