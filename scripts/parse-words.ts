#!/usr/bin/env npx ts-node
// Parses words.html and extracts the 1000 most common Spanish words.
// Outputs JSON to stdout.

import { readFileSync } from "fs";
import { join } from "path";

const html = readFileSync(join(process.cwd(), "words.html"), "utf-8");

// The blog post format: "1. ser - to be" style rows in table
// Pattern in the HTML: rows with rank, spanish word, english translation
const words: Array<{ rank: number; spanish: string; english: string }> = [];

// Extract table rows — the page has a numbered list format
// Pattern: digit(s) followed by Spanish word and English meaning
const rowPattern = />\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>\s*<td[^>]*>\s*([^<]+)\s*<\/td>/gi;

let match: RegExpExecArray | null;
while ((match = rowPattern.exec(html)) !== null) {
  const rank = parseInt(match[1], 10);
  const spanish = match[2].trim();
  const english = match[3].trim();
  if (rank >= 1 && rank <= 1000 && spanish && english) {
    words.push({ rank, spanish, english });
  }
}

if (words.length < 100) {
  // Fallback: try alternate format used in the blog (plain text list)
  const altPattern = /(\d+)\.\s+([^\s–-]+)\s*[–-]\s*(.+?)(?=\n|\r|$)/gm;
  const plainText = html.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ");
  while ((match = altPattern.exec(plainText)) !== null) {
    const rank = parseInt(match[1], 10);
    const spanish = match[2].trim();
    const english = match[3].trim().slice(0, 100);
    if (rank >= 1 && rank <= 1000 && spanish && english) {
      words.push({ rank, spanish, english });
    }
  }
}

// Deduplicate by rank
const seen = new Set<number>();
const deduped = words.filter((w) => {
  if (seen.has(w.rank)) return false;
  seen.add(w.rank);
  return true;
}).sort((a, b) => a.rank - b.rank);

console.log(JSON.stringify(deduped, null, 2));
process.stderr.write(`Extracted ${deduped.length} words\n`);
