
/** Where a visitor probably is, inferred only from their device time zone. */
export type Region = "india" | "uae" | "gulf" | "uk" | "northAmerica" | "other";

const GULF = new Set(["Asia/Muscat", "Asia/Riyadh", "Asia/Qatar", "Asia/Kuwait", "Asia/Bahrain"]);
const NORTH_AMERICA_PREFIXES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix",
  "America/Anchorage", "America/Detroit", "America/Indiana", "America/Kentucky", "America/Boise",
  "America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax",
  "America/St_Johns", "America/Regina", "Pacific/Honolulu",
];

export function regionFromTimeZone(timeZone: string): Region {
  if (timeZone === "Asia/Kolkata" || timeZone === "Asia/Calcutta") return "india";
  if (timeZone === "Asia/Dubai") return "uae";
  if (GULF.has(timeZone)) return "gulf";
  if (timeZone === "Europe/London" || timeZone === "Europe/Belfast") return "uk";
  if (NORTH_AMERICA_PREFIXES.some((prefix) => timeZone.startsWith(prefix))) return "northAmerica";
  return "other";
}

// Some devices still report legacy IANA names; normalise the ones our visitors use.
const LEGACY_ZONES: Record<string, string> = { "Asia/Calcutta": "Asia/Kolkata" };

export function detectTimeZone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
    return LEGACY_ZONES[zone] ?? zone;
  } catch {
    return "Asia/Kolkata";
  }
}

export function detectRegion(): Region {
  return regionFromTimeZone(detectTimeZone());
}

