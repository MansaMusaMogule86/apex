import type {
  AggregatedSignal,
  Recommendation,
  RecommendationEvidence,
  RecommendationScore,
  SignalEvent,
  SignalSource,
} from "@/components/command-center/recommendation/types";

const SOURCE_WEIGHTS: Record<SignalSource, number> = {
  "founder-authority": 0.12,
  "lead-intelligence": 0.12,
  "influence-network": 0.1,
  "market-intelligence": 0.1,
  "competitor-movement": 0.13,
  "sentiment-shift": 0.09,
  "conversion-change": 0.1,
  "audience-migration": 0.08,
  "prestige-volatility": 0.1,
  "executive-engagement": 0.06,
};

export function aggregateSignals(events: SignalEvent[]): AggregatedSignal[] {
  const bySource = new Map<SignalSource, SignalEvent[]>();

  for (const event of events) {
    const existing = bySource.get(event.source) ?? [];
    existing.push(event);
    bySource.set(event.source, existing);
  }

  return Array.from(bySource.entries()).map(([source, sourceEvents]) => {
    const avgMagnitude = sourceEvents.reduce((sum, item) => sum + item.magnitude, 0) / sourceEvents.length;
    const avgVelocity = sourceEvents.reduce((sum, item) => sum + item.velocity, 0) / sourceEvents.length;
    const avgTrust = sourceEvents.reduce((sum, item) => sum + item.trust, 0) / sourceEvents.length;
    const volatilityCount = sourceEvents.filter((item) => item.direction === "volatile").length;
    const downCount = sourceEvents.filter((item) => item.direction === "down").length;

    const weightedStrength = avgMagnitude * SOURCE_WEIGHTS[source] + avgVelocity * 0.22;
    const anomalyProbability = Math.min(99, Math.round(volatilityCount * 11 + downCount * 7 + avgVelocity * 0.35));
    const confidenceStability = Math.max(1, Math.round(avgTrust - volatilityCount * 4));

    const trend: AggregatedSignal["trend"] = anomalyProbability > 68
      ? "adverse"
      : weightedStrength > 55
        ? "favorable"
        : "neutral";

    return {
      source,
      weightedStrength: Number(weightedStrength.toFixed(1)),
      anomalyProbability,
      confidenceStability,
      trend,
    };
  });
}

export function scoreRecommendation(
  base: Recommendation,
  aggregated: AggregatedSignal[],
  interactionBias: number,
): RecommendationScore {
  const relatedSignals = aggregated.filter((item) => item.source.includes(base.area.split("-")[0]));
  const signalLift = relatedSignals.length
    ? relatedSignals.reduce((sum, item) => sum + item.weightedStrength, 0) / relatedSignals.length
    : aggregated.reduce((sum, item) => sum + item.weightedStrength, 0) / Math.max(aggregated.length, 1);

  const confidence = clamp(base.score.confidence + signalLift * 0.08 + interactionBias * 0.2);
  const strategicImpact = clamp(base.score.strategicImpact + signalLift * 0.1);
  const revenueImpact = clamp(base.score.revenueImpact + signalLift * 0.08);
  const prestigeImpact = clamp(base.score.prestigeImpact + signalLift * 0.07);
  const timeSensitivity = clamp(base.score.timeSensitivity + (100 - confidence) * 0.12);
  const executionComplexity = clamp(base.score.executionComplexity + Math.max(0, 72 - confidence) * 0.06);

  const priorityIndex = clamp(
    confidence * 0.22 +
      strategicImpact * 0.22 +
      revenueImpact * 0.15 +
      prestigeImpact * 0.15 +
      timeSensitivity * 0.16 +
      (100 - executionComplexity) * 0.1,
  );

  const riskLevel: RecommendationScore["riskLevel"] =
    priorityIndex > 92 ? "critical" : priorityIndex > 82 ? "high" : priorityIndex > 68 ? "moderate" : "low";

  return {
    confidence,
    strategicImpact,
    revenueImpact,
    prestigeImpact,
    riskLevel,
    timeSensitivity,
    executionComplexity,
    outcomeWindow: base.score.outcomeWindow,
    priorityIndex,
  };
}

export function applySuppressionAndDedupe(recommendations: Recommendation[]) {
  const seen = new Set<string>();
  let suppressed = 0;
  let deduped = 0;

  const filtered = recommendations.filter((rec) => {
    const key = `${rec.type}-${rec.area}`;
    if (seen.has(key)) {
      deduped += 1;
      return false;
    }
    seen.add(key);

    const shouldSuppress = rec.score.confidence < 55 || (rec.score.executionComplexity > 82 && rec.score.priorityIndex < 72);
    if (shouldSuppress) {
      suppressed += 1;
      return false;
    }

    return true;
  });

  return { filtered, suppressed, deduped };
}

export function resolveContradictions(recommendations: Recommendation[]) {
  let contradictionResolutions = 0;

  const adjusted = recommendations.map((rec) => {
    if (rec.type === "revenue-acceleration" && rec.score.prestigeImpact < 65) {
      contradictionResolutions += 1;
      return {
        ...rec,
        escalationState: "watch" as const,
        summary: `${rec.summary} Adjusted by prestige risk gate to avoid brand dilution.`,
      };
    }

    if (rec.type === "luxury-positioning" && rec.score.revenueImpact < 60) {
      contradictionResolutions += 1;
      return {
        ...rec,
        escalationState: "watch" as const,
        reasoning: `${rec.reasoning} Revenue tradeoff flagged for executive review.`,
      };
    }

    return rec;
  });

  return { adjusted, contradictionResolutions };
}

export function applyDecay(recommendations: Recommendation[]) {
  return recommendations.map((rec, index) => {
    const decay = Math.max(0, index * 1.2);
    return {
      ...rec,
      score: {
        ...rec.score,
        priorityIndex: clamp(rec.score.priorityIndex - decay),
        confidence: clamp(rec.score.confidence - decay * 0.7),
      },
    };
  });
}

export function invalidateRecommendations(recommendations: Recommendation[]) {
  let invalidations = 0;
  const updated = recommendations.map((rec) => {
    const shouldInvalidate = rec.score.confidence < 48;
    if (!shouldInvalidate) return rec;
    invalidations += 1;
    return { ...rec, invalidated: true };
  });

  return { updated, invalidations };
}

export function buildEvidenceFromSignals(signals: AggregatedSignal[]): RecommendationEvidence[] {
  return signals.slice(0, 3).map((item) => ({
    source: item.source,
    statement: `Signal ${item.source} strength ${item.weightedStrength} with anomaly probability ${item.anomalyProbability}.`,
    weight: Number((item.weightedStrength / 100).toFixed(2)),
  }));
}

function clamp(value: number) {
  return Number(Math.max(1, Math.min(99, value)).toFixed(1));
}
