import "server-only";
import demoKeys from "./demo/keys.json";
import { StoreError } from "./store/types";

/**
 * Portal configuration from the environment. Secrets live only in env
 * (.env.local here, Vercel project settings in production), never in code,
 * with one deliberate exception: the demo, below.
 *
 * Drivers:
 *   local   files in .data/portal, on a developer's computer
 *   demo    the committed fake sample data (lib/portal/demo) with demo-only
 *           keys, in memory; the default on Vercel until real storage is set up
 *   google  Google Sheets, for real use (PORTAL_DATA_DRIVER=google + secrets)
 */
export type Driver = "local" | "google" | "demo";

/**
 * The portal isn't connected yet (missing secrets or data store). Screens
 * show a calm "being set up" message; the detail goes to the server log,
 * never to the visitor.
 */
export class PortalNotConfiguredError extends StoreError {
  constructor(readonly detail: string) {
    super("The clinician portal is being set up.", 503);
    this.name = "PortalNotConfiguredError";
  }
}

export function dataDriver(): Driver {
  const driver = (process.env.PORTAL_DATA_DRIVER ?? (process.env.VERCEL ? "demo" : "local")) as Driver;
  if (driver !== "local" && driver !== "google" && driver !== "demo") throw new PortalNotConfiguredError(`Unknown PORTAL_DATA_DRIVER "${driver}"`);
  // The local stand-in writes files on this computer; Vercel's filesystem is read-only and shared.
  if (driver === "local" && process.env.VERCEL) {
    throw new PortalNotConfiguredError("PORTAL_DATA_DRIVER=local only works on a developer's computer. Use demo or google on Vercel.");
  }
  return driver;
}

/** True when the portal shows the fake demo data (the screens say so). */
export const isDemo = () => {
  try {
    return dataDriver() === "demo";
  } catch {
    return false;
  }
};

const DEMO_KEYS = demoKeys as Record<string, string>;

export function requireSecret(name: string): string {
  // The demo's keys are public by design: they only ever protect the fake sample data.
  if (dataDriver() === "demo" && DEMO_KEYS[name] && !name.startsWith("$")) return DEMO_KEYS[name];
  const value = process.env[name];
  if (!value) throw new PortalNotConfiguredError(`${name} is not set. Run "npm run portal:seed" for local development, or add it in the Vercel project settings.`);
  return value;
}
