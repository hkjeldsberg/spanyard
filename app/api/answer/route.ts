import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { nextBox, nextReviewDate } from "@/lib/leitner";

export async function POST(req: NextRequest) {
  const { word_id, correct, current_box } = await req.json();

  const newBox = nextBox(current_box ?? 0, correct);
  const reviewAt = nextReviewDate(newBox).toISOString();

  const { error } = await supabaseServer
    .schema("spanyard")
    .from("user_words")
    .upsert(
      {
        word_id,
        box: newBox,
        next_review_at: reviewAt,
        last_reviewed_at: new Date().toISOString(),
      },
      { onConflict: "word_id" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ box: newBox, next_review_at: reviewAt });
}
