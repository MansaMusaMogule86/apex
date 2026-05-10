"use client";

import dynamic from "next/dynamic";

const HomeScreen = dynamic(() => import("@/components/command-center/home/HomeScreen"), {
  ssr: false,
});

export default function DashboardPage() {
  return <HomeScreen />;
}
