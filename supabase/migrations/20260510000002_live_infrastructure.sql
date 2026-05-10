-- =====================================================================
-- APEX · Live Infrastructure Layer
-- Multi-tenant intelligence, event bus, recommendation runtime, memory
-- =====================================================================

create extension if not exists pgmq;

-- Enums ----------------------------------------------------------------
create type membership_role as enum (
  'owner',
  'executive',
  'strategist',
  'operator',
  'analyst',
  'viewer'
);

create type executive_access_level as enum (
  'observer',
  'operator',
  'strategist',
  'executive',
  'owner'
);

create type membership_status as enum ('invited', 'active', 'suspended', 'revoked');
create type workspace_type as enum ('global', 'market', 'founder', 'lead', 'influence', 'reports', 'simulator', 'recommendation');
create type event_priority as enum ('low', 'normal', 'high', 'critical');
create type processing_status as enum ('queued', 'processing', 'completed', 'failed', 'dead_lettered');
create type recommendation_state as enum ('active', 'suppressed', 'invalidated', 'executed', 'dismissed');
create type contradiction_state as enum ('none', 'detected', 'resolved', 'escalated');
create type memory_type as enum (
  'executive_interaction',
  'strategic_history',
  'recommendation_outcome',
  'organizational_intelligence',
  'prestige_trajectory',
  'founder_narrative',
  'market_event'
);

-- Organizations --------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'institutional',
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_chk check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$')
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role membership_role not null default 'viewer',
  access_level executive_access_level not null default 'observer',
  membership_status membership_status not null default 'active',
  invited_by uuid references public.profiles(id) on delete set null,
  invited_at timestamptz,
  joined_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.organization_workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  workspace_type workspace_type not null,
  settings jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, code)
);

alter table public.profiles add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.clients add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create index if not exists idx_profiles_organization_id on public.profiles(organization_id);
create index if not exists idx_clients_organization_id on public.clients(organization_id);
create index idx_org_memberships_user_active on public.organization_memberships(user_id, membership_status);
create index idx_org_memberships_org_role on public.organization_memberships(organization_id, role);
create index idx_workspaces_org on public.organization_workspaces(organization_id, workspace_type);

-- Session and auth hardening ------------------------------------------
create table public.executive_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_token_hash text not null,
  mfa_verified boolean not null default false,
  ip inet,
  user_agent text,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now()
);

create index idx_executive_sessions_user on public.executive_sessions(user_id, started_at desc);
create index idx_executive_sessions_org on public.executive_sessions(organization_id, started_at desc);
create index idx_executive_sessions_active on public.executive_sessions(expires_at) where revoked_at is null;

-- Event bus and orchestration -----------------------------------------
create table public.event_bus_events (
  id bigserial primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  source text not null,
  event_type text not null,
  event_priority event_priority not null default 'normal',
  correlation_id text,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  processing_status processing_status not null default 'queued',
  processed_at timestamptz,
  attempts smallint not null default 0
);

