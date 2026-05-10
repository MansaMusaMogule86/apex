"use client";

import { useEffect, useMemo, useRef } from "react";

type StreamStatus = {
  onOpen?: () => void;
  onClose?: () => void;
  onRetry?: (attempt: number) => void;
  onError?: (message: string) => void;
};

type StreamHandlers = StreamStatus & {
  onHeartbeat?: (payload: Record<string, unknown>) => void;
  onRecommendationSnapshot?: (payload: Record<string, unknown>) => void;
  onRecommendationCreated?: (payload: Record<string, unknown>) => void;
  onAlert?: (payload: Record<string, unknown>) => void;
  onDomainSignal?: (payload: Record<string, unknown>) => void;
  onExecutiveAction?: (payload: Record<string, unknown>) => void;
};

export type UseLiveEventStreamInput = {
  organizationId?: string;
  workspaceId?: string;
  enabled?: boolean;
  handlers?: StreamHandlers;
};

const BASE_RETRY_MS = 1200;
const MAX_RETRY_MS = 15000;

function safeParse(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function useLiveEventStream({
  organizationId,
  workspaceId,
  enabled = true,
  handlers,
}: UseLiveEventStreamInput): void {
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const closeRequestedRef = useRef(false);

  const streamUrl = useMemo(() => {
    if (!organizationId) return null;
    const url = new URL("/api/live/stream", window.location.origin);
    url.searchParams.set("organization_id", organizationId);
    if (workspaceId) {
      url.searchParams.set("workspace_id", workspaceId);
    }
    return url.toString();
  }, [organizationId, workspaceId]);

  useEffect(() => {
    if (!enabled || !streamUrl) {
      return;
    }

    closeRequestedRef.current = false;

    const connect = () => {
      if (closeRequestedRef.current) return;

      const source = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = source;

      source.addEventListener("open", () => {
        retryRef.current = 0;
        handlers?.onOpen?.();
      });

      source.addEventListener("heartbeat", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onHeartbeat?.(payload);
      });

      source.addEventListener("recommendations.snapshot", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onRecommendationSnapshot?.(payload);
      });

      source.addEventListener("recommendation.created", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onRecommendationCreated?.(payload);
      });

      source.addEventListener("alert", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onAlert?.(payload);
      });

      source.addEventListener("domain.signal", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onDomainSignal?.(payload);
      });

      source.addEventListener("executive.action", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlers?.onExecutiveAction?.(payload);
      });

      source.addEventListener("error", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        handlers?.onError?.((payload?.message as string) ?? "stream error");
      });

      source.onerror = () => {
        handlers?.onClose?.();
        source.close();
        eventSourceRef.current = null;

        if (closeRequestedRef.current) {
          return;
        }

        retryRef.current += 1;
        handlers?.onRetry?.(retryRef.current);

        const retryMs = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** retryRef.current);
        window.setTimeout(() => {
          connect();
        }, retryMs);
      };
    };

    connect();

    return () => {
      closeRequestedRef.current = true;
      handlers?.onClose?.();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      eventSourceRef.current = null;
    };
  }, [enabled, streamUrl, handlers]);
}
