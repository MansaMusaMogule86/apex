"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Brain, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

interface IntelligenceRailProps {
  signals: IntelligenceRailSignal[];
  className?: string;
}

const signalConfig = {
  market: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  risk: { icon: AlertTriangle, color: "text-critical-crimson", bg: "bg-critical-crimson/10" },
  insight: { icon: Brain, color: "text-signal-blue", bg: "bg-signal-blue/10" },
  competitor: { icon: Target, color: "text-risk-amber", bg: "bg-risk-amber/10" },
  recommendation: { icon: Sparkles, color: "text-gold", bg: "bg-gold/10" },
};

export default function IntelligenceRail({ signals, className = "" }: IntelligenceRailProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist mb-4">
        Live Intelligence
      </h3>
      
      <div className="space-y-3">
        {signals.map((signal, index) => {
          const config = signalConfig[signal.type];
          const Icon = config.icon;
          
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-sm border border-white/8 p-3 transition-all duration-200",
                "hover:border-white/15 hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-start gap-2.5">
                <div className={cn("p-1.5 rounded-sm", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] uppercase tracking-[0.12em]", config.color)}>
                      {signal.type}
                    </span>
                    <span className="text-[9px] text-mist ml-auto">{signal.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium text-warm-white mb-0.5">{signal.title}</p>
                  <p className="text-[11px] text-titanium leading-relaxed">{signal.body}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
