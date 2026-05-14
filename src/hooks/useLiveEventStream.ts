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
  const handlersRef = useRef<StreamHandlers | undefined>(handlers);
  handlersRef.current = handlers;

  const streamUrl = useMemo(() => {
    if (!organizationId || typeof window === "undefined") return null;
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
    let didOpen = false;
    let retryTimer: number | null = null;

    const connect = () => {
      if (closeRequestedRef.current) return;

      const source = new EventSource(streamUrl, { withCredentials: true });
      eventSourceRef.current = source;

      source.addEventListener("open", () => {
        retryRef.current = 0;
        didOpen = true;
        handlersRef.current?.onOpen?.();
      });

      source.addEventListener("heartbeat", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onHeartbeat?.(payload);
      });

      source.addEventListener("recommendations.snapshot", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onRecommendationSnapshot?.(payload);
      });

      source.addEventListener("recommendation.created", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onRecommendationCreated?.(payload);
      });

      source.addEventListener("alert", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onAlert?.(payload);
      });

      source.addEventListener("domain.signal", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onDomainSignal?.(payload);
      });

      source.addEventListener("executive.action", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        if (!payload) return;
        handlersRef.current?.onExecutiveAction?.(payload);
      });

      source.addEventListener("error", (event) => {
        const payload = safeParse((event as MessageEvent<string>).data);
        handlersRef.current?.onError?.((payload?.message as string) ?? "stream error");
      });

      source.onerror = () => {
        if (didOpen) {
          handlersRef.current?.onClose?.();
          didOpen = false;
        }
        source.close();
        eventSourceRef.current = null;

        if (closeRequestedRef.current) {
          return;
        }

        retryRef.current += 1;
        handlersRef.current?.onRetry?.(retryRef.current);

        const retryMs = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** retryRef.current);
        retryTimer = window.setTimeout(() => {
          retryTimer = null;
          connect();
        }, retryMs);
      };
    };

    connect();

    return () => {
      closeRequestedRef.current = true;
      if (retryTimer !== null) {
        window.clearTimeout(retryTimer);
        retryTimer = null;
      }
      if (didOpen) {
        handlersRef.current?.onClose?.();
        didOpen = false;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      eventSourceRef.current = null;
    };
  }, [enabled, streamUrl]);
}
