import { supabaseServer } from "./supabase";
import { NEW_WORDS_PER_SESSION, MAX_REVIEW_PER_SESSION, REINFORCEMENT_PER_SESSION } from "./leitner";

export interface SessionWord {
  word_id: number;
  spanish: string;
  english: string;
  pos: string | null;
  box: number;
  isNew: boolean;
  isReinforcement: boolean;
  sentence?: {
    spanish: string;
    english: string;
    cloze: string;
  };
}

const sb = supabaseServer.schema("spanyard");

export async function buildSession(): Promise<SessionWord[]> {
  const now = new Date().toISOString();

  // 1. Due reviews (strictly overdue)
  const { data: reviews } = await sb
    .from("user_words")
    .select("word_id, box, words(spanish, english, pos)")
    .lte("next_review_at", now)
    .order("next_review_at")
    .limit(MAX_REVIEW_PER_SESSION);

  const reviewIds = (reviews ?? []).map((r: any) => r.word_id as number);

  // 2. Get all word_ids already in user_words (any box) — to exclude from "new"
  const { data: allSeen } = await sb.from("user_words").select("word_id");
  const seenIds = new Set((allSeen ?? []).map((r: any) => r.word_id as number));
  const excludeFromNew = Array.from(new Set([...seenIds, ...reviewIds]));

  // 3. New words: lowest-rank words NOT yet in user_words at all
  const { data: unseenWords } = await sb
    .from("words")
    .select("id, spanish, english, pos")
    .not("id", "in", excludeFromNew.length ? `(${excludeFromNew.join(",")})` : "(0)")
    .order("rank")
    .limit(NEW_WORDS_PER_SESSION);

  // 4. Reinforcement: recently reviewed box-1 or box-2 words, not already in due list
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const allExcluded = [...reviewIds, ...(unseenWords ?? []).map((w: any) => w.id)];

  const { data: reinforcements } = await sb
    .from("user_words")
    .select("word_id, box, words(spanish, english, pos)")
    .in("box", [1, 2])
    .gte("last_reviewed_at", cutoff)
    .not("word_id", "in", allExcluded.length ? `(${allExcluded.join(",")})` : "(0)")
    .order("last_reviewed_at", { ascending: false })
    .limit(REINFORCEMENT_PER_SESSION);

  const reviewWords: SessionWord[] = (reviews ?? []).map((r: any) => ({
    word_id: r.word_id,
    spanish: r.words.spanish,
    english: r.words.english,
    pos: r.words.pos,
    box: r.box,
    isNew: false,
    isReinforcement: false,
  }));

  const newWords: SessionWord[] = (unseenWords ?? []).map((w: any) => ({
    word_id: w.id,
    spanish: w.spanish,
    english: w.english,
    pos: w.pos,
    box: 0,
    isNew: true,
    isReinforcement: false,
  }));

  const reinforcementWords: SessionWord[] = (reinforcements ?? []).map((r: any) => ({
    word_id: r.word_id,
    spanish: r.words.spanish,
    english: r.words.english,
    pos: r.words.pos,
    box: r.box,
    isNew: false,
    isReinforcement: true,
  }));

  // Interleave reinforcement into the mix (every ~4 words)
  const base = [...reviewWords, ...newWords];
  const result: SessionWord[] = [];
  let ri = 0;
  for (let i = 0; i < base.length; i++) {
    result.push(base[i]);
    if ((i + 1) % 4 === 0 && ri < reinforcementWords.length) {
      result.push(reinforcementWords[ri++]);
    }
  }
  // Append any remaining reinforcement
  while (ri < reinforcementWords.length) result.push(reinforcementWords[ri++]);

  return result;
}

export async function ensureSentences(
  wordIds: number[],
): Promise<Map<number, NonNullable<SessionWord["sentence"]>>> {
  if (wordIds.length === 0) return new Map();

  const { data: existing } = await sb
    .from("sentences")
    .select("word_id, spanish, english, cloze")
    .in("word_id", wordIds);

  const map = new Map<number, NonNullable<SessionWord["sentence"]>>();
  (existing ?? []).forEach((s: any) => {
    map.set(s.word_id, { spanish: s.spanish, english: s.english, cloze: s.cloze });
  });
  return map;
}
