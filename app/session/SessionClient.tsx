"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ClozeExercise } from "@/components/ClozeExercise";
import { ScramblerExercise } from "@/components/ScramblerExercise";

interface Exercise {
  word_id: number;
  spanish: string;
  english: string;
  pos: string | null;
  box: number;
  isNew: boolean;
  isReinforcement: boolean;
  mode: "cloze" | "scrambler";
  hints: string[];
  sentence: { spanish: string; english: string; cloze: string };
}

interface Props {
  exercises: Exercise[];
  mode: string;
}

export function SessionClient({ exercises, mode }: Props) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const router = useRouter();

  const current = exercises[idx];

  async function handleAnswer(correct: boolean) {
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word_id: current.word_id, correct, current_box: current.box || 1 }),
    });
    if (idx + 1 >= exercises.length) setDone(true);
    else setIdx((i) => i + 1);
  }

  function handleExit() { router.push("/today"); }

  function handleContinue() {
    // Navigate to a fresh session — builder picks the next unseen words
    router.push(`/session?mode=${mode}&t=${Date.now()}`);
    router.refresh();
  }

  if (exercises.length === 0) {
    return (
      <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.05em" }}>All done!</div>
          <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#65615a" }}>Nothing due today.</div>
          <button onClick={handleExit} style={{ marginTop: 24, padding: "14px 28px", background: "#1a1a17", color: "#fff", border: "2px solid #1a1a17", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
            Back to Today →
          </button>
        </div>
      </main>
    );
  }

  if (done) {
    const pct = Math.round((score.correct / score.total) * 100);
    return (
      <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", color: "#1a1a17" }}>
        <div style={{ width: "100%", maxWidth: 390, padding: 32 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", color: "#65615a" }}>SESSION COMPLETE</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.06em", marginTop: 8 }}>{pct}%</div>
          <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#65615a" }}>{score.correct}/{score.total} correct</div>
          <div style={{ marginTop: 24, height: 14, background: "#fbf5e6", border: "2px solid #1a1a17", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${pct}%`, background: pct >= 80 ? "#2a6a3e" : "#d24f2e", borderRight: pct > 0 ? "2px solid #1a1a17" : "none" }} />
          </div>

          {/* Continue → next batch */}
          <button
            onClick={handleContinue}
            style={{ marginTop: 24, width: "100%", padding: "22px 18px", background: "#d24f2e", color: "#fff", border: "2px solid #1a1a17", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span>Continue →</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.8 }}>next 10 words</span>
          </button>

          <button onClick={handleExit} style={{ marginTop: 10, width: "100%", padding: "16px 18px", background: "#1a1a17", color: "#fff", border: "2px solid #1a1a17", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", textTransform: "uppercase", cursor: "pointer" }}>
            Back to Today
          </button>
          <button onClick={() => router.push("/lexicon")} style={{ marginTop: 8, width: "100%", padding: "14px 18px", background: "transparent", color: "#1a1a17", border: "2px solid #1a1a17", fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em", textTransform: "uppercase", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace" }}>
            View Lexicon →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 390, minHeight: 700, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ minHeight: 700, display: "flex", flexDirection: "column" }}
          >
            {current.mode === "cloze" ? (
              <ClozeExercise
                spanish={current.sentence.spanish}
                english={current.sentence.english}
                cloze={current.sentence.cloze}
                word={current.spanish}
                wordMeaning={current.english}
                wordPos={current.pos}
                box={current.box}
                isNew={current.isNew}
                hints={current.hints}
                progress={idx + 1}
                total={exercises.length}
                onAnswer={handleAnswer}
                onExit={handleExit}
              />
            ) : (
              <ScramblerExercise
                english={current.sentence.english}
                sentence={current.sentence.spanish}
                word={current.spanish}
                box={current.box}
                isNew={current.isNew}
                progress={idx + 1}
                total={exercises.length}
                onAnswer={handleAnswer}
                onExit={handleExit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
