"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface WordCell {
  id: number;
  rank: number;
  spanish: string;
  english: string;
  box: number;
}

interface Props {
  cells: WordCell[];
}

const BOX_COLORS: Record<number, string> = {
  0: "#f0e8d8",
  1: "#f5d4c2",
  2: "#ee9c7c",
  3: "#e57350",
  4: "#d24f2e",
  5: "#2a6a3e",
};

const LEGEND = [
  ["○", "#f0e8d8"],
  ["1", "#f5d4c2"],
  ["2", "#ee9c7c"],
  ["3", "#e57350"],
  ["4", "#d24f2e"],
  ["5 *", "#2a6a3e"],
] as const;

export function LexiconGrid({ cells }: Props) {
  const [inspected, setInspected] = useState<WordCell | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const started = cells.filter((c) => c.box > 0).length;
  const mastered = cells.filter((c) => c.box === 5).length;
  const percent = ((started / 1000) * 100).toFixed(1);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return cells.filter(
      (c) => c.spanish.toLowerCase().includes(q) || c.english.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query, cells]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f0e8d8", fontFamily: "'Space Grotesk', sans-serif", color: "#1a1a17" }}>
      {/* Header */}
      <div style={{ padding: "14px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em" }}>SPANYARD / LEXICON</div>
        <button
          onClick={() => { setSearching((s) => !s); setQuery(""); }}
          style={{ width: 30, height: 30, border: "2px solid #1a1a17", background: searching ? "#1a1a17" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke={searching ? "#fff" : "#1a1a17"} strokeWidth="1.6" />
            <path d="M11 11l3 3" stroke={searching ? "#fff" : "#1a1a17"} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "12px 22px 0" }}>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="search spanish or english…"
                autoCapitalize="none"
                autoCorrect="off"
                style={{ width: "100%", padding: "10px 12px", border: "2px solid #1a1a17", background: "#fbf5e6", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#1a1a17", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            {searchResults.length > 0 && (
              <div style={{ margin: "8px 22px 0", border: "2px solid #1a1a17", background: "#fbf5e6", maxHeight: 220, overflowY: "auto" }}>
                {searchResults.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => { setInspected(c); setSearching(false); setQuery(""); }}
                    style={{ padding: "10px 14px", borderBottom: "1px solid #e5dece", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{c.spanish}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a", marginLeft: 10 }}>{c.english}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#65615a" }}>#{c.rank}</span>
                  </div>
                ))}
              </div>
            )}
            {query.trim() && searchResults.length === 0 && (
              <div style={{ padding: "10px 22px 0", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a" }}>
                No matches for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Big number */}
      <div style={{ padding: "18px 22px 0" }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.06em" }}>{started}</div>
        <div style={{ marginTop: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#65615a" }}>
          OF 1000 — {percent}% · {mastered} MASTERED
        </div>
      </div>

      {/* Legend */}
      <div style={{ padding: "14px 22px 0", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {LEGEND.map(([label, color]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 14, height: 14, background: color, border: "1.5px solid #1a1a17", display: "inline-block" }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* 1000-cell grid */}
      <div style={{ padding: "12px 22px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(25, 1fr)", gap: 1.5, padding: 4, background: "#1a1a17", border: "2px solid #1a1a17" }}>
          {cells.map((cell) => (
            <div
              key={cell.id}
              onClick={() => setInspected(cell)}
              style={{ paddingBottom: "100%", background: BOX_COLORS[cell.box] ?? "#f0e8d8", position: "relative", cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "10px 22px 14px", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#65615a", display: "flex", justifyContent: "space-between" }}>
        <span>Each cell = 1 word</span>
        <span>tap to inspect</span>
      </div>

      {/* Inspect overlay */}
      <AnimatePresence>
        {inspected && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{ position: "absolute", inset: 0, top: "auto", background: "#fbf5e6", border: "2px solid #1a1a17", borderBottom: "none", padding: "20px 22px 30px", zIndex: 10 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#65615a", letterSpacing: "0.1em" }}>RANK {inspected.rank}</div>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.04em", marginTop: 4 }}>{inspected.spanish}</div>
                <div style={{ fontSize: 16, color: "#65615a", marginTop: 4 }}>{inspected.english}</div>
              </div>
              <button onClick={() => setInspected(null)} style={{ width: 32, height: 32, border: "2px solid #1a1a17", background: "transparent", fontSize: 18, cursor: "pointer" }}>
                ×
              </button>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 6, alignItems: "flex-end" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ flex: 1, height: 16 + i * 6, background: i <= inspected.box ? BOX_COLORS[i] : "#f0e8d8", border: "2px solid #1a1a17" }} />
              ))}
            </div>
            <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#65615a" }}>
              {inspected.box === 0 ? "Not started" : inspected.box === 5 ? "Mastered" : `Box ${inspected.box} / 5`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
