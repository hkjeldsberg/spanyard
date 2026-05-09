import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedSentence {
  spanish: string;
  english: string;
  cloze: string;
}

// Fallback templates — used only when Claude fails, NOT cached in DB
const FALLBACKS = [
  (w: string) => ({ spanish: `Quiero ${w} ahora.`, english: `I want it now.`, cloze: `Quiero {{word}} ahora.` }),
  (w: string) => ({ spanish: `¿Puedes usar ${w}?`, english: `Can you use it?`, cloze: `¿Puedes usar {{word}}?` }),
  (w: string) => ({ spanish: `Ella tiene ${w}.`, english: `She has it.`, cloze: `Ella tiene {{word}}.` }),
  (w: string) => ({ spanish: `Necesito ${w} hoy.`, english: `I need it today.`, cloze: `Necesito {{word}} hoy.` }),
];

export async function generateSentence(
  spanish: string,
  english: string,
): Promise<GeneratedSentence> {
  const translations = english.split(",").map((t) => t.trim()).filter(Boolean);
  const chosenMeaning = translations[Math.floor(Math.random() * translations.length)];

  const msg = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 200,
    system: `You are a Spanish language teacher. Generate one unique, natural A1-level Spanish example sentence.
Return ONLY valid JSON, no markdown: {"spanish":"...","english":"...","cloze":"..."}

Rules:
- "spanish": a real, concrete everyday sentence that uses the target word naturally
- "english": its English translation (of the full sentence, not the word)
- "cloze": the Spanish sentence with ONLY the target word (the exact form as it appears) replaced by {{word}}
- Max 10 words. Use real contexts: food, family, home, school, weather, daily actions.
- NEVER say "X is an important word", "X is a common word", "I use the word X", or any meta-commentary
- NEVER include the English meaning of the target word in the Spanish sentence
- The sentence must be genuinely useful for learning the word in context`,
    messages: [
      {
        role: "user",
        content: `Target word: "${spanish}" (meaning: ${chosenMeaning}). Write one example sentence.`,
      },
    ],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text.trim() : "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as GeneratedSentence;
}

export function fallbackSentence(spanish: string): GeneratedSentence {
  const fn = FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
  return fn(spanish);
}
