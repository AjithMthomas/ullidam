import "server-only";
import { dataDriver } from "../env";
import { googleStore } from "./google";
import { localStore } from "./local";
import type { SheetStore } from "./types";

/** The active store: Google Sheets in production, the local stand-in on this computer. */
export function store(): SheetStore {
  return dataDriver() === "google" ? googleStore : localStore;
}

export { StoreError } from "./types";
