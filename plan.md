# APEX Revenue OS — MVP Build Plan

## Objective
Build a working, premium, full-stack MVP of the APEX Revenue OS web application from the PRD
(`/mnt/agents/output/APEX_Revenue_OS_PRD_v1.json`). Dubai real estate revenue OS: WhatsApp-native CRM,
deal pipelines, property matching, AI command layer. Deliverable = browser-openable web app, versioned
via website_version_manager.

## MVP Slice (scoped from PRD — Phase 1 + Phase 2 revenue core + demo-grade AI/comms layers)
IN SCOPE (functional demo with real backend):
1. Auth + organization context (Kimi auth via backend-building-swarm)
2. Dashboard (owner/manager KPIs: pipeline value, leads, SLA, viewings, forecast)
3. Relationships — Contacts & Companies (CRUD, search, timeline stub)
4. Deal Flow — buyer_sales pipeline Kanban with PRD stage list, drag/move, stage history
5. Properties — inventory list/grid, detail, Dubai communities, AED formatting
6. Buyer Requirements + Property Matching (deterministic filters + weighted scoring from PRD weights)
7. Tasks & reminders
8. Inbox — unified conversation timeline (seeded WhatsApp/email threads, AI draft suggestion UI)
9. AI Command Center — natural-language command bar with canned intelligent responses over real data
10. Reports — pipeline forecast, lead response SLA, source attribution
11. Notifications + audit-log stubs

OUT OF SCOPE (per PRD non-goals / later phases): real WhatsApp Business API, real email sync,
portals, commissions engine, workflow automation builder, MFA, native mobile.

## Stage Plan
- **Stage 0 — Scaffold & Workspace**: Load `vibecoding-webapp-swarm` (orchestration) → read it first.
  Set up shared repo via `swarm-workspace`. Seed PRD-derived domain data (Dubai communities, projects,
  pipelines/stages, demo contacts/properties/deals).
- **Stage 1 — Design system + app shell**: webapp-building-swarm frontend: Next.js/React + Tailwind +
  shadcn/ui. Premium, high-trust, calm operational aesthetic (PRD UX direction: "Premium, high-trust,
  operational, fast, and calm"). Desktop-first, min width 390. Left nav per PRD IA: Command, Dashboard,
  Inbox, Relationships, Deal Flow, Properties, Viewings, Tasks, Documents, Reports, Automations, Admin.
- **Stage 2 — Backend graft**: backend-building-swarm: tRPC + Drizzle + Hono + MySQL on a worktree;
  schema for contacts, companies, deals, stages, properties, requirements, matches, tasks, conversations,
  messages, viewings, audit. Seed data. Kimi auth if supported.
- **Stage 3 — Feature waves (parallel sub-agents, each on own worktree)**:
  Wave A: Dashboard + Reports | Contacts/Companies CRM
  Wave B: Deal Flow Kanban + stage history | Properties + Matching engine UI
  Wave C: Inbox + AI drafts | AI Command bar | Tasks/Viewings
- **Stage 4 — Integration & hardening**: merge branches, resolve conflicts, run build, fix errors,
  verify routes end-to-end.
- **Stage 5 — Deliver**: production build → `website_version_manager build_version` (type per project
  shape: dynamic if server-backed, static if frontend-only fallback). Report URL + summary.

## Sub-agent assignments
- Orchestrator-designed guidance inline in spawn prompts; skill paths passed by reference:
  - Frontend agents: read `/app/.agents/skills/webapp-building-swarm/SKILL.md`
  - Backend agent: read `/app/.agents/skills/backend-building-swarm/SKILL.md`
  - Worktree setup: `/app/.agents/skills/swarm-workspace/SKILL.md` (setup-local.sh)
- Each agent receives: (1) scoped skill guidance, (2) PRD-relevant context pasted inline, (3) atomic mission.

## Validation gates
- After Stage 2: schema migrates + seed loads + tRPC router responds.
- After each wave: branch builds independently before merge.
- Final: `npm run build` green; all nav routes render; no console-blocking errors.
