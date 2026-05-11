"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, RadioTower, Search, Sparkles } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import AccessRequestInsightDrawer from "@/components/command-center/lead/AccessRequestInsightDrawer";
import AccessRequestLeadTable, {
  type AccessRequestSortField,
} from "@/components/command-center/lead/AccessRequestLeadTable";
import { useAccessRequests } from "@/hooks/useAccessRequests";
import type { AccessRequest } from "@/types/database";

type LeadIntelligenceScreenProps = {
  initialRequests: AccessRequest[];
  loadError?: string | null;
};

const PRIORITY_ORDER: Record<AccessRequest["priority_level"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  watch: 1,
};

const STATUS_FILTERS: Array<"all" | AccessRequest["status"]> = [
  "all",
  "processing",
  "executive_review",
  "executive_call",
  "approved",
  "waitlisted",
  "declined",
];

const PRIORITY_FILTERS: Array<"all" | AccessRequest["priority_level"]> = [
  "all",
  "critical",
  "high",
  "medium",
  "watch",
];

function sortRequests(
  requests: AccessRequest[],
  field: AccessRequestSortField,
  direction: "asc" | "desc",
) {
  const sorted = [...requests].sort((left, right) => {
    const sign = direction === "asc" ? 1 : -1;

    if (field === "created_at") {
      return (new Date(left.created_at).getTime() - new Date(right.created_at).getTime()) * sign;
    }

    if (field === "priority_level") {
      return (PRIORITY_ORDER[left.priority_level] - PRIORITY_ORDER[right.priority_level]) * sign;
    }

    const leftValue = left[field] ?? -1;
    const rightValue = right[field] ?? -1;
    return (leftValue - rightValue) * sign;
  });

  return sorted;
}

