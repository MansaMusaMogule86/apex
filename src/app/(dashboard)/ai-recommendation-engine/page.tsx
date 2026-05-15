"use client";

import dynamic from "next/dynamic";

const AIRecommendationEngineScreen = dynamic(
  () => import("@/components/command-center/ai-recommendation/AIRecommendationEngineScreen"),
  { ssr: false }
);

export default function AIRecommendationEnginePage() {
  return <AIRecommendationEngineScreen />;
}
