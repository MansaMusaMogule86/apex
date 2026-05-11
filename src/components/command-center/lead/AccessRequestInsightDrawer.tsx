"use client";

import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail, Save } from "lucide-react";
import { motion } from "framer-motion";
import type { ApexApplication } from "@/types/database";

type AccessRequestInsightDrawerProps = {
  request: ApexApplication | null;
  draftNotes: string;
  draftStatus: ApexApplication["status"] | null;
  saveError: string | null;
  saving: boolean;
  onNotesChange: (value: string) => void;
  onStatusChange: (value: ApexApplication["status"]) => void;
  onSave: () => void;
};

const STATUS_OPTIONS: ApexApplication["status"][] = [
  "processing",
  "executive_review",
  "executive_call",
  "approved",
  "waitlisted",
  "declined",
];

function prettyStatus(status: ApexApplication["status"]) {
  return status.replaceAll("_", " ");
}

function buildRecommendationBadges(request: ApexApplication) {
  const badges: Array<{ label: string; className: string }> = [];
  if (request.priority_level === "critical") {
    badges.push({ label: "Priority onboarding", className: "border-critical-crimson/35 bg-critical-crimson/10 text-red-100" });
  }
  if ((request.authority_score ?? 0) >= 80) {
    badges.push({ label: "High authority", className: "border-signal-blue/35 bg-signal-blue/10 text-signal-blue" });
  }
  if ((request.luxury_fit_score ?? 0) >= 80) {
    badges.push({ label: "Luxury fit", className: "border-gold/35 bg-gold/10 text-gold-light" });
  }
  if ((request.market_potential_score ?? 0) >= 75) {
    badges.push({ label: "Strategic upside", className: "border-emerald-400/30 bg-emerald-400/12 text-emerald-100" });
  }
  return badges;
}

function ExternalLinkRow({ label, href }: { label: string; href: string | null }) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 text-sm text-platinum/85 transition-colors hover:text-gold"
    >
      {label}
    </a>
  );
}

export default function AccessRequestInsightDrawer({
  request,
  draftNotes,
  draftStatus,
  saveError,
  saving,
  onNotesChange,
  onStatusChange,
  onSave,
}: AccessRequestInsightDrawerProps) {
  if (!request) {
    return (
      <section className="rounded-xs border border-white/10 bg-white/2 p-5 text-center text-titanium">
        Select an operator dossier to review its AI summary, recommendation, and executive controls.
      </section>
    );
  }

  const badges = buildRecommendationBadges(request);

  return (
    <motion.aside
      key={request.id}
      initial={{ opacity: 0, x: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xs border border-white/10 bg-white/2 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/75">AI Summary Drawer</p>
          <h3 className="mt-1 font-display text-2xl font-light text-warm-white">{request.full_name}</h3>
          <p className="mt-2 text-sm text-titanium">{request.company} · {request.industry}</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">
          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span
            key={badge.label}
            className={["rounded-xs border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.15em]", badge.className].join(" ")}
          >
            {badge.label}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xs border border-white/10 bg-white/3 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Revenue range</p>
          <p className="mt-1 text-sm text-platinum/88">{request.revenue_range}</p>
        </div>
        <div className="rounded-xs border border-white/10 bg-white/3 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Market focus</p>
          <p className="mt-1 text-sm text-platinum/88">{request.market_focus}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Strategic objective</p>
          <p className="mt-2 text-sm leading-6 text-platinum/88">{request.strategic_objective}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Why APEX</p>
          <p className="mt-2 text-sm leading-6 text-platinum/88">{request.why_apex}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Executive summary</p>
          <p className="mt-2 text-sm leading-6 text-platinum/88">{request.ai_summary ?? "Intelligence scoring in progress."}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Strategic recommendation</p>
          <p className="mt-2 text-sm leading-6 text-platinum/88">{request.ai_recommendation ?? "Awaiting AI recommendation output."}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
        <a href={`mailto:${request.email}`} className="inline-flex items-center gap-2 text-sm text-platinum/86 transition-colors hover:text-gold">
          <Mail className="h-4 w-4" />
          {request.email}
        </a>
        <ExternalLinkRow label="Website" href={request.website} />
        <ExternalLinkRow label="LinkedIn" href={request.linkedin} />
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Status management</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => {
            const active = draftStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={[
                  "rounded-xs border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300",
                  active
                    ? "border-gold/45 bg-gold/10 text-gold-light"
                    : "border-white/12 bg-white/3 text-titanium hover:border-signal-blue/30 hover:text-platinum",
                ].join(" ")}
              >
                {prettyStatus(status)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">Executive notes</p>
        <textarea
          value={draftNotes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={6}
          placeholder="Add executive routing context, objections, or follow-up instructions."
          className="mt-3 w-full rounded-xs border border-white/12 bg-void/40 px-4 py-3 text-sm leading-6 text-platinum outline-none transition-colors duration-300 placeholder:text-mist focus:border-signal-blue/35"
        />
        {saveError ? <p className="mt-3 text-sm text-red-300">{saveError}</p> : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-xs border border-gold/45 bg-gold/8 px-4 font-mono text-[10px] uppercase tracking-[0.18em] text-gold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving" : "Save executive notes"}
        </button>
      </div>
    </motion.aside>
  );
}