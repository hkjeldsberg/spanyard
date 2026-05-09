export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase";
import { fluencyScore } from "@/lib/leitner";
import { TodayClient } from "./TodayClient";

async function getData() {
  const now = new Date().toISOString();

  const [{ data: dueWords }, { data: allUserWords }] = await Promise.all([
    supabaseServer.schema("spanyard").from("user_words").select("word_id, box").lte("next_review_at", now),
    supabaseServer.schema("spanyard").from("user_words").select("box"),
  ]);

  const reviewCount = dueWords?.length ?? 0;
  const seenCount = allUserWords?.length ?? 0;
  const newCount = Math.min(10, Math.max(0, 1000 - seenCount));

  const boxCounts = [0, 0, 0, 0, 0, 0];
  (allUserWords ?? []).forEach((uw: any) => { if (uw.box >= 1 && uw.box <= 5) boxCounts[uw.box]++; });

  const score = fluencyScore(boxCounts);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase().replace(/ /g, ".");

  return { reviewCount, newCount, score, started: seenCount, dateStr };
}

export default async function TodayPage() {
  const props = await getData();
  return <TodayClient {...props} />;
}
