"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Check,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Loader2,
  Mail,
  Pause,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Send,
  Shield,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import {
  EXEC_SIGNALS,
  REPORT_CATEGORIES,
  REPORT_FEED,
  REPORT_KPIS,
} from "@/components/command-center/reports/data";
import type { ReportCard, ReportCategory } from "@/components/command-center/reports/types";
import TopKpiRibbon from "@/components/command-center/reports/TopKpiRibbon";
import IntelligenceTimeline from "@/components/command-center/reports/IntelligenceTimeline";
import StrategicRecommendationEngine from "@/components/command-center/reports/StrategicRecommendationEngine";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

// ─── category icons ───────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, typeof FileText> = {
  "Luxury Market Intelligence Reports": BarChart3,
  "Founder Authority Reports": Brain,
  "Influence Intelligence Reports": Users,
  "Lead Conversion Intelligence Reports": TrendingUp,
  "Competitor Intelligence Reports": Shield,
  "Prestige Risk Reports": AlertTriangle,
  "Narrative Intelligence Reports": BookOpen,
  "Executive Strategy Briefings": Building2,
};

const IMPACT_STYLES: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-400",
  high: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  medium: "border-blue-400/40 bg-blue-400/10 text-blue-300",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
};

const RISK_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-emerald-500",
};

const SIGNAL_ICON: Record<string, typeof Zap> = {
  risk: AlertTriangle,
  anomaly: Zap,
  prestige: Shield,
  competitor: Building2,
  narrative: BookOpen,
  volatility: TrendingUp,
};

const SIGNAL_COLOR: Record<string, string> = {
  risk: "text-red-400",
  anomaly: "text-amber-300",
  prestige: "text-purple-400",
  competitor: "text-blue-400",
  narrative: "text-emerald-400",
  volatility: "text-orange-400",
};

