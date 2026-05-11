"use client";

import { useCallback, useMemo, useState } from "react";
import { ApexHeader } from "@/components/apex/ApexHeader";
import { ProgressLine } from "@/components/apex/ProgressLine";
import { StepTabs } from "@/components/apex/StepTabs";
import { Step1Profile } from "@/components/apex/steps/Step1Profile";
import { Step2Intent } from "@/components/apex/steps/Step2Intent";
import { Step3Authority } from "@/components/apex/steps/Step3Authority";
import { Step4Confirmed } from "@/components/apex/steps/Step4Confirmed";
import {
  EMPTY_DRAFT,
  type ApplicationDraft,
  type Updater,
} from "@/components/apex/types";

type Step = 1 | 2 | 3 | 4;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RequestAccessPage() {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<ApplicationDraft>(EMPTY_DRAFT);
  const [refCode, setRefCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update: Updater = useCallback((key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const canProceed = useMemo(() => {
    if (step === 1) {
      return (
        draft.full_name.trim().length > 1 &&
        draft.company.trim().length > 1 &&
        EMAIL_RE.test(draft.email.trim())
      );
    }
    if (step === 2) {
      return draft.intent_type !== "";
    }
    return true;
  }, [step, draft]);

  const handleNext = () => {
    setError(null);
    if (!canProceed) return;
    if (step < 3) setStep((s) => ((s + 1) as Step));
  };

  const handleBack = () => {
    setError(null);
    if (step > 1 && step < 4) setStep((s) => ((s - 1) as Step));
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        full_name: draft.full_name.trim(),
        title: draft.title.trim(),
        company: draft.company.trim(),
        market: draft.market,
        aum_range: draft.aum_range,
        email: draft.email.trim().toLowerCase(),
        intent_type: draft.intent_type,
        problem_statement: draft.problem_statement.trim(),
        linkedin_url: draft.linkedin_url.trim(),
        website_url: draft.website_url.trim(),
        referral_source: draft.referral_source.trim(),
        referral_code: draft.referral_code.trim(),
        phantom_scan_authorized: draft.phantom_scan_authorized,
        osint_score: draft.osint_score,
        signal_score: draft.intent_type ? 68 : null,
      };
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        success?: boolean;
        ref_code?: string;
        error?: string;
      };
      if (!res.ok || !json.success || !json.ref_code) {
        throw new Error(json.error ?? "Unable to submit. Please retry.");
      }
      setRefCode(json.ref_code);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apex-shell">
      <div className="apex-gold-grid" aria-hidden />
      <div className="apex-vignette" aria-hidden />

      <ApexHeader />

      <main className="apex-main">
        {step !== 4 && (
          <section className="apex-hero">
            <span className="apex-eyebrow">APEX — Private intelligence, Dubai</span>
            <h1 className="apex-hero__title">
              Request a private brief with the <em>house</em>.
            </h1>
            <p className="apex-hero__lede">
              APEX is a closed network of intelligence officers, capital
              architects and operators serving a deliberately small roster of
              principals. Files are reviewed by partners, not by software.
            </p>
          </section>
        )}

        <div className="apex-progress-wrap">
          <ProgressLine step={step} />
          <StepTabs step={step} />
        </div>

        <div className="apex-card">
          {step === 1 && <Step1Profile draft={draft} update={update} />}
          {step === 2 && <Step2Intent draft={draft} update={update} />}
          {step === 3 && <Step3Authority draft={draft} update={update} />}
          {step === 4 && <Step4Confirmed refCode={refCode} />}

          {step !== 4 && (
            <footer className="apex-actions">
              <div className="apex-actions__error" role="alert">
                {error}
              </div>
              <div className="apex-actions__buttons">
                <button
                  type="button"
                  className="apex-btn apex-btn--ghost"
                  onClick={handleBack}
                  disabled={step === 1 || submitting}
                >
                  ← Back
                </button>
                {step < 3 ? (
                  <button
                    type="button"
                    className="apex-btn apex-btn--gold"
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="apex-btn apex-btn--gold"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Submit private brief"}
                  </button>
                )}
              </div>
              <p className="apex-actions__legal">
                By continuing, you authorize APEX to review your public profile
                under our private NDA. We will not retain rejected files
                beyond 30 days.
              </p>
            </footer>
          )}
        </div>
      </main>

      <footer className="apex-footer">
        <span>APEX Intelligence Group · Dubai · {new Date().getFullYear()}</span>
        <span>By invitation, referral, or formal review only.</span>
      </footer>
    </div>
  );
}
