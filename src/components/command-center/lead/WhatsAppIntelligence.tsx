"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LeadPanel from "@/components/command-center/lead/LeadPanel";
import type { LeadRow } from "@/components/command-center/lead/types";

type WhatsAppIntelligenceProps = {
  leads: LeadRow[];
};

export default function WhatsAppIntelligence({ leads }: WhatsAppIntelligenceProps) {
  return (
    <LeadPanel
      title="WhatsApp Intelligence"
      subtitle="Conversation Signal Layer"
      decisionTie="Improve close rates by tightening latency and sentiment quality loops."
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={leads} barCategoryGap={10}>
            <CartesianGrid stroke="rgba(200,169,110,0.08)" vertical={false} />
            <XAxis dataKey="buyerName" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} interval={0} angle={-16} dy={8} />
            <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }}
            />
            <Bar dataKey="conversationQuality" fill="rgba(200,169,110,0.74)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="emotionalSentiment" fill="rgba(245,240,231,0.46)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="conversionContribution" fill="rgba(141, 176, 201, 0.55)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-titanium md:grid-cols-4">
        <p>Conversation quality</p>
        <p>Response latency</p>
        <p>Emotional sentiment</p>
        <p>Conversion contribution</p>
      </div>
    </LeadPanel>
  );
}
