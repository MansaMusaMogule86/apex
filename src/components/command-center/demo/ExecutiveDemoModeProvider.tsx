"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLiveIntelligenceStore, type LiveDomain } from "@/stores/live-intelligence-store";

type DemoPhase = "steady" | "surge" | "critical";

type DemoScenario = {
  id: string;
  label: string;
  route: string;
  domain: LiveDomain;
  urgency: DemoPhase;
};

type ExecutiveDemoModeState = {
  enabled: boolean;
  autoplay: boolean;
  phase: DemoPhase;
  signalDensity: number;
  kpiVelocity: number;
  activeScenario: DemoScenario;
  scenarios: DemoScenario[];
  toggleEnabled: () => void;
  toggleAutoplay: () => void;
  setPhase: (phase: DemoPhase) => void;
  jumpToScenario: (id: string) => void;
};

const DEMO_MODE_STORAGE_KEY = "apex-executive-demo-mode";
const DEMO_AUTOPLAY_STORAGE_KEY = "apex-executive-demo-autoplay";

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "home-briefing",
    label: "Executive Briefing",
    route: "/dashboard",
    domain: "home",
    urgency: "steady",
  },
  {
    id: "market-volatility",
    label: "Market Volatility Response",
    route: "/dashboard/analytics",
    domain: "market",
    urgency: "surge",
  },
  {
    id: "lead-escalation",
    label: "Lead Escalation Lane",
    route: "/dashboard/crm",
    domain: "lead",
    urgency: "surge",
  },
  {
    id: "influence-shift",
    label: "Influence Territory Shift",
    route: "/dashboard/influencers",
    domain: "influence",
    urgency: "critical",
  },
  {
    id: "ai-war-room",
    label: "AI War Room",
    route: "/dashboard/ai",
    domain: "recommendation",
    urgency: "critical",
  },
  {
    id: "scenario-simulation",
    label: "Scenario Simulation",
    route: "/dashboard/scenario-simulator",
    domain: "scenario",
    urgency: "steady",
  },
  {
    id: "board-reporting",
    label: "Board Reporting",
    route: "/dashboard/reports",
    domain: "reports",
    urgency: "steady",
  },
];

const DemoModeContext = createContext<ExecutiveDemoModeState | null>(null);

function findScenarioByRoute(pathname: string) {
  return DEMO_SCENARIOS.find((item) => pathname.startsWith(item.route)) ?? DEMO_SCENARIOS[0];
}