create table public.event_bus_failures (
  id bigserial primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  event_id bigint references public.event_bus_events(id) on delete cascade,
  failure_stage text not null,
  error_message text not null,
  retry_count smallint not null default 0,
  next_retry_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.signal_snapshots (
  id bigserial primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  source_event_id bigint references public.event_bus_events(id) on delete set null,
  signal_key text not null,
  signal_value numeric(10,3) not null,
  confidence numeric(6,3) not null,
  anomaly_score numeric(6,3) not null,
  trend text not null,
  captured_at timestamptz not null default now()
);

create index idx_event_bus_org_received on public.event_bus_events(organization_id, received_at desc);
create index idx_event_bus_priority on public.event_bus_events(event_priority, processing_status, received_at desc);
create index idx_event_bus_workspace on public.event_bus_events(workspace_id, received_at desc);
create index idx_event_failures_retry on public.event_bus_failures(next_retry_at) where next_retry_at is not null;
create index idx_signal_snapshots_org on public.signal_snapshots(organization_id, captured_at desc);
create index idx_signal_snapshots_key on public.signal_snapshots(organization_id, signal_key, captured_at desc);

-- Recommendation pipeline ---------------------------------------------
create table public.recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  triggered_by text not null,
  trigger_reason text not null,
  model_route text not null,
  confidence_model_version text not null,
  priority_index numeric(6,2) not null,
  status text not null default 'running',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.recommendations_live (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.recommendation_runs(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  recommendation_type text not null,
  title text not null,
  executive_summary text not null,
  ai_reasoning text not null,
  suggested_actions jsonb not null default '[]'::jsonb,
  forecast_outcome text not null,
  supporting_evidence jsonb not null default '[]'::jsonb,
  urgency_label text not null,
  escalation_state text not null default 'normal',
  confidence_score numeric(6,2) not null,
  strategic_impact_score numeric(6,2) not null,
  revenue_impact_estimate numeric(6,2) not null,
  prestige_impact_estimate numeric(6,2) not null,
  risk_level text not null,
  time_sensitivity_score numeric(6,2) not null,
  execution_complexity_score numeric(6,2) not null,
  expected_outcome_window text not null,
  priority_index numeric(6,2) not null,
  recommendation_state recommendation_state not null default 'active',
  contradiction_state contradiction_state not null default 'none',
  invalidated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recommendation_id uuid not null references public.recommendations_live(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  outcome text,
  impact_score numeric(6,2),
  notes text,
  created_at timestamptz not null default now()
);

create index idx_recommendation_runs_org on public.recommendation_runs(organization_id, created_at desc);
create index idx_recommendations_org_priority on public.recommendations_live(organization_id, priority_index desc);
create index idx_recommendations_workspace on public.recommendations_live(workspace_id, priority_index desc);
create index idx_recommendations_active on public.recommendations_live(organization_id, recommendation_state) where invalidated_at is null;
create index idx_recommendation_feedback_recommendation on public.recommendation_feedback(recommendation_id, created_at desc);

-- Agent orchestration -------------------------------------------------
create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  recommendation_run_id uuid references public.recommendation_runs(id) on delete set null,
  agent_name text not null,
  task_type text not null,
  task_priority event_priority not null default 'normal',
  task_input jsonb not null default '{}'::jsonb,
  task_output jsonb,
  status processing_status not null default 'queued',
  retry_count smallint not null default 0,
  next_retry_at timestamptz,
  last_error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_task_events (
  id bigserial primary key,
  task_id uuid not null references public.agent_tasks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_agent_tasks_org_status on public.agent_tasks(organization_id, status, task_priority, created_at desc);
create index idx_agent_tasks_retry on public.agent_tasks(next_retry_at) where next_retry_at is not null;
create index idx_agent_task_events_task on public.agent_task_events(task_id, created_at desc);

-- Executive memory ----------------------------------------------------
create table public.executive_memories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  memory_type memory_type not null,
  source_recommendation_id uuid references public.recommendations_live(id) on delete set null,
  title text,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  importance smallint not null default 50 check (importance between 0 and 100),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_exec_memories_org_type on public.executive_memories(organization_id, memory_type, created_at desc);
create index idx_exec_memories_workspace on public.executive_memories(workspace_id, created_at desc);
create index idx_exec_memories_embedding on public.executive_memories using ivfflat (embedding vector_cosine_ops) with (lists = 120);

-- Notifications and executive actions --------------------------------
create table public.executive_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null,
  severity text not null,
  title text not null,
  body text,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.executive_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.organization_workspaces(id) on delete set null,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  recommendation_id uuid references public.recommendations_live(id) on delete set null,
  action_type text not null,
  action_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_exec_notifications_user on public.executive_notifications(user_id, created_at desc);
create index idx_exec_notifications_org on public.executive_notifications(organization_id, created_at desc);
create index idx_exec_actions_org on public.executive_actions(organization_id, created_at desc);
create index idx_exec_actions_recommendation on public.executive_actions(recommendation_id, created_at desc);

-- Helper functions ----------------------------------------------------
create or replace function public.fn_org_ids()
returns table (organization_id uuid)
language sql stable security definer set search_path = public as $$
  select m.organization_id
  from public.organization_memberships m
  where m.user_id = auth.uid() and m.membership_status = 'active';
$$;

create or replace function public.fn_is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.membership_status = 'active'
  );
$$;

create or replace function public.fn_exec_level(target_org uuid)
returns executive_access_level
language sql stable security definer set search_path = public as $$
  select coalesce(
    (
      select m.access_level
      from public.organization_memberships m
      where m.organization_id = target_org
        and m.user_id = auth.uid()
        and m.membership_status = 'active'
      limit 1
    ),
    'observer'::executive_access_level
  );
$$;

create or replace function public.fn_exec_at_least(target_org uuid, min_level executive_access_level)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  current_rank int;
  required_rank int;
begin
  current_rank := case public.fn_exec_level(target_org)
    when 'observer' then 1
    when 'operator' then 2
    when 'strategist' then 3
    when 'executive' then 4
    when 'owner' then 5
    else 0
  end;

  required_rank := case min_level
    when 'observer' then 1
    when 'operator' then 2
    when 'strategist' then 3
    when 'executive' then 4
    when 'owner' then 5
    else 99
  end;

  return current_rank >= required_rank;
end;
$$;

-- RLS -----------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_workspaces enable row level security;
alter table public.executive_sessions enable row level security;
alter table public.event_bus_events enable row level security;
alter table public.event_bus_failures enable row level security;
alter table public.signal_snapshots enable row level security;
alter table public.recommendation_runs enable row level security;
alter table public.recommendations_live enable row level security;
alter table public.recommendation_feedback enable row level security;
alter table public.agent_tasks enable row level security;
alter table public.agent_task_events enable row level security;
alter table public.executive_memories enable row level security;
alter table public.executive_notifications enable row level security;
alter table public.executive_actions enable row level security;

create policy "organizations_member_read" on public.organizations
  for select using (public.fn_is_org_member(id));

create policy "organizations_owner_manage" on public.organizations
  for all using (public.fn_exec_at_least(id, 'owner'))
  with check (public.fn_exec_at_least(id, 'owner'));

create policy "org_memberships_member_read" on public.organization_memberships
  for select using (public.fn_is_org_member(organization_id));

create policy "org_memberships_owner_manage" on public.organization_memberships
  for all using (public.fn_exec_at_least(organization_id, 'owner'))
  with check (public.fn_exec_at_least(organization_id, 'owner'));

create policy "workspaces_member_read" on public.organization_workspaces
  for select using (public.fn_is_org_member(organization_id));

create policy "workspaces_exec_manage" on public.organization_workspaces
  for all using (public.fn_exec_at_least(organization_id, 'executive'))
  with check (public.fn_exec_at_least(organization_id, 'executive'));

create policy "exec_sessions_owner_read" on public.executive_sessions
  for select using (user_id = auth.uid() or public.fn_exec_at_least(organization_id, 'owner'));

create policy "events_org_read" on public.event_bus_events
  for select using (public.fn_is_org_member(organization_id));

create policy "events_operator_write" on public.event_bus_events
  for insert with check (public.fn_exec_at_least(organization_id, 'operator'));

create policy "signals_org_read" on public.signal_snapshots
  for select using (public.fn_is_org_member(organization_id));

create policy "signals_strategist_write" on public.signal_snapshots
  for insert with check (public.fn_exec_at_least(organization_id, 'strategist'));

create policy "recommendation_runs_org_read" on public.recommendation_runs
  for select using (public.fn_is_org_member(organization_id));

create policy "recommendation_runs_exec_write" on public.recommendation_runs
  for insert with check (public.fn_exec_at_least(organization_id, 'executive'));

create policy "recommendations_org_read" on public.recommendations_live
  for select using (public.fn_is_org_member(organization_id));

create policy "recommendations_exec_write" on public.recommendations_live
  for all using (public.fn_exec_at_least(organization_id, 'executive'))
  with check (public.fn_exec_at_least(organization_id, 'executive'));

create policy "recommendation_feedback_org_read" on public.recommendation_feedback
  for select using (public.fn_is_org_member(organization_id));

create policy "recommendation_feedback_operator_write" on public.recommendation_feedback
  for insert with check (public.fn_exec_at_least(organization_id, 'operator'));

create policy "agent_tasks_org_read" on public.agent_tasks
  for select using (public.fn_is_org_member(organization_id));

create policy "agent_tasks_exec_write" on public.agent_tasks
  for all using (public.fn_exec_at_least(organization_id, 'executive'))
  with check (public.fn_exec_at_least(organization_id, 'executive'));

create policy "agent_task_events_org_read" on public.agent_task_events
  for select using (
    exists (
      select 1 from public.agent_tasks t
      where t.id = task_id and public.fn_is_org_member(t.organization_id)
    )
  );

create policy "agent_task_events_exec_write" on public.agent_task_events
  for insert with check (
    exists (
      select 1 from public.agent_tasks t
      where t.id = task_id and public.fn_exec_at_least(t.organization_id, 'executive')
    )
  );

create policy "memories_org_read" on public.executive_memories
  for select using (public.fn_is_org_member(organization_id));

create policy "memories_strategist_write" on public.executive_memories
  for all using (public.fn_exec_at_least(organization_id, 'strategist'))
  with check (public.fn_exec_at_least(organization_id, 'strategist'));

create policy "exec_notifications_self_or_exec" on public.executive_notifications
  for select using (user_id = auth.uid() or public.fn_exec_at_least(organization_id, 'executive'));

create policy "exec_notifications_exec_write" on public.executive_notifications
  for insert with check (public.fn_exec_at_least(organization_id, 'executive'));

create policy "exec_actions_org_read" on public.executive_actions
  for select using (public.fn_is_org_member(organization_id));

create policy "exec_actions_operator_write" on public.executive_actions
  for insert with check (public.fn_exec_at_least(organization_id, 'operator'));

-- Realtime publication -------------------------------------------------
alter publication supabase_realtime add table public.event_bus_events;
alter publication supabase_realtime add table public.signal_snapshots;
alter publication supabase_realtime add table public.recommendations_live;
alter publication supabase_realtime add table public.executive_notifications;
alter publication supabase_realtime add table public.executive_actions;

-- Updated_at triggers --------------------------------------------------
create trigger trg_organizations_updated before update on public.organizations
  for each row execute function public.tg_set_updated_at();

create trigger trg_org_memberships_updated before update on public.organization_memberships
  for each row execute function public.tg_set_updated_at();

create trigger trg_org_workspaces_updated before update on public.organization_workspaces
  for each row execute function public.tg_set_updated_at();

create trigger trg_recommendations_live_updated before update on public.recommendations_live
  for each row execute function public.tg_set_updated_at();

-- Queue bootstrap ------------------------------------------------------
select pgmq.create('apex_events_critical');
select pgmq.create('apex_events_high');
select pgmq.create('apex_events_normal');
select pgmq.create('apex_events_low');
