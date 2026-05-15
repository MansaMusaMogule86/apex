"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "subtle";
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className = "",
  variant = "default",
}: MetricCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-critical-crimson" : "text-titanium";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-sm border p-4 transition-all duration-300",
        variant === "highlight" && "border-signal-blue/30 bg-signal-blue/5",
        variant === "subtle" && "border-white/8 bg-white/[0.02]",
        variant === "default" && "border-white/12 bg-white/[0.03]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">{title}</p>
          <p className="mt-1 font-display text-2xl text-warm-white">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-titanium">{subtitle}</p>}
        </div>
        {icon && <div className="text-gold/60">{icon}</div>}
      </div>
      
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}
