"use client";

import { useEffect, useState } from "react";

interface OSINTRingProps {
  /** Composite score 0-100 — drives the arc fill. */
  score: number;
  active: boolean;
}

const CIRC = 188.5; // 2 * π * 30

const DIMENSIONS = [
  { key: "Entity", value: 82 },
  { key: "Network", value: 68 },
  { key: "Regulatory", value: 91 },
  { key: "Press", value: 55 },
] as const;

export function OSINTRing({ score, active }: OSINTRingProps) {
  const [offset, setOffset] = useState(CIRC);

  useEffect(() => {
    if (!active) {
      setOffset(CIRC);
      return;
    }
    // next tick — triggers CSS transition
    const id = requestAnimationFrame(() => {
      setOffset(CIRC - (CIRC * Math.min(Math.max(score, 0), 100)) / 100);
    });
    return () => cancelAnimationFrame(id);
  }, [score, active]);

  return (
    <div className="apex-osint">
      <div className="apex-osint__ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="rgba(200,169,110,0.12)"
            strokeWidth="2"
          />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke="#c8a96e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <div className="apex-osint__score">
          <span className="apex-osint__score-value">{active ? score : "—"}</span>
          <span className="apex-osint__score-label">OSINT</span>
        </div>
      </div>
      <ul className="apex-osint__dims">
        {DIMENSIONS.map((d) => (
          <li key={d.key}>
            <span className="apex-osint__dim-label">{d.key}</span>
            <span className="apex-osint__dim-track">
              <span
                className="apex-osint__dim-fill"
                style={{ width: active ? `${d.value}%` : "0%" }}
              />
            </span>
            <span className="apex-osint__dim-value">{active ? d.value : "—"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
