import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { generateSentence } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const { word_id, spanish } = await req.json();

  if (!word_id || !spanish) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check cache first
  const { data: existing } = await supabaseServer
    .schema("spanyard")
    .from("sentences")
    .select("*")
    .eq("word_id", word_id)
    .single();

  if (existing) return NextResponse.json(existing);

  // Generate via Claude
  const sentence = await generateSentence(spanish);

  const { data, error } = await supabaseServer
    .schema("spanyard")
    .from("sentences")
    .insert({ word_id, ...sentence })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
