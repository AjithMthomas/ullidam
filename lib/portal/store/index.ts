import "server-only";
import { dataDriver } from "../env";
import { demoStore } from "./demo";
import { googleStore } from "./google";
import { localStore } from "./local";
import type { SheetStore } from "./types";

/** The active store: Google Sheets for real use, the demo copy on the deployed demo, local files on this computer. */
export function store(): SheetStore {
  const driver = dataDriver();
  return driver === "google" ? googleStore : driver === "demo" ? demoStore : localStore;
}

export { StoreError } from "./types";
