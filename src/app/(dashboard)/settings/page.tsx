"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Plug,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import LuxuryButton from "@/components/shared/LuxuryButton";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

type SectionId =
  | "profile"
  | "house"
  | "team"
  | "billing"
  | "notifications"
  | "integrations"
  | "security";

type Section = {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  hint: string;
};

const SECTIONS: Section[] = [
  { id: "profile", label: "Profile", icon: User, hint: "Your name on the door." },
  { id: "house", label: "House", icon: Building2, hint: "Workspace and identity." },
  { id: "team", label: "Team", icon: Shield, hint: "Counsel kept close." },
  { id: "billing", label: "Billing", icon: CreditCard, hint: "Retainers and receipts." },
  { id: "notifications", label: "Notifications", icon: Bell, hint: "When we should write to you." },
  { id: "integrations", label: "Integrations", icon: Plug, hint: "Quiet connections." },
  { id: "security", label: "Security", icon: KeyRound, hint: "Keys and sessions." },
];

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Principal" | "Director" | "Strategist" | "Observer";
  initials: string;
  joined: string;
};

const TEAM: Member[] = [
  { id: "1", name: "Mehdi Ourahou", email: "mehdi@apex.house", role: "Principal", initials: "MO", joined: "Founding · 2021" },
  { id: "2", name: "Camille Aurelius", email: "camille@apex.house", role: "Director", initials: "CA", joined: "Joined · Mar 2022" },
  { id: "3", name: "Yusuf Adekunle", email: "yusuf@apex.house", role: "Director", initials: "YA", joined: "Joined · Sep 2023" },
  { id: "4", name: "Inés Beaumont", email: "ines@apex.house", role: "Strategist", initials: "IB", joined: "Joined · Jan 2025" },
  { id: "5", name: "Hermès · J. Vallat", email: "j.vallat@hermes.com", role: "Observer", initials: "JV", joined: "Guest · client" },
];

const ROLE_STYLE: Record<Member["role"], string> = {
  Principal: "border-gold/40 bg-gold/10 text-gold-light",
  Director: "border-gold/25 bg-gold/5 text-gold",
  Strategist: "border-titanium/30 bg-titanium/5 text-warm-white",
  Observer: "border-mist/30 bg-void text-mist",
};

type Integration = {
  id: string;
  name: string;
  category: string;
  status: "connected" | "available";
  note: string;
};

const INTEGRATIONS: Integration[] = [
  { id: "stripe", name: "Stripe", category: "Billing", status: "connected", note: "Retainers · invoices · seat upgrades" },
  { id: "supabase", name: "Supabase", category: "Data", status: "connected", note: "Houses, campaigns, ledger of correspondence" },
  { id: "openrouter", name: "OpenRouter", category: "Counsel", status: "connected", note: "Claude Sonnet 4.7 · GPT-5 · routed by intent" },
  { id: "resend", name: "Resend", category: "Letters", status: "connected", note: "Editorial dispatch · transactional notes" },
  { id: "stitchcraft", name: "Stitchcraft", category: "Atelier", status: "available", note: "Notation for bespoke commissions" },
  { id: "salesforce", name: "Salesforce", category: "CRM", status: "available", note: "Mirror to legacy systems on request" },
];

