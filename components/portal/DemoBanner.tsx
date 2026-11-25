import { isDemo } from "@/lib/portal/env";

/** Shown whenever the portal runs on the fake demo data, so nobody types real client details into it. */
export function DemoBanner() {
  if (!isDemo()) return null;
  return (
    <p role="note" className="bg-highlight px-5 py-2 text-center text-sm text-ink-1">
      <b>Demo with made-up sample data.</b> Changes may reset. Please don&rsquo;t enter real client information.
    </p>
  );
}
