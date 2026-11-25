import "server-only";
import { bookOf, columnsOf, type TabName } from "./schema";
import { store, StoreError } from "./store";

/**
 * Rows as objects keyed by column name, with their sheet row number. Columns
 * are matched by header name, so a reordered sheet still reads correctly.
 * Every write sets Row_Version and Updated_At; an update whose expected
 * version no longer matches is refused (someone else saved first).
 */
export type Row = Record<string, string> & { _row: number };

export class ConflictError extends StoreError {
  constructor() {
    super("This record changed since you opened it. Reload to see the latest version.", 409);
  }
}

export async function readRows(tab: TabName): Promise<Row[]> {
  const [header = [], ...rows] = await store().read(bookOf(tab), tab);
  const missing = columnsOf(tab).filter((column) => !header.includes(column));
  if (missing.length) throw new StoreError(`The ${tab} tab is missing columns: ${missing.join(", ")}.`, 500);
  return rows
    .map((cells, index) => {
      const row = { _row: index + 2 } as Row;
      header.forEach((column, i) => (row[column] = cells[i] ?? ""));
      return row;
    })
    .filter((row) => header.some((column) => row[column] !== ""));
}

function toCells(tab: TabName, values: Record<string, string>, header: readonly string[]): string[] {
  const known = new Set(columnsOf(tab));
  return header.map((column) => (known.has(column) ? (values[column] ?? "") : ""));
}

async function headerOf(tab: TabName): Promise<string[]> {
  const [header = []] = await store().read(bookOf(tab), tab);
  return header;
}

export async function appendRow(tab: TabName, values: Record<string, string>): Promise<void> {
  const stamped = columnsOf(tab).includes("Row_Version")
    ? { ...values, Row_Version: "1", Updated_At: new Date().toISOString() }
    : values;
  await store().append(bookOf(tab), tab, toCells(tab, stamped, await headerOf(tab)));
}

/** Update one row after checking it has not changed since `row` was read. */
export async function updateRow(tab: TabName, row: Row, patch: Record<string, string>): Promise<void> {
  const current = (await readRows(tab)).find((candidate) => candidate._row === row._row);
  if (!current || current.Row_Version !== row.Row_Version) throw new ConflictError();
  const values = Object.fromEntries(Object.entries(current).filter(([column]) => column !== "_row")) as Record<string, string>;
  const next: Record<string, string> = {
    ...values,
    ...patch,
    Row_Version: String(Number(current.Row_Version || "0") + 1),
    Updated_At: new Date().toISOString(),
  };
  await store().update(bookOf(tab), tab, row._row, toCells(tab, next, await headerOf(tab)));
}

/** IDs like CL-7F3K9Q: never the row number, so manual sorting can't mix records up. */
export function newId(prefix: string): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
