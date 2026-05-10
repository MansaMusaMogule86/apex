"use client";

import { useEffect, useRef } from "react";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Event = "INSERT" | "UPDATE" | "DELETE" | "*";

export type RealtimeSubscription<T extends Record<string, unknown>> = {
  table: string;
  schema?: string;
  event?: Event;
  filter?: string;
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void;
};

/**
 * Subscribes to one or more Supabase Realtime channels for the lifetime
 * of the calling component. Pass stable callbacks (e.g. `useCallback`).
 */
export function useRealtime(
  subscriptions: ReadonlyArray<RealtimeSubscription<Record<string, unknown>>>,
  options?: { channelName?: string; enabled?: boolean },
): void {
  const enabled = options?.enabled ?? true;
  const subsRef = useRef(subscriptions);
  subsRef.current = subscriptions;

  useEffect(() => {
    if (!enabled || subsRef.current.length === 0) return;

    const supabase = createClient();
    const name =
      options?.channelName ??
      `apex-rt-${Math.random().toString(36).slice(2, 10)}`;
    const channel: RealtimeChannel = supabase.channel(name);

    subsRef.current.forEach((sub, idx) => {
      channel.on(
        "postgres_changes" as never,
        {
          event: sub.event ?? "*",
          schema: sub.schema ?? "public",
          table: sub.table,
          ...(sub.filter ? { filter: sub.filter } : {}),
        } as never,
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          subsRef.current[idx]?.onChange(payload);
        },
      );
    });

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, options?.channelName]);
}
