"use client";

import dynamic from "next/dynamic";

const InfluenceNetworkScreen = dynamic(
  () => import("@/components/command-center/influence/InfluenceNetworkScreen"),
  { ssr: false },
);

export default function InfluencersPage() {
  return <InfluenceNetworkScreen />;
}
