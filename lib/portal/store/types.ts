import type { Book } from "../schema";

/**
 * The portal's storage contract, shaped like Google Sheets: a book (one
 * spreadsheet) holds tabs; a tab is rows of strings; row 1 is the header.
 * Row numbers are 1-based sheet rows (the header is row 1).
 */
export interface SheetStore {
  read(book: Book, tab: string): Promise<string[][]>;
  append(book: Book, tab: string, row: string[]): Promise<void>;
  update(book: Book, tab: string, rowNumber: number, row: string[]): Promise<void>;
}

export class StoreError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "StoreError";
  }
}
