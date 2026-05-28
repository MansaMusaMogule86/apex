-- =====================================================================
-- APEX · Seed Data
-- Creates default Maison Atelier organization, workspace, client profile,
-- and live intelligence recommendations to bootstrap the UI.
-- =====================================================================

-- 1. Create Default Organization
insert into public.organizations (id, name, slug, plan, settings)
values (
  '00000000-0000-4000-8000-000000000001',
  'Maison Atelier',
  'maison-atelier',
  'institutional',
  '{}'::jsonb
)
on conflict (id) do nothing;

-- 2. Create Default Workspace
insert into public.organization_workspaces (id, organization_id, name, code, workspace_type, is_default)
values (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'Global Intelligence',
  'default',
  'global',
  true
)
on conflict (id) do nothing;

-- 3. Create Default Client (For metrics billing and profiles)
insert into public.clients (id, org_name, tier, apex_score, organization_id)
values (
  '00000000-0000-4000-8000-000000000003',
  'Maison Atelier',
  'bespoke',
  948,
  '00000000-0000-4000-8000-000000000001'
)
on conflict (id) do nothing;

-- 4. Create Recommendation Run
insert into public.recommendation_runs (id, organization_id, workspace_id, triggered_by, trigger_reason, model_route, confidence_model_version, priority_index, status, completed_at)
values (
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'system',
  'Initial platform bootstrap',
  'balanced',
  'v1.0.0',
  95.00,
  'completed',
  now()
)
on conflict (id) do nothing;

-- 5. Create Live Recommendations
insert into public.recommendations_live (
  id,
  run_id,
  organization_id,
  workspace_id,
  recommendation_type,
  title,
  executive_summary,
  ai_reasoning,
  suggested_actions,
  forecast_outcome,
  urgency_label,
  confidence_score,
  strategic_impact_score,
  revenue_impact_estimate,
  prestige_impact_estimate,
  risk_level,
  time_sensitivity_score,
  execution_complexity_score,
  expected_outcome_window,
  priority_index
)
values
(
  '00000000-0000-4000-8000-000000000005',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'market',
  'Optimize Jumeirah Bay pricing tiers',
  'Waterfront premium spreads suggest room for a 12% pricing lift on secondary luxury villas.',
  'Supply constraints at the AED 80M+ bracket combined with strong HNW transaction velocities indicate significant untapped pricing power.',
  '[{"action": "increase_pricing", "target": "villa_c_collection", "amount": 0.12}]'::jsonb,
  'Estimated revenue lift of AED 24M within Q2.',
  'high',
  94.50,
  88.00,
  24.00,
  5.00,
  'low',
  85.00,
  35.00,
  '30 days',
  91.25
),
(
  '00000000-0000-4000-8000-000000000006',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'founder',
  'Deploy heritage video series in GCC clusters',
  'Launch high-production cinematic episodes on design curation to boost founder authority metrics.',
  'Targeting HNW cohorts with narrative-first heritage reels has demonstrated a 31% higher trust transfer rate compared to ad copy.',
  '[{"action": "deploy_content", "channel": "instagram_reels", "series": "curated_spaces"}]'::jsonb,
  '38% lift in direct private viewing inquiries.',
  'medium',
  89.00,
  92.00,
  12.50,
  15.00,
  'low',
  60.00,
  50.00,
  '14 days',
  86.50
),
(
  '00000000-0000-4000-8000-000000000007',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'influence',
  'Partner with prestige watch collectors network',
  'Coordinate a private viewing partnership with elite watch network members in DIFC.',
  'Cross-vertical interest graphs show 86.4% affinity score overlap between prospective buyers and luxury timepiece collectors.',
  '[{"action": "private_viewing_event", "partner": "difc_watch_club"}]'::jsonb,
  '14 high-purity prospective leads generated.',
  'medium',
  82.00,
  85.00,
  35.00,
  8.00,
  'medium',
  45.00,
  70.00,
  '60 days',
  78.40
),
(
  '00000000-0000-4000-8000-000000000008',
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002',
  'lead',
  'Trigger high-intent lead phone outreach',
  'Immediate follow-up sequence for Jumeirah Islands inbound leads with high urgency profiles.',
  'Interaction analytics show that three active HNW leads in Jumeirah Islands have viewed project brochures 4+ times in the last 48 hours.',
  '[{"action": "sales_outreach", "targets": ["lead_id_1", "lead_id_2"]}]'::jsonb,
  'Accelerate conversion sequence to offer stage.',
  'high',
  96.00,
  78.00,
  18.00,
  2.00,
  'low',
  90.00,
  20.00,
  '7 days',
  94.80
)
on conflict (id) do nothing;
