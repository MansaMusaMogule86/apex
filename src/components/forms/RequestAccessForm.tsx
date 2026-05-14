"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  TerminalSquare,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import LuxuryFormInput from "@/components/shared/LuxuryFormInput";
import {
  RequestAccessInputSchema,
  RevenueRangeSchema,
  type RequestAccessFormInput,
  type RequestAccessInput,
} from "@/lib/access-request/schema";
import { SILK_EASE as SILK } from "@/lib/motion";

// ─── Constants ──────────────────────────────────────────────────────────────
const REVENUE_OPTIONS = RevenueRangeSchema.options;

const QUALIFICATION_SIGNALS = [
  "Authority and prestige scoring across operator signals.",
  "Luxury fit screening against APEX portfolio criteria.",
  "Executive recommendation routing within 24–48 hours.",
];

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = "idle" | "scanning" | "complete";

interface ParsedScores {
  authority: number | null;
  prestige: number | null;
  market: number | null;
  luxury: number | null;
  priority: string | null;
  recommendation: string | null;
}

interface DBResult {
  id: string;
  priorityLevel: string;
  aiSummary: string;
  aiRecommendation: string;
  prestigeScore: number;
  authorityScore: number;
  marketPotentialScore: number;
  luxuryFitScore: number;
}

// ─── Score parsing ───────────────────────────────────────────────────────────

function parseScoresFromText(text: string): ParsedScores {
  const authority = text.match(/AUTHORITY SCORE:\s*(\d+)\/100/)?.[1];
  const prestige = text.match(/PRESTIGE SCORE:\s*(\d+)\/100/)?.[1];
  const market = text.match(/MARKET POTENTIAL SCORE:\s*(\d+)\/100/)?.[1];
  const luxury = text.match(/LUXURY FIT SCORE:\s*(\d+)\/100/)?.[1];
  const priority = text.match(/PRIORITY CLASSIFICATION:\s*(CRITICAL|HIGH|MEDIUM|WATCH)/)?.[1];
  const recommendation = text.match(/STRATEGIC RECOMMENDATION:\s*(.+?)(?:\n|$)/)?.[1];

  return {
    authority: authority ? parseInt(authority, 10) : null,
    prestige: prestige ? parseInt(prestige, 10) : null,
    market: market ? parseInt(market, 10) : null,
    luxury: luxury ? parseInt(luxury, 10) : null,
    priority: priority ?? null,
    recommendation: recommendation?.trim() ?? null,
  };
}

function priorityColor(level: string | null): string {
  if (level === "CRITICAL") return "text-red-400 border-red-400/30 bg-red-400/8";
  if (level === "HIGH") return "text-electric-gold border-electric-gold/30 bg-electric-gold/8";
  if (level === "MEDIUM") return "text-signal-blue border-signal-blue/30 bg-signal-blue/8";
  return "text-titanium border-titanium/25 bg-titanium/8";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: SILK }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-titanium">{label}</span>
        <span className="font-mono text-[11px] font-medium text-gold">{value}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/6">
        <motion.div
          className="h-1 rounded-full bg-gradient-to-r from-signal-blue via-gold to-electric-gold"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay: 0.1, ease: SILK }}
        />
      </div>
    </motion.div>
  );
}

