export const dynamic = "force-dynamic";

import { buildSession, ensureSentences } from "@/lib/session";
import { supabaseServer } from "@/lib/supabase";
import { generateSentence } from "@/lib/claude";
import { SessionClient } from "./SessionClient";

type Mode = "cloze" | "scrambler" | "both";

async function getData(mode: Mode) {
  const words = await buildSession();
  if (words.length === 0) return { exercises: [] };

  const wordIds = words.map((w) => w.word_id);
  const sentenceMap = await ensureSentences(wordIds);

  const missing = words.filter((w) => !sentenceMap.has(w.word_id));
  if (missing.length > 0) {
    await Promise.all(
      missing.map(async (w) => {
        try {
          const s = await generateSentence(w.spanish);
          await supabaseServer
            .schema("spanyard")
            .from("sentences")
            .insert({ word_id: w.word_id, ...s });
          sentenceMap.set(w.word_id, s);
        } catch {
          console.error(`No sentence for word ${w.word_id}: ${w.spanish}`);
        }
      }),
    );
  }

  const sessionSpanish = words.map((w) => w.spanish);

  const exercises = words
    .filter((w) => sentenceMap.has(w.word_id))
    .map((w, i) => {
      const assignedMode: "cloze" | "scrambler" =
        mode === "cloze" ? "cloze"
        : mode === "scrambler" ? "scrambler"
        : i % 2 === 0 ? "cloze" : "scrambler";

      const hints = sessionSpanish
        .filter((s) => s !== w.spanish)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      return {
        word_id: w.word_id,
        spanish: w.spanish,
        english: w.english,
        pos: w.pos,
        box: w.box,
        isNew: w.isNew,
        isReinforcement: w.isReinforcement,
        mode: assignedMode,
        hints,
        sentence: sentenceMap.get(w.word_id)!,
      };
    });

  return { exercises };
}

export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const raw = params.mode ?? "both";
  const mode: Mode = raw === "cloze" || raw === "scrambler" ? raw : "both";
  const { exercises } = await getData(mode);
  return <SessionClient exercises={exercises} mode={raw} />;
}
