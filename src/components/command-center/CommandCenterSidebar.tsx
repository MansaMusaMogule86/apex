"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { COMMAND_NAV_ITEMS } from "@/components/command-center/config";
import { COMMAND_EASE } from "@/components/command-center/motion";
import { useCommandCenterShell } from "@/components/command-center/ShellContext";
import { cn } from "@/lib/utils";

function NavList({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1.5 px-3 py-4">
      {COMMAND_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-[2px] px-3 py-3 transition-colors duration-300",
                active ? "bg-signal-blue/[0.12] text-warm-white" : "text-titanium hover:bg-white/[0.04] hover:text-warm-white",
              )}
              data-cursor="interactive"
            >
              {active ? <span className="absolute left-0 top-2 bottom-2 w-px bg-signal-blue" /> : null}
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-signal-blue" : "text-mist")} strokeWidth={1.5} />
              {!collapsed ? (
                <span className="flex flex-1 items-center justify-between text-sm tracking-wide">
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-gold-light">{item.badge}</span>
                  ) : null}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function CommandCenterSidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useCommandCenterShell();

  return (
    <>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 84 : 272 }}
        transition={{ duration: 0.35, ease: COMMAND_EASE }}
        className="hidden xl:flex xl:h-[calc(100dvh-24px)] xl:flex-col xl:overflow-hidden xl:rounded-[2px] xl:border xl:border-white/12 xl:bg-[var(--cc-surface)] xl:backdrop-blur-2xl"
      >
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden" data-cursor="interactive">
            <span className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-signal-blue/35 bg-void font-display text-sm text-signal-blue">
              A
            </span>
            {!sidebarCollapsed ? (
              <span className="flex flex-col leading-tight">
                <span className="font-display text-xl text-warm-white">APEX</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">Command Center</span>
              </span>
            ) : null}
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={sidebarCollapsed} />
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex w-full items-center gap-2 rounded-[2px] px-3 py-2 text-titanium transition-colors duration-300 hover:bg-white/[0.04] hover:text-warm-white"
            data-cursor="interactive"
          >
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!sidebarCollapsed ? <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Collapse</span> : null}
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <motion.div
            className="fixed inset-0 z-50 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.35, ease: COMMAND_EASE }}
              className="relative h-full w-[88%] max-w-[320px] border-r border-white/15 bg-obsidian p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-2xl text-warm-white">APEX</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-[2px] border border-white/15 p-2 text-titanium"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList collapsed={false} onNavigate={() => setMobileSidebarOpen(false)} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
