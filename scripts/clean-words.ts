#!/usr/bin/env npx tsx
// Cleans up weird characters in the words table.
// Run: npx tsx scripts/clean-words.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function clean(text: string): string {
  return text
    .replace(/ﬁ/g, "fi")   // fi ligature
    .replace(/ﬂ/g, "fl")   // fl ligature
    .replace(/ﬀ/g, "ff")
    .replace(/ﬃ/g, "ffi")
    .replace(/ﬄ/g, "ffl")
    .replace(/&#\d+;/g, "")           // stray HTML entities
    .replace(/\[.*?\]/g, "")          // [annotation] brackets
    .replace(/\(.*?\)/g, (m) => m)    // keep parentheses (they're OK)
    .replace(/\s{2,}/g, " ")          // collapse spaces
    .trim();
}

async function run() {
  const { data: words, error } = await supabase
    .schema("spanyard")
    .from("words")
    .select("id, spanish, english");

  if (error) { console.error(error.message); process.exit(1); }

  let fixed = 0;
  const updates: Array<{ id: number; english: string }> = [];

  for (const w of words ?? []) {
    const cleanEn = clean(w.english);
    if (cleanEn !== w.english) {
      updates.push({ id: w.id, english: cleanEn });
      fixed++;
    }
  }

  console.log(`${fixed} words need cleaning`);

  for (const u of updates) {
    const { error } = await supabase
      .schema("spanyard")
      .from("words")
      .update({ english: u.english })
      .eq("id", u.id);
    if (error) console.error(`id ${u.id}:`, error.message);
  }

  console.log("Done!");
}

run().catch(console.error);
