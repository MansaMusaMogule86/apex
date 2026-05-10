"use client";

import { PRESETS } from "@/components/command-center/scenario/data";
import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";
import type { ScenarioPreset, SimulationControls } from "@/components/command-center/scenario/types";

type ScenarioControlsPanelProps = {
  controls: SimulationControls;
  onControlChange: <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => void;
  onApplyPreset: (preset: ScenarioPreset) => void;
};

type SliderControl = {
  key: keyof SimulationControls;
  label: string;
  min: number;
  max: number;
};

const SLIDERS: SliderControl[] = [
  { key: "founderContent", label: "Founder content increase", min: 0, max: 100 },
  { key: "luxuryPositioning", label: "Luxury positioning shifts", min: 0, max: 100 },
  { key: "influencerDeployment", label: "Influencer deployment", min: 0, max: 100 },
  { key: "prActivation", label: "PR campaign activation", min: 0, max: 100 },
  { key: "investorMessaging", label: "Investor messaging changes", min: 0, max: 100 },
  { key: "geographicExpansion", label: "Geographic expansion", min: 0, max: 100 },
  { key: "pricingChange", label: "Pricing changes", min: 0, max: 100 },
  { key: "narrativeFraming", label: "Narrative framing adjustments", min: 0, max: 100 },
  { key: "aggression", label: "Aggression setting", min: 0, max: 100 },
  { key: "riskTolerance", label: "Risk tolerance", min: 0, max: 100 },
  { key: "capitalAllocation", label: "Capital allocation", min: 0, max: 100 },
  { key: "influenceBudget", label: "Influence budget allocation", min: 0, max: 100 },
];

const TIMELINES: Array<SimulationControls["timeline"]> = ["7d", "30d", "90d", "180d", "long"];

export default function ScenarioControlsPanel({ controls, onControlChange, onApplyPreset }: ScenarioControlsPanelProps) {
  return (
    <ScenarioPanel
      title="Scenario Controls Panel"
      subtitle="Interactive Strategic Controls"
      decisionTie="Shape simulation outcomes by tuning operational, narrative, risk, and capital variables."
    >
      <div className="space-y-4">
        <div className="grid gap-2 md:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onApplyPreset(preset)}
              className="rounded-xs border border-white/10 bg-white/2 p-3 text-left hover:border-gold/30"
            >
              <p className="text-sm font-medium text-warm-white">{preset.name}</p>
              <p className="mt-1 text-xs text-titanium">{preset.description}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {SLIDERS.map((slider) => {
            const value = controls[slider.key];
            if (typeof value !== "number") return null;
            return (
              <label key={slider.key} className="space-y-1.5 rounded-xs border border-white/10 bg-white/2 p-2.5">
                <div className="flex items-center justify-between text-xs text-titanium">
                  <span>{slider.label}</span>
                  <span className="font-mono text-gold-light">{value}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={value}
                  onChange={(event) => onControlChange(slider.key, Number(event.target.value) as SimulationControls[typeof slider.key])}
                  className="w-full accent-[#C8A96E]"
                />
              </label>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TIMELINES.map((timeline) => (
            <button
              key={timeline}
              type="button"
              onClick={() => onControlChange("timeline", timeline)}
              className={[
                "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                controls.timeline === timeline
                  ? "border-gold/45 bg-gold/12 text-warm-white"
                  : "border-white/10 bg-white/2 text-titanium",
              ].join(" ")}
            >
              {timeline}
            </button>
          ))}
        </div>
      </div>
    </ScenarioPanel>
  );
}
