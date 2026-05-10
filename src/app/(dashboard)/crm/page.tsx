"use client";

import dynamic from "next/dynamic";

const LeadIntelligenceScreen = dynamic(
  () => import("@/components/command-center/lead/LeadIntelligenceScreen"),
  { ssr: false },
);

export default function CRMPage() {
  return <LeadIntelligenceScreen />;
}
