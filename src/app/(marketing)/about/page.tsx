import { ArrowUpRight } from "lucide-react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import GoldDivider from "@/components/shared/GoldDivider";

type Principal = {
  name: string;
  role: string;
  origin: string;
  bio: string;
};

const PRINCIPALS: Principal[] = [
  {
    name: "Mehdi Aït-Saïd",
    role: "Founding Partner · Principal",
    origin: "Formerly Saint Laurent · Acne Studios",
    bio: "Mehdi authors APEX's relationship with each maison. Twelve seasons spent at the table of European houses taught him that a brand's worth is held in restraint, not amplification.",
  },
  {
    name: "Camille Faure",
    role: "Director, Atelier",
    origin: "Formerly Wieden+Kennedy · Mother London",
    bio: "Camille leads our creative atelier. She believes a campaign is finished when there is nothing left to remove — a discipline she earned across nine years writing for fragrance and fashion.",
  },
  {
    name: "Yusuf Tan",
    role: "Director, Intelligence",
    origin: "Formerly Anthropic · Stripe",
    bio: "Yusuf composes the systems that hold our concierge model. His work treats artificial intelligence as a quiet hand — never a voice — within the work we publish for our houses.",
  },
];

const PRINCIPLES = [
  {
    n: "I",
    title: "Restraint over volume",
    body: "We hold a finite number of placements. The work improves when the table is small.",
  },
  {
    n: "II",
    title: "Considered, not loud",
    body: "A campaign earns its silence. We measure success in how little needs to be said.",
  },
  {
    n: "III",
    title: "Authored, not produced",
    body: "Every artifact carries a name. The principal is present from brief through publication.",
  },
  {
    n: "IV",
    title: "Intelligence as accompaniment",
    body: "Our models accompany the atelier — they do not replace the hand that signs the work.",
  },
];

const TIMELINE = [
  {
    year: "2021",
    title: "The first table",
    body: "Mehdi opens APEX with three founding houses — a fragrance maison, a fashion atelier, a hotel group. The table seats six.",
  },
  {
    year: "2022",
    title: "The atelier forms",
    body: "Camille joins as Director. The studio publishes its first campaign for a Parisian leather house, awarded at the Cannes Festival the following spring.",
  },
  {
    year: "2024",
    title: "Concierge intelligence",
    body: "Yusuf joins from Anthropic and authors our private concierge model — an instrument tuned for considered taste, never a substitute for it.",
  },
  {
    year: "2026",
    title: "Three placements remain",
    body: "APEX accepts a finite cohort each season. For the 2026 calendar, three placements are reserved.",
  },
];

const PRESS = [
  { title: "On the quietest agency in Europe", source: "Monocle", year: "2025" },
  { title: "How APEX rewrote the brief", source: "AnOther Magazine", year: "2025" },
  { title: "The case for restraint", source: "Wallpaper*", year: "2024" },
  { title: "AI, considered", source: "FT Weekend", year: "2024" },
];

