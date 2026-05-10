"use client";

import { useEffect, useMemo, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { broadcastChannel, presenceChannel } from "@/lib/live/realtime";
import { useLiveIntelligenceStore } from "@/stores/live-intelligence-store";

type UseLivePresenceInput = {
  organizationId?: string;
  workspaceId?: string;
  enabled?: boolean;
};

export function useLivePresence({
  organizationId,
  workspaceId,
  enabled = true,
}: UseLivePresenceInput) {
  const setPresence = useLiveIntelligenceStore((state) => state.setPresence);
  const pushMemorySignal = useLiveIntelligenceStore((state) => state.pushMemorySignal);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const channelName = useMemo(() => {
    if (!organizationId || !workspaceId) return null;
    return presenceChannel(organizationId, workspaceId);
  }, [organizationId, workspaceId]);

  useEffect(() => {
    if (!enabled || !organizationId || !workspaceId || !channelName) {
      return;
    }

    const supabase = createClient();
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: `${organizationId}:${workspaceId}:${Math.random().toString(36).slice(2, 10)}`,
        },
        broadcast: { self: false, ack: false },
      },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<Record<string, unknown>>();
        const onlineUsers = Object.keys(state).length;
        setPresence(workspaceId, onlineUsers);
      })
      .on("broadcast", { event: "memory.signal" }, (payload) => {
        const signal = payload.payload?.signal;
        if (typeof signal === "string" && signal.length) {
          pushMemorySignal(signal);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            at: new Date().toISOString(),
            workspaceId,
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName, enabled, organizationId, pushMemorySignal, setPresence, workspaceId]);

  const broadcastMemorySignal = async (signal: string) => {
    if (!channelRef.current || !signal.length) {
      return;
    }

    await channelRef.current.send({
      type: "broadcast",
      event: "memory.signal",
      payload: { signal },
    });
  };

  const publishExecutiveSync = async (payload: Record<string, unknown>) => {
    if (!organizationId) return;

    const supabase = createClient();
    const channel = supabase.channel(broadcastChannel(organizationId, workspaceId));
    await channel.subscribe();
    await channel.send({
      type: "broadcast",
      event: "executive.sync",
      payload,
    });
    void supabase.removeChannel(channel);
  };

  return {
    broadcastMemorySignal,
    publishExecutiveSync,
  };
}
