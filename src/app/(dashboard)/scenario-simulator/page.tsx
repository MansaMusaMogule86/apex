"use client";

import dynamic from "next/dynamic";

const ScenarioSimulatorScreen = dynamic(
  () => import("@/components/command-center/scenario/ScenarioSimulatorScreen"),
  { ssr: false },
);

export default function ScenarioSimulatorPage() {
  return <ScenarioSimulatorScreen />;
}