// ─── toast ────────────────────────────────────────────────────────────────────
type Toast = { id: string; message: string; type: "success" | "info" | "error" };

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `t-${Date.now()}`;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, push };
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: SILK }}
            className={cn(
              "flex items-center gap-3 rounded-[2px] border px-5 py-3 shadow-2xl backdrop-blur-xl font-mono text-[10px] uppercase tracking-[0.2em]",
              t.type === "success" && "border-gold/35 bg-obsidian/95 text-gold",
              t.type === "info" && "border-white/20 bg-obsidian/95 text-warm-white",
              t.type === "error" && "border-red-500/35 bg-obsidian/95 text-red-400",
            )}
          >
            {t.type === "success" && <Check className="h-3.5 w-3.5 shrink-0" />}
            {t.type === "info" && <Sparkles className="h-3.5 w-3.5 shrink-0" />}
            {t.type === "error" && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── share modal ──────────────────────────────────────────────────────────────
function ShareModal({
  report,
  onClose,
  onSend,
}: {
  report: ReportCard;
  onClose: () => void;
  onSend: (emails: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState<string[]>(["board@apex.com"]);
  const [sending, setSending] = useState(false);

  const addEmail = () => {
    const trimmed = input.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((p) => [...p, trimmed]);
      setInput("");
    }
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    onSend(emails);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.35, ease: SILK }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[2px] border border-gold/20 bg-[#0e0c09] p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">Share report</p>
            <h3 className="font-display text-xl text-warm-white">{report.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-mist hover:text-warm-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* recipients */}
        <div className="space-y-3 mb-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Recipients</p>
          <div className="flex flex-wrap gap-2">
            {emails.map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] text-warm-white">
                {e}
                <button type="button" onClick={() => setEmails((p) => p.filter((x) => x !== e))}>
                  <X className="h-2.5 w-2.5 text-mist hover:text-warm-white" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addEmail()}
              placeholder="add@address.com"
              className="flex-1 rounded-[2px] border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-warm-white placeholder:text-mist/50 focus:border-gold/30 focus:outline-none"
            />
            <button type="button" onClick={addEmail} className="rounded-[2px] border border-white/15 bg-white/[0.04] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium hover:border-gold/30 hover:text-gold transition-all">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* message */}
        <div className="mb-6 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Cover note (optional)</p>
          <textarea
            rows={3}
            placeholder="Please review the attached executive report ahead of our board meeting…"
            className="w-full resize-none rounded-[2px] border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-warm-white placeholder:text-mist/50 focus:border-gold/30 focus:outline-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || emails.length === 0}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[2px] border border-gold/35 bg-gold/[0.08] py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 disabled:opacity-40"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
            {sending ? "Sending…" : `Send to ${emails.length} recipient${emails.length !== 1 ? "s" : ""}`}
          </button>
          <button type="button" onClick={onClose} className="rounded-[2px] border border-white/12 bg-white/[0.03] px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium hover:border-white/25 transition-all">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── schedule modal ───────────────────────────────────────────────────────────
const DAYS = ["Daily", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const AUDIENCES = ["Executive Team", "Board Members", "Strategy Team", "Risk Committee", "Founder Office"];

function ScheduleModal({ report, onClose, onSchedule }: { report: ReportCard; onClose: () => void; onSchedule: () => void }) {
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("09:00");
  const [audience, setAudience] = useState("Board Members");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    onSchedule();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.35, ease: SILK }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[2px] border border-gold/20 bg-[#0e0c09] p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">Schedule export</p>
            <h3 className="font-display text-xl text-warm-white">{report.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-mist hover:text-warm-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 mb-6">
          {/* day */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Delivery day</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button key={d} type="button" onClick={() => setDay(d)}
                  className={cn("rounded-[2px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-all",
                    day === d ? "border-gold/50 bg-gold/[0.08] text-gold" : "border-white/12 text-titanium hover:border-white/25"
                  )}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* time */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Delivery time</p>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="rounded-[2px] border border-white/12 bg-white/[0.03] px-3 py-2 text-sm text-warm-white focus:border-gold/30 focus:outline-none"
            />
          </div>

          {/* audience */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Audience</p>
            <div className="flex flex-wrap gap-2">
              {AUDIENCES.map((a) => (
                <button key={a} type="button" onClick={() => setAudience(a)}
                  className={cn("rounded-[2px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-all",
                    audience === a ? "border-gold/50 bg-gold/[0.08] text-gold" : "border-white/12 text-titanium hover:border-white/25"
                  )}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-[2px] border border-gold/35 bg-gold/[0.08] py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 disabled:opacity-40"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
            {saving ? "Scheduling…" : `Schedule for ${day} ${time}`}
          </button>
          <button type="button" onClick={onClose} className="rounded-[2px] border border-white/12 bg-white/[0.03] px-5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium hover:border-white/25 transition-all">
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── print utility ────────────────────────────────────────────────────────────
function printReport(report: ReportCard) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${report.title}</title>
    <style>
      body{font-family:Georgia,serif;background:#fff;color:#111;max-width:760px;margin:40px auto;padding:0 24px;line-height:1.6}
      h1{font-size:24px;font-weight:500;margin-bottom:4px}
      .meta{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.2em;margin-bottom:24px}
      .section{margin-bottom:20px;padding:16px;border:1px solid #e5e5e5;border-radius:2px}
      .label{font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:#999;margin-bottom:6px}
      .tag{display:inline-block;padding:2px 10px;border:1px solid #ddd;font-size:10px;text-transform:uppercase;letter-spacing:.15em;margin:2px}
      @media print{body{margin:20px}}
    </style>
    </head><body>
    <p class="meta">APEX Intelligence Report · Confidential · ${new Date().toLocaleDateString("en-GB")}</p>
    <h1>${report.title}</h1>
    <p class="meta">${report.category} · ${report.executiveAudience} · ${report.confidence}% confidence · ${report.decisionPriority}</p>
    <div class="section"><div class="label">Executive Summary</div><p>${report.summary}</p></div>
    <div class="section"><div class="label">Risk Level</div><p>${report.risk.toUpperCase()} · Executive Impact: ${report.executiveImpact.toUpperCase()}</p></div>
    <div class="section"><div class="label">Suggested Actions</div>${report.suggestedActions.map((a) => `<span class="tag">${a}</span>`).join("")}</div>
    <p class="meta">Generated ${report.generatedAt} · APEX Command Center</p>
    </body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 400);
}

// ─── schedule row (sidebar) ───────────────────────────────────────────────────
type ScheduleItem = { id: string; report: string; day: string; time: string; to: string; active: boolean };

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  { id: "s1", report: "Weekly Summary", day: "Monday", time: "09:00", to: "Executive Team", active: true },
  { id: "s2", report: "Market Brief", day: "Daily", time: "18:00", to: "Strategy Team", active: true },
  { id: "s3", report: "Board Pack", day: "Friday", time: "08:00", to: "Board Members", active: true },
  { id: "s4", report: "Prestige Risk Report", day: "Wednesday", time: "12:00", to: "Risk Committee", active: false },
];

// ─── report row ───────────────────────────────────────────────────────────────
function ReportRow({
  report,
  selected,
  generating,
  generated,
  onClick,
  onGenerate,
  onExport,
}: {
  report: ReportCard;
  selected: boolean;
  generating: boolean;
  generated: boolean;
  onClick: () => void;
  onGenerate: () => void;
  onExport: () => void;
}) {
  const Icon = CATEGORY_ICONS[report.category] ?? FileText;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.4, ease: SILK }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-[2px] border p-5 transition-all duration-400",
        selected ? "border-gold/40 bg-gold/[0.06]" : "border-white/8 bg-white/[0.015] hover:border-white/20 hover:bg-white/[0.03]",
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-0.5 rounded-l-[2px] transition-all duration-400", selected ? "bg-gold" : "bg-transparent group-hover:bg-white/20")} />

      <div className="flex items-start gap-4">
        <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-400", selected ? "border-gold/40 bg-gold/15" : "border-white/10 bg-white/[0.04]")}>
          <Icon className={cn("h-4 w-4", selected ? "text-gold" : "text-titanium")} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug text-warm-white">{report.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                <span className={cn("h-1.5 w-1.5 rounded-full", RISK_DOT[report.risk] ?? "bg-mist")} />
                {report.risk} risk
              </span>
              <span className={cn("rounded-[2px] border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]", IMPACT_STYLES[report.executiveImpact] ?? "border-white/10 text-mist")}>
                {report.executiveImpact}
              </span>
            </div>
          </div>

          <p className="mt-1.5 text-xs leading-relaxed text-titanium line-clamp-2">{report.summary}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
              <span>{report.generatedAt}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-mist/50" />
              <span>{report.decisionPriority}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-mist/50" />
              <span>{report.executiveAudience}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-mist/50" />
              <span className="text-gold/80">{report.confidence}% conf.</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={onGenerate} disabled={generating}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[2px] border px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] transition-all duration-300",
                  generated ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-gold/25 bg-gold/[0.06] text-gold hover:bg-gold/15",
                  generating && "opacity-50 cursor-not-allowed",
                )}
              >
                {generating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : generated ? <Check className="h-2.5 w-2.5" /> : <Brain className="h-2.5 w-2.5" />}
                {generated ? "Generated" : "Generate"}
              </button>
              <button type="button" onClick={onExport}
                className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/12 bg-white/[0.03] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-titanium transition-all duration-300 hover:border-gold/30 hover:text-gold"
              >
                <Download className="h-2.5 w-2.5" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export default function ExecutiveReportsScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("reports");

  // ── state ───────────────────────────────────────────────────────────────────
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(REPORT_FEED[0]?.id ?? "");
  const [liveMode, setLiveMode] = useState(true);
  const [mobileMode, setMobileMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [generatingAll, setGeneratingAll] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(DEFAULT_SCHEDULES);
  const [modal, setModal] = useState<"share" | "schedule" | "addSchedule" | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const { toasts, push } = useToast();

  // ── derived ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () => REPORT_FEED.filter((r) => category === "all" || r.category === category),
    [category],
  );
  const selectedReport = useMemo(
    () => filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? REPORT_FEED[0],
    [filtered, selectedId],
  );
  const kpis = applyDomainKpiDrift(REPORT_KPIS, runtime.driftPct, runtime.confidenceBias);
  const alerts = useMemo(() => {
    const live = liveAlerts.slice(0, 2).map((a) => a.title);
    const baseline = [
      "Prestige confidence dipped below threshold in one segment.",
      "Competitor intelligence cadence accelerated beyond baseline.",
      "Narrative disruption detected in founder authority channel.",
    ];
    return [...live, ...baseline].slice(0, 3);
  }, [liveAlerts]);

  // ── actions ─────────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async (id: string) => {
    if (generating) return;
    setGenerating(id);
    try {
      await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: `Generate executive summary for report id: ${id}` }], stream: false }),
      });
    } catch { /* offline */ }
    setGenerating(null);
    setGenerated((p) => new Set(p).add(id));
    push("Report generated successfully", "success");
  }, [generating, push]);

  const handleGenerateAll = useCallback(async () => {
    setGeneratingAll(true);
    push("Generating all reports…", "info");
    for (const r of REPORT_FEED) {
      setGenerating(r.id);
      await new Promise((res) => setTimeout(res, 600));
      setGenerated((p) => new Set(p).add(r.id));
      setGenerating(null);
    }
    setGeneratingAll(false);
    push("All reports generated", "success");
  }, [push]);

  const handleExport = useCallback((report: ReportCard) => {
    printReport(report);
    push(`Exporting: ${report.title}`, "success");
  }, [push]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    push("Refreshing intelligence layer…", "info");
    setTimeout(() => {
      setLoading(false);
      push("Intelligence refreshed", "success");
    }, 1800);
  }, [push]);

  const handleSuggestedAction = useCallback(async (action: string) => {
    setActionBusy(action);
    await new Promise((r) => setTimeout(r, 800));
    setActionBusy(null);
    push(`Action queued: ${action}`, "success");
  }, [push]);

  const toggleSchedule = useCallback((id: string) => {
    setSchedules((p) =>
      p.map((s) => s.id === id ? { ...s, active: !s.active } : s)
    );
    const item = schedules.find((s) => s.id === id);
    if (item) push(`${item.report} ${item.active ? "paused" : "activated"}`, "info");
  }, [schedules, push]);

  const handlePrepareBoard = useCallback(() => {
    if (!selectedReport) return;
    printReport(selectedReport);
    push("Board pack prepared for printing", "success");
  }, [selectedReport, push]);

  return (
    <>
      <ToastStack toasts={toasts} />

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modal === "share" && selectedReport && (
          <ShareModal
            report={selectedReport}
            onClose={() => setModal(null)}
            onSend={(emails) => push(`Report sent to ${emails.length} recipient${emails.length !== 1 ? "s" : ""}`, "success")}
          />
        )}
        {modal === "schedule" && selectedReport && (
          <ScheduleModal
            report={selectedReport}
            onClose={() => setModal(null)}
            onSchedule={() => push("Export scheduled successfully", "success")}
          />
        )}
        {modal === "addSchedule" && selectedReport && (
          <ScheduleModal
            report={selectedReport}
            onClose={() => setModal(null)}
            onSchedule={() => {
              setSchedules((p) => [...p, { id: `s${Date.now()}`, report: selectedReport.title, day: "Monday", time: "09:00", to: "Executive Team", active: true }]);
              push("New schedule added", "success");
            }}
          />
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-6 py-8 lg:px-10">
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: SILK }}
          className="space-y-5 rounded-[2px] border border-gold/12 bg-gradient-to-r from-gold/[0.06] to-transparent px-6 py-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/70">APEX Executive Reports</p>
              <h1 className="font-display text-4xl font-light tracking-tight text-warm-white md:text-5xl">
                Intelligence Briefing <em className="not-italic text-gold">System</em>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-titanium">
                AI-generated executive reports across luxury market intelligence, founder authority, influence networks, lead conversion, competitor intelligence, and prestige risk management.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* live toggle */}
              <button type="button" onClick={() => { setLiveMode((v) => !v); push(liveMode ? "Snapshot mode" : "Live mode activated", "info"); }}
                className={cn("inline-flex items-center gap-2 rounded-[2px] border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-400",
                  liveMode ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-white/12 bg-white/[0.03] text-titanium hover:border-white/25"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", liveMode ? "bg-emerald-400 animate-pulse" : "bg-mist")} />
                {liveMode ? "Live mode" : "Snapshot"}
              </button>

              {/* mobile exec */}
              <button type="button" onClick={() => setMobileMode((v) => !v)}
                className="inline-flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-white/25 hover:text-warm-white"
              >
                <Smartphone className="h-3 w-3" strokeWidth={1.5} />
                {mobileMode ? "Full mode" : "Mobile exec"}
              </button>

              {/* refresh */}
              <button type="button" onClick={handleRefresh} disabled={loading}
                className="inline-flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-gold/30 hover:text-gold disabled:opacity-40"
              >
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} strokeWidth={1.5} />
                Refresh
              </button>

              {/* generate all */}
              <button type="button" onClick={handleGenerateAll} disabled={generatingAll}
                className="inline-flex items-center gap-2 rounded-[2px] border border-gold/30 bg-gold/[0.08] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 disabled:opacity-50"
              >
                {generatingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" strokeWidth={1.5} />}
                {generatingAll ? "Generating…" : "Generate all"}
              </button>
            </div>
          </div>

          <TopKpiRibbon data={kpis} loading={loading} />

          <div className="flex flex-wrap items-center gap-4 font-mono text-[9px] uppercase tracking-[0.2em] text-gold/60">
            <span className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", connection.state === "connected" ? "bg-emerald-400" : "bg-amber-400")} />
              Stream {connection.state}
            </span>
            <span>Queue {runtime.queueDepth}</span>
            <span>Rate {runtime.eventRate}/m</span>
          </div>
        </motion.header>

        {/* ── Alerts ──────────────────────────────────────────────────────────  */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: SILK, delay: 0.1 }}
          className="rounded-[2px] border border-amber-400/25 bg-amber-400/[0.06] px-5 py-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-300" strokeWidth={1.5} />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">High-priority signals</p>
          </div>
          <div className="grid gap-2 text-xs leading-relaxed text-amber-100/80 md:grid-cols-3">
            {alerts.map((a) => (
              <p key={a} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                {a}
              </p>
            ))}
          </div>
        </motion.section>

        {/* ── Category filter ─────────────────────────────────────────────────  */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: SILK, delay: 0.15 }}
          className="rounded-[2px] border border-white/8 bg-white/[0.015] p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Filter className="h-3.5 w-3.5 text-gold/60" strokeWidth={1.5} />
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Report categories</p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist/50">
              {filtered.length} report{filtered.length !== 1 ? "s" : ""} in scope
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory("all")}
              className={cn("inline-flex items-center gap-2 rounded-[2px] border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-all duration-300",
                category === "all" ? "border-gold/50 bg-gold/[0.08] text-warm-white" : "border-white/10 bg-white/[0.02] text-titanium hover:border-white/25 hover:text-warm-white"
              )}
            >
              <FileText className="h-3 w-3" strokeWidth={1.5} />
              All reports
            </button>

            {REPORT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? FileText;
              const active = category === cat;
              const count = REPORT_FEED.filter((r) => r.category === cat).length;
              return (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={cn("inline-flex items-center gap-2 rounded-[2px] border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-all duration-300",
                    active ? "border-gold/50 bg-gold/[0.08] text-warm-white" : "border-white/10 bg-white/[0.02] text-titanium hover:border-white/25 hover:text-warm-white"
                  )}
                >
                  <Icon className={cn("h-3 w-3", active ? "text-gold" : "text-mist")} strokeWidth={1.5} />
                  {cat}
                  {count > 0 && (
                    <span className={cn("rounded-[2px] px-1.5 py-0.5 text-[8px] leading-none", active ? "bg-gold/20 text-gold" : "bg-white/8 text-mist/60")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-[2px] border border-white/8 bg-white/[0.015] p-8"
            >
              <div className="mb-4 flex items-center gap-3 text-sm text-titanium">
                <Loader2 className="h-4 w-4 animate-spin text-gold" />
                Regenerating intelligence briefings from live signals…
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-[2px] border border-white/8 bg-white/[0.02]" />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
            >
              {/* ── LEFT ─────────────────────────────────────────────────── */}
              <div className="space-y-5">
                {/* list header */}
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                    {category === "all" ? "All intelligence reports" : category}
                  </p>
                  <button type="button" onClick={() => setModal("addSchedule")}
                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-gold/25 bg-gold/[0.05] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15"
                  >
                    <Sparkles className="h-2.5 w-2.5" strokeWidth={1.5} />
                    Generate custom
                  </button>
                </div>

                {/* report cards */}
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-[2px] border border-dashed border-white/15 bg-white/[0.01] p-10 text-center"
                    >
                      <FileText className="mx-auto mb-3 h-8 w-8 text-mist/40" strokeWidth={1} />
                      <p className="font-display text-xl text-warm-white">No reports in this category</p>
                      <p className="mt-1 text-sm text-titanium">Select a different category or generate a new report.</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {filtered.map((report) => (
                        <ReportRow
                          key={report.id}
                          report={report}
                          selected={selectedId === report.id}
                          generating={generating === report.id}
                          generated={generated.has(report.id)}
                          onClick={() => setSelectedId(report.id)}
                          onGenerate={() => handleGenerate(report.id)}
                          onExport={() => handleExport(report)}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>

                {/* expanded reader */}
                {selectedReport && (
                  <AnimatePresence mode="wait">
                    <motion.section key={selectedReport.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.5, ease: SILK }}
                      className="rounded-[2px] border border-gold/20 bg-gradient-to-br from-gold/[0.06] to-transparent p-6"
                    >
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/70">Executive reader</p>
                          <h2 className="font-display text-2xl font-light text-warm-white">{selectedReport.title}</h2>
                          <p className="text-sm text-titanium">{selectedReport.category}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => handleExport(selectedReport)}
                            className="inline-flex items-center gap-2 rounded-[2px] border border-gold/35 bg-gold/[0.08] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/18 active:scale-[0.97]"
                          >
                            <Download className="h-3 w-3" strokeWidth={1.5} />
                            Export PDF
                          </button>
                          <button type="button" onClick={() => setModal("share")}
                            className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-white/30 hover:text-warm-white active:scale-[0.97]"
                          >
                            <Send className="h-3 w-3" strokeWidth={1.5} />
                            Share
                          </button>
                          <button type="button" onClick={() => setModal("schedule")}
                            className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-white/30 hover:text-warm-white active:scale-[0.97]"
                          >
                            <Calendar className="h-3 w-3" strokeWidth={1.5} />
                            Schedule
                          </button>
                          <button type="button" onClick={() => printReport(selectedReport)}
                            className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-white/30 hover:text-warm-white active:scale-[0.97]"
                          >
                            <Printer className="h-3 w-3" strokeWidth={1.5} />
                            Print
                          </button>
                        </div>
                      </div>

                      <p className="mb-5 text-sm leading-relaxed text-beige">{selectedReport.summary}</p>

                      {/* suggested actions */}
                      <div className="mb-5 space-y-2">
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">Suggested actions</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReport.suggestedActions.map((action) => (
                            <button key={action} type="button" onClick={() => handleSuggestedAction(action)} disabled={actionBusy === action}
                              className="inline-flex items-center gap-1.5 rounded-[2px] border border-gold/25 bg-gold/[0.04] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold transition-all hover:bg-gold/12 active:scale-[0.97] disabled:opacity-50"
                            >
                              {actionBusy === action ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <ChevronRight className="h-2.5 w-2.5" strokeWidth={2} />}
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 border-t border-gold/10 pt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                        <span>Generated {selectedReport.generatedAt}</span>
                        <span className="h-3 w-px bg-mist/20 self-center" />
                        <span>Audience: {selectedReport.executiveAudience}</span>
                        <span className="h-3 w-px bg-mist/20 self-center" />
                        <span>Priority: {selectedReport.decisionPriority}</span>
                        <span className="h-3 w-px bg-mist/20 self-center" />
                        <span className="text-gold">{selectedReport.confidence}% confidence</span>
                      </div>
                    </motion.section>
                  </AnimatePresence>
                )}

                {/* strategic recommendations + timeline */}
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <StrategicRecommendationEngine />
                  <IntelligenceTimeline />
                </div>

                {/* pdf export panel */}
                {selectedReport && (
                  <div className="rounded-[2px] border border-white/8 bg-white/[0.015] p-5">
                    <div className="mb-4 flex items-center gap-2.5">
                      <FileText className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">PDF Export System</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {/* preview */}
                      <div className="rounded-[2px] border border-white/8 bg-black/30 p-4">
                        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Executive-ready preview</p>
                        <p className="text-sm font-medium text-warm-white">{selectedReport.title}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-titanium">{selectedReport.category}</p>
                        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-gold">
                          {selectedReport.confidence}% confidence · {selectedReport.decisionPriority}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-mist line-clamp-3">{selectedReport.summary}</p>
                      </div>
                      {/* export options */}
                      <div className="flex flex-col gap-3">
                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Export options</p>
                        <button type="button" onClick={() => handleExport(selectedReport)}
                          className="inline-flex items-center gap-2 rounded-[2px] border border-gold/30 bg-gold/[0.08] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 active:scale-[0.97]"
                        >
                          <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Generate PDF
                        </button>
                        <button type="button" onClick={() => printReport(selectedReport)}
                          className="inline-flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-gold/25 hover:text-gold active:scale-[0.97]"
                        >
                          <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Print briefing
                        </button>
                        <button type="button" onClick={() => setModal("share")}
                          className="inline-flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-gold/25 hover:text-gold active:scale-[0.97]"
                        >
                          <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                          Email to board
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT rail ───────────────────────────────────────────── */}
              <aside className="space-y-5">
                {/* executive signals */}
                <div className="rounded-[2px] border border-white/8 bg-white/[0.015] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Executive signals</p>
                  </div>
                  <div className="space-y-3">
                    {EXEC_SIGNALS.map((sig) => {
                      const Icon = SIGNAL_ICON[sig.type] ?? Zap;
                      const color = SIGNAL_COLOR[sig.type] ?? "text-titanium";
                      return (
                        <div key={sig.id} className="flex gap-3 rounded-[2px] border border-white/6 bg-white/[0.02] p-3">
                          <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", color)} strokeWidth={1.5} />
                          <div className="min-w-0">
                            <p className={cn("font-mono text-[9px] uppercase tracking-[0.2em]", color)}>{sig.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-titanium">{sig.body}</p>
                            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.15em] text-mist/50">{sig.timestamp}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* automated schedule */}
                <div className="rounded-[2px] border border-white/8 bg-white/[0.015] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gold/70" strokeWidth={1.5} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">Automated schedule</p>
                  </div>
                  <div className="space-y-3">
                    {schedules.map((s) => (
                      <div key={s.id} className="flex items-start justify-between gap-3 rounded-[2px] border border-white/6 bg-white/[0.02] p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-warm-white">{s.report}</p>
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mist">{s.day} · {s.time}</p>
                          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mist/60">→ {s.to}</p>
                        </div>
                        <button type="button" onClick={() => toggleSchedule(s.id)}
                          className={cn("flex shrink-0 items-center gap-1.5 rounded-[2px] border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.15em] transition-all",
                            s.active ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "border-white/10 text-mist/60 hover:border-white/20"
                          )}
                        >
                          {s.active ? <Pause className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
                          {s.active ? "Active" : "Paused"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setModal("addSchedule")}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-[2px] border border-white/10 bg-white/[0.02] py-2.5 font-mono text-[9px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-gold/25 hover:text-gold active:scale-[0.98]"
                  >
                    <Plus className="h-3 w-3" />
                    Add schedule
                  </button>
                </div>

                {/* board meeting CTA */}
                <div className="rounded-[2px] border border-gold/20 bg-gradient-to-br from-gold/[0.04] to-transparent p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/80">Next board meeting</p>
                  </div>
                  <p className="font-display text-3xl text-warm-white">June 3, 2026</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">6 days · Report pack due Friday</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <button type="button" onClick={handlePrepareBoard}
                      className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-gold/35 bg-gold/[0.08] py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold transition-all hover:bg-gold/15 active:scale-[0.97]"
                    >
                      <Printer className="h-3 w-3" strokeWidth={1.5} />
                      Prepare board pack
                    </button>
                    <button type="button" onClick={() => setModal("share")}
                      className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.02] py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium transition-all hover:border-white/25 hover:text-warm-white active:scale-[0.97]"
                    >
                      <Send className="h-3 w-3" strokeWidth={1.5} />
                      Send to board
                    </button>
                  </div>
                </div>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
