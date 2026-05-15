"use client";

import dynamic from "next/dynamic";

const ExecutiveReportsScreen = dynamic(
  () => import("@/components/command-center/executive-reports/ExecutiveReportsScreen"),
  { ssr: false }
);

export default function ExecutiveReportsPage() {
  return <ExecutiveReportsScreen />;
}
