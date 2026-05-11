"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import type { AccessRequest } from "@/types/database";

type LiveSignal = {
  type: "insert" | "update" | "delete";
  requestId: string;
};

type UpdateInput = {
  id: string;
  status?: AccessRequest["status"];
  executiveNotes?: string;
};

function upsertRequest(list: AccessRequest[], next: AccessRequest) {
  const existingIndex = list.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [next, ...list];
  }

  return list.map((item) => (item.id === next.id ? next : item));
}

export function useAccessRequests(initialRequests: AccessRequest[]) {
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [liveSignal, setLiveSignal] = useState<LiveSignal | null>(null);

  useRealtime(
    [
      {
        table: "access_requests",
        onChange: (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const inserted = payload.new as AccessRequest;
            setRequests((current) => upsertRequest(current, inserted));
            setLiveSignal({ type: "insert", requestId: inserted.id });
          }

          if (payload.eventType === "UPDATE" && payload.new) {
            const updated = payload.new as AccessRequest;
            setRequests((current) => upsertRequest(current, updated));
            setLiveSignal({ type: "update", requestId: updated.id });
          }

          if (payload.eventType === "DELETE" && payload.old) {
            const deleted = payload.old as AccessRequest;
            setRequests((current) => current.filter((item) => item.id !== deleted.id));
            setLiveSignal({ type: "delete", requestId: deleted.id });
          }
        },
      },
    ],
    { channelName: "access-requests-live" },
  );

  useEffect(() => {
    if (!liveSignal) {
      return;
    }

    const timeout = window.setTimeout(() => setLiveSignal(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [liveSignal]);

  const updateRequest = useCallback(
    async (input: UpdateInput) => {
      const previousRequest = requests.find((item) => item.id === input.id);

      if (!previousRequest) {
        throw new Error("Access request not found");
      }

      const optimisticRequest: AccessRequest = {
        ...previousRequest,
        ...(input.status ? { status: input.status } : {}),
        ...(input.executiveNotes !== undefined
          ? { executive_notes: input.executiveNotes || null }
          : {}),
      };

      setRequests((current) =>
        current.map((item) => (item.id === input.id ? optimisticRequest : item)),
      );
      setSavingId(input.id);

      try {
        const response = await fetch("/api/access-request", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        const payload = (await response.json().catch(() => null)) as
          | { request?: AccessRequest; error?: string }
          | null;

        if (!response.ok || !payload?.request) {
          throw new Error(payload?.error ?? "Failed to update access request");
        }

        const request = payload.request as AccessRequest;
        setRequests((current) => upsertRequest(current, request));
        return request;
      } catch (error) {
        setRequests((current) => upsertRequest(current, previousRequest));
        throw error;
      } finally {
        setSavingId((current) => (current === input.id ? null : current));
      }
    },
    [requests],
  );

  return {
    requests,
    savingId,
    liveSignal,
    updateRequest,
  };
}