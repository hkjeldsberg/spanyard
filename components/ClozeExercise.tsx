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
  hints: string[]; // 3 wrong options for hint
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
        {state !== "blank" ? typed : "​    "}
      </span>
      {parts[1]}
    </span>
  );
}

export function ClozeExercise({ spanish, english, cloze, word, wordMeaning, wordPos, box, isNew, progress, total, hints, onAnswer, onExit }: Props) {
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"blank" | "correct" | "wrong">("blank");
  const [showHints, setShowHints] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submitted = state !== "blank";

  function submit(answer: string) {
    if (submitted) return;
    const ok = answer.trim().toLowerCase() === word.toLowerCase();
    setState(ok ? "correct" : "wrong");
    setTyped(ok ? word : answer.trim() || word); // show correct word if blank submitted
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !submitted) submit(typed);
  }

  function pickHint(opt: string) {
    if (submitted) return;
    setTyped(opt);
    submit(opt);
  }

  const allHintOptions = [...hints, word].sort(() => Math.random() - 0.5);

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

      {/* Result label */}
      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: "16px 22px 0", padding: "10px 14px", background: state === "correct" ? "#d1fae5" : "#fee2e2", border: `2px solid ${state === "correct" ? "#2a6a3e" : "#c0392b"}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
          >
            {state === "correct" ? `✓ Correct!` : `✗ Answer: "${word}"`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint options (revealed on demand) */}
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
                style={{ padding: "10px 0", background: "#fbf5e6", color: "#1a1a17", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
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
            >
              {showHints ? "Hide Hints" : "Hint?"}
            </button>
          )}
          {!submitted ? (
            <button
              onClick={() => submit(typed)}
              disabled={typed.trim().length === 0}
              style={{ flex: 2, padding: "14px 0", background: typed.trim() ? "#1a1a17" : "#65615a", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, textTransform: "uppercase", cursor: typed.trim() ? "pointer" : "default" }}
            >
              Check ↗
            </button>
          ) : (
            <button
              onClick={() => onAnswer(state === "correct")}
              style={{ flex: 1, padding: "16px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", cursor: "pointer" }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
