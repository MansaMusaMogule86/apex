"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AiActionSystem from "@/components/command-center/lead/AiActionSystem";
import BuyerIntentEngine from "@/components/command-center/lead/BuyerIntentEngine";
import { LEAD_ROWS } from "@/components/command-center/lead/data";
import ExecutiveInsightsRail from "@/components/command-center/lead/ExecutiveInsightsRail";
import LeadCommandTable from "@/components/command-center/lead/LeadCommandTable";
import type { LeadRow } from "@/components/command-center/lead/types";
import VipSegmentationPanel from "@/components/command-center/lead/VipSegmentationPanel";
import WhatsAppIntelligence from "@/components/command-center/lead/WhatsAppIntelligence";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

function mutateLeads(leads: LeadRow[]) {
  return leads.map((lead) => {
    const intentDrift = Math.floor((Math.random() - 0.5) * 4);
    const closeDrift = Math.floor((Math.random() - 0.5) * 3);
    return {
      ...lead,
      intentScore: Math.min(99, Math.max(55, lead.intentScore + intentDrift)),
      probabilityToClose: Math.min(98, Math.max(40, lead.probabilityToClose + closeDrift)),
    };
  });
}

function HeaderStats({ leads }: { leads: LeadRow[] }) {
  const critical = leads.filter((lead) => lead.aiPriorityLevel === "critical").length;
  const avgIntent = Math.round(leads.reduce((sum, lead) => sum + lead.intentScore, 0) / Math.max(leads.length, 1));
  const avgClose = Math.round(leads.reduce((sum, lead) => sum + lead.probabilityToClose, 0) / Math.max(leads.length, 1));

  const stats = [
    { label: "Critical AI priorities", value: String(critical), delta: "Live" },
    { label: "Average intent score", value: String(avgIntent), delta: "+4.1%" },
    { label: "Average close probability", value: `${avgClose}%`, delta: "+2.6%" },
    { label: "Buyer command volume", value: String(leads.length), delta: "Realtime" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-titanium">{stat.label}</p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-3xl font-light text-warm-white">{stat.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">{stat.delta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function LeadIntelligenceScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("lead");

  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [mobileExecutiveMode, setMobileExecutiveMode] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>(LEAD_ROWS);
  const [selectedLeadId, setSelectedLeadId] = useState(LEAD_ROWS[0]?.id ?? "");

  useEffect(() => {
    if (!liveMode) return;
    const interval = window.setInterval(() => {
      setLeads((current) => mutateLeads(current));
    }, 6000);
    return () => window.clearInterval(interval);
  }, [liveMode]);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0],
    [leads, selectedLeadId],
  );

  const alerts = useMemo(() => {
    const baseline = [
      "Sovereign Capital cohort showing accelerated readiness in last 20 minutes.",
      "Two high-prestige buyers exceeded premium trust threshold after founder touchpoint.",
      "Latency spike detected on one broker pod; reassignment action recommended.",
    ];

    return [...liveAlerts.slice(0, 3).map((item) => item.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Lead Intelligence</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Elite buyer intelligence command center
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Palantir-grade visibility for luxury conversion decisions across intent, prestige, broker performance, and trust momentum.
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
              onClick={() => setIsLoading((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle loading
            </button>
            <button
              type="button"
              onClick={() => setShowEmpty((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle empty
            </button>
          </div>
        </div>

        <HeaderStats leads={leads} />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-rose-300/20 bg-rose-300/10 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-rose-100">Command alerts</p>
        </div>
        <div className="grid gap-1 text-xs text-rose-100 md:grid-cols-3">
          {alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-white/10 bg-white/2 p-4"
          >
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-titanium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Hydrating lead intelligence graph...
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xs border border-white/10 bg-white/3" />
              ))}
            </div>
          </motion.section>
        ) : showEmpty ? (
          <motion.section
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center"
          >
            <p className="font-display text-2xl font-light text-warm-white">No leads in active command filter</p>
            <p className="mt-2 text-sm text-titanium">AI systems are online but no buyers match the current view constraints.</p>
          </motion.section>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {mobileExecutiveMode ? (
              <div className="space-y-4">
                <ExecutiveInsightsRail lead={selectedLead} />
                <AiActionSystem />
                <LeadCommandTable leads={leads} selectedLeadId={selectedLeadId} onSelectLead={setSelectedLeadId} />
              </div>
            ) : (
              <>
                <LeadCommandTable leads={leads} selectedLeadId={selectedLeadId} onSelectLead={setSelectedLeadId} />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <VipSegmentationPanel />
                  <ExecutiveInsightsRail lead={selectedLead} />
                </div>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <BuyerIntentEngine />
                  <AiActionSystem />
                </div>
                <WhatsAppIntelligence leads={leads} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
