"use client";

import dynamic from "next/dynamic";

const LeadIntelligenceScreen = dynamic(
  () => import("@/components/command-center/lead-intelligence/LeadIntelligenceScreen"),
  { ssr: false }
);

export default function LeadIntelligencePage() {
  return <LeadIntelligenceScreen />;
}
