# Live API Contracts

## POST /api/live/events

Ingest live operational events.

Request:

```json
{
  "organizationId": "uuid",
  "workspaceId": "uuid",
  "source": "market-intelligence",
  "eventType": "market.anomaly.detected",
  "priority": "critical",
  "correlationId": "corr-123",
  "payload": {
    "anomalyScore": 87.2,
    "region": "GCC"
  },
  "occurredAt": "2026-05-10T10:12:43.010Z"
}
```

Response `202`:

```json
{
  "eventId": 1842,
  "queue": "apex:events:critical",
  "status": "accepted"
}
```

## GET /api/live/recommendations

Query params:

- `organization_id` (required)
- `workspace_id` (optional)
- `limit` (optional, default 20, max 100)

Response `200`:

```json
{
  "recommendations": [
    {
      "id": "uuid",
      "title": "Reinforce prestige narrative before competitor resonance peak",
      "executive_summary": "...",
      "escalation_state": "urgent",
      "priority_index": 92.4,
      "confidence_score": 88.1,
      "risk_level": "high",
      "created_at": "2026-05-10T10:30:11.111Z"
    }
  ]
}
```

## POST /api/live/recommendations?mode=trigger

Request:

```json
{
  "organizationId": "uuid",
  "workspaceId": "uuid",
  "trigger": "event-spike",
  "reason": "Competitor pressure + prestige drift"
}
```

Response `202`:

```json
{
  "runId": "uuid",
  "recommendation": {
    "id": "uuid",
    "title": "...",
    "priority_index": 90.2,
    "confidence_score": 87.8,
    "escalation_state": "urgent"
  }
}
```

## POST /api/live/recommendations?mode=manual

Request:

```json
{
  "organizationId": "uuid",
  "workspaceId": "uuid",
  "recommendationType": "strategic-timing",
  "title": "Activate founder brief in 6h window",
  "executiveSummary": "...",
  "aiReasoning": "...",
  "suggestedActions": ["action-1", "action-2"],
  "forecastOutcome": "...",
  "supportingEvidence": [{"source": "signal"}],
  "urgencyLabel": "6h",
  "escalationState": "watch",
  "score": {
    "confidence": 85,
    "strategicImpact": 90,
    "revenueImpact": 82,
    "prestigeImpact": 88,
    "riskLevel": "high",
    "timeSensitivity": 78,
    "executionComplexity": 40,
    "outcomeWindow": "24-72 hours",
    "priorityIndex": 89
  }
}
```

Response `201`:

```json
{
  "recommendation": {
    "id": "uuid",
    "title": "...",
    "priority_index": 89,
    "confidence_score": 85,
    "escalation_state": "watch"
  }
}
```

## GET /api/live/stream

SSE endpoint for recommendation snapshots and heartbeats.

Query params:

- `organization_id` (required)
- `workspace_id` (optional)

Frames:

```text
event: recommendations.snapshot
data: {"ts":"...","recommendations":[...]}

event: heartbeat
data: {"ts":"...","type":"heartbeat"}
```

## POST /api/live/executive-actions

Request:

```json
{
  "organizationId": "uuid",
  "workspaceId": "uuid",
  "recommendationId": "uuid",
  "actionType": "approve",
  "actionPayload": {
    "notes": "approved by COO"
  }
}
```

Response `201`:

```json
{
  "action": {
    "id": "uuid",
    "action_type": "approve",
    "created_at": "2026-05-10T11:00:00.000Z"
  }
}
```

## Error contract

```json
{
  "error": "human readable message",
  "issues": []
}
```

- `issues` appears for validation errors (`422`).
