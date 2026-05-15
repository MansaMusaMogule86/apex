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
    <ul className="space-y-1 px-3 py-4">
      {COMMAND_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        
        // EXACT match for active state - only true when pathname equals href exactly
        const isActive = pathname === item.href;
        
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all duration-200",
                // Active: filled dark navy background, gold/blue icon
                isActive 
                  ? "bg-[#1a2a4a]/80 text-warm-white shadow-[inset_0_0_0_1px_rgba(110,140,255,0.2)]" 
                  : "text-titanium hover:bg-white/[0.04] hover:text-warm-white"
              )}
              data-cursor="interactive"
            >
              {/* Active indicator - left border accent */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-signal-blue shadow-[0_0_8px_rgba(110,140,255,0.5)]" />
              )}
              
              {/* Icon - gold/blue when active, muted when inactive */}
              <Icon 
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors duration-200",
                  isActive 
                    ? "text-signal-blue" 
                    : "text-mist group-hover:text-titanium"
                )} 
                strokeWidth={1.5} 
              />
              
              {!collapsed ? (
                <span className="flex flex-1 items-center justify-between text-sm tracking-wide">
                  <span className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-warm-white" : "text-titanium group-hover:text-warm-white"
                  )}>
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className={cn(
                      "font-mono text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm",
                      isActive 
                        ? "bg-gold/20 text-gold-light" 
                        : "text-gold/60"
                    )}>
                      {item.badge}
                    </span>
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
        className="hidden xl:flex xl:h-[calc(100dvh-24px)] xl:flex-col xl:overflow-hidden xl:rounded-sm xl:border xl:border-white/12 xl:bg-[var(--cc-surface)] xl:backdrop-blur-2xl"
      >
        <div className="flex h-16 items-center border-b border-white/10 px-4">
          <Link href="/command-center" className="flex items-center gap-3 overflow-hidden" data-cursor="interactive">
            <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-signal-blue/35 bg-void font-display text-sm text-signal-blue">
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
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-titanium transition-colors duration-300 hover:bg-white/[0.04] hover:text-warm-white"
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
                  className="rounded-sm border border-white/15 p-2 text-titanium"
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
