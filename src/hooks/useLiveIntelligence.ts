"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLiveEventStream } from "@/hooks/useLiveEventStream";
import { useLiveOrgContext } from "@/hooks/useLiveOrgContext";
import { useLivePresence } from "@/hooks/useLivePresence";
import { useRealtime } from "@/hooks/useRealtime";
import {
  type LiveAlert,
  type LiveDomain,
  selectDomainRuntime,
  useLiveIntelligenceStore,
} from "@/stores/live-intelligence-store";

type RecommendationApiRow = {
  id: string;
  title: string;
  executive_summary: string;
  escalation_state: "normal" | "watch" | "escalated" | "urgent";
  priority_index: number;
  confidence_score: number;
  risk_level: "low" | "moderate" | "high" | "critical";
  created_at: string;
};

type RecommendationsApiResponse = {
  recommendations: RecommendationApiRow[];
};

function mapAlert(payload: Record<string, unknown>, domain: LiveDomain): LiveAlert {
  const source = String(payload.source ?? payload.type ?? "signal").toLowerCase();

  const type: LiveAlert["type"] = source.includes("risk")
    ? "risk"
    : source.includes("competitor")
      ? "competitor"
      : source.includes("lead")
        ? "lead"
        : source.includes("sentiment")
          ? "sentiment"
          : "market";

  return {
    id: String(payload.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    type,
    title: String(payload.title ?? payload.eventType ?? "Operational signal"),
    body: String(payload.body ?? payload.message ?? "Live operational change detected."),
    severity: (payload.severity as LiveAlert["severity"]) ?? "P2",
    timestamp: String(payload.ts ?? payload.timestamp ?? "now"),
    domain,
  };
}

function parseMetricValue(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) {
    return null;
  }

  const raw = Number(match[0]);
  const prefix = value.slice(0, match.index ?? 0);
  const suffix = value.slice((match.index ?? 0) + match[0].length);
  const decimals = match[0].includes(".") ? match[0].split(".")[1]?.length ?? 0 : 0;

  return { raw, prefix, suffix, decimals };
}

function formatMetricValue(raw: number, decimals: number, prefix: string, suffix: string) {
  return `${prefix}${raw.toFixed(decimals)}${suffix}`;
}

export function applyDomainKpiDrift<T extends { value: string; deltaPct: number; confidence: number }>(
  rows: T[],
  driftPct: number,
  confidenceBias: number,
): T[] {
  return rows.map((row) => {
    const parsed = parseMetricValue(row.value);
    if (!parsed) {
      return row;
    }

    const nextRaw = parsed.raw * (1 + driftPct / 100);
    const nextValue = formatMetricValue(nextRaw, parsed.decimals, parsed.prefix, parsed.suffix);

    return {
      ...row,
      value: nextValue,
      deltaPct: Number((row.deltaPct + driftPct).toFixed(2)),
      confidence: Math.max(50, Math.min(99, Math.round(row.confidence + confidenceBias * 0.03))),
    };
  });
}

async function fetchRecommendations(organizationId: string, workspaceId?: string) {
  const params = new URLSearchParams({ organization_id: organizationId, limit: "25" });
  if (workspaceId) {
    params.set("workspace_id", workspaceId);
  }

  const response = await fetch(`/api/live/recommendations?${params.toString()}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recommendations (${response.status})`);
  }

  return (await response.json()) as RecommendationsApiResponse;
}

