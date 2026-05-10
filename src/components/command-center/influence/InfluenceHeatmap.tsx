"use client";

import { DISTRICT_HEATMAP } from "@/components/command-center/influence/data";
import InfluencePanel from "@/components/command-center/influence/InfluencePanel";

function tone(value: number) {
  if (value >= 90) return "bg-gold/40 border-gold/60 text-warm-white";
  if (value >= 80) return "bg-gold/30 border-gold/50 text-warm-white";
  if (value >= 70) return "bg-gold/20 border-gold/40 text-warm-white";
  return "bg-white/6 border-white/15 text-titanium";
}

export default function InfluenceHeatmap() {
  return (
    <InfluencePanel
      title="Influence Heatmap"
      subtitle="Dubai Influence Districts"
      decisionTie="Deploy creator resources in districts with strongest luxury attention and prestige concentration overlap."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DISTRICT_HEATMAP.map((district) => {
          const composite = Math.round((district.luxuryAttention + district.prestigeConcentration + district.creatorTerritory) / 3);
          return (
            <article key={district.district} className={["rounded-xs border p-3", tone(composite)].join(" ")}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{district.district}</p>
                <p className="font-mono text-[11px]">{composite}</p>
              </div>
              <div className="space-y-2 text-xs">
                <p>Luxury attention: {district.luxuryAttention}</p>
                <p>Prestige concentration: {district.prestigeConcentration}</p>
                <p>Creator territory: {district.creatorTerritory}</p>
                <p>Audience movement: {district.movement}</p>
              </div>
            </article>
          );
        })}
      </div>
    </InfluencePanel>
  );
}
