import { Check, Minus } from "lucide-react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import GoldDivider from "@/components/shared/GoldDivider";
import { cn } from "@/lib/utils";

type Tier = {
  id: string;
  name: string;
  eyebrow: string;
  price: string;
  cadence: string;
  description: string;
  highlight?: boolean;
  cta: { label: string; href: string };
  inclusions: string[];
};

const TIERS: Tier[] = [
  {
    id: "atelier",
    name: "Atelier",
    eyebrow: "For emerging maisons",
    price: "$4,800",
    cadence: "per month",
    description:
      "A curated entry into the APEX standard. Built for founders shaping their first considered campaigns with discernment.",
    cta: { label: "Begin the conversation", href: "/contact?tier=atelier" },
    inclusions: [
      "Two concurrent engagements",
      "Concierge AI co-pilot · 50k tokens",
      "Quarterly creative review with director",
      "Standard attribution & ROAS reporting",
      "Email & messaging support",
    ],
  },
  {
    id: "maison",
    name: "Maison",
    eyebrow: "For established houses",
    price: "$12,400",
    cadence: "per month",
    description:
      "Our signature engagement. Unlimited creative throughput paired with a dedicated atelier of strategists and a private concierge line.",
    highlight: true,
    cta: { label: "Reserve a placement", href: "/contact?tier=maison" },
    inclusions: [
      "Unlimited concurrent engagements",
      "Concierge AI co-pilot · 500k tokens",
      "Dedicated strategy director & atelier of three",
      "Bespoke attribution model & weekly briefings",
      "Influencer & talent introductions",
      "Priority concierge · 4-hour response",
    ],
  },
  {
    id: "couture",
    name: "Couture",
    eyebrow: "By invitation",
    price: "Bespoke",
    cadence: "annual placement",
    description:
      "A private partnership for the world's most considered houses. Authored singularly by our founding partners.",
    cta: { label: "Request an introduction", href: "/contact?tier=couture" },
    inclusions: [
      "Founding partner as principal",
      "Private model fine-tuned on your archive",
      "On-site quarterly residencies",
      "Embargoed product & talent access",
      "Direct line to the principal",
      "White-glove governance & legal review",
    ],
  },
];

type Capability = {
  label: string;
  values: [string | boolean, string | boolean, string | boolean];
};

const CAPABILITIES: { group: string; rows: Capability[] }[] = [
  {
    group: "Concierge intelligence",
    rows: [
      { label: "AI co-pilot tokens / month", values: ["50k", "500k", "Unlimited"] },
      { label: "Bespoke model fine-tuning", values: [false, false, true] },
      { label: "Real-time concierge channel", values: [false, true, true] },
      { label: "Founding partner as principal", values: [false, false, true] },
    ],
  },
  {
    group: "Engagement & creative",
    rows: [
      { label: "Concurrent engagements", values: ["Two", "Unlimited", "Unlimited"] },
      { label: "Strategy director", values: [false, true, true] },
      { label: "Creative atelier headcount", values: ["Shared", "Three", "Bespoke"] },
      { label: "Quarterly on-site residencies", values: [false, false, true] },
    ],
  },
  {
    group: "Measurement & access",
    rows: [
      { label: "Attribution model", values: ["Standard", "Bespoke", "Bespoke + custom data"] },
      { label: "Talent & influencer introductions", values: [false, true, "White-glove"] },
      { label: "Weekly executive briefing", values: [false, true, true] },
      { label: "Embargoed product & talent access", values: [false, false, true] },
    ],
  },
];

const FAQS = [
  {
    q: "Why is APEX priced higher than typical agencies?",
    a: "We hold a deliberate cap on engagements. The fee reserves a seat at our table — not an hourly rate, but a placement within a finite atelier of houses we authorise to work alongside.",
  },
  {
    q: "Is there a minimum commitment?",
    a: "Our Maison engagement is structured as a six-month placement, renewed by mutual invitation. Couture begins with a twelve-month residency. The Atelier tier is offered month to month.",
  },
  {
    q: "Can we transition between tiers?",
    a: "Yes — and we encourage it. Many of our houses begin in Atelier and graduate to Maison once their cadence demands it. Couture is by invitation only and emerges from a working relationship.",
  },
  {
    q: "Do you work with houses outside of luxury?",
    a: "We work exclusively with houses that hold considered taste — luxury, hospitality, fragrance, design, fine spirits, considered fashion. If the work is honest, we will entertain a conversation.",
  },
];

