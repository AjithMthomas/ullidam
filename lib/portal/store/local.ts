import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Book } from "../schema";
import { StoreError, type SheetStore } from "./types";

/**
 * The local stand-in for Google Sheets: one JSON file per spreadsheet in
 * .data/portal (git-ignored), holding the same tabs, headers and string rows.
 * For development on this computer only (env.ts refuses it on Vercel).
 * Writes are serialised per process and saved atomically (temp file, rename).
 */
type BookFile = Record<string, string[][]>;

const dir = () => process.env.PORTAL_LOCAL_DIR ?? path.join(process.cwd(), ".data", "portal");
const fileOf = (book: Book) => path.join(dir(), `${book}.json`);

let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

async function load(book: Book): Promise<BookFile> {
  try {
    return JSON.parse(await readFile(fileOf(book), "utf8")) as BookFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new StoreError(`No local portal data yet. Run "npm run portal:seed" first.`, 503);
    }
    throw error;
  }
}

async function save(book: Book, data: BookFile) {
  await mkdir(dir(), { recursive: true });
  const target = fileOf(book);
  const temp = `${target}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 1));
  await rename(temp, target);
}

function tabOf(data: BookFile, tab: string): string[][] {
  const rows = data[tab];
  if (!rows) throw new StoreError(`Tab "${tab}" is missing. Re-run "npm run portal:seed".`, 500);
  return rows;
}

export const localStore: SheetStore = {
  async read(book, tab) {
    const data = await load(book);
    return tabOf(data, tab).map((row) => [...row]);
  },
  append(book, tab, row) {
    return serial(async () => {
      const data = await load(book);
      tabOf(data, tab).push([...row]);
      await save(book, data);
    });
  },
  update(book, tab, rowNumber, row) {
    return serial(async () => {
      const data = await load(book);
      const rows = tabOf(data, tab);
      if (rowNumber < 2 || rowNumber > rows.length) throw new StoreError(`Row ${rowNumber} does not exist in ${tab}.`, 404);
      rows[rowNumber - 1] = [...row];
      await save(book, data);
    });
  },
};
