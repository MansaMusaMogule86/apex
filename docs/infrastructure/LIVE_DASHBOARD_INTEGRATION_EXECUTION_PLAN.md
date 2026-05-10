# APEX Live Dashboard Integration Execution Plan

## 1) Integration Order (Execution Sequence)
1. Foundation runtime layer
   - Deploy global live state (`zustand`) and query transport (`react-query`)
   - Initialize stream health, retry, and offline recovery
2. Multi-tenant channel wiring
   - Apply channel naming strategy for org/workspace/domain scopes
   - Add presence + broadcast lifecycle
3. Recommendation pipeline sync
   - Pull live recommendations from `/api/live/recommendations`
   - Merge SSE snapshots and recommendation create events into feed
4. KPI engine activation
   - Reconcile queue depth, event rate, confidence drift, anomaly amplification
   - Feed KPI drift to all ribbon/header components
5. Alert and executive urgency layer
   - Ingest DB notifications and SSE alerts
   - Route to intelligence rail and dashboard section alerts
6. Screen-by-screen cutover
   - Home, AI Recommendation, Scenario, Founder, Influence, Market, Lead, Reports
7. Production hardening
   - Retry policies, invalidation, optimistic mutation rollback, lint gate

## 2) Route-by-Route Live Connection Map
- `/dashboard` -> `home` domain runtime + live recommendations + alert stream
- `/dashboard/ai` -> `recommendation` domain runtime + SSE recommendation snapshots + optimistic execute action
- `/dashboard/scenario-simulator` -> `scenario` runtime drift + live alerts + queue/event telemetry
- `/dashboard/founder-authority` -> `founder` runtime drift + alert stream + executive sync presence
- `/dashboard/influencers` -> `influence` runtime drift + alert stream + signal amplification
- `/dashboard/analytics` -> `market` runtime + anomaly/competitor alert stream
- `/dashboard/crm` -> `lead` runtime + lead quality alert stream
- `/dashboard/reports` -> `reports` runtime + KPI drift + executive notification stream

## 3) File-by-File Implementation
### New core runtime
- `src/stores/live-intelligence-store.ts`
  - Global realtime state, recommendation cache, alert routing, KPI runtime, connection health, memory signals
- `src/providers/LiveIntelligenceProvider.tsx`
  - Query client bootstrap + online/offline recovery wiring
- `src/hooks/useLiveEventStream.ts`
  - SSE stream handling with retry/backoff and lifecycle callbacks
- `src/hooks/useLiveOrgContext.ts`
  - Organization/workspace resolution for multi-tenant routing
- `src/hooks/useLivePresence.ts`
  - Presence tracking and broadcast channels for executive sync and memory signal fanout
- `src/hooks/useLiveIntelligence.ts`
  - Domain orchestrator: query pull, SSE merge, DB subscription sync, optimistic action mutation

### Updated infrastructure helpers
- `src/lib/live/realtime.ts`
  - Added channel naming strategy for recommendations, alerts, domain signals, executive sync, presence, broadcast

### Updated UI integration
- `src/components/command-center/CommandCenterShell.tsx`
  - Global live provider mount
- `src/components/command-center/CommandCenterTopBar.tsx`
  - Stream health + presence + live alert count
- `src/components/command-center/IntelligenceRail.tsx`
  - Live alert rail integration
- `src/components/command-center/home/HomeScreen.tsx`
- `src/components/command-center/recommendation/RecommendationEngineScreen.tsx`
- `src/components/command-center/scenario/ScenarioSimulatorScreen.tsx`
- `src/components/command-center/founder/FounderAuthorityScreen.tsx`
- `src/components/command-center/influence/InfluenceNetworkScreen.tsx`
- `src/components/command-center/market/MarketIntelligenceScreen.tsx`
- `src/components/command-center/lead/LeadIntelligenceScreen.tsx`
- `src/components/command-center/reports/ExecutiveReportsScreen.tsx`

## 4) Subscription Architecture
- Postgres subscriptions (`useRealtime`)
  - `event_bus_events` (INSERT): queue-depth/event-rate telemetry
  - `executive_notifications` (INSERT): alert ingestion
- SSE (`/api/live/stream`)
  - `heartbeat`
  - `recommendations.snapshot`
  - `recommendation.created`
  - `alert`
  - `domain.signal`
  - `executive.action`
- Presence/broadcast
  - Presence channel per org/workspace
  - Memory and executive sync broadcast events

## 5) State Reconciliation Strategy
- Source priority order
  1. SSE snapshots
  2. SSE incremental events
  3. Postgres realtime events
  4. Interval query refetch
- Conflict handling
  - Recommendation upsert by `id`
  - Feed order by `priorityIndex desc`
  - Dedup by semantic key (`title`) on merged UI feed
- Cache invalidation
  - Invalidate `live/recommendations` query after executive action mutation success

## 6) Optimistic Updates + Recovery
- On recommendation execute action:
  - Optimistically remove recommendation from local store
  - If API fails, rollback previous recommendation list
  - Emit P1 alert for execution failure and rollback completion

## 7) Offline/Retry Policy
- SSE reconnect with exponential backoff
  - Base: 1200ms
  - Max: 15000ms
- Connection state machine
  - `connecting -> connected -> degraded -> offline`
- Browser online/offline events update global connection status

## 8) KPI Engine Model
- Runtime metrics computed continuously:
  - `queueDepth`
  - `eventRate`
  - `rollingAvg`
  - `amplifiedSignal`
  - `driftPct`
  - `confidenceBias`
- KPI display mutation:
  - Parsed numeric values adjusted with drift
  - Confidence and delta updated with bounded clamps

## 9) OpenAI Orchestration Integration Points
- Existing recommendation pipeline endpoint remains canonical:
  - `POST /api/live/recommendations` trigger mode for model recalculation
- Context injection layers:
  - latest signal snapshots
  - recommendation outcomes and memory signals
  - escalation and risk state
- Streaming response behavior:
  - surfaced through SSE event normalization into domain state

## 10) Deployment Checklist
1. Set env vars:
   - `NEXT_PUBLIC_APEX_ORGANIZATION_ID`
   - `NEXT_PUBLIC_APEX_WORKSPACE_*` IDs per domain
   - Supabase public keys
2. Apply DB migrations in order (`00000`, `00001`, `00002`)
3. Validate authenticated org membership
4. Start frontend and verify:
   - stream health indicator changes correctly
   - presence counts update from multiple sessions
   - recommendation feed updates without refresh
5. Run lint gate
6. Staging soak test with synthetic event bursts

## 11) Testing Strategy
- Unit
  - KPI drift parser/formatter
  - store upsert/invalidation/reconciliation reducers
- Integration
  - SSE stream reconnect and heartbeat transitions
  - optimistic execute rollback path
- End-to-end
  - ingest event -> recommendation created -> rail alert -> execute recommendation

## 12) Production Rollout Order
1. Deploy runtime/store/hooks behind feature flag
2. Enable Home + AI modules
3. Enable Scenario + Founder + Influence
4. Enable Market + Lead + Reports
5. Enable presence and executive sync broadcasts
6. Remove feature flag after 48h stability window
