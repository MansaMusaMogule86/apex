"use client";

import { useCallback } from "react";
import { PhantomScanBlock } from "../PhantomScanBlock";
import type { ApplicationDraft, Updater } from "../types";

interface Step3Props {
  draft: ApplicationDraft;
  update: Updater;
}

export function Step3Authority({ draft, update }: Step3Props) {
  const handleScore = useCallback(
    (score: number | null) => update("osint_score", score),
    [update],
  );

  return (
    <section className="apex-step">
      <header className="apex-step__head">
        <span className="apex-eyebrow">Step 03 — Authority</span>
        <h2 className="apex-step__title">
          Verify your <em>standing</em>.
        </h2>
        <p className="apex-step__lede">
          Two passive signals — public profile and referral — followed by the
          Phantom scan. No outreach. No noise on your network.
        </p>
      </header>

      <div className="apex-grid apex-grid--two">
        <label className="apex-field">
          <span className="apex-field__label">LinkedIn profile</span>
          <input
            type="url"
            className="apex-input"
            value={draft.linkedin_url}
            onChange={(e) => update("linkedin_url", e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        </label>
        <label className="apex-field">
          <span className="apex-field__label">Company website</span>
          <input
            type="url"
            className="apex-input"
            value={draft.website_url}
            onChange={(e) => update("website_url", e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label className="apex-field">
          <span className="apex-field__label">Referral source</span>
          <input
            type="text"
            className="apex-input"
            value={draft.referral_source}
            onChange={(e) => update("referral_source", e.target.value)}
            placeholder="Name of the partner or operator who referred you"
          />
        </label>
        <label className="apex-field">
          <span className="apex-field__label">
            Referral code
            <span className="apex-field__hint"> — optional</span>
          </span>
          <input
            type="text"
            className="apex-input"
            value={draft.referral_code}
            onChange={(e) => update("referral_code", e.target.value.toUpperCase())}
            placeholder="APEX-XXXX"
          />
        </label>
      </div>

      <div className="apex-dropzone" aria-disabled="true">
        <span className="apex-mono-tag">{"// upload — optional"}</span>
        <p>
          Drag a one-page memorandum, deck or holding-company structure.
          <span className="apex-dropzone__hint">
            {" "}
            Visual only — encrypted upload opens after submission.
          </span>
        </p>
      </div>

      <PhantomScanBlock
        authorized={draft.phantom_scan_authorized}
        onToggle={(v) => update("phantom_scan_authorized", v)}
        onScore={handleScore}
      />
    </section>
  );
}
