"use client";

import { FeaturePill } from "../FeaturePill";

interface Step4Props {
  refCode: string;
}

export function Step4Confirmed({ refCode }: Step4Props) {
  return (
    <section className="apex-step apex-step--confirmed">
      <div className="apex-seal">
        <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
          <polygon
            points="60,6 110,33 110,87 60,114 10,87 10,33"
            fill="none"
            stroke="#c8a96e"
            strokeWidth="1.2"
          />
          <polygon
            points="60,18 99,39 99,81 60,102 21,81 21,39"
            fill="none"
            stroke="rgba(200,169,110,0.35)"
            strokeWidth="0.8"
          />
          <text
            x="60"
            y="68"
            textAnchor="middle"
            fill="#c8a96e"
            fontFamily="var(--font-cormorant)"
            fontSize="28"
            letterSpacing="6"
          >
            APEX
          </text>
        </svg>
      </div>

      <span className="apex-eyebrow">File received</span>
      <h2 className="apex-step__title apex-step__title--center">
        Your request is <em>under review</em>.
      </h2>
      <p className="apex-step__lede apex-step__lede--center">
        A senior partner will respond personally within 24 hours from a
        verified APEX channel. No newsletters. No marketing. No third parties.
      </p>

      <div className="apex-ref">
        <span className="apex-ref__label">Reference</span>
        <span className="apex-ref__code">{refCode}</span>
      </div>

      <div className="apex-pills">
        <FeaturePill label="Private brief in 24h" />
        <FeaturePill label="Encrypted channel" />
        <FeaturePill label="No marketing" />
      </div>

      <p className="apex-mono-tag apex-mono-tag--center">
        {"// a copy of this reference has been sent to your inbox"}
      </p>
    </section>
  );
}