function ScorePanel({ scores, dbResult }: { scores: ParsedScores; dbResult: DBResult | null }) {
  const authority = dbResult?.authorityScore ?? scores.authority;
  const prestige = dbResult?.prestigeScore ?? scores.prestige;
  const market = dbResult?.marketPotentialScore ?? scores.market;
  const luxury = dbResult?.luxuryFitScore ?? scores.luxury;
  const priority = dbResult?.priorityLevel?.toUpperCase() ?? scores.priority;

  const hasAnyScore = [authority, prestige, market, luxury].some((s) => s !== null);

  return (
    <div className="flex flex-col gap-3">
      {/* Score bars */}
      <div className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4">
        <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
          Intelligence Scores
        </p>
        {hasAnyScore ? (
          <div className="flex flex-col gap-4">
            <ScoreBar label="Authority" value={authority} />
            <ScoreBar label="Prestige" value={prestige} />
            <ScoreBar label="Market Potential" value={market} />
            <ScoreBar label="Luxury Fit" value={luxury} />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(["Authority", "Prestige", "Market Potential", "Luxury Fit"] as const).map((label, idx) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-titanium/50">{label}</span>
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: idx * 0.18 }}
                    className="font-mono text-[9px] text-titanium/40"
                  >
                    SCANNING
                  </motion.span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/4">
                  <motion.div
                    className="h-1 rounded-full bg-gold/20"
                    animate={{ width: ["15%", "65%", "30%", "80%", "40%"] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Priority badge */}
      <AnimatePresence>
        {priority && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: SILK }}
            className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4"
          >
            <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
              Priority Classification
            </p>
            <span
              className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] ${priorityColor(priority)}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {priority}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routing status */}
      <div className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
          Routing Status
        </p>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-signal-blue"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal-blue">
            Executive Review Queue
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Terminal component ──────────────────────────────────────────────────────

function IntelligenceTerminal({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  const formattedLines = text.split("\n").map((line, i) => {
    const isHeader = line.startsWith("[ PHASE") || line.startsWith("APEX INTELLIGENCE");
    const isDivider = /^━+$/.test(line.trim());
    const isScore = /^(AUTHORITY|PRESTIGE|MARKET POTENTIAL|LUXURY FIT) SCORE:/.test(line);
    const isPriority = line.startsWith("PRIORITY CLASSIFICATION:");
    const isRouting = line.startsWith("ROUTING:") || line.startsWith("SCAN STATUS:");
    const isLabel = /^(OPERATOR|SECTOR|REVENUE BAND|QUALIFICATION RUN|STRATEGIC RECOMMENDATION):/.test(line);

    let cls = "text-platinum/80";
    if (isHeader) cls = "text-gold font-medium";
    if (isDivider) cls = "text-white/15";
    if (isScore) cls = "text-electric-gold font-medium";
    if (isPriority) cls = "text-electric-gold font-medium";
    if (isRouting) cls = "text-signal-blue";
    if (isLabel) cls = "text-titanium";

    return (
      <div key={i} className={`leading-relaxed ${cls}`}>
        {line || "\u00A0"}
      </div>
    );
  });

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[6px] border border-gold/12 bg-[#060608]">
      {/* Terminal header */}
      <div className="flex items-center gap-2 border-b border-white/6 bg-white/[0.02] px-4 py-3">
        <TerminalSquare className="h-3.5 w-3.5 text-gold/60" />
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-titanium/70">
          APEX Intelligence System
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-signal-blue"
            />
          )}
          {!isStreaming && text && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400/70" />
          )}
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-titanium/50">
            {isStreaming ? "ACTIVE" : text ? "COMPLETE" : "READY"}
          </span>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={containerRef}
        className="h-[420px] overflow-y-auto scroll-smooth p-5 font-mono text-[12px] leading-[1.7]"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(200,169,110,0.15) transparent" }}
      >
        {text ? (
          <>
            {formattedLines}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block h-[13px] w-[7px] bg-gold/70 align-middle"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-titanium/50"
              >
                Initializing intelligence scan...
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Form phase ──────────────────────────────────────────────────────────────

interface FormPhaseProps {
  onSubmit: (e: React.FormEvent) => void;
  register: ReturnType<typeof useForm<RequestAccessFormInput, unknown, RequestAccessInput>>["register"];
  errors: ReturnType<typeof useForm<RequestAccessFormInput, unknown, RequestAccessInput>>["formState"]["errors"];
  isSubmitting: boolean;
  isValid: boolean;
  revenueRange: string | undefined;
  onRevenueSelect: (v: (typeof REVENUE_OPTIONS)[number]) => void;
  serverError: string | null;
}

function FormPhase({
  onSubmit,
  register,
  errors,
  isSubmitting,
  isValid,
  revenueRange,
  onRevenueSelect,
  serverError,
}: FormPhaseProps) {
  return (
    <motion.section
      key="form"
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.65, ease: SILK }}
      className="relative overflow-hidden rounded-[6px] border border-white/8 bg-gradient-to-br from-[#0d0d16]/95 via-[#0b0b14]/90 to-[#080810] shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(110,140,255,0.07)_0%,transparent_65%)] blur-[60px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(201,178,124,0.06)_0%,transparent_65%)] blur-[60px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,228,218,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,218,0.08) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:p-8">
        {/* Left — form */}
        <div>
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-sm border border-signal-blue/30 bg-signal-blue/8 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.28em] text-signal-blue">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
              Request Access Intelligence System
            </span>
            <h2 className="mt-5 font-display text-4xl leading-[0.93] text-warm-white md:text-5xl">
              Private operator qualification.
            </h2>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-8 text-titanium md:text-base">
              This is not a contact form. It is an executive screening workflow
              for operators seeking private AI intelligence infrastructure.
            </p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3.5 md:grid-cols-2">
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
              placeholder="Luxury real estate, hospitality, private equity"
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

            {/* Revenue range */}
            <div className="md:col-span-2">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-titanium">Revenue Range</p>
                {errors.revenueRange && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-red-400">
                    {errors.revenueRange.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {REVENUE_OPTIONS.map((option) => {
                  const active = revenueRange === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onRevenueSelect(option)}
                      className={[
                        "rounded-[3px] border px-3 py-3 text-left font-mono text-[9px] uppercase tracking-[0.18em] transition-all duration-250",
                        active
                          ? "border-gold/55 bg-gold/8 text-gold-light shadow-[inset_0_0_0_1px_rgba(201,178,124,0.15)]"
                          : "border-white/10 bg-white/[0.02] text-titanium hover:border-white/18 hover:text-platinum",
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
              placeholder="Dubai prime, GCC corridors, UHNW family office networks"
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

            {serverError && (
              <div className="md:col-span-2 rounded-[3px] border border-red-500/25 bg-red-500/8 px-4 py-3 font-mono text-[11px] text-red-400/90">
                {serverError}
              </div>
            )}

            <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] border border-gold/50 bg-gradient-to-b from-[#e0c268] to-[#c9b27c] px-6 font-mono text-[10px] uppercase tracking-[0.22em] text-void shadow-[0_8px_24px_rgba(201,178,124,0.18)] transition-all duration-300 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {isSubmitting ? "Initiating scan…" : "Request Access"}
              </button>
              <a
                href="mailto:hello@apex.studio?subject=APEX%20Executive%20Call"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[3px] border border-white/12 px-5 font-mono text-[10px] uppercase tracking-[0.22em] text-titanium transition-colors duration-250 hover:border-white/20 hover:text-platinum"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Schedule Call
              </a>
            </div>
          </form>
        </div>

        {/* Right — intelligence layer preview */}
        <div className="hidden flex-col gap-3 lg:flex">
          <div className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
              Qualification Signals
            </p>
            <div className="flex flex-col gap-3">
              {QUALIFICATION_SIGNALS.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-blue" />
                  <p className="text-[13px] leading-6 text-platinum/75">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4">
            <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
              Intelligence Layer
            </p>
            <div className="flex flex-col gap-4">
              {["Prestige score", "Authority score", "Luxury fit", "Executive recommendation"].map(
                (item, i) => (
                  <div key={item}>
                    <div className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em]">
                      <span className="text-titanium/80">{item}</span>
                      <span className="text-signal-blue/70">Live</span>
                    </div>
                    <div className="h-[3px] rounded-full bg-white/6">
                      <motion.div
                        className="h-[3px] rounded-full bg-gradient-to-r from-signal-blue via-[#9fb1ff] to-gold-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${70 + i * 7}%` }}
                        transition={{ duration: 1.3, delay: 0.25 + i * 0.12, ease: SILK }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="rounded-[4px] border border-white/8 bg-white/[0.025] p-4">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">
              Routing outcome
            </p>
            <p className="text-[13px] leading-6 text-platinum/70">
              Accepted profiles route directly into the APEX executive command layer for priority
              review and operator onboarding strategy.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Scan / complete phase ───────────────────────────────────────────────────

interface ScanPhaseProps {
  streamText: string;
  scores: ParsedScores;
  dbResult: DBResult | null;
  isStreaming: boolean;
  phase: "scanning" | "complete";
  onReset: () => void;
}

function ScanPhase({ streamText, scores, dbResult, isStreaming, phase, onReset }: ScanPhaseProps) {
  const dossierRef = dbResult?.id ?? null;

  return (
    <motion.section
      key="scan"
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
      transition={{ duration: 0.65, ease: SILK }}
      className="relative overflow-hidden rounded-[6px] border border-white/8 bg-gradient-to-br from-[#0d0d16]/95 via-[#0b0b14]/90 to-[#080810] shadow-[0_40px_100px_rgba(0,0,0,0.55)]"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5%] top-[-5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(110,140,255,0.06)_0%,transparent_65%)] blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,178,124,0.05)_0%,transparent_65%)] blur-[80px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-sm border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.28em] ${
                isStreaming
                  ? "border-signal-blue/30 bg-signal-blue/8 text-signal-blue"
                  : "border-green-400/30 bg-green-400/8 text-green-400"
              }`}
            >
              <motion.span
                animate={isStreaming ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
                transition={{ duration: 0.9, repeat: isStreaming ? Infinity : 0 }}
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
              {isStreaming ? "Intelligence Scan Active" : "Scan Complete"}
            </span>

            {dossierRef && (
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-titanium/60">
                Ref · {dossierRef.slice(0, 8).toUpperCase()}
              </span>
            )}
          </div>

          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: SILK }}
              className="flex flex-wrap items-center gap-2"
            >
              <a
                href="mailto:hello@apex.studio?subject=APEX%20Executive%20Call"
                className="inline-flex h-9 items-center gap-1.5 rounded-[3px] border border-gold/30 bg-gold/6 px-4 font-mono text-[9px] uppercase tracking-[0.2em] text-gold transition-colors hover:bg-gold/10"
              >
                <CalendarDays className="h-3 w-3" />
                Schedule Call
              </a>
              <button
                type="button"
                onClick={onReset}
                className="inline-flex h-9 items-center rounded-[3px] border border-white/10 px-4 font-mono text-[9px] uppercase tracking-[0.2em] text-titanium transition-colors hover:border-white/18 hover:text-platinum"
              >
                New Profile
              </button>
            </motion.div>
          )}
        </div>

        {/* Two-column layout: terminal + score panel */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          {/* Terminal */}
          <IntelligenceTerminal text={streamText} isStreaming={isStreaming} />

          {/* Score panel */}
          <ScorePanel scores={scores} dbResult={dbResult} />
        </div>

        {/* Complete state: recommendation */}
        <AnimatePresence>
          {phase === "complete" && scores.recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: SILK }}
              className="mt-4 flex items-start gap-3 rounded-[4px] border border-gold/15 bg-gold/[0.04] p-4"
            >
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-gold/60" />
              <div>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium/70">
                  Strategic Recommendation
                </p>
                <p className="text-[13px] leading-6 text-platinum/85">
                  {scores.recommendation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function RequestAccessForm() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [streamText, setStreamText] = useState("");
  const [scores, setScores] = useState<ParsedScores>({
    authority: null,
    prestige: null,
    market: null,
    luxury: null,
    priority: null,
    recommendation: null,
  });
  const [dbResult, setDbResult] = useState<DBResult | null>(null);
  const [streamDone, setStreamDone] = useState(false);
  const [dbDone, setDbDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Transition to complete when both requests finish
  useEffect(() => {
    if (streamDone && dbDone && phase === "scanning") {
      const t = setTimeout(() => setPhase("complete"), 600);
      return () => clearTimeout(t);
    }
  }, [streamDone, dbDone, phase]);

  // Parse scores from accumulated text
  useEffect(() => {
    if (!streamText) return;
    setScores(parseScoresFromText(streamText));
  }, [streamText]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isValid } } =
    useForm<RequestAccessFormInput, unknown, RequestAccessInput>({
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
    setStreamText("");
    setScores({ authority: null, prestige: null, market: null, luxury: null, priority: null, recommendation: null });
    setDbResult(null);
    setStreamDone(false);
    setDbDone(false);
    setPhase("scanning");

    const body = JSON.stringify(values);

    // ── Stream request ──────────────────────────────────────────────────────
    const streamRequest = (async () => {
      const res = await fetch("/api/access-request/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream unavailable");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setStreamText((prev) => prev + chunk);
      }

      setStreamDone(true);
    })();

    // ── DB request ─────────────────────────────────────────────────────────
    const dbRequest = (async () => {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const payload = (await res.json().catch(() => null)) as {
        request?: {
          id: string;
          priority_level: string;
          ai_summary: string;
          ai_recommendation: string;
          prestige_score: number;
          authority_score: number;
          market_potential_score: number;
          luxury_fit_score: number;
        };
      } | null;

      if (res.ok && payload?.request) {
        setDbResult({
          id: payload.request.id,
          priorityLevel: payload.request.priority_level,
          aiSummary: payload.request.ai_summary,
          aiRecommendation: payload.request.ai_recommendation,
          prestigeScore: payload.request.prestige_score,
          authorityScore: payload.request.authority_score,
          marketPotentialScore: payload.request.market_potential_score,
          luxuryFitScore: payload.request.luxury_fit_score,
        });
      }

      setDbDone(true);
    })();

    // Wait for both — errors are non-fatal (stream still showed partial data)
    await Promise.allSettled([streamRequest, dbRequest]);

    // Ensure we always land on complete
    setStreamDone(true);
    setDbDone(true);
    reset();
  });

  const handleReset = () => {
    setPhase("idle");
    setStreamText("");
    setScores({ authority: null, prestige: null, market: null, luxury: null, priority: null, recommendation: null });
    setDbResult(null);
    setStreamDone(false);
    setDbDone(false);
  };

  return (
    <AnimatePresence mode="wait">
      {phase === "idle" ? (
        <FormPhase
          key="form"
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          revenueRange={revenueRange}
          onRevenueSelect={(v) => setValue("revenueRange", v, { shouldDirty: true, shouldValidate: true })}
          serverError={serverError}
        />
      ) : (
        <ScanPhase
          key="scan"
          streamText={streamText}
          scores={scores}
          dbResult={dbResult}
          isStreaming={!streamDone}
          phase={phase === "complete" ? "complete" : "scanning"}
          onReset={handleReset}
        />
      )}
    </AnimatePresence>
  );
}
