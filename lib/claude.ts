import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GeneratedSentence {
  spanish: string;
  english: string;
  cloze: string;
}

export async function generateSentence(
  spanish: string,
  attempt = 0,
): Promise<GeneratedSentence> {
  const msg = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    system: `You are a Spanish language teacher. Generate one unique, natural A1-level Spanish example sentence for a target word.

    OUTPUT FORMAT:
    Return ONLY a valid JSON object. Do not include markdown formatting, backticks, or any conversational text.
    {"spanish": "string", "english": "string", "cloze": "string"}

    CONSTRAINTS:
    1. "spanish": A concrete, everyday sentence (max 10 words). Use simple vocabulary (A1 level).
    2. "english": A natural English translation of the Spanish sentence.
    3. "cloze": The Spanish sentence with the target word replaced by {{word}}.
    4. No meta-commentary or explanations.

    EXAMPLE:
    Target: "manzana"
    {"spanish": "Yo como una manzana roja.", "english": "I eat a red apple.", "cloze": "Yo como una {{word}} roja."}`,
    messages: [
      {
        role: "user",
        content: `Target Spanish word: "${spanish}"`,
      },
    ],
  });

  const content = msg.content.find(c => c.type === "text");
  const rawText = content ? content.text.trim() : "";

  // 2. Extract JSON instead of replacing tags
  // This finds the first '{' and the last '}' and takes everything in between
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  const clean = jsonMatch ? jsonMatch[0] : "";

  let result: GeneratedSentence;

  try {
    if (!clean) throw new Error("No JSON found in response");
    result = JSON.parse(clean);
  } catch (e) {
    if (attempt < 2) return generateSentence(spanish, attempt + 1);
    throw new Error(`Failed to parse Claude response: ${e instanceof Error ? e.message : "Unknown error"}`);
  }

  // 3. Validation
  if (!result.cloze?.includes("{{word}}")) {
    if (attempt < 2) return generateSentence(spanish, attempt + 1);
    throw new Error("Claude response missing {{word}} in cloze");
  }


  return result;
}
