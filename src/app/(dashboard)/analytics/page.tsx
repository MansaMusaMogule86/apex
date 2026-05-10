"use client";

import dynamic from "next/dynamic";

const MarketIntelligenceScreen = dynamic(
  () => import("@/components/command-center/market/MarketIntelligenceScreen"),
  { ssr: false },
);

export default function AnalyticsPage() {
  return <MarketIntelligenceScreen />;
}
