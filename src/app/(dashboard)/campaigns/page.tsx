import { Plus, Filter, Calendar, Download } from "lucide-react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import CampaignTable, {
  type Campaign,
} from "@/components/dashboard/CampaignTable";
import MetricCard from "@/components/dashboard/MetricCard";

const CAMPAIGNS: Campaign[] = [
  {
    id: "c-001",
    name: "Hermès — Spring Heritage",
    channel: "Editorial · Print + Digital",
    status: "live",
    spend: 184_400,
    revenue: 1_948_200,
    roas: 10.6,
    conversions: 412,
    updated: "2h ago",
  },
  {
    id: "c-002",
    name: "Patek Philippe — 175e Anniversaire",
    channel: "Private · Concierge",
    status: "live",
    spend: 96_800,
    revenue: 5_780_000,
    roas: 59.7,
    conversions: 27,
    updated: "5h ago",
  },
  {
    id: "c-003",
    name: "Aman — An Unhurried Year (May)",
    channel: "Membership · Direct",
    status: "live",
    spend: 42_300,
    revenue: 612_000,
    roas: 14.5,
    conversions: 188,
    updated: "1d ago",
  },
  {
    id: "c-004",
    name: "Loro Piana — SS26 Broadsheet",
    channel: "Editorial · Print",
    status: "paused",
    spend: 71_200,
    revenue: 488_900,
    roas: 6.9,
    conversions: 142,
    updated: "3d ago",
  },
  {
    id: "c-005",
    name: "Ruinart — Carte Blanche",
    channel: "Hospitality · Atelier",
    status: "draft",
    spend: 0,
    revenue: 0,
    roas: 0,
    conversions: 0,
    updated: "Drafted yesterday",
  },
  {
    id: "c-006",
    name: "Berluti — Atelier Privée",
    channel: "Private · Atelier",
    status: "live",
    spend: 28_400,
    revenue: 392_000,
    roas: 13.8,
    conversions: 64,
    updated: "6h ago",
  },
  {
    id: "c-007",
    name: "Sotheby's — Spring Editions",
    channel: "Editorial · Digital",
    status: "ended",
    spend: 112_000,
    revenue: 1_240_000,
    roas: 11.1,
    conversions: 218,
    updated: "Ended Apr 28",
  },
];

export default function CampaignsPage() {
  const live = CAMPAIGNS.filter((c) => c.status === "live");
  const totalSpend = CAMPAIGNS.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = CAMPAIGNS.reduce((sum, c) => sum + c.revenue, 0);
  const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="flex flex-col gap-12 px-8 py-10 lg:px-12 lg:py-12">
      <header className="flex flex-col gap-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
              Campaigns · Q2 · 2026
            </span>
            <h1 className="font-display text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-5xl">
              Seven campaigns,{" "}
              <em className="not-italic text-gold">in motion</em>.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-titanium">
              Composed across editorial, private and hospitality channels. Each entry is authored by a principal and reviewed weekly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[2px] border border-gold/15 bg-obsidian px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-titanium uppercase transition-colors duration-500 hover:border-gold/30 hover:text-warm-white"
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              Q2 · Apr — Jun
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[2px] border border-gold/15 bg-obsidian px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-titanium uppercase transition-colors duration-500 hover:border-gold/30 hover:text-warm-white"
            >
              <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
              All channels
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[2px] border border-gold/15 bg-obsidian px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-titanium uppercase transition-colors duration-500 hover:border-gold/30 hover:text-warm-white"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              Export
            </button>
            <LuxuryButton variant="primary" size="sm">
              <Plus className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
              Compose campaign
            </LuxuryButton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active campaigns"
            value={live.length}
            delta={28.6}
            deltaLabel="vs Q1"
          />
          <MetricCard
            label="Spend, quarter to date"
            value={totalSpend}
            prefix="$"
            delta={-14.2}
            deltaLabel="tighter than plan"
          />
          <MetricCard
            label="Revenue, quarter to date"
            value={totalRevenue}
            prefix="$"
            delta={38.0}
            deltaLabel="vs Q1"
            accent
          />
          <MetricCard
            label="Blended ROAS"
            value={blendedRoas}
            suffix="×"
            decimals={1}
            delta={21.4}
            deltaLabel="vs Q1"
          />
        </div>
      </header>

      <section>
        <CampaignTable campaigns={CAMPAIGNS} />
      </section>
    </div>
  );
}
