"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PanInfo } from "framer-motion";

interface Props {
  english: string;
  sentence: string;
  word: string;
  wordMeaning: string;
  wordPos: string | null;
  box: number;
  isNew: boolean;
  progress: number;
  total: number;
  onAnswer: (correct: boolean) => void;
  onExit: () => void;
}

interface PlacedWord {
  id: string;
  tokenIdx: number;
  text: string;
}

function tokenize(s: string): string[] {
  return s.replace(/[.,!?;:]/g, "").split(/\s+/).filter(Boolean);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns insert-before index (0 = before first, n = after last).
// Uses edge-based detection: measures distance from pointer to the left/right
// edge of each chip, so the first slot (left of chip 0) is a full-size target.
function getInsertIndex(
  px: number,
  py: number,
  draggingPos: number,
  refs: (HTMLElement | null)[],
): number {
  let best = draggingPos;
  let bestDist = Infinity;

  refs.forEach((el, i) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const midY = r.top + r.height / 2;

    // Gap BEFORE chip i — anchor at left edge
    const dBefore = Math.hypot(px - r.left, py - midY);
    if (dBefore < bestDist) { bestDist = dBefore; best = i; }

    // Gap AFTER chip i — anchor at right edge (= "before chip i+1")
    const dAfter = Math.hypot(px - r.right, py - midY);
    if (dAfter < bestDist) { bestDist = dAfter; best = i + 1; }
  });

  return best;
}

const TAP_THRESHOLD = 8;

