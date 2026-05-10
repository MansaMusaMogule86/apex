"use client";

import { motion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";
import { useMemo, useState } from "react";

import LeadPanel from "@/components/command-center/lead/LeadPanel";
import type { LeadRow, PriorityLevel } from "@/components/command-center/lead/types";

type SortField = "intentScore" | "prestigeScore" | "probabilityToClose" | "lastInteraction";

type LeadCommandTableProps = {
  leads: LeadRow[];
  selectedLeadId: string;
  onSelectLead: (id: string) => void;
};

const PRIORITY_CLASS: Record<PriorityLevel, string> = {
  critical: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  high: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  medium: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  watch: "border-white/20 bg-white/8 text-mist",
};

function lastInteractionToMinutes(value: string) {
  if (value.includes("m")) return Number.parseInt(value, 10);
  if (value.includes("h")) return Number.parseInt(value, 10) * 60;
  return 9999;
}

export default function LeadCommandTable({ leads, selectedLeadId, onSelectLead }: LeadCommandTableProps) {
  const [sortField, setSortField] = useState<SortField>("intentScore");

  const sorted = useMemo(() => {
    const copy = [...leads];
    return copy.sort((a, b) => {
      if (sortField === "lastInteraction") {
        return lastInteractionToMinutes(a.lastInteraction) - lastInteractionToMinutes(b.lastInteraction);
      }
      return b[sortField] - a[sortField];
    });
  }, [leads, sortField]);

  return (
    <LeadPanel
      title="Lead Command Table"
      subtitle="AI Buyer Command"
      decisionTie="Prioritize broker energy by AI urgency and close probability convergence."
      rightSlot={
        <div className="flex items-center gap-2">
          {(["intentScore", "prestigeScore", "probabilityToClose", "lastInteraction"] as SortField[]).map((field) => {
            const active = sortField === field;
            return (
              <button
                key={field}
                type="button"
                onClick={() => setSortField(field)}
                className={[
                  "inline-flex items-center gap-1 rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.13em]",
                  active
                    ? "border-gold/45 bg-gold/12 text-warm-white"
                    : "border-white/10 bg-white/2 text-titanium hover:border-gold/30",
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
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-titanium">
              <th className="py-2 pr-4">Buyer name</th>
              <th className="py-2 pr-4">Segment</th>
              <th className="py-2 pr-4">Intent score</th>
              <th className="py-2 pr-4">Prestige score</th>
              <th className="py-2 pr-4">Broker assignment</th>
              <th className="py-2 pr-4">Probability to close</th>
              <th className="py-2 pr-4">Last interaction</th>
              <th className="py-2 pr-0">AI priority level</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((lead, index) => {
              const selected = lead.id === selectedLeadId;
              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  onClick={() => onSelectLead(lead.id)}
                  className={[
                    "cursor-pointer border-b border-white/6 text-sm transition-colors",
                    selected ? "bg-gold/10" : "hover:bg-white/3",
                  ].join(" ")}
                >
                  <td className="py-2.5 pr-4 text-warm-white">{lead.buyerName}</td>
                  <td className="py-2.5 pr-4 text-mist">{lead.segment}</td>
                  <td className="py-2.5 pr-4 text-warm-white">{lead.intentScore}</td>
                  <td className="py-2.5 pr-4 text-warm-white">{lead.prestigeScore}</td>
                  <td className="py-2.5 pr-4 text-titanium">{lead.brokerAssignment}</td>
                  <td className="py-2.5 pr-4 text-gold-light">{lead.probabilityToClose}%</td>
                  <td className="py-2.5 pr-4 text-titanium">{lead.lastInteraction}</td>
                  <td className="py-2.5 pr-0">
                    <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.13em]", PRIORITY_CLASS[lead.aiPriorityLevel]].join(" ")}>
                      {lead.aiPriorityLevel}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </LeadPanel>
  );
}
