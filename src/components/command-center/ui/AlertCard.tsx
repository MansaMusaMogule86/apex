"use client";

import { motion } from "framer-motion";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  severity: "P1" | "P2" | "P3" | "P4";
  title: string;
  description: string;
  timestamp?: string;
  resolved?: boolean;
  onResolve?: () => void;
  className?: string;
}

const severityConfig = {
  P1: {
    icon: AlertTriangle,
    label: "P1 Critical",
    color: "text-critical-crimson",
    bgColor: "bg-critical-crimson/10",
    borderColor: "border-critical-crimson/40",
    glow: "shadow-[0_0_20px_rgba(214,74,74,0.15)]",
  },
  P2: {
    icon: AlertCircle,
    label: "P2 High",
    color: "text-risk-amber",
    bgColor: "bg-risk-amber/10",
    borderColor: "border-risk-amber/40",
    glow: "",
  },
  P3: {
    icon: Info,
    label: "P3 Medium",
    color: "text-signal-blue",
    bgColor: "bg-signal-blue/10",
    borderColor: "border-signal-blue/30",
    glow: "",
  },
  P4: {
    icon: CheckCircle2,
    label: "P4 Low",
    color: "text-titanium",
    bgColor: "bg-white/5",
    borderColor: "border-white/15",
    glow: "",
  },
};

export default function AlertCard({
  severity,
  title,
  description,
  timestamp,
  resolved = false,
  onResolve,
  className,
}: AlertCardProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "rounded-sm border p-4 transition-all duration-300",
        config.bgColor,
        config.borderColor,
        config.glow,
        resolved && "opacity-50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", config.color)}>
              {config.label}
            </span>
            {timestamp && (
              <span className="text-[10px] text-mist">{timestamp}</span>
            )}
            {resolved && (
              <span className="ml-auto text-[10px] text-emerald-400">Resolved</span>
            )}
          </div>
          
          <h4 className="font-display text-base text-warm-white mb-1">{title}</h4>
          <p className="text-sm text-titanium">{description}</p>
          
          {!resolved && onResolve && (
            <button
              onClick={onResolve}
              className="mt-3 text-[11px] text-mist hover:text-warm-white transition-colors"
            >
              Mark as resolved
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
