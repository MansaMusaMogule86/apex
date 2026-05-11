"use client";

import { SignalMeter } from "../SignalMeter";
import type { ApplicationDraft, IntentType, Updater } from "../types";

interface Step2Props {
  draft: ApplicationDraft;
  update: Updater;
}

const INTENTS: Array<{
  key: IntentType;
  title: string;
  lede: string;
  detail: string;
}> = [
  {
    key: "intelligence_os",
    title: "Intelligence OS",
    lede: "A private operating system for decisioning.",
    detail:
      "Real-time market, competitor and counterparty signal — distilled to one daily brief.",
  },
  {
    key: "deal_flow",
    title: "Proprietary Deal Flow",
    lede: "Off-market access, vetted.",
    detail:
      "Curated origination — venture, real assets and structured opportunities aligned to your mandate.",
  },
  {
    key: "influence",
    title: "Influence Architecture",
    lede: "Reputation as infrastructure.",
    detail:
      "Strategic press, narrative engineering and silent positioning across decision-maker channels.",
  },
  {
    key: "advisory",
    title: "Private Advisory",
    lede: "A discreet brain trust on call.",
    detail:
      "Senior operators on retainer for high-stakes calls — capital, talent, governance, exits.",
  },
];

export function Step2Intent({ draft, update }: Step2Props) {
  const hasIntent = draft.intent_type !== "";
  const meterLevel = hasIntent ? 68 : 28;

  return (
    <section className="apex-step">
      <header className="apex-step__head">
        <span className="apex-eyebrow">Step 02 — Intent</span>
        <h2 className="apex-step__title">
          What do you need APEX <em>to do</em>?
        </h2>
        <p className="apex-step__lede">
          Choose the primary engagement. We will align the right partner and
          the right cell of the network around your file.
        </p>
      </header>

      <div className="apex-grid apex-grid--two apex-intent-grid">
        {INTENTS.map((i) => {
          const active = draft.intent_type === i.key;
          return (
            <button
              type="button"
              key={i.key}
              className={`apex-intent-card ${active ? "apex-intent-card--active" : ""}`}
              onClick={() => update("intent_type", i.key)}
            >
              <span className="apex-mono-tag">{`// ${i.key.replace("_", " ")}`}</span>
              <h3>{i.title}</h3>
              <p className="apex-intent-card__lede">{i.lede}</p>
              <p className="apex-intent-card__detail">{i.detail}</p>
              <span className="apex-intent-card__select">
                {active ? "Selected" : "Select →"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="apex-grid apex-grid--problem">
        <label className="apex-field">
          <span className="apex-field__label">
            Problem statement
            <span className="apex-field__hint"> — 1–3 sentences</span>
          </span>
          <textarea
            className="apex-textarea"
            value={draft.problem_statement}
            onChange={(e) => update("problem_statement", e.target.value)}
            rows={5}
            placeholder="We are evaluating a regional roll-up of three boutique asset managers under one brand. We need quiet diligence on the principals, regulatory exposure in two jurisdictions, and a positioning architecture for institutional capital."
          />
        </label>
        <div className="apex-meter-panel">
          <span className="apex-eyebrow">Live signal read</span>
          <SignalMeter level={meterLevel} label="Mandate clarity" />
          <p className="apex-meter-panel__copy">
            The signal sharpens as your intent becomes specific. APEX engages
            files that read above 60.
          </p>
        </div>
      </div>
    </section>
  );
}