const NOTIFICATIONS = [
  { id: "n1", label: "New campaign briefs from a house", description: "Letter to your inbox within the hour.", on: true },
  { id: "n2", label: "Weekly performance digest", description: "Sundays at dawn, in plain prose.", on: true },
  { id: "n3", label: "AI counsel surfaces a meaningful insight", description: "Only when the model is sure.", on: true },
  { id: "n4", label: "Influencer posts that mention a house", description: "Within ten minutes of publication.", on: false },
  { id: "n5", label: "Receipts and renewal reminders", description: "Two weeks before a retainer turns.", on: true },
];

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>("profile");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const toggle = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, on: !n.on } : n)),
    );

  return (
    <div className="flex flex-col gap-12 px-8 py-10 lg:px-12 lg:py-12">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
          Settings · The house, kept in order
        </span>
        <h1 className="font-display text-4xl leading-[1.05] font-light tracking-tight text-warm-white md:text-5xl">
          Quiet preferences,{" "}
          <em className="not-italic text-gold">precisely set</em>.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-titanium">
          Configure how APEX speaks on your behalf, who is in counsel with you, and the cadence at which we write back.
        </p>
      </header>

      {/* Layout: rail + panel */}
      <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 lg:grid-cols-[260px_1fr]">
        {/* Rail */}
        <nav className="flex flex-col bg-obsidian">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "group flex items-center gap-4 border-l-2 px-6 py-4 text-left transition-all duration-500",
                  active
                    ? "border-gold bg-gold/5 text-warm-white"
                    : "border-transparent text-titanium hover:border-gold/30 hover:bg-void hover:text-warm-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    active ? "text-gold" : "text-mist group-hover:text-gold/70",
                  )}
                  strokeWidth={1.5}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
                    {s.label}
                  </span>
                  <span className="text-[11px] text-mist normal-case">
                    {s.hint}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Panel */}
        <motion.section
          key={section}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: SILK }}
          className="flex flex-col gap-10 bg-obsidian px-8 py-10 lg:px-12 lg:py-12"
        >
          {section === "profile" && <ProfilePanel />}
          {section === "house" && <HousePanel />}
          {section === "team" && <TeamPanel />}
          {section === "billing" && <BillingPanel />}
          {section === "notifications" && (
            <NotificationsPanel data={notifications} onToggle={toggle} />
          )}
          {section === "integrations" && <IntegrationsPanel />}
          {section === "security" && <SecurityPanel />}
        </motion.section>
      </div>
    </div>
  );
}

/* ---------- Panels ---------- */

function PanelHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-[10px] tracking-[0.3em] text-gold/70 uppercase">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl leading-tight font-light text-warm-white">
        {title}
      </h2>
      <p className="max-w-xl text-sm leading-relaxed text-titanium">{copy}</p>
    </div>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
        {label}
      </span>
      <input
        defaultValue={value}
        className="rounded-[2px] border border-gold/10 bg-void px-4 py-3 text-sm text-warm-white focus:border-gold/30 focus:outline-none"
      />
      {hint && <span className="text-[11px] text-mist">{hint}</span>}
    </label>
  );
}

function ProfilePanel() {
  return (
    <>
      <PanelHeader
        eyebrow="Profile"
        title="The name on the door."
        copy="How clients see you in correspondence and where to reach you when matters are time-sensitive."
      />
      <div className="flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center border border-gold/30 bg-void">
          <span className="font-display text-2xl font-light text-gold">MO</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-display text-xl font-light text-warm-white">
            Mehdi Ourahou
          </span>
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Principal · Founding partner
          </span>
          <div className="flex gap-2">
            <LuxuryButton variant="ghost" size="sm">Replace portrait</LuxuryButton>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Full name" value="Mehdi Ourahou" />
        <Field label="Title" value="Principal" />
        <Field label="Email" value="mehdi@apex.house" />
        <Field label="Direct line" value="+33 1 42 60 30 30" hint="Reserved for principals only." />
        <Field label="City" value="Paris · 7e" />
        <Field label="Time zone" value="Europe/Paris (CET · UTC+1)" />
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-gold/10 pt-6">
        <LuxuryButton variant="ghost" size="sm">Discard</LuxuryButton>
        <LuxuryButton variant="primary" size="sm">Save preferences</LuxuryButton>
      </div>
    </>
  );
}

function HousePanel() {
  return (
    <>
      <PanelHeader
        eyebrow="House"
        title="APEX, as it appears."
        copy="The identity carried into every brief, invoice, and letter sent from this workspace."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="House name" value="APEX" />
        <Field label="Legal entity" value="APEX Conseil SAS" />
        <Field label="Tax registration" value="FR · 7480219630" />
        <Field label="Headquartered" value="6 Rue de l'Université, 75007 Paris" />
        <Field label="Founded" value="May 2021" />
        <Field label="Workspace handle" value="apex.house" hint="Your private subdomain on the platform." />
      </div>
      <div className="flex flex-col gap-3 border-t border-gold/10 pt-6">
        <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
          Letterhead
        </span>
        <div className="flex h-32 items-center justify-center border border-gold/15 bg-void">
          <span className="font-display text-3xl tracking-[0.3em] text-gold">
            APEX
          </span>
        </div>
      </div>
    </>
  );
}

