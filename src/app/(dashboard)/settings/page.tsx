"use client";

import dynamic from "next/dynamic";

const SettingsScreen = dynamic(
  () => import("@/components/command-center/settings/SettingsScreen"),
  { ssr: false }
);

export default function SettingsPage() {
  return <SettingsScreen />;
}
