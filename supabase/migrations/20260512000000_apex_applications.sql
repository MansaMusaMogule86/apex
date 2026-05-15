-- APEX Applications — onboarding flow (/request-access)
-- Captures qualified applications from the private access gateway.

create table if not exists public.apex_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  title text,
  company text not null,
  industry text,
  revenue_range text,
  market_focus text,
  strategic_objective text,
  why_apex text,
  email text not null unique,
  linkedin text,
  website text,
  referral_source text,
  priority_level text default 'medium',
  prestige_score int,
  authority_score int,
  market_potential_score int,
  luxury_fit_score int,
  ai_summary text,
  ai_recommendation text,
  executive_notes text,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'executive_review', 'approved', 'rejected', 'submitted')
  ),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create index if not exists apex_applications_created_at_idx
  on public.apex_applications (created_at desc);
create index if not exists apex_applications_status_idx
  on public.apex_applications (status);

alter table public.apex_applications enable row level security;

-- Anonymous applicants may insert only.
drop policy if exists "apex_applications_anon_insert" on public.apex_applications;
create policy "apex_applications_anon_insert"
  on public.apex_applications
  for insert
  to anon
  with check (true);

-- No SELECT / UPDATE / DELETE policies for anon — service role bypasses RLS.
