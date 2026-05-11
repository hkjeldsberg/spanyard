export const dynamic = "force-dynamic";

import { supabaseServer } from "@/lib/supabase";
import { LexiconGrid } from "@/components/LexiconGrid";
import Link from "next/link";

async function getData() {
  const { data: words } = await supabaseServer
    .schema("spanyard")
    .from("words")
    .select("id, rank, spanish, english")
    .order("rank")
    .limit(1000);

  const { data: userWords } = await supabaseServer
    .schema("spanyard")
    .from("user_words")
    .select("word_id, box");

  const boxMap = new Map<number, number>();
  (userWords ?? []).forEach((uw) => boxMap.set(uw.word_id, uw.box));

  const cells = (words ?? []).map((w) => ({
    id: w.id,
    rank: w.rank,
    spanish: w.spanish,
    english: w.english,
    box: boxMap.get(w.id) ?? 0,
  }));

  return { cells };
}

export default async function LexiconPage() {
  const { cells } = await getData();

  return (
    <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 390, minHeight: 700, display: "flex", flexDirection: "column", position: "relative" }}>
        <LexiconGrid cells={cells} />
        <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "center" }}>
          <Link href="/today" style={{ flex: 1, textAlign: "center", padding: "12px", border: "2px solid #1a1a17", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a17", textDecoration: "none", maxWidth: "90%" }}>
            ← Home
          </Link>
        </div>
      </div>
    </main>
  );
}
