"use client";

import dynamic from "next/dynamic";

const MarketIntelligenceScreen = dynamic(
  () => import("@/components/command-center/market-intelligence/MarketIntelligenceScreen"),
  { ssr: false }
);

export default function MarketIntelligencePage() {
  return <MarketIntelligenceScreen />;
}
