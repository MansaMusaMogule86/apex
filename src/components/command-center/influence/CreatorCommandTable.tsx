"use client";

import { motion } from "framer-motion";
import { ArrowDownUp, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import InfluencePanel from "@/components/command-center/influence/InfluencePanel";
import type { CreatorRow, InfluenceCluster, RiskLevel } from "@/components/command-center/influence/types";

type SortField =
  | "prestigeScore"
  | "audienceWealthDensity"
  | "luxuryAlignment"
  | "conversionGravity"
  | "trustTransferPotential"
  | "influenceYield"
  | "aiPriority";

type CreatorCommandTableProps = {
  creators: CreatorRow[];
  selectedCreatorId: string;
  onSelectCreator: (id: string) => void;
};

const RISK_CLASS: Record<RiskLevel, string> = {
  low: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/35 bg-rose-400/10 text-rose-100",
};

export default function CreatorCommandTable({ creators, selectedCreatorId, onSelectCreator }: CreatorCommandTableProps) {
  const [sortField, setSortField] = useState<SortField>("aiPriority");
  const [clusterFilter, setClusterFilter] = useState<InfluenceCluster | "all">("all");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all");
  const [aiOnly, setAiOnly] = useState(false);

  const visible = useMemo(() => {
    return creators
      .filter((creator) => {
        if (clusterFilter !== "all" && creator.cluster !== clusterFilter) return false;
        if (riskFilter !== "all" && creator.riskLevel !== riskFilter) return false;
        if (aiOnly && creator.aiPriority < 85) return false;
        return true;
      })
      .sort((a, b) => b[sortField] - a[sortField]);
  }, [aiOnly, clusterFilter, creators, riskFilter, sortField]);

  const clusters: Array<InfluenceCluster | "all"> = ["all", "Elite Finance", "Luxury Lifestyle", "Cultural Authority", "HNWI Mobility"];

  const risks: Array<RiskLevel | "all"> = ["all", "low", "medium", "high"];

  const selectedCreator = visible.find((creator) => creator.id === selectedCreatorId) ?? visible[0];

  return (
    <InfluencePanel
      title="Creator Command Table"
      subtitle="Creator Intelligence Matrix"
      decisionTie="Rank by AI priority, trust transfer, and conversion gravity to allocate partnership capital."
      rightSlot={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {(["aiPriority", "prestigeScore", "trustTransferPotential", "conversionGravity"] as SortField[]).map((field) => {
            const active = sortField === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => setSortField(field)}
                className={[
                  "inline-flex items-center gap-1 rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.13em]",
                  active ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium hover:border-gold/30",
                ].join(" ")}
              >
                <ArrowDownUp className="h-3 w-3" />
                {field}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {clusters.map((cluster) => (
          <button
            key={cluster}
            type="button"
            onClick={() => setClusterFilter(cluster)}
            className={[
              "rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.13em]",
              clusterFilter === cluster ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium",
            ].join(" ")}
          >
            {cluster}
          </button>
        ))}
        {risks.map((risk) => (
          <button
            key={risk}
            type="button"
            onClick={() => setRiskFilter(risk)}
            className={[
              "rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.13em]",
              riskFilter === risk ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium",
            ].join(" ")}
          >
            risk: {risk}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setAiOnly((value) => !value)}
          className={[
            "inline-flex items-center gap-1 rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.13em]",
            aiOnly ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium",
          ].join(" ")}
        >
          <Sparkles className="h-3 w-3" />
          ai filter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-330 border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-titanium">
              <th className="py-2 pr-4">Creator</th>
              <th className="py-2 pr-4">Platform</th>
              <th className="py-2 pr-4">Prestige Score</th>
              <th className="py-2 pr-4">Audience Wealth Density</th>
              <th className="py-2 pr-4">Luxury Alignment</th>
              <th className="py-2 pr-4">Conversion Gravity</th>
              <th className="py-2 pr-4">Trust Transfer Potential</th>
              <th className="py-2 pr-4">Influence Yield</th>
              <th className="py-2 pr-4">Narrative Category</th>
              <th className="py-2 pr-4">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((creator, index) => {
              const selected = creator.id === selectedCreatorId;
              return (
                <motion.tr
                  key={creator.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  onClick={() => onSelectCreator(creator.id)}
                  className={[
                    "cursor-pointer border-b border-white/6 text-sm transition-colors",
                    selected ? "bg-gold/10" : "hover:bg-white/3",
                  ].join(" ")}
                >
                  <td className="py-2.5 pr-4 text-warm-white">{creator.creator}</td>
                  <td className="py-2.5 pr-4 text-titanium">{creator.platform}</td>
                  <td className="py-2.5 pr-4 text-warm-white">{creator.prestigeScore}</td>
                  <td className="py-2.5 pr-4 text-warm-white">{creator.audienceWealthDensity}</td>
                  <td className="py-2.5 pr-4 text-warm-white">{creator.luxuryAlignment}</td>
                  <td className="py-2.5 pr-4 text-gold-light">{creator.conversionGravity}</td>
                  <td className="py-2.5 pr-4 text-gold-light">{creator.trustTransferPotential}</td>
                  <td className="py-2.5 pr-4 text-gold-light">{creator.influenceYield.toFixed(1)}x</td>
                  <td className="py-2.5 pr-4 text-titanium">{creator.narrativeCategory}</td>
                  <td className="py-2.5 pr-4">
                    <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.13em]", RISK_CLASS[creator.riskLevel]].join(" ")}>
                      {creator.riskLevel}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedCreator ? (
        <div className="mt-3 rounded-xs border border-gold/30 bg-gold/12 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/80">Executive quick actions</p>
          <div className="mt-2 grid gap-2 md:grid-cols-4">
            <button type="button" className="rounded-xs border border-white/15 bg-white/6 px-2 py-1 text-left text-xs text-warm-white">Deploy partnership with {selectedCreator.creator}</button>
            <button type="button" className="rounded-xs border border-white/15 bg-white/6 px-2 py-1 text-left text-xs text-warm-white">Pair with founder narrative crossover</button>
            <button type="button" className="rounded-xs border border-white/15 bg-white/6 px-2 py-1 text-left text-xs text-warm-white">Increase exclusivity framing</button>
            <button type="button" className="rounded-xs border border-white/15 bg-white/6 px-2 py-1 text-left text-xs text-warm-white">Escalate to high-trust creator cluster</button>
          </div>
        </div>
      ) : null}
    </InfluencePanel>
  );
}
