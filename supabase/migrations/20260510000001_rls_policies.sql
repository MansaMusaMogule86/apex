-- =====================================================================
-- APEX · Row-Level Security
-- PRD §09 Auth & Security · Zero-Trust
-- =====================================================================

-- Enable RLS ----------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.clients             enable row level security;
alter table public.influencers         enable row level security;
alter table public.campaigns           enable row level security;
alter table public.campaign_influencers enable row level security;
alter table public.leads               enable row level security;
alter table public.ai_reports          enable row level security;
alter table public.notifications       enable row level security;
alter table public.audit_log           enable row level security;

-- Helpers -------------------------------------------------------------
create or replace function public.fn_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.fn_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select client_id from public.profiles where id = auth.uid();
$$;

create or replace function public.fn_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('super_admin','admin') from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.fn_is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('super_admin','admin','account_manager') from public.profiles where id = auth.uid()), false);
$$;

-- profiles ------------------------------------------------------------
create policy "profiles_self_read" on public.profiles
  for select using (id = auth.uid() or public.fn_is_staff());

create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_all" on public.profiles
  for all using (public.fn_is_admin()) with check (public.fn_is_admin());

-- clients -------------------------------------------------------------
create policy "clients_member_read" on public.clients
  for select using (id = public.fn_client_id() or public.fn_is_staff());

create policy "clients_admin_write" on public.clients
  for all using (public.fn_is_admin()) with check (public.fn_is_admin());

-- influencers (shared roster, all authenticated read; staff write) ----
create policy "influencers_auth_read" on public.influencers
  for select using (auth.uid() is not null);

create policy "influencers_staff_write" on public.influencers
  for all using (public.fn_is_staff()) with check (public.fn_is_staff());

-- campaigns -----------------------------------------------------------
create policy "campaigns_client_read" on public.campaigns
  for select using (client_id = public.fn_client_id() or public.fn_is_staff());

create policy "campaigns_client_write" on public.campaigns
  for all using (
    (client_id = public.fn_client_id() and public.fn_role() = 'client_owner')
    or public.fn_is_staff()
  ) with check (
    (client_id = public.fn_client_id() and public.fn_role() = 'client_owner')
    or public.fn_is_staff()
  );

-- campaign_influencers ------------------------------------------------
create policy "ci_read" on public.campaign_influencers
  for select using (
    public.fn_is_staff() or exists (
      select 1 from public.campaigns c
      where c.id = campaign_id and c.client_id = public.fn_client_id()
    )
  );

create policy "ci_staff_write" on public.campaign_influencers
  for all using (public.fn_is_staff()) with check (public.fn_is_staff());

-- leads ---------------------------------------------------------------
create policy "leads_staff_all" on public.leads
  for all using (public.fn_is_staff()) with check (public.fn_is_staff());

create policy "leads_client_read" on public.leads
  for select using (client_id = public.fn_client_id());

-- ai_reports ----------------------------------------------------------
create policy "reports_client_read" on public.ai_reports
  for select using (client_id = public.fn_client_id() or public.fn_is_staff());

create policy "reports_staff_write" on public.ai_reports
  for all using (public.fn_is_staff()) with check (public.fn_is_staff());

-- notifications -------------------------------------------------------
create policy "notif_self" on public.notifications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notif_admin_insert" on public.notifications
  for insert with check (public.fn_is_staff());

-- audit_log (read-only for admins; insert via service role only) ------
create policy "audit_admin_read" on public.audit_log
  for select using (public.fn_is_admin());

-- Realtime publication -----------------------------------------------
alter publication supabase_realtime add table public.campaigns;
alter publication supabase_realtime add table public.campaign_influencers;
alter publication supabase_realtime add table public.ai_reports;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.leads;
