"use client";

import "@/styles/command-center.css";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import CommandCenterSidebar from "@/components/command-center/CommandCenterSidebar";
import CommandCenterTopBar from "@/components/command-center/CommandCenterTopBar";
import IntelligenceRail from "@/components/command-center/IntelligenceRail";
import { CommandCenterShellProvider, useCommandCenterShell } from "@/components/command-center/ShellContext";
import DemoModeAtmosphere from "@/components/command-center/demo/DemoModeAtmosphere";
import {
  ExecutiveDemoModeProvider,
  useExecutiveDemoMode,
} from "@/components/command-center/demo/ExecutiveDemoModeProvider";
import LiveIntelligenceProvider from "@/providers/LiveIntelligenceProvider";

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useCommandCenterShell();
  const { enabled, phase } = useExecutiveDemoMode();

  return (
    <div
      className="command-center-shell relative bg-void text-warm-white"
      data-theme={theme}
      data-demo-mode={enabled ? "on" : "off"}
      data-demo-phase={phase}
    >
      <DemoModeAtmosphere />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(232,228,218,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(232,228,218,0.05)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute -left-36 -top-24 h-[460px] w-[460px] rounded-full bg-signal-blue/[0.08] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full bg-white/[0.05] blur-[150px]" />
      </div>

      <div className="command-center-grid relative z-10">
        <CommandCenterSidebar />

        <section className="min-w-0 overflow-hidden rounded-[2px] border border-white/12 bg-[var(--cc-panel)]">
          <CommandCenterTopBar />
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="min-w-0 px-4 py-6 md:px-6 md:py-8"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </section>

        <IntelligenceRail />
      </div>
    </div>
  );
}

export default function CommandCenterShell({ children }: { children: React.ReactNode }) {
  return (
    <LiveIntelligenceProvider>
      <ExecutiveDemoModeProvider>
        <CommandCenterShellProvider>
          <ShellFrame>{children}</ShellFrame>
        </CommandCenterShellProvider>
      </ExecutiveDemoModeProvider>
    </LiveIntelligenceProvider>
  );
}