export function ExecutiveDemoModeProvider({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const setDomainKpi = useLiveIntelligenceStore((state) => state.setDomainKpi);
  const pushAlert = useLiveIntelligenceStore((state) => state.pushAlert);

  const [enabled, setEnabled] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [phase, setPhase] = useState<DemoPhase>("steady");
  const [signalDensity, setSignalDensity] = useState(0.34);
  const [kpiVelocity, setKpiVelocity] = useState(0.52);
  const [activeScenarioId, setActiveScenarioId] = useState(DEMO_SCENARIOS[0].id);

  useEffect(() => {
    const storedEnabled = window.localStorage.getItem(DEMO_MODE_STORAGE_KEY);
    const storedAutoplay = window.localStorage.getItem(DEMO_AUTOPLAY_STORAGE_KEY);
    if (storedEnabled === "0") {
      setEnabled(false);
    }
    if (storedAutoplay === "1") {
      setAutoplay(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, enabled ? "1" : "0");
  }, [enabled]);

  useEffect(() => {
    window.localStorage.setItem(DEMO_AUTOPLAY_STORAGE_KEY, autoplay ? "1" : "0");
  }, [autoplay]);

  useEffect(() => {
    const fromRoute = findScenarioByRoute(pathname);
    setActiveScenarioId(fromRoute.id);
  }, [pathname]);

  const activeScenario = useMemo(
    () => DEMO_SCENARIOS.find((item) => item.id === activeScenarioId) ?? DEMO_SCENARIOS[0],
    [activeScenarioId],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const phaseSequence: DemoPhase[] = ["steady", "surge", "critical", "surge"];
    let pointer = 0;

    const interval = window.setInterval(() => {
      pointer = (pointer + 1) % phaseSequence.length;
      const nextPhase = phaseSequence[pointer];
      setPhase(nextPhase);

      setSignalDensity((current) => {
        const drift = (Math.random() - 0.5) * 0.11;
        const urgencyBias = nextPhase === "critical" ? 0.09 : nextPhase === "surge" ? 0.04 : -0.02;
        return Math.max(0.15, Math.min(0.95, Number((current + drift + urgencyBias).toFixed(2))));
      });

      setKpiVelocity((current) => {
        const drift = (Math.random() - 0.5) * 0.1;
        const urgencyBias = nextPhase === "critical" ? 0.08 : nextPhase === "surge" ? 0.03 : -0.02;
        return Math.max(0.2, Math.min(1, Number((current + drift + urgencyBias).toFixed(2))));
      });
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const phaseMultiplier = phase === "critical" ? 1.4 : phase === "surge" ? 1.15 : 0.95;
    const queueDepth = Math.round(14 + signalDensity * 34 * phaseMultiplier);
    const eventRate = Math.round(20 + kpiVelocity * 55 * phaseMultiplier);
    const rollingAvg = Math.round(70 + kpiVelocity * 20);
    const amplifiedSignal = Math.round(48 + signalDensity * 42 * phaseMultiplier);
    const driftPct = Number((((phaseMultiplier - 1) * 4.6) + (kpiVelocity - 0.5) * 2.1).toFixed(2));
    const confidenceBias = Number((((signalDensity - 0.5) * 38) + (phase === "critical" ? -8 : 4)).toFixed(2));

    setDomainKpi(activeScenario.domain, {
      queueDepth,
      eventRate,
      rollingAvg,
      amplifiedSignal,
      driftPct,
      confidenceBias,
    });
  }, [activeScenario.domain, enabled, kpiVelocity, phase, setDomainKpi, signalDensity]);

  useEffect(() => {
    if (!enabled || !autoplay) {
      return;
    }

    DEMO_SCENARIOS.forEach((scenario) => {
      router.prefetch(scenario.route);
    });

    let pointer = Math.max(
      0,
      DEMO_SCENARIOS.findIndex((item) => item.id === activeScenario.id),
    );

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") {
        return;
      }

      pointer = (pointer + 1) % DEMO_SCENARIOS.length;
      const next = DEMO_SCENARIOS[pointer];
      setActiveScenarioId(next.id);
      setPhase(next.urgency);
      router.push(next.route);

      pushAlert({
        id: `demo-${Date.now()}-${next.id}`,
        type: next.urgency === "critical" ? "risk" : "market",
        title: `Demo scenario: ${next.label}`,
        body: `Autoplay advanced to ${next.label} with ${next.urgency.toUpperCase()} operational tone.`,
        severity: next.urgency === "critical" ? "P1" : "P2",
        timestamp: "now",
        domain: next.domain,
      });
    }, 16000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeScenario.id, autoplay, enabled, pushAlert, router]);

  const value = useMemo(
    () => ({
      enabled,
      autoplay,
      phase,
      signalDensity,
      kpiVelocity,
      activeScenario,
      scenarios: DEMO_SCENARIOS,
      toggleEnabled: () => setEnabled((current) => !current),
      toggleAutoplay: () => setAutoplay((current) => !current),
      setPhase,
      jumpToScenario: (id: string) => {
        const target = DEMO_SCENARIOS.find((item) => item.id === id);
        if (!target) {
          return;
        }
        setActiveScenarioId(target.id);
        setPhase(target.urgency);
        router.push(target.route);
      },
    }),
    [activeScenario, autoplay, enabled, kpiVelocity, phase, router, signalDensity],
  );

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useExecutiveDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error("useExecutiveDemoMode must be used within ExecutiveDemoModeProvider");
  }
  return context;
}
