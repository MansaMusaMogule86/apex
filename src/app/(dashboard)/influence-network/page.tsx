"use client";

import dynamic from "next/dynamic";

const InfluenceNetworkScreen = dynamic(
  () => import("@/components/command-center/influence-network/InfluenceNetworkScreen"),
  { ssr: false }
);

export default function InfluenceNetworkPage() {
  return <InfluenceNetworkScreen />;
}
