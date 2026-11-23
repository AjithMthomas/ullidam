#!/usr/bin/env node
/**
 * Zero-Emoji Standard guard (CLAUDE_MASTER_SPECIFICATION.md, Rule 1).
 *
 * Fails with exit code 1 if any Unicode emoji, or an emoji-style glyph used in
 * place of an icon, appears in the project's text files. Runs before every
 * build, so a stray emoji can never reach Vercel.
 *
 * Allowed: Malayalam script (including the ZWJ/ZWNJ it relies on), and plain
 * typography such as the rupee sign, dashes, middle dots, curly quotes and the
 * copyright, registered and trademark signs.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([".claude", ".git", ".next", ".vercel", "node_modules", "out", "build", "coverage"]);

// CLAUDE.md quotes banned emoji as examples of what not to use. It is the one
// documented exception; everything else in the repository is scanned.
const IGNORED_FILES = new Set(["CLAUDE.md"]);

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".css", ".html", ".svg", ".txt", ".yml", ".yaml",
]);
const TEXT_FILENAMES = new Set([".env.example", ".gitignore"]);

// Emoji pictographs, flag letters, skin-tone modifiers, the emoji variation
// selector (U+FE0F) and the keycap combiner (U+20E3).
const EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|\u{FE0F}|\u{20E3}/u;

// Characters are listed as numeric code points so this file never contains
// the glyphs it bans.
const fromCodePoints = (...codePoints) => new Set(codePoints.map((cp) => String.fromCodePoint(cp)));

// Text-presentation symbols that are ordinary typography, not emoji:
// copyright, registered and trademark signs.
const ALLOWED = fromCodePoints(0x00a9, 0x00ae, 0x2122);

// Glyphs the spec replaces with Lucide icons, StatusPulse beacons or numeric
// ratings: stars, check and cross marks, and the filled status dot.
const PSEUDO_ICONS = fromCodePoints(0x2605, 0x2606, 0x2713, 0x2714, 0x2715, 0x2716, 0x2717, 0x2718, 0x25cf);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const isText = TEXT_EXTENSIONS.has(path.extname(entry.name)) || TEXT_FILENAMES.has(entry.name);
      if (isText && !IGNORED_FILES.has(entry.name)) yield path.join(dir, entry.name);
    }
  }
}

function findViolations(text) {
  const found = [];
  const lines = text.split("\n");
  lines.forEach((line, lineIndex) => {
    let column = 0;
    for (const char of line) {
      column += 1;
      if (ALLOWED.has(char)) continue;
      if (EMOJI.test(char) || PSEUDO_ICONS.has(char)) {
        const codePoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
        found.push({ line: lineIndex + 1, column, codePoint: `U+${codePoint}` });
      }
    }
  });
  return found;
}

let scanned = 0;
const violations = [];
for await (const file of walk(ROOT)) {
  scanned += 1;
  const text = await readFile(file, "utf8");
  for (const hit of findViolations(text)) {
    violations.push(`${path.relative(ROOT, file)}:${hit.line}:${hit.column}  ${hit.codePoint}`);
  }
}

if (violations.length > 0) {
  console.error(`Zero-Emoji Standard: ${violations.length} violation(s) found.\n`);
  for (const violation of violations) console.error(`  ${violation}`);
  console.error("\nReplace emoji with lucide-react icons, <StatusPulse />, or numeric ratings (e.g. 4.97 / 5.0).");
  process.exit(1);
}

console.log(`Zero-Emoji Standard: ${scanned} files scanned, no emoji found.`);
