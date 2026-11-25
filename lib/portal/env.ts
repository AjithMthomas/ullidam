import "server-only";

/**
 * Portal configuration from the environment. Secrets live only in env
 * (.env.local here, Vercel project settings in production), never in code.
 */
export type Driver = "local" | "google";

export function dataDriver(): Driver {
  const driver = (process.env.PORTAL_DATA_DRIVER ?? "local") as Driver;
  if (driver !== "local" && driver !== "google") throw new Error(`Unknown PORTAL_DATA_DRIVER "${driver}"`);
  // The local stand-in writes files on this computer; Vercel's filesystem is read-only and shared.
  if (driver === "local" && process.env.VERCEL) {
    throw new Error("PORTAL_DATA_DRIVER=local only works on this computer. Set it to google on Vercel.");
  }
  return driver;
}

export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. Run "npm run portal:seed" for local development, or add it to Vercel.`);
  return value;
}