export function ScramblerExercise({
  english, sentence, word, wordMeaning, wordPos,
  box, isNew, progress, total, onAnswer, onExit,
}: Props) {
  const tokens = tokenize(sentence);

  const [displayOrder, setDisplayOrder] = useState<number[]>(() => tokens.map((_, i) => i));
  useEffect(() => {
    setDisplayOrder(shuffle(tokens.map((_, i) => i)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence]);

  const [placed, setPlaced] = useState<PlacedWord[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [seq, setSeq] = useState(0);
  const [draggingPos, setDraggingPos] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const chipRefs = useRef<(HTMLElement | null)[]>([]);
  const selectedSet = new Set(placed.map((p) => p.tokenIdx));
  const canCheck = placed.length === tokens.length && !checked;

  function addFromTray(tokenIdx: number) {
    if (checked || selectedSet.has(tokenIdx)) return;
    const id = `${tokenIdx}-${seq}`;
    setSeq((c) => c + 1);
    setPlaced((prev) => [...prev, { id, tokenIdx, text: tokens[tokenIdx] }]);
  }

  function deselectFromTray(tokenIdx: number) {
    if (checked) return;
    setPlaced((prev) => {
      const reversed = [...prev].reverse();
      const i = reversed.findIndex((p) => p.tokenIdx === tokenIdx);
      const real = prev.length - 1 - i;
      return prev.filter((_, j) => j !== real);
    });
  }

  function tapTray(tokenIdx: number) {
    if (selectedSet.has(tokenIdx)) deselectFromTray(tokenIdx);
    else addFromTray(tokenIdx);
  }

  function handleDragStart(pos: number) {
    setDraggingPos(pos);
    setDropIndex(pos);
  }

  function handleDrag(pos: number, info: PanInfo) {
    const idx = getInsertIndex(info.point.x, info.point.y, pos, chipRefs.current);
    setDropIndex(idx);
  }

  function handleDragEnd(pos: number, info: PanInfo) {
    const moved = Math.abs(info.offset.x) + Math.abs(info.offset.y);
    const targetIdx = dropIndex;
    setDraggingPos(null);
    setDropIndex(null);

    if (moved < TAP_THRESHOLD) {
      setPlaced((prev) => prev.filter((_, j) => j !== pos));
      return;
    }

    if (targetIdx === null || targetIdx === pos || targetIdx === pos + 1) return;

    setPlaced((prev) => {
      const next = [...prev];
      const [item] = next.splice(pos, 1);
      const adjusted = targetIdx > pos ? targetIdx - 1 : targetIdx;
      next.splice(adjusted, 0, item);
      return next;
    });
  }

  function reset() { setPlaced([]); setChecked(false); setSeq(0); }

  function check() {
    setIsCorrect(placed.map((p) => p.text).join(" ").toLowerCase() === tokens.join(" ").toLowerCase());
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
      <div style={{
        margin: "24px 22px 0", padding: "18px 14px", minHeight: 90,
        background: "#fbf5e6",
        border: `2px solid ${checked ? (isCorrect ? "#2a6a3e" : "#c0392b") : "#1a1a17"}`,
        display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
        alignContent: "flex-start", transition: "border-color 0.2s",
      }}>
        {placed.length === 0 && draggingPos === null && (
          <span style={{ color: "#65615a", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, pointerEvents: "none" }}>
            tap or drag words below →
          </span>
        )}

        {placed.map((p, pos) => (
          <div key={p.id} style={{ display: "contents" }}>
            {/* Drop indicator — appears BEFORE chip[pos] when dropIndex === pos */}
            {draggingPos !== null && dropIndex === pos && draggingPos !== pos && draggingPos !== pos - 1 && (
              <div style={{ width: 3, minHeight: 36, background: "#d24f2e", borderRadius: 2, alignSelf: "stretch", flexShrink: 0 }} />
            )}

            <motion.span
              layout
              ref={(el) => { chipRefs.current[pos] = el as HTMLElement | null; }}
              drag={!checked}
              dragMomentum={false}
              onDragStart={() => handleDragStart(pos)}
              onDrag={(_, info) => handleDrag(pos, info)}
              onDragEnd={(_, info) => handleDragEnd(pos, info)}
              whileDrag={{ scale: 1.08, zIndex: 20, boxShadow: "5px 5px 0 #d24f2e" }}
              style={{
                padding: "8px 14px",
                background: "#1a1a17", color: "#fff",
                fontSize: 17, fontWeight: 600,
                boxShadow: "3px 3px 0 #d24f2e",
                cursor: checked ? "default" : "grab",
                userSelect: "none", touchAction: "none",
                opacity: draggingPos === pos ? 0.35 : 1,
                position: "relative",
              }}
            >
              {p.text}
            </motion.span>
          </div>
        ))}

        {/* Drop indicator after last chip */}
        {draggingPos !== null && dropIndex === placed.length && draggingPos !== placed.length - 1 && (
          <div style={{ width: 3, minHeight: 36, background: "#d24f2e", borderRadius: 2, alignSelf: "stretch", flexShrink: 0 }} />
        )}
      </div>

      {/* Tray */}
      <div style={{ margin: "20px 22px 0", display: "flex", flexWrap: "wrap", gap: 10 }}>
        {displayOrder.map((i) => {
          const w = tokens[i];
          const isSel = selectedSet.has(i);
          return (
            <span
              key={i}
              onClick={() => tapTray(i)}
              onPointerDown={(e) => { if (!isSel) { e.currentTarget.style.transform = "translate(1px,1px)"; e.currentTarget.style.boxShadow = "1px 1px 0 #1a1a17"; } }}
              onPointerUp={(e) => { e.currentTarget.style.transform = isSel ? "none" : "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = isSel ? "none" : "3px 3px 0 #1a1a17"; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = isSel ? "none" : "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = isSel ? "none" : "3px 3px 0 #1a1a17"; }}
              style={{
                padding: "10px 16px",
                background: isSel ? "#d8d0c0" : "#f0e8d8",
                border: `2px solid ${isSel ? "#a09080" : "#1a1a17"}`,
                color: isSel ? "#a09080" : "#1a1a17",
                fontSize: 17, fontWeight: 600,
                boxShadow: isSel ? "none" : "3px 3px 0 #1a1a17",
                transform: isSel ? "none" : "translate(-1px,-1px)",
                cursor: "pointer", userSelect: "none",
                transition: "background 0.12s, color 0.12s, border-color 0.12s",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      {/* Result after check */}
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ margin: "16px 22px 0", padding: "14px", background: isCorrect ? "#d1fae5" : "#fee2e2", border: `2px solid ${isCorrect ? "#2a6a3e" : "#c0392b"}` }}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isCorrect ? "#2a6a3e" : "#c0392b", letterSpacing: "0.08em" }}>
              {isCorrect ? "CORRECT" : "WRONG"}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em", marginTop: 4 }}>{word}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a", marginTop: 2 }}>
              {wordPos ? `${wordPos} · ` : ""}{wordMeaning}
            </div>
            {!isCorrect && (
              <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a" }}>
                {sentence}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div style={{ marginTop: "auto", padding: "28px 22px 28px", display: "flex", gap: 8 }}>
        {!checked && (
          <button
            onClick={reset}
            onPointerDown={(e) => { e.currentTarget.style.transform = "translate(2px,2px)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = ""; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = ""; }}
            style={{ flex: 1, padding: "14px 0", background: "#f0e8d8", color: "#1a1a17", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, textTransform: "uppercase", cursor: "pointer" }}
          >
            RESET
          </button>
        )}
        {!checked ? (
          <button
            onClick={check}
            disabled={!canCheck}
            onPointerDown={(e) => { if (canCheck) e.currentTarget.style.transform = "translate(2px,2px)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = ""; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = ""; }}
            style={{ flex: 2, padding: "14px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, textTransform: "uppercase", opacity: canCheck ? 1 : 0.4, cursor: canCheck ? "pointer" : "default" }}
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onAnswer(isCorrect)}
            onPointerDown={(e) => { e.currentTarget.style.transform = "translate(2px,2px)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = ""; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = ""; }}
            style={{ flex: 1, padding: "14px 0", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, textTransform: "uppercase", cursor: "pointer" }}
          >
            CONTINUE
          </button>
        )}
      </div>
    </div>
  );
}
