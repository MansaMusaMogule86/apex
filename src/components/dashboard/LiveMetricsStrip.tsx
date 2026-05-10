"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DollarSign,
  MousePointerClick,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { useRealtime, type RealtimeSubscription } from "@/hooks/useRealtime";

type Metrics = {
  spend: number;
  revenue: number;
  roas: number;
  conversions: number;
};

type CampaignRow = {
  spend?: number | null;
  revenue?: number | null;
  conversions?: number | null;
};

const SPEND_SPARK = [12, 18, 16, 22, 28, 26, 32, 38, 34, 41, 46, 52];
const REVENUE_SPARK = [24, 28, 26, 34, 38, 42, 40, 48, 54, 58, 62, 71];
const ROAS_SPARK = [3.0, 3.1, 2.9, 3.2, 3.3, 3.1, 3.2, 3.4, 3.3, 3.2, 3.3, 3.24];
const CONV_SPARK = [42, 48, 56, 52, 58, 64, 61, 66, 70, 68, 72, 74];

export default function LiveMetricsStrip({ initial }: { initial: Metrics }) {
  const [metrics, setMetrics] = useState<Metrics>(initial);

  const handleCampaignChange = useCallback(
    (
      payload: Parameters<
        RealtimeSubscription<Record<string, unknown>>["onChange"]
      >[0],
    ) => {
      // Pull deltas from the new row and apply them additively.
      const next = (payload.new ?? {}) as CampaignRow;
      const prev = (payload.old ?? {}) as CampaignRow;

      const dSpend = (next.spend ?? 0) - (prev.spend ?? 0);
      const dRevenue = (next.revenue ?? 0) - (prev.revenue ?? 0);
      const dConv = (next.conversions ?? 0) - (prev.conversions ?? 0);

      if (!dSpend && !dRevenue && !dConv) return;

      setMetrics((m) => {
        const spend = Math.max(0, m.spend + dSpend);
        const revenue = Math.max(0, m.revenue + dRevenue);
        const conversions = Math.max(0, m.conversions + dConv);
        const roas = spend > 0 ? Number((revenue / spend).toFixed(2)) : 0;
        return { spend, revenue, roas, conversions };
      });
    },
    [],
  );

  const subscriptions = useMemo<
    ReadonlyArray<RealtimeSubscription<Record<string, unknown>>>
  >(
    () => [
      {
        table: "campaigns",
        event: "*",
        onChange: handleCampaignChange,
      },
    ],
    [handleCampaignChange],
  );

  useRealtime(subscriptions, { channelName: "dashboard-metrics" });

  return (
    <section className="grid grid-cols-1 gap-px overflow-hidden rounded-[2px] border border-gold/10 bg-gold/10 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Portfolio Spend"
        value={metrics.spend}
        prefix="$"
        delta={12.4}
        icon={DollarSign}
        sparkline={SPEND_SPARK}
        accent
      />
      <MetricCard
        label="Attributed Revenue"
        value={metrics.revenue}
        prefix="$"
        delta={18.2}
        icon={TrendingUp}
        sparkline={REVENUE_SPARK}
      />
      <MetricCard
        label="Blended ROAS"
        value={metrics.roas}
        suffix="x"
        decimals={2}
        delta={4.8}
        icon={Sparkles}
        sparkline={ROAS_SPARK}
      />
      <MetricCard
        label="Atelier Conversions"
        value={metrics.conversions}
        delta={-2.1}
        icon={MousePointerClick}
        sparkline={CONV_SPARK}
      />
    </section>
  );
}
