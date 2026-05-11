"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CalendarDays, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import LuxuryFormInput from "@/components/shared/LuxuryFormInput";
import {
  RequestAccessInputSchema,
  RevenueRangeSchema,
  type RequestAccessFormInput,
  type RequestAccessInput,
} from "@/lib/access-request/schema";

const SILK = [0.16, 1, 0.3, 1] as const;

type SubmissionState = {
  id?: string;
  message: string;
  warning?: string;
};

const REVENUE_OPTIONS = RevenueRangeSchema.options;

const INTELLIGENCE_NOTES = [
  "Authority and prestige scoring across operator signals.",
  "Luxury fit screening against APEX portfolio criteria.",
  "Executive recommendation routing within 24-48 hours.",
];

export default function RequestAccessForm() {
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RequestAccessFormInput, unknown, RequestAccessInput>({
    resolver: zodResolver(RequestAccessInputSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      industry: "",
      website: "",
      linkedin: "",
      revenueRange: undefined,
      marketFocus: "",
      strategicObjective: "",
      whyApex: "",
    },
  });

  const revenueRange = watch("revenueRange");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      const response = await fetch("/api/access-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as
        | { request?: { id?: string }; requestId?: string; message?: string; error?: string; warning?: string }
        | null;

      if (!response.ok || !payload) {
        setServerError(payload?.error ?? "Unable to submit your application right now.");
        return;
      }

      setSubmission({
        id: payload.request?.id ?? payload.requestId,
        message:
          payload.message ??
          "Application received. Your profile is now being processed through the APEX intelligence layer. Executive review window: 24-48 hours.",
        warning: payload.warning,
      });
      reset();
    } catch {
      setServerError("Unable to submit your application right now.");
    }
  });

  return (
    <AnimatePresence mode="wait">
      {submission ? (
        <motion.section
          key="success"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: SILK }}
          className="relative overflow-hidden rounded-xs border border-white/12 bg-linear-to-br from-carbon/90 via-graphite/85 to-obsidian p-6 shadow-[0_36px_90px_rgba(0,0,0,0.48)] md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(110,140,255,0.24),transparent_42%),radial-gradient(circle_at_80%_74%,rgba(201,178,124,0.2),transparent_48%),linear-gradient(rgba(232,228,218,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(232,228,218,0.06)_1px,transparent_1px)] bg-size-[auto,auto,44px_44px,44px_44px] opacity-40" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-xs border border-signal-blue/35 bg-signal-blue/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-signal-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
                APEX Intelligence Layer Active
              </span>
              <h2 className="mt-5 font-display text-4xl leading-[0.95] text-warm-white md:text-5xl">
                Application received.
              </h2>
              <p className="mt-5 max-w-[56ch] text-base leading-8 text-platinum/88 md:text-lg">
                Your profile is now being processed through the APEX intelligence layer.
              </p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-gold-light">
                Executive review window: 24-48 hours.
              </p>
              {submission.id ? (
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium">
                  Dossier ref · {submission.id.slice(0, 8).toUpperCase()}
                </p>
              ) : null}
              {submission.warning ? (
                <div className="mt-5 rounded-xs border border-risk-amber/30 bg-risk-amber/10 px-4 py-3 text-sm text-platinum/85">
                  Intelligence note: {submission.warning}
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:hello@apex.studio?subject=APEX%20Executive%20Call"
                  className="inline-flex h-12 items-center gap-2 rounded-xs border border-gold/35 bg-gold/8 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-gold"
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule Executive Call
                </a>
                <button
                  type="button"
                  onClick={() => setSubmission(null)}
                  className="inline-flex h-12 items-center rounded-xs border border-white/15 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-platinum/90"
                >
                  Submit Another Profile
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-xs border border-white/10 bg-white/2 p-4">
                <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-titanium">
                  <Sparkles className="h-3.5 w-3.5 text-signal-blue" />
                  Signal Processing
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className="h-20 rounded-xs bg-white/4"
                      animate={{ opacity: [0.25, 0.9, 0.25], scaleY: [0.75, 1, 0.8] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: index * 0.18, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xs border border-white/10 bg-white/2 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-titanium">Qualification Pipeline</p>
                <div className="mt-4 space-y-3">
                  {INTELLIGENCE_NOTES.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.08, duration: 0.45 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-signal-blue" />
                      <p className="text-sm leading-6 text-platinum/88">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="form"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.6, ease: SILK }}
          className="relative overflow-hidden rounded-xs border border-white/12 bg-linear-to-br from-carbon/92 via-graphite/82 to-obsidian p-6 shadow-[0_36px_90px_rgba(0,0,0,0.48)] md:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(110,140,255,0.24),transparent_42%),radial-gradient(circle_at_80%_74%,rgba(201,178,124,0.18),transparent_48%),linear-gradient(rgba(232,228,218,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(232,228,218,0.06)_1px,transparent_1px)] bg-size-[auto,auto,44px_44px,44px_44px] opacity-35" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-xs border border-signal-blue/35 bg-signal-blue/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-signal-blue">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
                Request Access Intelligence System
              </span>
              <h2 className="mt-5 font-display text-4xl leading-[0.95] text-warm-white md:text-5xl">
                Private operator qualification.
              </h2>
              <p className="mt-5 max-w-[58ch] text-base leading-8 text-platinum/82 md:text-lg">
                This is not a contact form. It is an executive screening workflow for operators seeking private AI intelligence infrastructure.
              </p>

              <form onSubmit={onSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
                <LuxuryFormInput
                  label="Full Name"
                  placeholder="Full Name"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />
                <LuxuryFormInput
                  label="Email"
                  placeholder="Email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <LuxuryFormInput
                  label="Company / Portfolio"
                  placeholder="Company / Portfolio"
                  error={errors.company?.message}
                  {...register("company")}
                />
                <LuxuryFormInput
                  label="Industry"
                  placeholder="Luxury real estate, hospitality, wealth, private equity"
                  error={errors.industry?.message}
                  {...register("industry")}
                />
                <LuxuryFormInput
                  label="Website"
                  placeholder="https://yourcompany.com"
                  error={errors.website?.message}
                  {...register("website")}
                />
                <LuxuryFormInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/yourprofile"
                  error={errors.linkedin?.message}
                  {...register("linkedin")}
                />

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-titanium">Revenue Range</p>
                    {errors.revenueRange ? (
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400">{errors.revenueRange.message}</p>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {REVENUE_OPTIONS.map((option) => {
                      const active = revenueRange === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setValue("revenueRange", option, { shouldDirty: true, shouldValidate: true })}
                          className={[
                            "rounded-xs border px-3 py-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-300",
                            active
                              ? "border-gold/50 bg-gold/8 text-gold-light"
                              : "border-white/12 bg-white/2 text-titanium hover:border-signal-blue/35 hover:text-platinum",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <LuxuryFormInput
                  label="Market Focus"
                  placeholder="Dubai prime, GCC growth corridors, UHNW family office networks"
                  className="md:col-span-2"
                  error={errors.marketFocus?.message}
                  {...register("marketFocus")}
                />
                <LuxuryFormInput
                  multiline
                  rows={3}
                  label="Strategic Objective"
                  placeholder="Define the operating outcome you want APEX to influence."
                  className="md:col-span-2"
                  error={errors.strategicObjective?.message}
                  {...register("strategicObjective")}
                />
                <LuxuryFormInput
                  multiline
                  rows={5}
                  label="Why APEX"
                  placeholder="Why does your profile require a private intelligence operating system rather than a conventional agency stack?"
                  className="md:col-span-2"
                  error={errors.whyApex?.message}
                  {...register("whyApex")}
                />

                {serverError ? (
                  <div className="md:col-span-2 rounded-xs border border-critical-crimson/35 bg-critical-crimson/10 px-4 py-3 text-sm text-platinum/90">
                    {serverError}
                  </div>
                ) : null}

                <div className="md:col-span-2 flex flex-col gap-3 pt-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xs border border-gold/55 bg-linear-to-b from-[#e4c66a] to-[#c9b27c] px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-void shadow-[0_12px_30px_rgba(201,178,124,0.22)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {isSubmitting ? "Processing Intelligence" : "Request Access"}
                  </button>
                  <a
                    href="mailto:hello@apex.studio?subject=APEX%20Executive%20Call"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xs border border-white/15 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-platinum/90 transition-colors duration-300 hover:border-signal-blue/35 hover:text-platinum"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Schedule Executive Call
                  </a>
                </div>
              </form>
            </div>

            <div className="grid gap-4">
              <div className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-titanium">Qualification Signals</p>
                <div className="mt-4 space-y-3">
                  {INTELLIGENCE_NOTES.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.08, duration: 0.45 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-signal-blue" />
                      <p className="text-sm leading-6 text-platinum/86">{item}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-titanium">Intelligence Layer</p>
                <div className="mt-4 space-y-4">
                  {["Prestige score", "Authority score", "Luxury fit", "Executive recommendation"].map((item, index) => (
                    <div key={item}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-titanium">
                        <span>{item}</span>
                        <span className="font-mono text-signal-blue">Live</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/8">
                        <motion.div
                          className="h-1.5 rounded-full bg-linear-to-r from-signal-blue via-[#9fb1ff] to-gold-light"
                          initial={{ width: 0 }}
                          animate={{ width: `${72 + index * 6}%` }}
                          transition={{ duration: 1.2, delay: 0.2 + index * 0.1, ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-titanium">Routing Outcome</p>
                <p className="mt-3 text-sm leading-7 text-platinum/86">
                  Accepted profiles route directly into the APEX executive command layer for priority review, notes, and operator onboarding strategy.
                </p>
                <a
                  href="/dashboard/leads"
                  className="mt-4 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold"
                >
                  Executive intelligence queue
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}