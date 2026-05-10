"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CornerDownLeft,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Search,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Create" | "Intelligence" | "Settings";
  icon: LucideIcon;
  shortcut?: string;
  action: () => void;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CommandItem[];
};

function defaultItems(close: () => void): CommandItem[] {
  return [
    { id: "nav-overview", group: "Navigate", icon: LayoutDashboard, label: "Overview", hint: "Dashboard home", shortcut: "G O", action: close },
    { id: "nav-campaigns", group: "Navigate", icon: Megaphone, label: "Campaigns", hint: "Active engagements", shortcut: "G C", action: close },
    { id: "nav-clients", group: "Navigate", icon: Users, label: "Clients", hint: "Atelier roster", shortcut: "G L", action: close },
    { id: "nav-reports", group: "Navigate", icon: BarChart3, label: "Reports", hint: "Performance archive", shortcut: "G R", action: close },
    { id: "create-campaign", group: "Create", icon: Sparkles, label: "New Campaign", hint: "Launch with AI brief", shortcut: "N C", action: close },
    { id: "create-report", group: "Create", icon: FileText, label: "New Report", hint: "Custom analytics view", shortcut: "N R", action: close },
    { id: "ai-insights", group: "Intelligence", icon: Sparkles, label: "Generate Insights", hint: "Run AI synthesis", action: close },
    { id: "ai-search", group: "Intelligence", icon: Search, label: "Ask the Concierge", hint: "Natural language query", action: close },
    { id: "settings", group: "Settings", icon: Settings, label: "Workspace Settings", action: close },
  ];
}

export default function CommandPalette({
  open,
  onOpenChange,
  items,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = () => onOpenChange(false);

  const allItems = useMemo<CommandItem[]>(
    () => items ?? defaultItems(close),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  // Global ⌘K / Ctrl+K toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Focus input on open + reset state
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.hint?.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  const grouped = useMemo(() => {
    const map = new Map<CommandItem["group"], CommandItem[]>();
    for (const it of filtered) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.action();
    }
  };

  let runningIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="palette"
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: SILK }}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/* Scrim */}
          <motion.button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 bg-void/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: SILK }}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-[2px] border border-gold/20 bg-obsidian/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.5, ease: SILK }}
          >
            {/* Top hairline accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />

            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-gold/10 px-5 py-4">
              <Search className="h-4 w-4 text-gold" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search commands, navigate, ask the concierge…"
                className="w-full bg-transparent text-base text-warm-white placeholder:text-mist/60 focus:outline-none"
              />
              <kbd className="rounded-[2px] border border-gold/15 bg-void/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto py-2">
              {grouped.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="font-display text-lg text-warm-white">
                    Nothing <em className="not-italic text-gold">matches</em>
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                    Try a different phrase
                  </p>
                </div>
              )}

              {grouped.map(([group, list]) => (
                <div key={group} className="px-2 pb-2">
                  <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                    {group}
                  </div>
                  <ul>
                    {list.map((it) => {
                      runningIndex += 1;
                      const isActive = runningIndex === active;
                      const Icon = it.icon;
                      return (
                        <li key={it.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(runningIndex)}
                            onClick={() => it.action()}
                            className={cn(
                              "group relative flex w-full items-center gap-3 rounded-[2px] px-3 py-2.5 text-left transition-colors duration-300",
                              isActive ? "bg-carbon/80" : "hover:bg-carbon/40"
                            )}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="cmd-active"
                                className="absolute inset-y-1 left-0 w-px bg-gold"
                                transition={{ duration: 0.3, ease: SILK }}
                              />
                            )}
                            <span
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-[2px] border transition-colors duration-500",
                                isActive
                                  ? "border-gold/40 bg-gold/10 text-gold"
                                  : "border-gold/10 bg-void/40 text-titanium"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="flex flex-1 flex-col">
                              <span
                                className={cn(
                                  "text-sm transition-colors duration-300",
                                  isActive ? "text-warm-white" : "text-titanium"
                                )}
                              >
                                {it.label}
                              </span>
                              {it.hint && (
                                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                                  {it.hint}
                                </span>
                              )}
                            </span>
                            {it.shortcut && (
                              <kbd className="rounded-[2px] border border-gold/10 bg-void/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                                {it.shortcut}
                              </kbd>
                            )}
                            <ArrowRight
                              className={cn(
                                "h-3.5 w-3.5 transition-all duration-500",
                                isActive
                                  ? "translate-x-0 text-gold opacity-100"
                                  : "-translate-x-1 text-mist opacity-0"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between gap-3 border-t border-gold/10 bg-void/40 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded-[2px] border border-gold/15 px-1.5 py-0.5 text-mist">↑↓</kbd>
                  Navigate
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="rounded-[2px] border border-gold/15 px-1.5 py-0.5 text-mist">
                    <CornerDownLeft className="h-3 w-3" />
                  </kbd>
                  Select
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-gold/70">
                <Sparkles className="h-3 w-3" />
                Concierge
              </span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
