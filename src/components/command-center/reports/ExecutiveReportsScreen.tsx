"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import IntelligenceTimeline from "@/components/command-center/reports/IntelligenceTimeline";
import MainReportFeed from "@/components/command-center/reports/MainReportFeed";
import PdfExportSystem from "@/components/command-center/reports/PdfExportSystem";
import ReportCommandCenter from "@/components/command-center/reports/ReportCommandCenter";
import ReportReaderExperience from "@/components/command-center/reports/ReportReaderExperience";
import RightExecutiveRail from "@/components/command-center/reports/RightExecutiveRail";
import StrategicRecommendationEngine from "@/components/command-center/reports/StrategicRecommendationEngine";
import TopKpiRibbon from "@/components/command-center/reports/TopKpiRibbon";
import { REPORT_CATEGORIES, REPORT_FEED, REPORT_KPIS } from "@/components/command-center/reports/data";
import type { ReportCard, ReportCategory } from "@/components/command-center/reports/types";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";

function mutateReports(reports: ReportCard[]) {
  return reports.map((report) => {
    const confidenceDrift = Math.floor((Math.random() - 0.5) * 3);
    return {
      ...report,
      confidence: Math.min(98, Math.max(76, report.confidence + confidenceDrift)),
    };
  });
}

function MobileQuickBriefings({ report }: { report: ReportCard }) {
  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">Executive quick briefing</p>
      <p className="text-sm text-warm-white">{report.title}</p>
      <p className="mt-1 text-xs text-titanium">{report.summary}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
        <span className="rounded-xs border border-white/15 bg-white/6 px-2 py-0.5 text-titanium">{report.category}</span>
        <span className="rounded-xs border border-gold/25 bg-gold/10 px-2 py-0.5 text-gold-light">{report.confidence}% confidence</span>
        <span className="rounded-xs border border-white/15 bg-white/6 px-2 py-0.5 text-titanium">{report.decisionPriority}</span>
      </div>
    </section>
  );
}

export default function ExecutiveReportsScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("reports");

  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [mobileExecutiveMode, setMobileExecutiveMode] = useState(false);
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [reports, setReports] = useState<ReportCard[]>(REPORT_FEED);
  const [selectedReportId, setSelectedReportId] = useState(REPORT_FEED[0]?.id ?? "");

  useEffect(() => {
    if (!liveMode) return;
    const interval = window.setInterval(() => {
      setReports((current) => mutateReports(current));
    }, 7000);
    return () => window.clearInterval(interval);
  }, [liveMode]);

  const filteredReports = useMemo(
    () => reports.filter((report) => (category === "all" ? true : report.category === category)),
    [category, reports],
  );

  const selectedReport = useMemo(
    () => filteredReports.find((report) => report.id === selectedReportId) ?? filteredReports[0] ?? reports[0],
    [filteredReports, reports, selectedReportId],
  );

  const alerts = useMemo(() => {
    const baseline = [
      "Strategic confidence dropped 3 points in one prestige-sensitive segment.",
      "Competitor intelligence cadence accelerated beyond expected baseline.",
      "Narrative disruption event detected in founder authority channel.",
    ];

    return [...liveAlerts.slice(0, 3).map((item) => item.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Executive Reports</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Institutional intelligence briefing system
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              AI-generated executive reports for strategic decisions, prestige positioning, market dominance, founder authority, and revenue acceleration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLiveMode((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-warm-white"
            >
              {liveMode ? "Live mode" : "Snapshot mode"}
            </button>
            <button
              type="button"
              onClick={() => setMobileExecutiveMode((value) => !value)}
              className="inline-flex items-center gap-1 rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              <Smartphone className="h-3.5 w-3.5" />
              {mobileExecutiveMode ? "Full mode" : "Mobile executive"}
            </button>
            <button
              type="button"
              onClick={() => setLoading((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle loading
            </button>
            <button
              type="button"
              onClick={() => setEmpty((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle empty
            </button>
          </div>
        </div>

        <TopKpiRibbon data={applyDomainKpiDrift(REPORT_KPIS, runtime.driftPct, runtime.confidenceBias)} loading={loading} />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">High-priority alerts</p>
        </div>
        <div className="grid gap-1 text-xs text-amber-100 md:grid-cols-3">
          {alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-white/10 bg-white/2 p-4"
          >
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-titanium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating executive intelligence briefings...
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xs border border-white/10 bg-white/3" />
              ))}
            </div>
          </motion.section>
        ) : empty ? (
          <motion.section
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center"
          >
            <p className="font-display text-2xl font-light text-warm-white">No reports in active intelligence scope</p>
            <p className="mt-2 text-sm text-titanium">Adjust category filters or reconnect report generation pipelines.</p>
          </motion.section>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {mobileExecutiveMode ? (
              <div className="space-y-4">
                {selectedReport ? <MobileQuickBriefings report={selectedReport} /> : null}
                <StrategicRecommendationEngine />
                <RightExecutiveRail />
              </div>
            ) : (
              <>
                <ReportCommandCenter categories={REPORT_CATEGORIES} active={category} onSelect={setCategory} />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <MainReportFeed reports={filteredReports} selectedReportId={selectedReportId} onSelectReport={setSelectedReportId} />
                  <RightExecutiveRail />
                </div>
                {selectedReport ? <ReportReaderExperience report={selectedReport} /> : null}
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <StrategicRecommendationEngine />
                  <IntelligenceTimeline />
                </div>
                {selectedReport ? <PdfExportSystem report={selectedReport} /> : null}
              </>
            )}

            <section className="rounded-xs border border-gold/20 bg-gold/8 p-3 text-xs text-gold-light">
              Executive interaction flow: filter category in command center, open report in feed, review reader evidence and forecasts, apply strategic recommendations, then export boardroom PDF.
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
