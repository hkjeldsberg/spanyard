"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });

    if (res.ok) {
      router.push("/today");
      router.refresh();
    } else {
      setError(true);
      setPw("");
    }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f0e8d8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", color: "#1a1a17" }}>
      <div style={{ width: "100%", maxWidth: 360, padding: "0 24px" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#65615a" }}>
          SPANYARD / ACCESS
        </div>
        <h1 style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.85, letterSpacing: "-0.05em", textTransform: "uppercase", margin: "14px 0 32px" }}>
          Enter.<span style={{ color: "#d24f2e" }}>.</span>
        </h1>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="password"
            autoFocus
            style={{
              width: "100%",
              padding: "16px 14px",
              border: `2px solid ${error ? "#d24f2e" : "#1a1a17"}`,
              background: "#fbf5e6",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 18,
              color: "#1a1a17",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {error && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#d24f2e", letterSpacing: "0.08em" }}>
              WRONG PASSWORD
            </div>
          )}
          <button
            type="submit"
            disabled={loading || pw.length === 0}
            style={{
              padding: "18px",
              background: loading || pw.length === 0 ? "#65615a" : "#1a1a17",
              color: "#fff",
              border: "2px solid #1a1a17",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              cursor: loading || pw.length === 0 ? "default" : "pointer",
              transition: "background 0.15s",
            }}
          >
            {loading ? "..." : "Enter →"}
          </button>
        </form>
      </div>
    </main>
  );
}
