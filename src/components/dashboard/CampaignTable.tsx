"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Pause,
  Play,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

export type CampaignStatus = "live" | "paused" | "draft" | "ended";

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  status: CampaignStatus;
  spend: number;
  revenue: number;
  roas: number; // multiplier, e.g. 4.2
  conversions: number;
  updated: string;
};

type SortKey = "name" | "spend" | "revenue" | "roas" | "conversions";
type SortDir = "asc" | "desc";

export type CampaignTableProps = {
  campaigns: Campaign[];
  onToggle?: (id: string) => void;
  className?: string;
};

const STATUS_STYLES: Record<CampaignStatus, string> = {
  live: "border-gold/40 bg-gold/10 text-gold-light",
  paused: "border-mist/30 bg-mist/5 text-mist",
  draft: "border-titanium/20 bg-carbon/40 text-titanium",
  ended: "border-mist/15 bg-void/40 text-mist/60",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  live: "Live",
  paused: "Paused",
  draft: "Draft",
  ended: "Ended",
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export default function CampaignTable({
  campaigns,
  onToggle,
  className,
}: CampaignTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? campaigns.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.channel.toLowerCase().includes(q)
        )
      : campaigns;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [campaigns, query, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ active }: { active: boolean }) => {
    if (!active) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-gold" />
    ) : (
      <ArrowDown className="h-3 w-3 text-gold" />
    );
  };

  const headerCell = (key: SortKey, label: string, align: "left" | "right" = "left") => (
    <th
      scope="col"
      className={cn(
        "px-5 py-4 font-mono text-[10px] uppercase tracking-[0.3em] text-mist",
        align === "right" && "text-right"
      )}
    >
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className={cn(
          "inline-flex items-center gap-1.5 transition-colors duration-500 hover:text-warm-white",
          align === "right" && "ml-auto"
        )}
      >
        {label}
        <SortIcon active={sortKey === key} />
      </button>
    </th>
  );

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2px] border border-gold/15 bg-obsidian/60 backdrop-blur-sm",
        className
      )}
    >
      {/* Toolbar */}
      <header className="flex items-center justify-between gap-4 border-b border-gold/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg text-warm-white">
            Active <em className="not-italic text-gold">Campaigns</em>
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
            {filtered.length} / {campaigns.length}
          </span>
        </div>
        <label className="group flex w-72 items-center gap-2 rounded-[2px] border border-gold/10 bg-void/40 px-3 py-2 transition-colors duration-500 focus-within:border-gold/40">
          <Search className="h-3.5 w-3.5 text-mist transition-colors duration-500 group-focus-within:text-gold" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter campaigns…"
            className="w-full bg-transparent text-sm text-warm-white placeholder:text-mist/60 focus:outline-none"
          />
        </label>
      </header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gold/10 bg-void/30">
              {headerCell("name", "Campaign")}
              <th className="px-5 py-4 text-left font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                Status
              </th>
              {headerCell("spend", "Spend", "right")}
              {headerCell("revenue", "Revenue", "right")}
              {headerCell("roas", "ROAS", "right")}
              {headerCell("conversions", "Conv.", "right")}
              <th className="px-5 py-4 text-right font-mono text-[10px] uppercase tracking-[0.3em] text-mist">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: SILK, delay: i * 0.02 }}
                  className="group border-b border-gold/5 transition-colors duration-500 hover:bg-carbon/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-warm-white">{c.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                        {c.channel} · {c.updated}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.25em]",
                        STATUS_STYLES[c.status]
                      )}
                    >
                      {c.status === "live" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                      )}
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm tabular-nums text-titanium">
                    {formatCurrency(c.spend)}
                  </td>
                  <td className="px-5 py-4 text-right text-sm tabular-nums text-warm-white">
                    {formatCurrency(c.revenue)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={cn(
                        "font-mono text-sm tabular-nums",
                        c.roas >= 3 ? "text-gold-light" : "text-mist"
                      )}
                    >
                      {c.roas.toFixed(1)}x
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm tabular-nums text-titanium">
                    {c.conversions.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {(c.status === "live" || c.status === "paused") && onToggle && (
                        <button
                          type="button"
                          onClick={() => onToggle(c.id)}
                          aria-label={c.status === "live" ? "Pause" : "Resume"}
                          className="flex h-7 w-7 items-center justify-center rounded-[2px] text-mist transition-colors duration-500 hover:bg-void/60 hover:text-gold"
                        >
                          {c.status === "live" ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="More actions"
                        className="flex h-7 w-7 items-center justify-center rounded-[2px] text-mist transition-colors duration-500 hover:bg-void/60 hover:text-warm-white"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-16 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-mist"
                >
                  No campaigns match “{query}”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
