"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { LIVE_SIGNALS } from "@/components/command-center/founder/data";
import type { LiveSignal } from "@/components/command-center/founder/types";

const SIGNAL_CONFIG: Record<
  LiveSignal["type"],
  { dot: string; badge: string; label: string }
> = {
  authority: {
    dot: "bg-gold",
    badge: "border-gold/35 bg-gold/12 text-gold-light",
    label: "AUTH",
  },
  trust: {
    dot: "bg-emerald-400",
    badge: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
    label: "TRUST",
  },
  narrative: {
    dot: "bg-signal-blue",
    badge: "border-signal-blue/35 bg-signal-blue/10 text-blue-200",
    label: "NARR",
  },
  competitor: {
    dot: "bg-rose-400",
    badge: "border-rose-400/35 bg-rose-400/10 text-rose-200",
    label: "COMP",
  },
  investor: {
    dot: "bg-violet-400",
    badge: "border-violet-400/35 bg-violet-400/10 text-violet-200",
    label: "INV",
  },
};

export default function LiveSignalStream() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setScale(1.6);
      const t = setTimeout(() => setScale(1), 600);
      return () => clearTimeout(t);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <AuthorityPanel
      title="Live Signal Stream"
      subtitle="Real-Time Authority Intelligence"
      rightSlot={
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-emerald-400 transition-transform duration-300"
            style={{ transform: `scale(${scale})` }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300">
            Live
          </span>
        </div>
      }
    >
      <div className="grid gap-1.5 sm:grid-cols-2">
        <AnimatePresence initial={false}>
          {LIVE_SIGNALS.map((signal, index) => {
            const cfg = SIGNAL_CONFIG[signal.type];
            return (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="flex items-start gap-2.5 rounded-xs border border-white/8 bg-white/2 px-3 py-2.5 hover:border-white/15"
              >
                <span className={["mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot].join(" ")} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-warm-white">{signal.message}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={[
                        "rounded-xs border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]",
                        cfg.badge,
                      ].join(" ")}
                    >
                      {cfg.label}
                    </span>
                    <span className="font-mono text-[10px] text-gold-light">{signal.delta}</span>
                    <span className="ml-auto font-mono text-[9px] text-mist">{signal.ts}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </AuthorityPanel>
  );
}
