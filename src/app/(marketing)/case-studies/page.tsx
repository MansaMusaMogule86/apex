import { ArrowUpRight } from "lucide-react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import GoldDivider from "@/components/shared/GoldDivider";
import { cn } from "@/lib/utils";

type CaseStudy = {
  id: string;
  index: string;
  house: string;
  campaign: string;
  category: string;
  season: string;
  geography: string;
  thesis: string;
  results: { label: string; value: string }[];
  awards?: string[];
};

const CASES: CaseStudy[] = [
  {
    id: "hermes-spring",
    index: "01",
    house: "Hermès",
    campaign: "Spring Heritage",
    category: "Maison · Leather",
    season: "SS · 2025",
    geography: "Paris · Tokyo · New York",
    thesis:
      "A campaign authored around silence. The studio composed a thirty-second film and a single editorial spread — no second wave, no extension. The work earned its restraint.",
    results: [
      { label: "Earned reach", value: "42.8M" },
      { label: "Editorial pickups", value: "61" },
      { label: "Sell-through, signature line", value: "+128%" },
      { label: "Cost per acquisition", value: "−34%" },
    ],
    awards: ["Cannes Lions · Gold", "D&AD · Pencil"],
  },
  {
    id: "patek-philippe-175",
    index: "02",
    house: "Patek Philippe",
    campaign: "175e Anniversaire",
    category: "Maison · Horlogerie",
    season: "FW · 2025",
    geography: "Geneva · London · Hong Kong",
    thesis:
      "Twenty-eight collectors, hand-selected. A private dossier delivered by courier, an evening at the manufacture, a single film published the morning after. The campaign was finished before it was announced.",
    results: [
      { label: "Atelier conversions", value: "27 of 28" },
      { label: "Average order, anniversary line", value: "$214,000" },
      { label: "Net new collector intake", value: "+19" },
      { label: "Press impressions", value: "11.4M" },
    ],
    awards: ["Andy Awards · Gold"],
  },
  {
    id: "aman-resorts",
    index: "03",
    house: "Aman Resorts",
    campaign: "An Unhurried Year",
    category: "Hotel Group",
    season: "Annual · 2025",
    geography: "Global",
    thesis:
      "A twelve-month rhythm rather than a campaign. The studio composed one editorial chapter per month, distributed only to a private membership of two thousand. No paid amplification was permitted.",
    results: [
      { label: "Membership conversion", value: "+38%" },
      { label: "Atelier nights booked", value: "8,440" },
      { label: "Repeat-stay rate", value: "+22%" },
      { label: "Net promoter, members", value: "94" },
    ],
  },
  {
    id: "loro-piana-ss26",
    index: "04",
    house: "Loro Piana",
    campaign: "SS26 — The Quiet Cloth",
    category: "Maison · Textile",
    season: "SS · 2026",
    geography: "Milan · Paris · Seoul",
    thesis:
      "A study in cloth, not garment. The campaign was photographed in available light, printed on uncoated stock, and distributed through a fold-out broadsheet to two hundred buyers and editors. No film was produced.",
    results: [
      { label: "Atelier appointments", value: "412" },
      { label: "Wholesale uptake, SS26 line", value: "+47%" },
      { label: "Editorial features", value: "39" },
      { label: "Concierge engagements", value: "1,820" },
    ],
    awards: ["ADC · Silver Cube"],
  },
];

const CATEGORIES = [
  "All work",
  "Maison",
  "Horlogerie",
  "Hotel",
  "Textile",
] as const;

