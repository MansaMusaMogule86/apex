-- =====================================================================
-- APEX · Initial Schema
-- PRD §08 Database Architecture · Supabase / Postgres
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- Enums ---------------------------------------------------------------
create type client_tier as enum ('prestige', 'elite', 'bespoke');
create type campaign_status as enum ('draft', 'active', 'paused', 'completed');
create type campaign_inf_status as enum ('proposed', 'contracted', 'live', 'complete');
create type user_role as enum ('super_admin', 'admin', 'account_manager', 'client_owner', 'client_viewer');
create type lead_stage as enum ('lead', 'qualified', 'proposal', 'negotiation', 'client', 'retained');
create type report_type as enum ('monthly', 'weekly', 'campaign', 'adhoc');
create type notification_type as enum ('success', 'info', 'error', 'ai_insight');

-- =====================================================================
-- profiles · extends auth.users
-- =====================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'client_viewer',
  client_id uuid,
  mfa_enabled boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================================
-- clients
-- =====================================================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  tier client_tier not null default 'prestige',
  apex_score smallint not null default 0 check (apex_score between 0 and 1000),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  brand_guidelines jsonb,
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_client_id_fk
  foreign key (client_id) references public.clients(id) on delete set null;

create index idx_profiles_client_id on public.profiles(client_id);
create index idx_clients_owner_id on public.clients(owner_id);

-- =====================================================================
-- influencers
-- =====================================================================
create table public.influencers (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  display_name text,
  avatar_url text,
  cover_url text,
  platform text[] not null default '{}',
  apex_score smallint not null default 0 check (apex_score between 0 and 1000),
  followers_total bigint not null default 0,
  engagement_rate numeric(5,2) not null default 0,
  location text,
  niches text[] not null default '{}',
  languages text[] not null default '{}',
  ai_notes jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_influencers_apex_score on public.influencers(apex_score desc);
create index idx_influencers_followers on public.influencers(followers_total desc);
create index idx_influencers_niches on public.influencers using gin(niches);
create index idx_influencers_platform on public.influencers using gin(platform);
create index idx_influencers_embedding on public.influencers using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- =====================================================================
-- campaigns
-- =====================================================================
create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status campaign_status not null default 'draft',
  budget numeric(14,2) not null default 0,
  start_date date,
  end_date date,
  kpis jsonb not null default '{}'::jsonb,
  ai_brief text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_campaigns_client_id on public.campaigns(client_id);
create index idx_campaigns_status on public.campaigns(status);

-- =====================================================================
-- campaign_influencers (join)
-- =====================================================================
create table public.campaign_influencers (
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  fee numeric(14,2) not null default 0,
  deliverables jsonb not null default '{}'::jsonb,
  status campaign_inf_status not null default 'proposed',
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (campaign_id, influencer_id)
);

create index idx_ci_influencer on public.campaign_influencers(influencer_id);

-- =====================================================================
-- leads (CRM pipeline)
-- =====================================================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  company text,
  email text,
  phone text,
  stage lead_stage not null default 'lead',
  value numeric(14,2) not null default 0,
  source text,
  ai_next_action text,
  last_touch_at timestamptz,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_leads_stage on public.leads(stage);
create index idx_leads_owner on public.leads(owner_id);

-- =====================================================================
-- ai_reports
-- =====================================================================
create table public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type report_type not null,
  title text not null,
  content jsonb not null,
  pdf_url text,
  generated_at timestamptz not null default now()
);

create index idx_reports_client on public.ai_reports(client_id, generated_at desc);

-- =====================================================================
-- notifications
-- =====================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type notification_type not null default 'info',
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notif_user_unread on public.notifications(user_id, read_at);

-- =====================================================================
-- audit_log (immutable append-only)
-- =====================================================================
create table public.audit_log (
  id bigserial primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_audit_actor on public.audit_log(actor_id, created_at desc);
create index idx_audit_entity on public.audit_log(entity, entity_id);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.tg_set_updated_at();
create trigger trg_influencers_updated before update on public.influencers
  for each row execute function public.tg_set_updated_at();
create trigger trg_campaigns_updated before update on public.campaigns
  for each row execute function public.tg_set_updated_at();
create trigger trg_leads_updated before update on public.leads
  for each row execute function public.tg_set_updated_at();

-- Auto-create profile row on auth.users insert
create or replace function public.tg_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.tg_handle_new_user();
