"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowDownUp } from "lucide-react";
import type { AccessRequest } from "@/types/database";

export type AccessRequestSortField =
  | "created_at"
  | "prestige_score"
  | "authority_score"
  | "luxury_fit_score"
  | "priority_level";

type AccessRequestLeadTableProps = {
  requests: AccessRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  sortField: AccessRequestSortField;
  sortDirection: "asc" | "desc";
  onSortChange: (field: AccessRequestSortField) => void;
  highlightedRequestId?: string | null;
};

const PRIORITY_CLASS: Record<AccessRequest["priority_level"], string> = {
  critical: "border-critical-crimson/35 bg-critical-crimson/10 text-red-100",
  high: "border-risk-amber/35 bg-risk-amber/10 text-amber-100",
  medium: "border-signal-blue/30 bg-signal-blue/10 text-signal-blue",
  watch: "border-white/15 bg-white/6 text-titanium",
};

const STATUS_CLASS: Record<AccessRequest["status"], string> = {
  submitted: "border-white/15 bg-white/6 text-titanium",
  processing: "border-signal-blue/30 bg-signal-blue/10 text-signal-blue",
  executive_review: "border-gold/35 bg-gold/10 text-gold-light",
  executive_call: "border-signal-blue/35 bg-signal-blue/14 text-platinum",
  approved: "border-emerald-400/35 bg-emerald-400/12 text-emerald-100",
  waitlisted: "border-risk-amber/30 bg-risk-amber/10 text-amber-100",
  declined: "border-critical-crimson/35 bg-critical-crimson/10 text-red-100",
};

function formatPriority(priority: AccessRequest["priority_level"]) {
  if (priority === "critical") return "Critical";
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Watch";
}

function formatStatus(status: AccessRequest["status"]) {
  return status.replaceAll("_", " ");
}

function formatScore(value: number | null) {
  return value === null ? "Pending" : String(value);
}

function SortButton({
  field,
  sortField,
  sortDirection,
  onSortChange,
  label,
}: {
  field: AccessRequestSortField;
  sortField: AccessRequestSortField;
  sortDirection: "asc" | "desc";
  onSortChange: (field: AccessRequestSortField) => void;
  label: string;
}) {
  const active = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className="inline-flex items-center gap-1 text-left transition-colors duration-300 hover:text-platinum"
    >
      {label}
      <ArrowDownUp className={`h-3 w-3 ${active ? "text-gold" : "text-mist"}`} />
      {active ? <span className="text-gold/80">{sortDirection}</span> : null}
    </button>
  );
}

export default function AccessRequestLeadTable({
  requests,
  selectedRequestId,
  onSelectRequest,
  sortField,
  sortDirection,
  onSortChange,
  highlightedRequestId,
}: AccessRequestLeadTableProps) {
  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal-blue">Access Intelligence Table</p>
          <h2 className="mt-1 font-display text-xl font-light text-warm-white md:text-2xl">Executive qualification queue</h2>
          <p className="mt-2 text-sm text-titanium">Sort by intelligence signal strength, review status, and submission recency.</p>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Company</th>
              <th className="py-2 pr-4">
                <SortButton field="prestige_score" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange} label="Prestige" />
              </th>
              <th className="py-2 pr-4">
                <SortButton field="authority_score" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange} label="Authority" />
              </th>
              <th className="py-2 pr-4">
                <SortButton field="luxury_fit_score" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange} label="Luxury Fit" />
              </th>
              <th className="py-2 pr-4">
                <SortButton field="priority_level" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange} label="Priority" />
              </th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-0">
                <SortButton field="created_at" sortField={sortField} sortDirection={sortDirection} onSortChange={onSortChange} label="Created At" />
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => {
              const selected = request.id === selectedRequestId;
              const highlighted = request.id === highlightedRequestId;

              return (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.02 }}
                  onClick={() => onSelectRequest(request.id)}
                  className={[
                    "cursor-pointer border-b border-white/6 text-sm transition-colors",
                    selected ? "bg-signal-blue/8" : "hover:bg-white/3",
                    highlighted ? "animate-pulse" : "",
                  ].join(" ")}
                >
                  <td className="py-3 pr-4 align-top">
                    <div>
                      <p className="text-warm-white">{request.full_name}</p>
                      <p className="mt-1 text-xs text-titanium">{request.email}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 align-top">
                    <div>
                      <p className="text-warm-white">{request.company}</p>
                      <p className="mt-1 text-xs text-titanium">{request.industry}</p>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-platinum">{formatScore(request.prestige_score)}</td>
                  <td className="py-3 pr-4 text-platinum">{formatScore(request.authority_score)}</td>
                  <td className="py-3 pr-4 text-platinum">{formatScore(request.luxury_fit_score)}</td>
                  <td className="py-3 pr-4">
                    <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]", PRIORITY_CLASS[request.priority_level]].join(" ")}>
                      {formatPriority(request.priority_level)}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]", STATUS_CLASS[request.status]].join(" ")}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="py-3 pr-0 text-titanium">{format(new Date(request.created_at), "MMM d · HH:mm")}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}