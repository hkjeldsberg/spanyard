#!/usr/bin/env npx ts-node
// Seeds the Supabase words table from words.html
// Usage: npx ts-node scripts/seed.ts

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const html = readFileSync(join(process.cwd(), "words.html"), "utf-8");

function parseWords() {
  // Format: <span>NUMBER &nbsp;_ &nbsp;SPANISH &nbsp;- &nbsp;ENGLISH</span>
  const words: Array<{ rank: number; spanish: string; english: string }> = [];
  const spanPattern = /<span>(\d+)\s*(?:&nbsp;)+\s*_\s*(?:&nbsp;)+\s*([^&\s<][^<]*?)\s*(?:&nbsp;)+\s*-\s*(?:&nbsp;)+\s*([^<]+?)\s*<\/span>/gi;

  let m: RegExpExecArray | null;
  while ((m = spanPattern.exec(html)) !== null) {
    const rank = parseInt(m[1], 10);
    const spanish = m[2].trim().replace(/&nbsp;/g, "").trim();
    const english = m[3].trim().replace(/&nbsp;/g, "").replace(/\s+/g, " ").trim();
    if (rank >= 1 && rank <= 1000 && spanish && english) {
      words.push({ rank, spanish, english });
    }
  }

  const seen = new Set<number>();
  return words
    .filter((w) => { if (seen.has(w.rank)) return false; seen.add(w.rank); return true; })
    .sort((a, b) => a.rank - b.rank);
}

async function seed() {
  const words = parseWords();
  console.log(`Parsed ${words.length} words`);
  if (words.length > 0) {
    console.log(`First: ${words[0].rank}. ${words[0].spanish} - ${words[0].english}`);
    console.log(`Last:  ${words[words.length - 1].rank}. ${words[words.length - 1].spanish} - ${words[words.length - 1].english}`);
  }

  // Upsert in batches of 100
  for (let i = 0; i < words.length; i += 100) {
    const batch = words.slice(i, i + 100);
    const { error } = await supabase
      .schema("spanyard")
      .from("words")
      .upsert(batch, { onConflict: "rank" });
    if (error) {
      console.error(`Batch ${i}-${i + 100} failed:`, error.message);
    } else {
      console.log(`Seeded ranks ${batch[0].rank}–${batch[batch.length - 1].rank}`);
    }
  }
  console.log("Done!");
}

seed().catch(console.error);
