import "server-only";
import demoOps from "../demo/ops.json";
import demoVault from "../demo/vault.json";
import type { Book } from "../schema";
import { StoreError, type SheetStore } from "./types";

/**
 * The demo store: the committed fake sample data (lib/portal/demo), loaded
 * into memory. Used on the deployed demo when no real data store is set up.
 * Changes (sign-in counters, notes, schedule edits) live in this server
 * instance's memory only and reset when Vercel restarts it. Never for real
 * client records.
 */
type BookData = Record<string, string[][]>;

const clone = (data: BookData): BookData => Object.fromEntries(Object.entries(data).map(([tab, rows]) => [tab, rows.map((row) => [...row])]));
const books: Record<Book, BookData> = { ops: clone(demoOps as BookData), vault: clone(demoVault as BookData) };

function tabOf(book: Book, tab: string): string[][] {
  const rows = books[book][tab];
  if (!rows) throw new StoreError(`Tab "${tab}" is missing from the demo data.`, 500);
  return rows;
}

export const demoStore: SheetStore = {
  async read(book, tab) {
    return tabOf(book, tab).map((row) => [...row]);
  },
  async append(book, tab, row) {
    tabOf(book, tab).push([...row]);
  },
  async update(book, tab, rowNumber, row) {
    const rows = tabOf(book, tab);
    if (rowNumber < 2 || rowNumber > rows.length) throw new StoreError(`Row ${rowNumber} does not exist in ${tab}.`, 404);
    rows[rowNumber - 1] = [...row];
  },
};