export default function AboutPage() {
  return (
    <div className="relative bg-void text-warm-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] bg-linear-to-b from-gold/[0.05] via-void to-void" />

      <section className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-12 lg:pt-40">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div className="flex flex-col gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The studio · Est. 2021
            </span>
            <h1 className="font-display text-5xl leading-[1.04] font-light tracking-tight text-warm-white md:text-6xl lg:text-7xl">
              An atelier of{" "}
              <em className="not-italic text-gold">considered</em> work — for the houses that{" "}
              <em className="not-italic text-gold">notice</em>.
            </h1>
          </div>
          <p className="text-base leading-relaxed text-titanium md:text-lg">
            APEX is a small studio in Paris and London. We accept a finite number of houses each season — the kind that prefer a quiet conversation to a loud campaign — and author the work that follows.
          </p>
        </div>
      </section>

      <GoldDivider />

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              Our discipline
            </span>
            <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
              Four principles,{" "}
              <em className="not-italic text-gold">held closely</em>.
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-titanium">
              Composed in the studio&rsquo;s first season. Reviewed each year. Unrevised since.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.n}
                className="flex flex-col gap-4 bg-obsidian p-10"
              >
                <span className="font-display text-2xl font-light text-gold">
                  {principle.n}
                </span>
                <h3 className="font-display text-2xl leading-snug font-light tracking-tight text-warm-white">
                  {principle.title}
                </h3>
                <p className="text-sm leading-relaxed text-titanium">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="flex flex-col gap-4 md:max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            The principals
          </span>
          <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
            Three names{" "}
            <em className="not-italic text-gold">on the work</em>.
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-titanium">
            Every campaign that leaves the studio is signed. These are the hands that sign it.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 lg:grid-cols-3">
          {PRINCIPALS.map((principal) => (
            <article
              key={principal.name}
              className="group relative flex flex-col bg-obsidian"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-carbon">
                <div className="absolute inset-0 bg-linear-to-br from-gold/[0.08] via-transparent to-void/40" />
                <div className="absolute inset-0 flex items-end justify-center pb-12">
                  <span className="font-display text-[140px] leading-none font-light tracking-tighter text-gold/15 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
                    {principal.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
              </div>

              <div className="flex flex-1 flex-col gap-4 p-8 lg:p-10">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-2xl leading-snug font-light tracking-tight text-warm-white">
                      {principal.name}
                    </h3>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">
                      {principal.role}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-mist transition-colors duration-500 group-hover:text-gold"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-xs tracking-wide text-mist italic">
                  {principal.origin}
                </span>
                <p className="mt-2 text-sm leading-relaxed text-titanium">
                  {principal.bio}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <GoldDivider />

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.6fr]">
          <div className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              The chronology
            </span>
            <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
              Five seasons,{" "}
              <em className="not-italic text-gold">unhurried</em>.
            </h2>
          </div>

          <ol className="relative flex flex-col">
            <span className="absolute top-2 bottom-2 left-[7px] w-px bg-linear-to-b from-gold/40 via-gold/15 to-transparent" />
            {TIMELINE.map((entry) => (
              <li
                key={entry.year}
                className="relative grid grid-cols-[40px_1fr] gap-x-6 border-t border-gold/10 py-10 first:border-t-0 first:pt-0"
              >
                <div className="relative pt-1">
                  <span className="absolute top-1.5 left-0 h-3.5 w-3.5 rounded-full border border-gold/40 bg-void" />
                  <span className="absolute top-[7px] left-[3px] h-2 w-2 rounded-full bg-gold" />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
                    {entry.year}
                  </span>
                  <h3 className="font-display text-2xl leading-snug font-light tracking-tight text-warm-white">
                    {entry.title}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-titanium">
                    {entry.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 lg:px-12">
        <div className="flex flex-col gap-4 md:max-w-2xl">
          <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
            Recently noted
          </span>
          <h2 className="font-display text-4xl leading-[1.1] font-light tracking-tight text-warm-white md:text-5xl">
            Words written{" "}
            <em className="not-italic text-gold">about the studio</em>.
          </h2>
        </div>

        <div className="mt-16 border-t border-gold/10">
          {PRESS.map((entry) => (
            <a
              key={entry.title}
              href="#"
              className="group grid grid-cols-[1fr_auto_auto] items-baseline gap-8 border-b border-gold/10 px-2 py-8 transition-colors hover:bg-carbon/30"
            >
              <h3 className="font-display text-2xl font-light tracking-tight text-warm-white transition-colors group-hover:text-gold-light md:text-3xl">
                {entry.title}
              </h3>
              <span className="font-mono text-[11px] tracking-[0.25em] text-titanium uppercase">
                {entry.source}
              </span>
              <span className="font-mono text-[11px] tracking-[0.25em] text-mist uppercase">
                {entry.year}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-32 lg:px-12">
        <div className="relative overflow-hidden border border-gold/15 bg-obsidian px-10 py-20 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-gold/[0.07] blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-gold/[0.04] blur-[140px]" />

          <div className="relative flex flex-col items-start gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-gold/70 uppercase">
              A private conversation
            </span>
            <h2 className="font-display max-w-3xl text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-6xl">
              Should the studio resonate, the principal{" "}
              <em className="not-italic text-gold">writes back personally</em>.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-titanium">
              Replies arrive within seventy-two hours, signed. We take the conversation slowly.
            </p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row">
              <LuxuryButton href="/contact" variant="primary">
                Write to the studio
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