export default function PricingPage() {
  return (
    <div className="relative bg-void text-warm-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-linear-to-b from-gold/[0.06] via-void to-void" />

      <section className="mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-12 lg:pt-40">
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            Placements · 2026
          </span>
          <h1 className="font-display mt-8 max-w-3xl text-5xl leading-[1.05] font-light tracking-tight text-warm-white md:text-6xl lg:text-7xl">
            Three placements.{" "}
            <em className="not-italic text-gold">Considered</em> for the few who insist.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-titanium md:text-lg">
            APEX accepts a finite number of houses each season. Our fees reserve a seat — not a service, but a discipline. Choose the cadence that suits your maison.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-32 lg:px-12">
        <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={cn(
                "relative flex flex-col bg-obsidian p-10 lg:p-12",
                tier.highlight && "bg-carbon",
              )}
            >
              {tier.highlight && (
                <span className="absolute top-0 left-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 border border-gold/30 bg-void px-4 py-1.5 font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  Most reserved
                </span>
              )}

              <header className="flex flex-col gap-3">
                <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
                  {tier.eyebrow}
                </span>
                <h2 className="font-display text-4xl font-light tracking-tight text-warm-white">
                  {tier.name}
                </h2>
                <p className="text-sm leading-relaxed text-titanium">{tier.description}</p>
              </header>

              <div className="mt-10 flex items-baseline gap-3 border-t border-gold/10 pt-8">
                <span className="font-display text-5xl font-light tracking-tight text-warm-white">
                  {tier.price}
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-mist uppercase">
                  {tier.cadence}
                </span>
              </div>

              <ul className="mt-10 flex flex-1 flex-col gap-4">
                {tier.inclusions.map((line) => (
                  <li key={line} className="flex gap-3 text-sm leading-relaxed text-warm-white/85">
                    <Check
                      className="mt-[3px] h-4 w-4 shrink-0 text-gold"
                      strokeWidth={1.5}
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 pt-8">
                <LuxuryButton
                  href={tier.cta.href}
                  variant={tier.highlight ? "primary" : "ghost"}
                  className="w-full justify-center"
                >
                  {tier.cta.label}
                </LuxuryButton>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-[11px] tracking-[0.25em] text-mist uppercase">
          All placements include a private onboarding residency · Fees billed in USD
        </p>
      </section>

      <GoldDivider />

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="flex flex-col gap-4 md:max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            The detail
          </span>
          <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
            What is held within{" "}
            <em className="not-italic text-gold">each placement</em>.
          </h2>
        </div>

        <div className="mt-16 overflow-hidden border border-gold/10 bg-obsidian">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b border-gold/10 bg-void/40">
            <div className="px-6 py-5 font-mono text-[10px] tracking-[0.3em] text-mist uppercase">
              Capability
            </div>
            {TIERS.map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  "px-6 py-5 font-mono text-[10px] tracking-[0.3em] uppercase",
                  tier.highlight ? "text-gold" : "text-mist",
                )}
              >
                {tier.name}
              </div>
            ))}
          </div>

          {CAPABILITIES.map((group) => (
            <div key={group.group}>
              <div className="bg-carbon/40 px-6 py-3 font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
                {group.group}
              </div>
              {group.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.6fr_1fr_1fr_1fr] border-t border-gold/[0.06] transition-colors hover:bg-carbon/20"
                >
                  <div className="px-6 py-5 text-sm text-warm-white/85">{row.label}</div>
                  {row.values.map((value, idx) => (
                    <CapabilityCell
                      key={idx}
                      value={value}
                      highlighted={TIERS[idx]?.highlight}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              Common questions
            </span>
            <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
              Asked with{" "}
              <em className="not-italic text-gold">discretion</em>.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-titanium">
              Anything else, address directly to our principal — replied within the day.
            </p>
          </div>
          <dl className="flex flex-col">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="border-t border-gold/10 py-8 first:border-t-0 first:pt-0"
              >
                <dt className="font-display text-2xl font-light tracking-tight text-warm-white">
                  {item.q}
                </dt>
                <dd className="mt-4 max-w-2xl text-sm leading-relaxed text-titanium">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pb-32 lg:px-12">
        <div className="relative overflow-hidden border border-gold/15 bg-obsidian px-10 py-20 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-gold/[0.08] blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-gold/[0.05] blur-[140px]" />

          <div className="relative flex flex-col items-start gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The remaining placements
            </span>
            <h2 className="font-display max-w-3xl text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-6xl">
              Three placements remain for the{" "}
              <em className="not-italic text-gold">2026 season</em>.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-titanium">
              Should the cadence resonate, write to us. We will arrange a private conversation with the principal within seventy-two hours.
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row">
              <LuxuryButton href="/contact" variant="primary">
                Request a private conversation
              </LuxuryButton>
              <LuxuryButton href="/case-studies" variant="ghost">
                Review the work
              </LuxuryButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CapabilityCell({
  value,
  highlighted,
}: {
  value: string | boolean;
  highlighted?: boolean;
}) {
  if (value === true) {
    return (
      <div className="px-6 py-5">
        <Check
          className={cn("h-4 w-4", highlighted ? "text-gold" : "text-warm-white/70")}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  if (value === false) {
    return (
      <div className="px-6 py-5">
        <Minus className="h-4 w-4 text-mist/40" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-6 py-5 text-sm",
        highlighted ? "text-gold" : "text-warm-white/85",
      )}
    >
      {value}
    </div>
  );
}
