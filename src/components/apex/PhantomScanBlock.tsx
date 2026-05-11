"use client";

import { useEffect, useState } from "react";
import { OSINTRing } from "./OSINTRing";

interface PhantomScanBlockProps {
  authorized: boolean;
  onToggle: (value: boolean) => void;
  onScore: (score: number | null) => void;
}

type Phase = "idle" | "scanning" | "complete";

export function PhantomScanBlock({
  authorized,
  onToggle,
  onScore,
}: PhantomScanBlockProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    if (!authorized) {
      setPhase("idle");
      setScore(null);
      onScore(null);
      return;
    }
    setPhase("scanning");
    // TODO: replace with real OSINT API
    const t = setTimeout(() => {
      const computed = 72 + Math.floor(Math.random() * 18);
      setScore(computed);
      setPhase("complete");
      onScore(computed);
    }, 2200);
    return () => clearTimeout(t);
  }, [authorized, onScore]);

  return (
    <div className="apex-phantom">
      <div className="apex-phantom__head">
        <div>
          <div className="apex-eyebrow">Phantom Intelligence Scan</div>
          <h4 className="apex-phantom__title">Independent verification</h4>
          <p className="apex-phantom__copy">
            We discreetly cross-reference public registries, press, network signals
            and regulatory filings. No outreach. No footprint on your subjects.
          </p>
        </div>
        <label className="apex-toggle">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="apex-toggle__track">
            <span className="apex-toggle__thumb" />
          </span>
          <span className="apex-toggle__label">
            {authorized ? "Authorized" : "Authorize scan"}
          </span>
        </label>
      </div>

      <div className="apex-phantom__body" data-phase={phase}>
        {phase === "idle" && (
          <div className="apex-phantom__idle">
            <span className="apex-mono-tag">{"// scan dormant"}</span>
            <p>Toggle authorization to initiate a passive intelligence sweep.</p>
          </div>
        )}
        {phase === "scanning" && (
          <div className="apex-phantom__scanning">
            <div className="apex-phantom__scanline" />
            <span className="apex-mono-tag">{"// sweeping public sources…"}</span>
          </div>
        )}
        {phase === "complete" && score !== null && (
          <div className="apex-phantom__complete">
            <OSINTRing score={score} active />
            <div className="apex-phantom__verdict">
              <span className="apex-mono-tag">{"// composite signal"}</span>
              <p>
                Provisional verification cleared. The decision file is now warm —
                a senior reviewer will reach out within 24 hours.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
