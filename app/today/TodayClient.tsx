"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  reviewCount: number;
  newCount: number;
  score: number;
  started: number;
  dateStr: string;
}

export function TodayClient({ reviewCount, newCount, score, started, dateStr }: Props) {
  const totalWords = reviewCount + newCount;
  const estMin = Math.round(totalWords * 0.4);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  function go(href: string, key: string) {
    setLoading(key);
    router.push(href);
  }

  const btn = (label: string, sub: string | null, href: string, key: string, big = false, ignoreStyle = false) => (
    <button
      onClick={() => go(href, key)}
      disabled={loading !== null}
      style={ignoreStyle ? undefined : {
        width: "100%",
        padding: big ? "22px 18px" : "14px",
        border: "2px solid #1a1a17",
        background: loading === key ? "#d24f2e" : big ? "#1a1a17" : "#fbf5e6",
        color: loading === key ? "#fff" : big ? "#fff" : "#1a1a17",
        display: big ? "flex" : "block",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: big ? "'Space Grotesk', sans-serif" : "'JetBrains Mono', monospace",
        fontSize: big ? 22 : 11,
        fontWeight: 600,
        letterSpacing: big ? "-0.02em" : "0.08em",
        textTransform: "uppercase",
        cursor: loading !== null ? "default" : "pointer",
        transition: "background 0.12s, transform 0.08s",
        transform: loading === key ? "translate(2px,2px)" : undefined,
      }}
    >
      {big ? (
        <>
          <span>{loading === key ? "Loading…" : label}</span>
          {sub && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, opacity: 0.7 }}>{sub}</span>}
        </>
      ) : (
        loading === key ? "…" : label
      )}
    </button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 390, minHeight: 700, background: "#f0e8d8", display: "flex", flexDirection: "column", color: "#1a1a17" }}>

        {/* Top bar */}
        <div style={{ padding: "14px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.05em" }}>
            SPANYARD / {dateStr}
          </div>
        </div>

        {/* Headline — replace "Today." with something useful */}
        <div style={{ paddingTop: 28 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#65615a" }}>
            {started} words learned
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.9, letterSpacing: "-0.05em", textTransform: "uppercase", marginTop: 8 }}>
            {totalWords > 0 ? (
              <>
                {reviewCount > 0 && newCount > 0 ? `${reviewCount} due,\n${newCount} new.` : null}
                {reviewCount > 0 && newCount === 0 ? `${reviewCount} to review.` : null}
                {reviewCount === 0 && newCount > 0 ? `${newCount} new\nwords.` : null}
              </>
            ) : (
              "All clear."
            )}
          </div>
        </div>

        {/* Review / New tiles */}
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "3fr 2fr", gap: 0 }}>
          <div style={{ background: "#d24f2e", color: "#fff", padding: 14, border: "2px solid #1a1a17", borderRight: "none" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.85 }}>
              review
            </div>
            <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.06em", marginTop: 6 }}>
              {String(reviewCount).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, opacity: 0.7, marginTop: 4 }}>
              overdue today
            </div>
          </div>
          <div style={{ background: "#e8c14b", color: "#1a1a17", padding: 14, border: "2px solid #1a1a17" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              new
            </div>
            <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.06em", marginTop: 6 }}>
              {String(newCount).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, opacity: 0.7, marginTop: 4 }}>
              never seen
            </div>
          </div>
        </div>

        {/* Mode buttons */}
        {totalWords > 0 ? (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {btn("Begin →", `~${estMin} min · mixed`, "/session", "mixed", true)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {btn("Cloze only", null, "/session?mode=cloze", "cloze")}
              {btn("Scramble only", null, "/session?mode=scrambler", "scrambler")}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 14, padding: "22px 18px", border: "2px solid #1a1a17", background: "#fbf5e6", color: "#65615a", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, textAlign: "center" }}>
            Nothing due — come back tomorrow.
          </div>
        )}

        {/* Fluency */}
        <div style={{ paddingTop: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#65615a" }}>FLUENCY</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 6 }}>
            <div style={{ fontSize: 112, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.06em" }}>{score}</div>
            <div style={{ paddingBottom: 14, fontSize: 32, fontWeight: 600, color: "#d24f2e", lineHeight: 1 }}>%</div>
            <div style={{ paddingBottom: 18, marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#65615a", textAlign: "right", lineHeight: 1.5 }}>
              {started} / 1000<br />words started
            </div>
          </div>
          <div style={{ marginTop: 6, height: 14, background: "#fbf5e6", border: "2px solid #1a1a17", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${score}%`, background: "#d24f2e", borderRight: score > 0 ? "2px solid #1a1a17" : "none", transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "2px solid #1a1a17", display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
          <span>{started} / 1000 words</span>
          <button onClick={() => go("/lexicon", "lexicon-footer")} style={{ color: "#1a1a17", background: "transparent", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, cursor: "pointer" }}>
            LEXICON →
          </button>
        </div>
      </div>
    </main>
  );
}
