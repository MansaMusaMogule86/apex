"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  type: "high-impact" | "medium-risk" | "fast-win";
  recommendation: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
  suggestedAction: string;
  onAction?: () => void;
}

const typeConfig = {
  "high-impact": {
    icon: Zap,
    label: "High Impact",
    color: "text-amber-300",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-300/30",
  },
  "medium-risk": {
    icon: Shield,
    label: "Medium Risk",
    color: "text-signal-blue",
    bgColor: "bg-signal-blue/10",
    borderColor: "border-signal-blue/30",
  },
  "fast-win": {
    icon: Rocket,
    label: "Fast Win",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
  },
};

export default function RecommendationCard({
  type,
  recommendation,
  reason,
  expectedImpact,
  confidence,
  suggestedAction,
  onAction,
}: RecommendationCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-sm border p-5 transition-all duration-300",
        config.bgColor,
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 rounded-sm", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", config.color)}>
          {config.label}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
            <div 
              className={cn("h-full rounded-full", config.color.replace("text-", "bg-"))}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-[10px] text-titanium">{confidence}%</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-display text-lg text-warm-white mb-2">{recommendation}</h3>
      <p className="text-sm text-titanium mb-3">{reason}</p>
      
      <div className="flex items-center gap-2 mb-4 text-xs">
        <span className="text-mist">Expected impact:</span>
        <span className="text-gold-light">{expectedImpact}</span>
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        className={cn(
          "w-full py-2.5 px-4 rounded-sm font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-200",
          "border hover:shadow-lg",
          config.bgColor,
          config.borderColor,
          config.color,
          "hover:brightness-110"
        )}
      >
        {suggestedAction}
      </button>
    </motion.div>
  );
}
