"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CreditCard,
  Flag,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const SILK = [0.16, 1, 0.3, 1] as const;

type Tab =
  | "users"
  | "subscriptions"
  | "moderation"
  | "system"
  | "flags"
  | "revenue";

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: "users", label: "Members", icon: Users },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "moderation", label: "Moderation", icon: ShieldCheck },
  { id: "system", label: "System", icon: Activity },
  { id: "flags", label: "Feature Flags", icon: Flag },
  { id: "revenue", label: "Revenue", icon: TrendingUp },
];

const MEMBERS = [
  {
    name: "Aurélie Vasseur",
    org: "Maison Vasseur",
    role: "owner",
    tier: "bespoke",
    joined: "Mar 2024",
  },
  {
    name: "Idris Kahn",
    org: "Atelier Kahn",
    role: "admin",
    tier: "elite",
    joined: "Jan 2024",
  },
  {
    name: "Naomi Salim",
    org: "House of Salim",
    role: "manager",
    tier: "prestige",
    joined: "Jul 2024",
  },
  {
    name: "Hadrien Olier",
    org: "Olier & Cie",
    role: "owner",
    tier: "elite",
    joined: "Feb 2025",
  },
];

const SUBSCRIPTIONS = [
  { tier: "Bespoke", count: 12, mrr: "$96,000", churn: "0.8%" },
  { tier: "Elite", count: 47, mrr: "$141,000", churn: "1.4%" },
  { tier: "Prestige", count: 134, mrr: "$93,800", churn: "2.7%" },
];

const SYSTEM = [
  { label: "Database latency", value: "38 ms", trend: "calm" },
  { label: "AI inference p95", value: "1.4 s", trend: "calm" },
  { label: "Realtime fanout", value: "23 ms", trend: "calm" },
  { label: "Edge cache hit", value: "94.7%", trend: "calm" },
];

const FLAGS = [
  { id: "ai_concierge", label: "AI Concierge — Beta", on: true },
  { id: "growth_forecast", label: "Growth Forecast", on: true },
  { id: "brand_safety", label: "Brand Safety", on: true },
  { id: "audience_targeting", label: "Audience Targeting", on: false },
];

export default function AdminConsole() {
  const [tab, setTab] = useState<Tab>("users");
  const [flags, setFlags] = useState(FLAGS);

  return (
    <div className="relative flex flex-col gap-12 px-6 py-10 lg:px-10">
      <Header />

      <nav className="flex flex-wrap gap-2 border-b border-gold/10 pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`group relative flex items-center gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.32em] transition-colors duration-500 ${
                active ? "text-gold" : "text-mist hover:text-titanium"
              }`}
            >
              <Icon className="h-3 w-3" strokeWidth={1.5} />
              {t.label}
              {active ? (
                <motion.span
                  layoutId="admin-tab-underline"
                  transition={{ duration: 0.5, ease: SILK }}
                  className="absolute -bottom-px left-0 right-0 h-px bg-gold"
                />
              ) : null}
            </button>
          );
        })}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: SILK }}
          className="flex flex-col gap-8"
        >
          {tab === "users" ? <MembersTable /> : null}
          {tab === "subscriptions" ? <SubscriptionsView /> : null}
          {tab === "moderation" ? <ModerationView /> : null}
          {tab === "system" ? <SystemView /> : null}
          {tab === "flags" ? (
            <FlagsView
              flags={flags}
              onToggle={(id) =>
                setFlags((arr) =>
                  arr.map((f) => (f.id === id ? { ...f, on: !f.on } : f)),
                )
              }
            />
          ) : null}
          {tab === "revenue" ? <RevenueView /> : null}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-3 border-b border-gold/10 pb-10">
      <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/80">
        Atelier · Administration
      </span>
      <h1 className="font-display text-5xl tracking-tight text-warm-white lg:text-6xl">
        The <em className="not-italic text-gold">conservatory</em>.
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-titanium">
        A discreet vantage onto every house, every transaction, every signal.
        Restricted to stewards.
      </p>
    </header>
  );
}

function MembersTable() {
  return (
    <Panel title="Members" kicker="Active accounts" count={MEMBERS.length}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gold/10">
              {["Member", "House", "Role", "Tier", "Joined", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-[0.32em] text-mist"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEMBERS.map((m) => (
              <tr
                key={m.name}
                className="border-b border-gold/5 transition-colors duration-500 hover:bg-gold/[0.02]"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 bg-void/60 font-display text-sm text-gold">
                      {m.name.charAt(0)}
                    </span>
                    <span className="font-display text-base text-warm-white">
                      {m.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-titanium">{m.org}</td>
                <td className="px-4 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-titanium">
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <TierPill tier={m.tier} />
                </td>
                <td className="px-4 py-4 font-mono text-[10px] uppercase tracking-[0.32em] text-mist">
                  {m.joined}
                </td>
                <td className="px-4 py-4 text-right">
                  <button
                    type="button"
                    className="font-mono text-[10px] uppercase tracking-[0.32em] text-mist transition-colors duration-500 hover:text-gold"
                  >
                    Manage →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SubscriptionsView() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {SUBSCRIPTIONS.map((s) => (
        <div
          key={s.tier}
          className="flex flex-col gap-6 rounded-[2px] border border-gold/10 bg-obsidian/60 p-6"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-display text-3xl text-warm-white">
              {s.tier}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold">
              Active
            </span>
          </div>
          <Stat label="Accounts" value={String(s.count)} />
          <Stat label="MRR" value={s.mrr} />
          <Stat label="Churn (30d)" value={s.churn} accent />
        </div>
      ))}
    </div>
  );
}

function ModerationView() {
  return (
    <Panel
      title="Moderation queue"
      kicker="Awaiting review"
      count={3}
      empty="The queue is empty. The signal is clean."
    >
      <ul className="flex flex-col">
        {[
          {
            type: "Caption",
            org: "Maison Vasseur",
            severity: "watch",
            note: "Flagged for adjacency to a regulated category.",
          },
          {
            type: "Influencer",
            org: "Atelier Kahn",
            severity: "act",
            note: "Audience integrity below threshold (62%).",
          },
          {
            type: "Ad copy",
            org: "House of Salim",
            severity: "watch",
            note: "Comparative phrasing — verify legal.",
          },
        ].map((item) => (
          <li
            key={item.note}
            className="flex items-start gap-4 border-b border-gold/5 py-4 last:border-0"
          >
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                item.severity === "act" ? "bg-red-400" : "bg-gold"
              }`}
            />
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-gold/80">
                  {item.type}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-mist">
                  {item.org}
                </span>
              </div>
              <p className="text-sm text-titanium">{item.note}</p>
            </div>
            <button
              type="button"
              className="font-mono text-[10px] uppercase tracking-[0.32em] text-titanium transition-colors duration-500 hover:text-gold"
            >
              Review
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function SystemView() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {SYSTEM.map((s) => (
        <div
          key={s.label}
          className="flex flex-col gap-4 rounded-[2px] border border-gold/10 bg-obsidian/60 p-6"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-mist">
            {s.label}
          </span>
          <span className="font-display text-3xl text-warm-white">
            {s.value}
          </span>
          <span className="inline-flex w-fit items-center gap-2 font-mono text-[9px] uppercase tracking-[0.32em] text-gold">
            <span className="h-1 w-1 rounded-full bg-gold" />
            Calm
          </span>
        </div>
      ))}
    </div>
  );
}

