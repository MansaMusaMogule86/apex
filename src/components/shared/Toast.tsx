"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  X,
} from "lucide-react";

const SILK = [0.16, 1, 0.3, 1] as const;

export type ToastVariant = "system" | "campaign" | "alert" | "ai_insight";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof Info; accent: string; label: string }
> = {
  system: { icon: Info, accent: "text-titanium", label: "System" },
  campaign: { icon: CheckCircle2, accent: "text-gold", label: "Campaign" },
  alert: { icon: AlertTriangle, accent: "text-red-400", label: "Alert" },
  ai_insight: { icon: Sparkles, accent: "text-gold-light", label: "Insight" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input: Omit<Toast, "id">) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next: Toast = { id, durationMs: 5200, ...input };
      setToasts((prev) => [...prev, next].slice(-5));
      if (next.durationMs && next.durationMs > 0) {
        const timer = setTimeout(() => dismiss(id), next.durationMs);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-[360px] max-w-[calc(100vw-3rem)] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const meta = VARIANT_META[t.variant];
            const Icon = meta.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 24, filter: "blur(6px)" }}
                transition={{ duration: 0.6, ease: SILK }}
                className="pointer-events-auto relative overflow-hidden rounded-[2px] border border-gold/15 bg-obsidian/95 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              >
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
                <div className="flex items-start gap-3 p-4">
                  <Icon
                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${meta.accent}`}
                    strokeWidth={1.5}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-gold/80">
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-base leading-snug text-warm-white">
                      {t.title}
                    </p>
                    {t.message ? (
                      <p className="mt-1 text-xs leading-relaxed text-titanium">
                        {t.message}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    onClick={() => dismiss(t.id)}
                    className="text-mist transition-colors duration-500 hover:text-gold"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
