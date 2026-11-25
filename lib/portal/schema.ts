import schema from "./schema.json";

/** The portal's tables (tabs) and their columns; the single source is schema.json. */
export type Book = "ops" | "vault";
export type TabName = keyof typeof schema.tabs;

export const TABS = schema.tabs as Record<TabName, { book: Book; columns: readonly string[]; encrypted: readonly string[] }>;

export function columnsOf(tab: TabName): readonly string[] {
  return TABS[tab].columns;
}

export function bookOf(tab: TabName): Book {
  return TABS[tab].book;
}