export function useLiveIntelligence(domain: LiveDomain, enabled = true) {
  const queryClient = useQueryClient();
  const {
    organizationId,
    workspaceByDomain,
  } = useLiveOrgContext();

  const workspaceId = workspaceByDomain[domain];

  const { broadcastMemorySignal } = useLivePresence({
    organizationId,
    workspaceId,
    enabled,
  });

  const runtime = useLiveIntelligenceStore(selectDomainRuntime(domain));
  const setConnectionState = useLiveIntelligenceStore((state) => state.setConnectionState);
  const markHeartbeat = useLiveIntelligenceStore((state) => state.markHeartbeat);
  const incrementRetry = useLiveIntelligenceStore((state) => state.incrementRetry);
  const resetRetry = useLiveIntelligenceStore((state) => state.resetRetry);
  const setRecommendations = useLiveIntelligenceStore((state) => state.setRecommendations);
  const upsertRecommendation = useLiveIntelligenceStore((state) => state.upsertRecommendation);
  const pushAlert = useLiveIntelligenceStore((state) => state.pushAlert);
  const setDomainKpi = useLiveIntelligenceStore((state) => state.setDomainKpi);
  const reconcileFromRealtimeTick = useLiveIntelligenceStore((state) => state.reconcileFromRealtimeTick);
  const recommendations = useLiveIntelligenceStore((state) => state.recommendations);
  const alerts = useLiveIntelligenceStore((state) => state.alerts);
  const connection = useLiveIntelligenceStore((state) => state.connection);

  const recommendationQuery = useQuery({
    queryKey: ["live", "recommendations", organizationId, workspaceId],
    queryFn: () => fetchRecommendations(organizationId, workspaceId),
    enabled,
    refetchInterval: enabled ? 15000 : false,
    staleTime: 7000,
    gcTime: 120000,
  });

  useEffect(() => {
    const rows = recommendationQuery.data?.recommendations ?? [];
    if (!rows.length) {
      return;
    }

    setRecommendations(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        executiveSummary: row.executive_summary,
        escalationState: row.escalation_state,
        priorityIndex: Number(row.priority_index),
        confidenceScore: Number(row.confidence_score),
        riskLevel: row.risk_level,
        createdAt: row.created_at,
        organizationId,
        workspaceId: workspaceId ?? null,
      })),
    );
  }, [organizationId, recommendationQuery.data?.recommendations, setRecommendations, workspaceId]);

  useLiveEventStream({
    organizationId,
    workspaceId,
    enabled,
    handlers: {
      onOpen: () => {
        setConnectionState("connected");
        resetRetry();
      },
      onClose: () => {
        setConnectionState("degraded");
      },
      onRetry: () => {
        incrementRetry();
      },
      onHeartbeat: () => {
        markHeartbeat();
      },
      onRecommendationSnapshot: (payload) => {
        const rows = Array.isArray(payload.recommendations)
          ? (payload.recommendations as RecommendationApiRow[])
          : [];
        if (!rows.length) return;

        setRecommendations(
          rows.map((row) => ({
            id: row.id,
            title: row.title,
            executiveSummary: row.executive_summary,
            escalationState: row.escalation_state,
            priorityIndex: Number(row.priority_index),
            confidenceScore: Number(row.confidence_score),
            riskLevel: row.risk_level,
            createdAt: row.created_at,
            organizationId,
            workspaceId: workspaceId ?? null,
          })),
        );

        const top = rows[0];
        if (top) {
          reconcileFromRealtimeTick({
            domain,
            queueDepth: rows.length,
            eventRate: Math.max(8, rows.length * 2),
            confidence: Number(top.confidence_score),
            anomaly: Number(top.priority_index),
          });
        }
      },
      onRecommendationCreated: (payload) => {
        const row = payload.recommendation as RecommendationApiRow | undefined;
        if (!row) return;

        upsertRecommendation({
          id: row.id,
          title: row.title,
          executiveSummary: row.executive_summary,
          escalationState: row.escalation_state,
          priorityIndex: Number(row.priority_index),
          confidenceScore: Number(row.confidence_score),
          riskLevel: row.risk_level,
          createdAt: row.created_at,
          organizationId,
          workspaceId: workspaceId ?? null,
        });

        pushAlert(
          mapAlert(
            {
              id: `rec-${row.id}`,
              source: "market",
              title: "New strategic recommendation",
              body: row.title,
              severity: row.escalation_state === "urgent" ? "P1" : "P2",
              ts: "now",
            },
            domain,
          ),
        );
      },
      onAlert: (payload) => {
        pushAlert(mapAlert(payload, domain));
      },
      onDomainSignal: (payload) => {
        const confidence = Number(payload.confidence ?? 72);
        const anomaly = Number(payload.anomaly ?? payload.priority ?? 45);
        const eventRate = Number(payload.eventRate ?? 28);
        const queueDepth = Number(payload.queueDepth ?? recommendations.length);

        reconcileFromRealtimeTick({
          domain,
          confidence,
          anomaly,
          eventRate,
          queueDepth,
        });
      },
      onExecutiveAction: (payload) => {
        void broadcastMemorySignal(
          `executive-action:${String(payload.actionType ?? "update")}:${String(payload.actionId ?? "unknown")}`,
        );
        pushAlert(
          mapAlert(
            {
              id: `act-${payload.actionId ?? Date.now()}`,
              source: "risk",
              title: "Executive action received",
                body: `Action ${String(payload.actionType ?? "update")} acknowledged by orchestration pipeline.`,
              severity: "P2",
              ts: String(payload.ts ?? "now"),
            },
            domain,
          ),
        );
      },
      onError: () => {
        setConnectionState("degraded");
      },
    },
  });

  useRealtime(
    [
      {
        table: "event_bus_events",
        event: "INSERT",
        filter: `organization_id=eq.${organizationId}`,
        onChange: (payload) => {
          const row = payload.new as Record<string, unknown>;
          const queueDepth = Number(row.id ?? 0) % 100;
          const eventRate = Number(row.id ?? 0) % 70;
          const confidence = Number(row.id ?? 0) % 100;
          const anomaly = Number(row.id ?? 0) % 100;

          setDomainKpi(domain, {
            queueDepth,
            eventRate,
            driftPct: Number((((confidence - 50) * 0.08)).toFixed(2)),
            confidenceBias: confidence - 50,
            rollingAvg: confidence,
            amplifiedSignal: anomaly,
          });
        },
      },
      {
        table: "executive_notifications",
        event: "INSERT",
        filter: `organization_id=eq.${organizationId}`,
        onChange: (payload) => {
          pushAlert(
            mapAlert(
              {
                id: String(payload.new.id ?? `notif-${Date.now()}`),
                source: payload.new.severity ?? "risk",
                title: payload.new.title,
                body: payload.new.body,
                severity: payload.new.severity === "critical" ? "P1" : "P2",
                ts: payload.new.created_at ?? "now",
              },
              domain,
            ),
          );
        },
      },
    ],
    {
      enabled,
      channelName: `apex-live-${domain}`,
    },
  );

  const executeRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const response = await fetch("/api/live/executive-actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          organizationId,
          workspaceId,
          recommendationId,
          actionType: "execute",
          actionPayload: {
            domain,
            source: "ui",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute recommendation (${response.status})`);
      }

      return response.json() as Promise<{ action: { id: string } }>;
    },
    onMutate: async (recommendationId) => {
      const before = recommendations;
      useLiveIntelligenceStore.getState().invalidateRecommendation(recommendationId);
      return { before };
    },
    onError: (_error, _input, context) => {
      if (context?.before) {
        useLiveIntelligenceStore.getState().setRecommendations(context.before);
      }
      pushAlert(
        mapAlert(
          {
            id: `exec-error-${Date.now()}`,
            source: "risk",
            title: "Execution failed",
            body: "Recommendation execution failed. Recovery logic restored local cache.",
            severity: "P1",
            ts: "now",
          },
          domain,
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["live", "recommendations", organizationId, workspaceId],
      });
    },
  });

  const domainAlerts = useMemo(
    () => alerts.filter((item) => !item.domain || item.domain === domain).slice(0, 6),
    [alerts, domain],
  );

  return {
    organizationId,
    workspaceId,
    runtime,
    connection,
    recommendations,
    alerts: domainAlerts,
    recommendationQuery,
    executeRecommendationMutation,
  };
}
