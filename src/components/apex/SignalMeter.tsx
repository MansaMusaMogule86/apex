"use client";

import { useEffect, useState } from "react";

interface SignalMeterProps {
  /** 0-100 amplitude target. Bars are randomized but capped under this. */
  level: number;
  label?: string;
}

const BAR_COUNT = 12;

export function SignalMeter({ level, label = "Signal" }: SignalMeterProps) {
  const [heights, setHeights] = useState<number[]>(() => Array(BAR_COUNT).fill(0));

  useEffect(() => {
    const targets = Array.from({ length: BAR_COUNT }, () => {
      const min = Math.max(level - 18, 4);
      const max = Math.min(level + 4, 100);
      return Math.floor(min + Math.random() * Math.max(max - min, 1));
    });
    const timers = targets.map((t, i) =>
      setTimeout(() => {
        setHeights((prev) => {
          const next = [...prev];
          next[i] = t;
          return next;
        });
      }, i * 40),
    );
    return () => timers.forEach(clearTimeout);
  }, [level]);

  return (
    <div className="apex-meter" role="img" aria-label={`${label}: ${level}`}>
      <div className="apex-meter__bars">
        {heights.map((h, i) => (
          <span
            key={i}
            className="apex-meter__bar"
            style={{ height: `${Math.max(h, 4)}%` }}
          />
        ))}
      </div>
      <div className="apex-meter__legend">
        <span>{label}</span>
        <span>{Math.round(level)}</span>
      </div>
    </div>
  );
}
