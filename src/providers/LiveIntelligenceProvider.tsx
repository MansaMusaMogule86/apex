"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type PropsWithChildren } from "react";
import { useLiveIntelligenceStore } from "@/stores/live-intelligence-store";

function createLiveQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        refetchOnWindowFocus: false,
        staleTime: 7000,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

export default function LiveIntelligenceProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createLiveQueryClient);
  const setConnectionState = useLiveIntelligenceStore((state) => state.setConnectionState);

  useEffect(() => {
    const handleOnline = () => setConnectionState("connecting");
    const handleOffline = () => setConnectionState("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setConnectionState("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setConnectionState]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
