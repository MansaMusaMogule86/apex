"use client";

import dynamic from "next/dynamic";

const RecommendationEngineScreen = dynamic(
  () => import("@/components/command-center/recommendation/RecommendationEngineScreen"),
  { ssr: false },
);

export default function AIRecommendationEnginePage() {
  return <RecommendationEngineScreen />;
}
