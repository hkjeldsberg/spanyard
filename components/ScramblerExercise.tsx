"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  english: string;
  sentence: string;
  word: string;
  box: number;
  isNew: boolean;
  progress: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  onExit: () => void;
}

function tokenize(sentence: string): string[] {
  return sentence.replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ScramblerExercise({ english, sentence, word, box, isNew, progress, total, onAnswer, onExit }: Props) {
  const tokens = tokenize(sentence); // source of truth, never changes

  // Shuffle on client only to avoid hydration mismatch
  const [displayOrder, setDisplayOrder] = useState<number[]>(() => tokens.map((_, i) => i));
  useEffect(() => {
    setDisplayOrder(shuffle(tokens.map((_, i) => i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  // selectedIndices: ordered list of token indices the user has picked
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const built = selectedIndices.map((i) => tokens[i]);
  const selectedSet = new Set(selectedIndices);
  const canCheck = selectedIndices.length === tokens.length && !checked;

  function tapTray(i: number) {
    if (checked) return;
    if (selectedSet.has(i)) {
      // deselect: remove the last occurrence of this index
      setSelectedIndices((prev) => {
        const last = prev.lastIndexOf(i);
        return prev.filter((_, j) => j !== last);
      });
    } else {
      setSelectedIndices((prev) => [...prev, i]);
    }
  }

  function tapBuilt(pos: number) {
    if (checked) return;
    // Remove this position from the selection order
    setSelectedIndices((prev) => prev.filter((_, j) => j !== pos));
  }

  function reset() {
    setSelectedIndices([]);
    setChecked(false);
  }

  function check() {
    const ok = built.join(" ").toLowerCase() === tokens.join(" ").toLowerCase();
    setIsCorrect(ok);
    setChecked(true);
  }

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

      {/* Tag + Prompt */}
      <div style={{ padding: "22px 22px 0" }}>
        <div style={{ display: "inline-block", padding: "4px 10px", background: "#e8c14b", border: "2px solid #1a1a17", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          SCRAMBLE · {isNew ? "NEW" : `BOX ${box}`}
        </div>
        <div style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.25, letterSpacing: "-0.02em", marginTop: 14, fontStyle: "italic" }}>
          {english}
        </div>
      </div>

      {/* Built area */}
      <div style={{ margin: "24px 22px 0", padding: "18px 14px", minHeight: 90, background: "#fbf5e6", border: `2px solid ${checked ? (isCorrect ? "#2a6a3e" : "#c0392b") : "#1a1a17"}`, display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start", transition: "border-color 0.2s" }}>
        {built.map((w, pos) => (
          <motion.span
            key={pos}
            layout
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => tapBuilt(pos)}
            style={{ padding: "8px 14px", background: "#1a1a17", color: "#fff", fontSize: 17, fontWeight: 600, boxShadow: "3px 3px 0 #d24f2e", cursor: checked ? "default" : "pointer", userSelect: "none" }}
          >
            {w}
          </motion.span>
        ))}
        {built.length === 0 && (
          <span style={{ color: "#65615a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>tap words below →</span>
        )}
      </div>

      {/* Tray — all words always visible, selected ones greyed */}
      <div style={{ margin: "20px 22px 0", display: "flex", flexWrap: "wrap", gap: 10 }}>
        {displayOrder.map((i) => {
          const w = tokens[i];
          const isSelected = selectedSet.has(i);
          return (
            <span
              key={i}
              onClick={() => tapTray(i)}
              style={{
                padding: "10px 16px",
                background: isSelected ? "#d8d0c0" : "#f0e8d8",
                border: `2px solid ${isSelected ? "#a09080" : "#1a1a17"}`,
                color: isSelected ? "#a09080" : "#1a1a17",
                fontSize: 17,
                fontWeight: 600,
                boxShadow: isSelected ? "none" : "3px 3px 0 #1a1a17",
                transform: isSelected ? "none" : "translate(-1px,-1px)",
                cursor: "pointer",
                userSelect: "none",
                transition: "all 0.12s",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Result feedback */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ margin: "16px 22px 0", padding: "10px 14px", background: isCorrect ? "#d1fae5" : "#fee2e2", border: `2px solid ${isCorrect ? "#2a6a3e" : "#c0392b"}`, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
        >
          {isCorrect ? "✓ Correct!" : `✗ Should be: "${sentence}"`}
        </motion.div>
      )}

      {/* Buttons */}
      <div style={{ marginTop: "auto", padding: "28px 22px 28px", display: "flex", gap: 8 }}>
        <button onClick={reset} style={{ flex: 1, padding: "14px 0", background: "#f0e8d8", color: "#1a1a17", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", cursor: "pointer" }}>
          Reset
        </button>
        {!checked ? (
          <button onClick={check} disabled={!canCheck} style={{ flex: 2, padding: "14px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", opacity: canCheck ? 1 : 0.4, cursor: canCheck ? "pointer" : "default" }}>
            Check ↗
          </button>
        ) : (
          <button onClick={() => onAnswer(isCorrect)} style={{ flex: 2, padding: "14px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", cursor: "pointer" }}>
            Continue ↗
          </button>
        )}
      </div>
    </div>
  );
}