function TeamPanel() {
  return (
    <>
      <PanelHeader
        eyebrow="Team"
        title="A small council, by design."
        copy="Five seats, kept deliberately. Add only those whose judgment you would trust with a house."
      />
      <div className="flex items-center justify-end">
        <LuxuryButton variant="primary" size="sm" withArrow>
          Extend an invitation
        </LuxuryButton>
      </div>
      <div className="flex flex-col gap-px border border-gold/10 bg-gold/10">
        {TEAM.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-4 bg-obsidian px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center border border-gold/20 bg-void">
                <span className="font-display text-sm font-light text-gold">
                  {m.initials}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-display text-lg font-light text-warm-white">
                  {m.name}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-mist">
                  {m.email}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                {m.joined}
              </span>
              <span
                className={cn(
                  "rounded-[2px] border px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] uppercase",
                  ROLE_STYLE[m.role],
                )}
              >
                {m.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function BillingPanel() {
  return (
    <>
      <PanelHeader
        eyebrow="Billing"
        title="Retainer · Maison."
        copy="Invoiced on the first of each month. Paid by SEPA mandate, never automated against the wishes of a principal."
      />
      <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 sm:grid-cols-3">
        <div className="flex flex-col gap-2 bg-obsidian px-6 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Plan
          </span>
          <span className="font-display text-2xl font-light text-warm-white">
            Maison
          </span>
          <span className="text-xs text-titanium">$12,400 / month · 8 seats</span>
        </div>
        <div className="flex flex-col gap-2 bg-obsidian px-6 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Next renewal
          </span>
          <span className="font-display text-2xl font-light text-gold">
            Jun 1 · 2026
          </span>
          <span className="text-xs text-titanium">22 days from today.</span>
        </div>
        <div className="flex flex-col gap-2 bg-obsidian px-6 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Year-to-date
          </span>
          <span className="font-display text-2xl font-light text-warm-white">
            $62,000
          </span>
          <span className="text-xs text-titanium">Five invoices · all settled.</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-gold/10 pt-6">
        <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
          Recent receipts
        </span>
        <div className="flex flex-col gap-px border border-gold/10 bg-gold/10">
          {[
            { id: "I-2026-005", date: "May 1 · 2026", amount: "$12,400.00", status: "Paid" },
            { id: "I-2026-004", date: "Apr 1 · 2026", amount: "$12,400.00", status: "Paid" },
            { id: "I-2026-003", date: "Mar 1 · 2026", amount: "$12,400.00", status: "Paid" },
            { id: "I-2026-002", date: "Feb 1 · 2026", amount: "$12,400.00", status: "Paid" },
            { id: "I-2026-001", date: "Jan 1 · 2026", amount: "$12,400.00", status: "Paid" },
          ].map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between bg-obsidian px-6 py-4"
            >
              <div className="flex items-center gap-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-mist">
                  {r.id}
                </span>
                <span className="text-sm text-warm-white">{r.date}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="font-display text-base font-light text-warm-white">
                  {r.amount}
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-gold uppercase">
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <LuxuryButton variant="ghost" size="sm">Update mandate</LuxuryButton>
        <LuxuryButton variant="primary" size="sm" withArrow>
          Speak with billing
        </LuxuryButton>
      </div>
    </>
  );
}

function NotificationsPanel({
  data,
  onToggle,
}: {
  data: typeof NOTIFICATIONS;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      <PanelHeader
        eyebrow="Notifications"
        title="When we should write to you."
        copy="Restraint, by default. Add cadence only where its absence would cost you."
      />
      <div className="flex flex-col gap-px border border-gold/10 bg-gold/10">
        {data.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between bg-obsidian px-6 py-5"
          >
            <div className="flex flex-col gap-1">
              <span className="font-display text-lg font-light text-warm-white">
                {n.label}
              </span>
              <span className="text-xs text-titanium">{n.description}</span>
            </div>
            <button
              type="button"
              onClick={() => onToggle(n.id)}
              role="switch"
              aria-checked={n.on}
              className={cn(
                "relative h-6 w-11 rounded-full border transition-all duration-500",
                n.on
                  ? "border-gold/50 bg-gold/20"
                  : "border-mist/30 bg-void",
              )}
            >
              <motion.span
                animate={{ x: n.on ? 22 : 2 }}
                transition={{ duration: 0.4, ease: SILK }}
                className={cn(
                  "absolute top-1/2 left-0 block h-4 w-4 -translate-y-1/2 rounded-full",
                  n.on ? "bg-gold" : "bg-mist",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function IntegrationsPanel() {
  return (
    <>
      <PanelHeader
        eyebrow="Integrations"
        title="Quiet connections."
        copy="Each tool earns its place. We surface only those whose absence would force a duplicate of effort."
      />
      <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 md:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <div key={i.id} className="flex flex-col gap-3 bg-obsidian px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl font-light text-warm-white">
                  {i.name}
                </span>
                <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
                  {i.category}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-[2px] border px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] uppercase",
                  i.status === "connected"
                    ? "border-gold/40 bg-gold/5 text-gold"
                    : "border-mist/30 bg-void text-mist",
                )}
              >
                {i.status === "connected" ? "Connected" : "Available"}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-titanium">{i.note}</p>
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                className="font-mono text-[10px] tracking-[0.25em] text-warm-white uppercase transition-colors hover:text-gold"
              >
                {i.status === "connected" ? "Manage →" : "Connect →"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SecurityPanel() {
  const sessions = [
    { id: "s1", device: "MacBook Pro · 16″", city: "Paris · 7e", last: "Active now", current: true },
    { id: "s2", device: "iPhone 17 Pro", city: "Paris · 7e", last: "12 minutes ago", current: false },
    { id: "s3", device: "iPad Pro", city: "Megève", last: "Apr 24 · 2026", current: false },
  ];

  return (
    <>
      <PanelHeader
        eyebrow="Security"
        title="Keys, sessions, and the door."
        copy="Two factors, always. Sessions kept short. Recovery in writing, never by chat."
      />
      <div className="grid grid-cols-1 gap-px border border-gold/10 bg-gold/10 sm:grid-cols-2">
        <div className="flex flex-col gap-3 bg-obsidian px-6 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Two-factor authentication
          </span>
          <span className="font-display text-xl font-light text-warm-white">
            Hardware key · enrolled
          </span>
          <p className="text-xs text-titanium">
            YubiKey 5C registered Jan 14 · 2025. Backup phrase printed and sealed.
          </p>
          <div className="flex gap-2 pt-2">
            <LuxuryButton variant="ghost" size="sm">Add a second key</LuxuryButton>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-obsidian px-6 py-5">
          <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
            Password
          </span>
          <span className="font-display text-xl font-light text-warm-white">
            Last rotated · Mar 2 · 2026
          </span>
          <p className="text-xs text-titanium">
            Generated by 1Password. We never see it, by design.
          </p>
          <div className="flex gap-2 pt-2">
            <LuxuryButton variant="ghost" size="sm">Rotate password</LuxuryButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gold/10 pt-6">
        <span className="font-mono text-[10px] tracking-[0.25em] text-mist uppercase">
          Active sessions
        </span>
        <div className="flex flex-col gap-px border border-gold/10 bg-gold/10">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-obsidian px-6 py-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm text-warm-white">{s.device}</span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-mist">
                  {s.city} · {s.last}
                </span>
              </div>
              {s.current ? (
                <span className="rounded-[2px] border border-gold/40 bg-gold/5 px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-gold uppercase">
                  This device
                </span>
              ) : (
                <button
                  type="button"
                  className="font-mono text-[10px] tracking-[0.25em] text-titanium uppercase transition-colors hover:text-warm-white"
                >
                  Sign out
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-gold/10 pt-6">
        <LuxuryButton variant="ghost" size="sm">Download account ledger</LuxuryButton>
        <LuxuryButton variant="primary" size="sm">End every other session</LuxuryButton>
      </div>
    </>
  );
}
