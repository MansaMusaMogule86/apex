"use client";

import dynamic from "next/dynamic";

const FounderAuthorityScreen = dynamic(
  () => import("@/components/command-center/founder/FounderAuthorityScreen"),
  { ssr: false },
);

export default function FounderAuthorityDashboardPage() {
  return <FounderAuthorityScreen />;
}
