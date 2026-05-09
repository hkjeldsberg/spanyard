# IN PROGRESS

# COMPLETED
- Some words (e.g. "se") had weird formatting — cleaned 100 words (fi/fl ligatures, [annotation] brackets, stray HTML entities). Run `npx tsx scripts/clean-words.ts` anytime.
- X button does not work — now a real `<button>` with `onExit` → navigates to /today
- Design: top-right text showing small boxes — replaced ▣▢ Unicode block chars with plain "LEXICON" text button
- Search button in lexicon does not work — now opens an inline search input; filters by Spanish or English, tap a result to inspect it
- "session_start" text on home page — removed
- Home page mode selection — "Begin →" (mixed), + two smaller buttons: "Cloze only" and "Scramble only" with ?mode= param
- Session page: remove word progress box (gives away the answer) — word card with LeitnerBar removed from Cloze screen
- Session Cloze: type the answer instead of picking — text input + Enter/Check button; optional "Hint?" toggle reveals 4 choices
- Session Scramble: more spacing before bottom buttons — increased padding
- Session Scramble: click away words — was already working (tap built word → returns to tray)
- Session Scramble: long press to move words — 450ms long press on built word moves it back to tray
- Sentences all the same — cleared cached sentences; improved Claude prompt for natural, contextual sentences; picks random translation for multi-meaning words
- Every sentence must be unique — Claude generates a unique sentence per word; fallbacks are random templates, never cached in DB so Claude retries next session
- "la is an important word" pattern — fixed: Claude prompt now explicitly forbids meta-commentary and using the English meaning inside the Spanish sentence; fallback templates are neutral
- More spacing between input and hint suggestions — added 20px top padding to the input/button section
- Scrambler: grey out selected words instead of removing — tray always shows all words; selected ones appear greyed/flat; clicking grey word deselects it; no animation jitter
