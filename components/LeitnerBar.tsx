"use client";

interface Props {
  box: number; // 0-5
  className?: string;
}

const BOX_COLORS = ["", "#f5d4c2", "#ee9c7c", "#e57350", "#d24f2e", "#2a6a3e"];

export function LeitnerBar({ box, className = "" }: Props) {
  return (
    <div className={`flex gap-1.5 w-full ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            height: 16 + i * 6,
            background: i <= box ? BOX_COLORS[i] : "#fbf5e6",
            border: "2px solid #1a1a17",
            flex: 1,
          }}
        />
      ))}
    </div>
  );
}
