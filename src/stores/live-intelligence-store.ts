import { create } from "zustand";

export type LiveDomain =
	| "home"
	| "market"
	| "lead"
	| "founder"
	| "influence"
	| "reports"
	| "scenario"
	| "recommendation";

export type ConnectionState = "connecting" | "connected" | "degraded" | "offline";

export type LiveRecommendationDigest = {
	id: string;
	title: string;
	executiveSummary: string;
	escalationState: "normal" | "watch" | "escalated" | "urgent";
	priorityIndex: number;
	confidenceScore: number;
	riskLevel: "low" | "moderate" | "high" | "critical";
	createdAt: string;
	organizationId?: string;
	workspaceId?: string | null;
};

export type LiveAlertSeverity = "P1" | "P2" | "P3";

export type LiveAlert = {
	id: string;
	type: "risk" | "sentiment" | "lead" | "competitor" | "market";
	title: string;
	body: string;
	severity: LiveAlertSeverity;
	timestamp: string;
	domain?: LiveDomain;
};

export type DomainKpiRuntime = {
	driftPct: number;
	confidenceBias: number;
	eventRate: number;
	queueDepth: number;
	rollingAvg: number;
	amplifiedSignal: number;
	updatedAt: string;
};

type PresenceSnapshot = {
	workspaceId: string;
	onlineUsers: number;
	updatedAt: string;
};

type LiveIntelligenceState = {
	connection: {
		state: ConnectionState;
		lastHeartbeat: string | null;
		retryCount: number;
		offlineSince: string | null;
	};
	recommendations: LiveRecommendationDigest[];
	alerts: LiveAlert[];
	domainKpi: Record<LiveDomain, DomainKpiRuntime>;
	presence: Record<string, PresenceSnapshot>;
	memorySignals: string[];
	setConnectionState: (state: ConnectionState) => void;
	markHeartbeat: () => void;
	incrementRetry: () => void;
	resetRetry: () => void;
	upsertRecommendation: (next: LiveRecommendationDigest) => void;
	setRecommendations: (rows: LiveRecommendationDigest[]) => void;
	invalidateRecommendation: (recommendationId: string) => void;
	pushAlert: (alert: LiveAlert) => void;
	setDomainKpi: (domain: LiveDomain, patch: Partial<DomainKpiRuntime>) => void;
	setPresence: (workspaceId: string, onlineUsers: number) => void;
	pushMemorySignal: (signal: string) => void;
	reconcileFromRealtimeTick: (input: {
		domain: LiveDomain;
		queueDepth: number;
		eventRate: number;
		confidence: number;
		anomaly: number;
	}) => void;
};

const nowIso = () => new Date().toISOString();

const defaultDomainKpi = (): Record<LiveDomain, DomainKpiRuntime> => ({
	home: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	market: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	lead: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	founder: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	influence: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	reports: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	scenario: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
	recommendation: {
		driftPct: 0,
		confidenceBias: 0,
		eventRate: 0,
		queueDepth: 0,
		rollingAvg: 0,
		amplifiedSignal: 0,
		updatedAt: nowIso(),
	},
});

export const useLiveIntelligenceStore = create<LiveIntelligenceState>((set) => ({
	connection: {
		state: "connecting",
		lastHeartbeat: null,
		retryCount: 0,
		offlineSince: null,
	},
	recommendations: [],
	alerts: [],
	domainKpi: defaultDomainKpi(),
	presence: {},
	memorySignals: [],

	setConnectionState: (state) =>
		set((current) => ({
			connection: {
				...current.connection,
				state,
				offlineSince: state === "offline" ? current.connection.offlineSince ?? nowIso() : null,
			},
		})),

	markHeartbeat: () =>
		set((current) => ({
			connection: {
				...current.connection,
				state: "connected",
				lastHeartbeat: nowIso(),
				offlineSince: null,
			},
		})),

	incrementRetry: () =>
		set((current) => ({
			connection: {
				...current.connection,
				retryCount: current.connection.retryCount + 1,
				state: "degraded",
			},
		})),

	resetRetry: () =>
		set((current) => ({
			connection: {
				...current.connection,
				retryCount: 0,
			},
		})),

	upsertRecommendation: (next) =>
		set((current) => {
			const found = current.recommendations.find((item) => item.id === next.id);
			const recommendations = found
				? current.recommendations
						.map((item) => (item.id === next.id ? { ...item, ...next } : item))
						.sort((a, b) => b.priorityIndex - a.priorityIndex)
				: [next, ...current.recommendations].sort((a, b) => b.priorityIndex - a.priorityIndex).slice(0, 60);

			return { recommendations };
		}),

	setRecommendations: (rows) =>
		set({
			recommendations: [...rows].sort((a, b) => b.priorityIndex - a.priorityIndex).slice(0, 60),
		}),

	invalidateRecommendation: (recommendationId) =>
		set((current) => ({
			recommendations: current.recommendations.filter((item) => item.id !== recommendationId),
		})),

	pushAlert: (alert) =>
		set((current) => {
			const exists = current.alerts.some((item) => item.id === alert.id);
			if (exists) {
				return current;
			}

			return {
				alerts: [alert, ...current.alerts].slice(0, 80),
			};
		}),

	setDomainKpi: (domain, patch) =>
		set((current) => ({
			domainKpi: {
				...current.domainKpi,
				[domain]: {
					...current.domainKpi[domain],
					...patch,
					updatedAt: nowIso(),
				},
			},
		})),

	setPresence: (workspaceId, onlineUsers) =>
		set((current) => ({
			presence: {
				...current.presence,
				[workspaceId]: {
					workspaceId,
					onlineUsers,
					updatedAt: nowIso(),
				},
			},
		})),

	pushMemorySignal: (signal) =>
		set((current) => {
			if (current.memorySignals.includes(signal)) {
				return current;
			}
			return {
				memorySignals: [signal, ...current.memorySignals].slice(0, 40),
			};
		}),

	reconcileFromRealtimeTick: (input) =>
		set((current) => {
			const previous = current.domainKpi[input.domain];
			const rollingAvg = Number(((previous.rollingAvg * 0.8 + input.confidence * 0.2)).toFixed(2));
			const amplifiedSignal = Number((input.anomaly * 0.45 + input.eventRate * 0.55).toFixed(2));
			const driftPct = Number(((input.confidence - rollingAvg) * 0.12).toFixed(2));
			const confidenceBias = Number((input.confidence - 50).toFixed(2));

			return {
				domainKpi: {
					...current.domainKpi,
					[input.domain]: {
						...previous,
						queueDepth: input.queueDepth,
						eventRate: input.eventRate,
						rollingAvg,
						amplifiedSignal,
						driftPct,
						confidenceBias,
						updatedAt: nowIso(),
					},
				},
			};
		}),
}));

export const selectDomainRuntime = (domain: LiveDomain) => (state: LiveIntelligenceState) =>
	state.domainKpi[domain];

