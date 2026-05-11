-- =====================================================================
-- APEX · Request Access Intelligence System
-- Creates the first operational operator qualification pipeline.
-- =====================================================================

do $$
begin
  create type access_request_priority as enum ('critical', 'high', 'medium', 'watch');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type access_request_status as enum (
    'submitted',
    'processing',
    'executive_review',
    'executive_call',
    'approved',
    'waitlisted',
    'declined'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  company text not null,
  industry text not null,
  website text,
  linkedin text,
  revenue_range text not null,
  market_focus text not null,
  strategic_objective text not null,
  why_apex text not null,
  prestige_score smallint check (prestige_score between 0 and 100),
  authority_score smallint check (authority_score between 0 and 100),
  market_potential_score smallint check (market_potential_score between 0 and 100),
  luxury_fit_score smallint check (luxury_fit_score between 0 and 100),
  priority_level access_request_priority not null default 'watch',
  ai_summary text,
  ai_recommendation text,
  status access_request_status not null default 'submitted',
  executive_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists idx_access_requests_email_unique
  on public.access_requests (lower(email));

create index if not exists idx_access_requests_created_at_desc
  on public.access_requests (created_at desc);

create index if not exists idx_access_requests_status_priority_created
  on public.access_requests (status, priority_level, created_at desc);

create index if not exists idx_access_requests_priority_scores
  on public.access_requests (
    priority_level,
    prestige_score desc nulls last,
    authority_score desc nulls last,
    luxury_fit_score desc nulls last
  );

create trigger trg_access_requests_updated before update on public.access_requests
  for each row execute function public.tg_set_updated_at();

alter table public.access_requests enable row level security;

create policy "access_requests_staff_select" on public.access_requests
  for select using (public.fn_is_staff());

create policy "access_requests_staff_insert" on public.access_requests
  for insert with check (public.fn_is_staff());

create policy "access_requests_staff_update" on public.access_requests
  for update using (public.fn_is_staff()) with check (public.fn_is_staff());

alter publication supabase_realtime add table public.access_requests;