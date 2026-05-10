"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  spanish: string;
  english: string;
  cloze: string;
  word: string;
  wordMeaning: string;
  wordPos: string | null;
  box: number;
  isNew: boolean;
  progress: number;
  total: number;
  hints: string[];
  onAnswer: (correct: boolean) => void;
  onExit: () => void;
}

function renderCloze(cloze: string, state: "blank" | "correct" | "wrong", typed: string) {
  const parts = cloze.split("{{word}}");
  if (parts.length < 2) return <span>{cloze}</span>;
  const bg = state === "correct" ? "#2a6a3e" : state === "wrong" ? "#c0392b" : "#d24f2e";
  return (
    <span>
      {parts[0]}
      <span style={{ display: "inline-block", padding: "0 12px", margin: "0 2px", background: bg, color: "#fff", border: "2px solid #1a1a17", transform: "translateY(-2px)", fontWeight: 600, minWidth: 80, textAlign: "center" }}>
        {state !== "blank" ? typed : "​    "}
      </span>
      {parts[1]}
    </span>
  );
}

// Extract the exact word form from the sentence that was replaced by {{word}}.
// e.g. spanish="Yo hablo español", cloze="Yo {{word}} español" → "hablo"
function extractClozeAnswer(spanish: string, cloze: string): string {
  const parts = cloze.split("{{word}}");
  if (parts.length < 2) return "";
  const before = parts[0];
  const after = parts[1];
  const extracted = spanish.slice(before.length, spanish.length - after.length).trim();
  return extracted.replace(/[.,!?;:]$/, "").trim();
}

export function ClozeExercise({ spanish, english, cloze, word, wordMeaning, wordPos, box, isNew, progress, total, hints, onAnswer, onExit }: Props) {
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"blank" | "correct" | "wrong">("blank");
  const [showHints, setShowHints] = useState(false);
  const [pressing, setPressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // The form actually used in the sentence (may differ from infinitive stored as `word`)
  const correctForm = extractClozeAnswer(spanish, cloze) || word;

  const submitted = state !== "blank";

  function submit(answer: string) {
    if (submitted) return;
    const ok = answer.trim().toLowerCase() === correctForm.toLowerCase();
    setState(ok ? "correct" : "wrong");
    setTyped(ok ? correctForm : answer.trim() || correctForm);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !submitted) submit(typed);
  }

  function pickHint(opt: string) {
    if (submitted) return;
    setTyped(opt);
    submit(opt);
  }

  const allHintOptions = [...hints, correctForm].sort(() => Math.random() - 0.5);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f0e8d8", fontFamily: "'Space Grotesk', sans-serif", color: "#1a1a17" }}>
      {/* Top bar */}
      <div style={{ padding: "14px 22px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onExit} style={{ width: 30, height: 30, border: "2px solid #1a1a17", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", padding: 0 }}>×</button>
        <div style={{ flex: 1, height: 10, background: "#fbf5e6", border: "2px solid #1a1a17" }}>
          <div style={{ width: `${(progress / total) * 100}%`, height: "100%", background: "#1a1a17", transition: "width 0.3s" }} />
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{String(progress).padStart(2, "0")}/{total}</div>
      </div>

      {/* Tag */}
      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", background: "#1a1a17", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          CLOZE · {isNew ? "NEW" : `BOX ${box}`}
        </div>
      </div>

      {/* Sentence */}
      <div style={{ padding: "16px 22px 0" }}>
        <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {renderCloze(cloze, state, typed)}
        </div>
        <div style={{ marginTop: 14, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#65615a" }}>
          EN: {english}
        </div>
      </div>

      {/* Word reveal after check */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: "16px 22px 0", padding: "14px", background: state === "correct" ? "#d1fae5" : "#fee2e2", border: `2px solid ${state === "correct" ? "#2a6a3e" : "#c0392b"}` }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: state === "correct" ? "#2a6a3e" : "#c0392b", letterSpacing: "0.08em" }}>
              {state === "correct" ? "CORRECT" : "WRONG"}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 4 }}>{correctForm}</div>
            {correctForm.toLowerCase() !== word.toLowerCase() && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a", marginTop: 2 }}>
                infinitive: {word}
              </div>
            )}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a", marginTop: 2 }}>
              {wordPos ? `${wordPos} · ` : ""}{wordMeaning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint options */}
      <AnimatePresence>
        {showHints && !submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ margin: "16px 22px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, overflow: "hidden" }}
          >
            {allHintOptions.map((opt) => (
              <button key={opt} onClick={() => pickHint(opt)}
                style={{ padding: "10px 0", background: "#fbf5e6", color: "#1a1a17", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "transform 0.08s, background 0.08s" }}
                onPointerDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = "")}
                onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input + buttons */}
      <div style={{ marginTop: "auto", padding: "20px 22px 22px" }}>
        {!submitted && (
          <div style={{ marginBottom: 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={handleKey}
              placeholder="type the missing word…"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              style={{ width: "100%", padding: "14px", border: "2px solid #1a1a17", background: "#fbf5e6", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "#1a1a17", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          {!submitted && (
            <button
              onClick={() => setShowHints((h) => !h)}
              style={{ flex: 1, padding: "14px 0", background: showHints ? "#e8c14b" : "#fbf5e6", color: "#1a1a17", border: "2px solid #1a1a17", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
              onPointerDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "")}
              onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
            >
              {showHints ? "Hide" : "Hint?"}
            </button>
          )}
          {!submitted ? (
            <button
              onClick={() => submit(typed)}
              disabled={typed.trim().length === 0}
              onPointerDown={() => setPressing(true)}
              onPointerUp={() => setPressing(false)}
              onPointerLeave={() => setPressing(false)}
              style={{
                flex: 2, padding: "14px 0",
                background: typed.trim() ? "#1a1a17" : "#65615a", color: "#fff",
                border: "2px solid #1a1a17",
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, textTransform: "uppercase",
                cursor: typed.trim() ? "pointer" : "default",
                transform: pressing && typed.trim() ? "translate(2px,2px)" : undefined,
                transition: "transform 0.08s",
              }}
            >
              CHECK
            </button>
          ) : (
            <button
              onClick={() => onAnswer(state === "correct")}
              onPointerDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "")}
              onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
              style={{ flex: 1, padding: "16px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", cursor: "pointer", transition: "transform 0.08s" }}
            >
              CONTINUE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
