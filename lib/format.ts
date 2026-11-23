// Grouping only, so server and client render identical strings regardless of
// ICU locale data.
const grouping = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return grouping.format(value);
}

/** Typographic rating, never stars: 4.97 -> "4.97 / 5.0" */
export function formatRating(rating: number): string {
  return `${rating.toFixed(2)} / 5.0`;
}
