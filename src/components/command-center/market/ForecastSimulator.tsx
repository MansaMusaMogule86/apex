"use client";

import { useMemo, useState } from "react";

import { SIMULATION_SCENARIOS } from "@/components/command-center/market/data";
import MarketPanel from "@/components/command-center/market/MarketPanel";

export default function ForecastSimulator() {
  const [scenarioId, setScenarioId] = useState<(typeof SIMULATION_SCENARIOS)[number]["id"]>("base");
  const [priceAdjustment, setPriceAdjustment] = useState(2);
  const [narrativeCadence, setNarrativeCadence] = useState(3);

  const active = useMemo(
    () => SIMULATION_SCENARIOS.find((scenario) => scenario.id === scenarioId) ?? SIMULATION_SCENARIOS[0],
    [scenarioId],
  );

  const simulatedUpside = useMemo(() => {
    const base = Number.parseFloat(active.uplift.replace("%", ""));
    const modifier = priceAdjustment * 0.6 + narrativeCadence * 0.9;
    return `${(base + modifier).toFixed(1)}%`;
  }, [active.uplift, narrativeCadence, priceAdjustment]);

  return (
    <MarketPanel
      title="Forecast Simulator"
      subtitle="Decision Simulator"
      decisionTie="Stress-test strategic moves before market deployment."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Scenario</p>
          <div className="grid gap-2">
            {SIMULATION_SCENARIOS.map((scenario) => {
              const selected = scenario.id === active.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setScenarioId(scenario.id)}
                  className={[
                    "rounded-xs border p-3 text-left transition-all",
                    selected
                      ? "border-gold/50 bg-gold/12"
                      : "border-white/10 bg-white/2 hover:border-gold/30",
                  ].join(" ")}
                >
                  <p className="text-sm font-medium text-warm-white">{scenario.name}</p>
                  <p className="mt-1 text-xs text-titanium">{scenario.description}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">
                    Baseline uplift {scenario.uplift} | risk {scenario.risk}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-xs border border-white/10 bg-white/2 p-3">
          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-titanium" htmlFor="price-adjustment">
              Pricing leverage
              <span className="font-mono text-gold-light">{priceAdjustment}%</span>
            </label>
            <input
              id="price-adjustment"
              type="range"
              min={-2}
              max={8}
              value={priceAdjustment}
              onChange={(event) => setPriceAdjustment(Number(event.target.value))}
              className="w-full accent-[#C8A96E]"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs text-titanium" htmlFor="narrative-cadence">
              Narrative cadence
              <span className="font-mono text-gold-light">{narrativeCadence}/5</span>
            </label>
            <input
              id="narrative-cadence"
              type="range"
              min={1}
              max={5}
              value={narrativeCadence}
              onChange={(event) => setNarrativeCadence(Number(event.target.value))}
              className="w-full accent-[#C8A96E]"
            />
          </div>

          <div className="rounded-xs border border-gold/30 bg-gold/12 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/80">Projected uplift</p>
            <p className="mt-1 font-display text-3xl font-light text-warm-white">{simulatedUpside}</p>
            <p className="mt-1 text-xs text-mist">Model blends scenario baseline with active levers.</p>
          </div>
        </div>
      </div>
    </MarketPanel>
  );
}