function average(values: Array<number | null>) {
  const valid = values.filter((value): value is number => value !== null);
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function prettyLabel(value: string) {
  return value.replaceAll("_", " ");
}

export default function LeadIntelligenceScreen({
  initialRequests,
  loadError = null,
}: LeadIntelligenceScreenProps) {
  const { requests, savingId, liveSignal, updateRequest } = useAccessRequests(initialRequests);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(initialRequests[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_FILTERS)[number]>("all");
  const [sortField, setSortField] = useState<AccessRequestSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [draftStatus, setDraftStatus] = useState<AccessRequest["status"] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(searchValue);

  const metrics = useMemo(() => {
    return [
      { label: "Total dossiers", value: String(requests.length), detail: "Live qualification queue" },
      {
        label: "Priority queue",
        value: String(
          requests.filter(
            (request) => request.priority_level === "critical" || request.priority_level === "high",
          ).length,
        ),
        detail: "Critical + high routing",
      },
      {
        label: "Average prestige",
        value: String(average(requests.map((request) => request.prestige_score))),
        detail: "Institutional signal score",
      },
      {
        label: "Executive review",
        value: String(requests.filter((request) => request.status === "executive_review").length),
        detail: "Awaiting manual decision",
      },
    ];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    const needle = deferredSearch.trim().toLowerCase();
    const filtered = requests.filter((request) => {
      const matchesSearch =
        needle.length === 0 ||
        request.full_name.toLowerCase().includes(needle) ||
        request.company.toLowerCase().includes(needle) ||
        request.email.toLowerCase().includes(needle);
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || request.priority_level === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return sortRequests(filtered, sortField, sortDirection);
  }, [deferredSearch, priorityFilter, requests, sortDirection, sortField, statusFilter]);

  const selectedRequest = useMemo(() => {
    if (!selectedRequestId) {
      return filteredRequests[0] ?? null;
    }

    return filteredRequests.find((request) => request.id === selectedRequestId) ?? filteredRequests[0] ?? null;
  }, [filteredRequests, selectedRequestId]);

  useEffect(() => {
    if (!filteredRequests.length) {
      setSelectedRequestId(null);
      return;
    }

    if (!selectedRequestId || !filteredRequests.some((request) => request.id === selectedRequestId)) {
      setSelectedRequestId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedRequestId]);

  useEffect(() => {
    setDraftNotes(selectedRequest?.executive_notes ?? "");
    setDraftStatus(selectedRequest?.status ?? null);
    setSaveError(null);
  }, [selectedRequest?.executive_notes, selectedRequest?.id, selectedRequest?.status]);

  const hasUnsavedChanges =
    !!selectedRequest &&
    (draftNotes !== (selectedRequest.executive_notes ?? "") || draftStatus !== selectedRequest.status);

  async function handleSave() {
    if (!selectedRequest || !draftStatus || !hasUnsavedChanges) {
      return;
    }

    setSaveError(null);

    try {
      const updated = await updateRequest({
        id: selectedRequest.id,
        status: draftStatus,
        executiveNotes: draftNotes,
      });

      setDraftNotes(updated.executive_notes ?? "");
      setDraftStatus(updated.status);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save executive notes.");
    }
  }

  function handleSortChange(field: AccessRequestSortField) {
    if (field === sortField) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortField(field);
    setSortDirection("desc");
  }

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-white/10 bg-linear-to-r from-signal-blue/8 via-transparent to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal-blue">
              APEX Request Access Intelligence System
            </p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Executive access qualification command center
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Real operator dossiers, live AI scoring, executive notes, and qualification routing for
              private APEX onboarding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em]">
            <span className="inline-flex items-center gap-2 rounded-xs border border-signal-blue/30 bg-signal-blue/10 px-3 py-1 text-signal-blue">
              <RadioTower className="h-3.5 w-3.5" />
              Supabase realtime
            </span>
            {liveSignal ? (
              <span className="inline-flex items-center gap-2 rounded-xs border border-gold/35 bg-gold/10 px-3 py-1 text-gold-light">
                <Sparkles className="h-3.5 w-3.5" />
                {liveSignal.type === "insert"
                  ? "New submission detected"
                  : liveSignal.type === "update"
                    ? "Executive update synced"
                    : "Submission removed"}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="rounded-xs border border-white/10 bg-white/3 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">
                {metric.label}
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="font-display text-3xl font-light text-warm-white">{metric.value}</p>
                <p className="text-[11px] text-titanium">{metric.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </header>

      {loadError ? (
        <section className="rounded-xs border border-critical-crimson/35 bg-critical-crimson/10 p-4 text-sm text-platinum/90">
          Unable to load access request intelligence: {loadError}
        </section>
      ) : null}

      <section className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="w-full max-w-xl">
            <label className="flex items-center gap-3 rounded-xs border border-white/12 bg-void/40 px-4 py-3">
              <Search className="h-4 w-4 text-mist" />
              <input
                value={searchValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setSearchValue(nextValue));
                }}
                placeholder="Search name, company, or email"
                className="w-full bg-transparent text-sm text-platinum outline-none placeholder:text-mist"
              />
            </label>
          </div>

          <div className="grid gap-3 xl:min-w-130 xl:grid-cols-2">
            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">
                Status filter
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((status) => {
                  const active = statusFilter === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={[
                        "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-300",
                        active
                          ? "border-gold/40 bg-gold/10 text-gold-light"
                          : "border-white/12 bg-white/3 text-titanium hover:border-signal-blue/30 hover:text-platinum",
                      ].join(" ")}
                    >
                      {prettyLabel(status)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium">
                Priority filter
              </p>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_FILTERS.map((priority) => {
                  const active = priorityFilter === priority;
                  return (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setPriorityFilter(priority)}
                      className={[
                        "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-300",
                        active
                          ? "border-signal-blue/35 bg-signal-blue/10 text-signal-blue"
                          : "border-white/12 bg-white/3 text-titanium hover:border-signal-blue/30 hover:text-platinum",
                      ].join(" ")}
                    >
                      {prettyLabel(priority)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {filteredRequests.length === 0 ? (
        <section className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center">
          <p className="font-display text-2xl font-light text-warm-white">
            No operator dossiers match the current intelligence filters.
          </p>
          <p className="mt-2 text-sm text-titanium">
            Adjust search or filters to widen the executive review queue.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <AccessRequestLeadTable
            requests={filteredRequests}
            selectedRequestId={selectedRequest?.id ?? null}
            onSelectRequest={setSelectedRequestId}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            highlightedRequestId={liveSignal?.requestId ?? null}
          />

          <AccessRequestInsightDrawer
            request={selectedRequest}
            draftNotes={draftNotes}
            draftStatus={draftStatus}
            saveError={saveError}
            saving={savingId === selectedRequest?.id}
            onNotesChange={setDraftNotes}
            onStatusChange={setDraftStatus}
            onSave={handleSave}
          />
        </div>
      )}

      <section className="rounded-xs border border-white/10 bg-white/2 px-4 py-3 text-xs text-titanium md:px-5">
        {selectedRequest ? (
          <span>
            Reviewing {selectedRequest.full_name} · submitted{" "}
            {formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-platinum/85">
            <AlertTriangle className="h-3.5 w-3.5 text-risk-amber" />
            Select an operator dossier to activate the executive drawer.
          </span>
        )}
      </section>
    </div>
  );
}