export default function CaseStudiesPage() {
  return (
    <div className="relative bg-void text-warm-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-linear-to-b from-gold/[0.06] via-void to-void" />

      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12 lg:pt-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="flex flex-col gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The work · 2024 — 2026
            </span>
            <h1 className="font-display text-5xl leading-[1.04] font-light tracking-tight text-warm-white md:text-6xl lg:text-7xl">
              Four campaigns. Four houses.{" "}
              <em className="not-italic text-gold">No volume</em>.
            </h1>
          </div>
          <p className="text-base leading-relaxed text-titanium md:text-lg">
            We publish a small catalogue. Each entry was authored end-to-end inside the studio, signed by the principal, and held to the standard of work that does not need to be louder than it is.
          </p>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-px border border-gold/10 bg-gold/10 p-px">
          {CATEGORIES.map((category, idx) => (
            <button
              key={category}
              className={cn(
                "flex-1 px-6 py-4 font-mono text-[11px] tracking-[0.28em] uppercase transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                idx === 0
                  ? "bg-warm-white text-void"
                  : "bg-obsidian text-titanium hover:bg-carbon hover:text-warm-white",
              )}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <GoldDivider />

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-12">
        <div className="flex flex-col">
          {CASES.map((entry, idx) => (
            <article
              key={entry.id}
              className={cn(
                "group grid grid-cols-1 gap-12 border-t border-gold/10 py-20 lg:grid-cols-[0.8fr_1.4fr] lg:gap-20",
                idx === 0 && "border-t-0 pt-12",
              )}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-obsidian">
                <div className="absolute inset-0 bg-linear-to-br from-gold/[0.1] via-transparent to-void/40" />
                <div className="absolute inset-0 flex flex-col items-start justify-between p-8 lg:p-10">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
                    Case · {entry.index}
                  </span>
                  <div className="flex items-end justify-between gap-4 self-stretch">
                    <span className="font-display text-[120px] leading-none font-light tracking-tighter text-gold/15 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 lg:text-[160px]">
                      {entry.house
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <ArrowUpRight
                      className="h-5 w-5 shrink-0 text-mist transition-colors duration-500 group-hover:text-gold"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
              </div>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.28em] text-mist uppercase">
                    <span className="text-gold">{entry.category}</span>
                    <span>{entry.season}</span>
                    <span>{entry.geography}</span>
                  </div>
                  <h2 className="font-display text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-5xl">
                    {entry.house}
                    <span className="text-mist"> · </span>
                    <em className="not-italic text-gold">{entry.campaign}</em>
                  </h2>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-titanium">
                    {entry.thesis}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-px border border-gold/10 bg-gold/10 lg:grid-cols-4">
                  {entry.results.map((metric) => (
                    <div
                      key={metric.label}
                      className="flex flex-col gap-3 bg-obsidian p-6"
                    >
                      <span className="font-display text-3xl leading-none font-light tracking-tight text-warm-white md:text-4xl">
                        {metric.value}
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                        {metric.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                  {entry.awards ? (
                    <div className="flex flex-wrap items-center gap-3">
                      {entry.awards.map((award) => (
                        <span
                          key={award}
                          className="rounded-[2px] border border-gold/25 bg-gold/[0.04] px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-gold uppercase"
                        >
                          {award}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                      Privately published · no public submissions
                    </span>
                  )}
                  <a
                    href="#"
                    className="group/link inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-warm-white uppercase transition-colors duration-500 hover:text-gold-light"
                  >
                    Read the dossier
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                      strokeWidth={1.5}
                    />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <GoldDivider />

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The houses we serve
            </span>
            <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
              A short list,{" "}
              <em className="not-italic text-gold">privately held</em>.
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-titanium">
              Names appear with permission. Many of our houses prefer to remain unattributed; their work is carried in the catalogue without signature.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px border border-gold/10 bg-gold/10 sm:grid-cols-3 lg:grid-cols-4">
            {[
              "Hermès",
              "Patek Philippe",
              "Aman",
              "Loro Piana",
              "Maison Margiela",
              "Rolls-Royce",
              "Cipriani",
              "Berluti",
              "Goyard",
              "Bottega Veneta",
              "Ruinart",
              "Sotheby's",
            ].map((house) => (
              <div
                key={house}
                className="flex aspect-square items-center justify-center bg-obsidian px-4 transition-colors duration-500 hover:bg-carbon"
              >
                <span className="font-display text-xl leading-none font-light tracking-tight text-warm-white/70 transition-colors duration-500 hover:text-gold-light md:text-2xl">
                  {house}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pt-12 pb-32 lg:px-12">
        <div className="relative overflow-hidden border border-gold/15 bg-obsidian px-10 py-20 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-gold/[0.07] blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-gold/[0.04] blur-[140px]" />

          <div className="relative flex flex-col items-start gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The 2026 catalogue
            </span>
            <h2 className="font-display max-w-3xl text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-6xl">
              Three placements remain for the{" "}
              <em className="not-italic text-gold">2026 season</em>.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-titanium">
              Begin with a private conversation. The principal answers personally, within seventy-two hours, signed.
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row">
              <LuxuryButton href="/contact" variant="primary">
                Open a conversation
              </LuxuryButton>
              <LuxuryButton href="/pricing" variant="ghost">
                Review the placements
              </LuxuryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
