"use client";

import type { ApplicationDraft, Updater } from "../types";

interface Step1Props {
  draft: ApplicationDraft;
  update: Updater;
}

const AUM_RANGES = [
  "< $10M",
  "$10M – $50M",
  "$50M – $250M",
  "$250M – $1B",
  "$1B+",
];

const MARKETS = [
  "GCC / Dubai",
  "Europe",
  "North America",
  "South & East Asia",
  "Africa",
  "LATAM",
];

export function Step1Profile({ draft, update }: Step1Props) {
  return (
    <section className="apex-step">
      <header className="apex-step__head">
        <span className="apex-eyebrow">Step 01 — Profile</span>
        <h2 className="apex-step__title">
          Tell us <em>who</em> is at the table.
        </h2>
        <p className="apex-step__lede">
          We require a clean identity signal before any further review. Names
          and addresses below are encrypted in transit and at rest.
        </p>
      </header>

      <div className="apex-grid apex-grid--two">
        <Field label="Full name" required>
          <input
            type="text"
            className="apex-input"
            value={draft.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            autoComplete="name"
            placeholder="Faisal Al-Mansouri"
          />
        </Field>
        <Field label="Title">
          <input
            type="text"
            className="apex-input"
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Managing Partner"
          />
        </Field>
        <Field label="Company" required>
          <input
            type="text"
            className="apex-input"
            value={draft.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Mansouri Capital"
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            className="apex-input"
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
            placeholder="faisal@mansouricapital.ae"
          />
        </Field>
        <Field label="Primary market">
          <select
            className="apex-input"
            value={draft.market}
            onChange={(e) => update("market", e.target.value)}
          >
            <option value="">Select market —</option>
            {MARKETS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>
        <Field label="AUM / revenue range">
          <select
            className="apex-input"
            value={draft.aum_range}
            onChange={(e) => update("aum_range", e.target.value)}
          >
            <option value="">Select range —</option>
            {AUM_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="apex-banner">
        <span className="apex-mono-tag">{"// ai enrichment"}</span>
        <p>
          Once submitted, your file is silently enriched with public registry,
          press and graph data. We do not contact your network.
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="apex-field">
      <span className="apex-field__label">
        {label}
        {required && <span className="apex-field__req"> *</span>}
      </span>
      {children}
    </label>
  );
}
