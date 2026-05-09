import { supabaseServer } from "./supabase";
import { NEW_WORDS_PER_SESSION, MAX_REVIEW_PER_SESSION } from "./leitner";

export interface SessionWord {
  word_id: number;
  spanish: string;
  english: string;
  pos: string | null;
  box: number;
  isNew: boolean;
  sentence?: {
    spanish: string;
    english: string;
    cloze: string;
  };
}

const sb = supabaseServer.schema("spanyard");

export async function buildSession(): Promise<SessionWord[]> {
  const now = new Date().toISOString();

  // Due reviews
  const { data: reviews } = await sb
    .from("user_words")
    .select("word_id, box, words(spanish, english, pos)")
    .lte("next_review_at", now)
    .order("next_review_at")
    .limit(MAX_REVIEW_PER_SESSION);

  const seenIds = (reviews ?? []).map((r: any) => r.word_id as number);

  // New words not yet in user_words
  const { data: allWords } = await sb
    .from("words")
    .select("id, spanish, english, pos")
    .not("id", "in", seenIds.length ? `(${seenIds.join(",")})` : "(0)")
    .order("rank")
    .limit(NEW_WORDS_PER_SESSION);

  const reviewWords: SessionWord[] = (reviews ?? []).map((r: any) => ({
    word_id: r.word_id,
    spanish: r.words.spanish,
    english: r.words.english,
    pos: r.words.pos,
    box: r.box,
    isNew: false,
  }));

  const newWords: SessionWord[] = (allWords ?? []).map((w: any) => ({
    word_id: w.id,
    spanish: w.spanish,
    english: w.english,
    pos: w.pos,
    box: 0,
    isNew: true,
  }));

  return [...reviewWords, ...newWords];
}

export async function ensureSentences(
  wordIds: number[],
): Promise<Map<number, NonNullable<SessionWord["sentence"]>>> {
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
