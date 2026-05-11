-- APEX Applications — onboarding flow (/request-access)
-- Captures qualified applications from the private access gateway.

create table if not exists public.apex_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  title text,
  company text not null,
  market text,
  aum_range text,
  email text not null unique,
  intent_type text check (
    intent_type in ('intelligence_os', 'deal_flow', 'influence', 'advisory')
  ),
  problem_statement text,
  signal_score int,
  linkedin_url text,
  website_url text,
  referral_source text,
  referral_code text,
  phantom_scan_authorized boolean not null default false,
  osint_score int,
  status text not null default 'pending' check (
    status in ('pending', 'reviewing', 'approved', 'rejected')
  ),
  ref_code text not null unique,
  notes text
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