function FlagsView({
  flags,
  onToggle,
}: {
  flags: typeof FLAGS;
  onToggle: (id: string) => void;
}) {
  return (
    <Panel title="Feature flags" kicker="Runtime" count={flags.length}>
      <ul className="flex flex-col">
        {flags.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between gap-6 border-b border-gold/5 py-5 last:border-0"
          >
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg text-warm-white">
                {f.label}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-mist">
                {f.id}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={f.on}
              onClick={() => onToggle(f.id)}
              className={`relative h-6 w-12 rounded-full border transition-colors duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                f.on
                  ? "border-gold/60 bg-gold/20"
                  : "border-gold/15 bg-void/60"
              }`}
            >
              <motion.span
                animate={{ x: f.on ? 24 : 2 }}
                transition={{ duration: 0.5, ease: SILK }}
                className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full ${
                  f.on ? "bg-gold" : "bg-mist"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function RevenueView() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Stat label="Monthly recurring" value="$330,800" accent xl />
      <Stat label="Net new MRR (30d)" value="+$28,400" xl />
      <Stat label="Annual run rate" value="$3.97M" xl />
    </div>
  );
}

function Panel({
  title,
  kicker,
  count,
  empty,
  children,
}: {
  title: string;
  kicker: string;
  count: number;
  empty?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-[2px] border border-gold/10 bg-obsidian/60">
      <header className="flex items-end justify-between border-b border-gold/5 px-6 pt-6 pb-5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-gold/80">
            {kicker}
          </span>
          <h2 className="font-display text-2xl text-warm-white">{title}</h2>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mist">
          {count} entries
        </span>
      </header>
      <div className="px-6 pb-6">
        {count === 0 && empty ? (
          <p className="py-8 text-center text-sm text-titanium">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function TierPill({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    bespoke: "border-gold/60 text-gold-light bg-gold/10",
    elite: "border-gold/30 text-gold bg-gold/5",
    prestige: "border-gold/15 text-titanium bg-void/40",
  };
  return (
    <span
      className={`rounded-[2px] border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.32em] ${
        map[tier] ?? map.prestige
      }`}
    >
      {tier}
    </span>
  );
}

function Stat({
  label,
  value,
  accent,
  xl,
}: {
  label: string;
  value: string;
  accent?: boolean;
  xl?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        xl ? "rounded-[2px] border border-gold/10 bg-obsidian/60 p-6" : ""
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-mist">
        {label}
      </span>
      <span
        className={`font-display tracking-tight ${
          xl ? "text-4xl" : "text-2xl"
        } ${accent ? "text-gold" : "text-warm-white"}`}
      >
        {value}
      </span>
    </div>
  );
}
