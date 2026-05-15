"use client";

import dynamic from "next/dynamic";

const CommandCenterScreen = dynamic(
  () => import("@/components/command-center/command-center/CommandCenterScreen"),
  { ssr: false }
);

export default function CommandCenterPage() {
  return <CommandCenterScreen />;
}
