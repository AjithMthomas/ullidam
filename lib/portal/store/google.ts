import "server-only";
import { JWT } from "google-auth-library";
import { requireSecret } from "../env";
import type { Book } from "../schema";
import { StoreError, type SheetStore } from "./types";

/**
 * Google Sheets through the Sheets REST API v4, signed in as the practice's
 * service account. Values are written RAW, so "18:30" and "2026-11-26" stay
 * plain text and Sheets never turns them into numbers or dates.
 *
 * Env: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_OPS_ID,
 * GOOGLE_SHEETS_VAULT_ID.
 */
const API = "https://sheets.googleapis.com/v4/spreadsheets";

let client: JWT | null = null;
function auth(): JWT {
  client ??= new JWT({
    email: requireSecret("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key: requireSecret("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return client;
}

const spreadsheetId = (book: Book) => requireSecret(book === "ops" ? "GOOGLE_SHEETS_OPS_ID" : "GOOGLE_SHEETS_VAULT_ID");
const range = (tab: string, cells = "") => encodeURIComponent(`'${tab}'${cells ? `!${cells}` : ""}`);

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const { token } = await auth().getAccessToken();
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!response.ok) {
    // The body can echo the request; keep it out of logs that might leave the server.
    throw new StoreError(`Google Sheets request failed (${response.status}).`, response.status);
  }
  return (await response.json()) as T;
}

export const googleStore: SheetStore = {
  async read(book, tab) {
    const data = await call<{ values?: string[][] }>(`${API}/${spreadsheetId(book)}/values/${range(tab)}?majorDimension=ROWS`);
    return (data.values ?? []).map((row) => row.map((cell) => String(cell)));
  },
  async append(book, tab, row) {
    await call(`${API}/${spreadsheetId(book)}/values/${range(tab, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      method: "POST",
      body: JSON.stringify({ values: [row] }),
    });
  },
  async update(book, tab, rowNumber, row) {
    await call(`${API}/${spreadsheetId(book)}/values/${range(tab, `A${rowNumber}`)}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [row] }),
    });
  },
};
