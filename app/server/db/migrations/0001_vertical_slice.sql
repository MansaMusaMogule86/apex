CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  primary_language TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE advisor_profiles (
  user_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  specialties_json TEXT NOT NULL,
  languages_json TEXT NOT NULL,
  focus_locations_json TEXT NOT NULL,
  max_budget_aed INTEGER NOT NULL,
  round_robin_weight INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE pipelines (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  pipeline_key TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE pipeline_stages (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  pipeline_id TEXT NOT NULL,
  stage_key TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  email_normalized TEXT,
  phone TEXT,
  phone_normalized TEXT,
  preferred_language TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  owner_user_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_contacts_org_email ON contacts(organization_id, email_normalized);
CREATE UNIQUE INDEX idx_contacts_org_phone ON contacts(organization_id, phone_normalized);

CREATE TABLE form_submissions (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  form_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  utm_source TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE contact_requirements (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  budget_min_aed INTEGER,
  budget_max_aed INTEGER,
  locations_json TEXT NOT NULL,
  property_types_json TEXT NOT NULL,
  bedrooms_min INTEGER,
  bedrooms_max INTEGER,
  timeline TEXT,
  purpose TEXT,
  financing TEXT,
  notes TEXT,
  confidence INTEGER NOT NULL,
  extracted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE lead_scores (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  purchase_intent INTEGER NOT NULL,
  urgency INTEGER NOT NULL,
  budget_confidence INTEGER NOT NULL,
  engagement_strength INTEGER NOT NULL,
  property_fit INTEGER NOT NULL,
  advisor_fit INTEGER NOT NULL,
  conversion_probability INTEGER NOT NULL,
  expected_deal_value_aed INTEGER NOT NULL,
  expected_close_date TEXT NOT NULL,
  next_best_action TEXT NOT NULL,
  reason_codes_json TEXT NOT NULL,
  data_completeness INTEGER NOT NULL,
  calculated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE properties (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  property_ref TEXT NOT NULL,
  name TEXT NOT NULL,
  community TEXT NOT NULL,
  property_type TEXT NOT NULL,
  developer TEXT NOT NULL,
  beds INTEGER NOT NULL,
  baths INTEGER NOT NULL,
  size_sqft INTEGER NOT NULL,
  price_aed INTEGER NOT NULL,
  status TEXT NOT NULL,
  completion TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE property_matches (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  reasons_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

CREATE TABLE opportunities (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  title TEXT NOT NULL,
  pipeline_key TEXT NOT NULL,
  stage_key TEXT NOT NULL,
  status TEXT NOT NULL,
  expected_value_aed INTEGER NOT NULL,
  probability INTEGER NOT NULL,
  advisor_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (advisor_user_id) REFERENCES users(id)
);

CREATE TABLE message_drafts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  opportunity_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL,
  confidence INTEGER NOT NULL,
  source_records_json TEXT NOT NULL,
  approval_level INTEGER NOT NULL,
  approved_by_user_id TEXT,
  delivery_mode TEXT NOT NULL,
  sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  opportunity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
);

CREATE TABLE timeline_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

CREATE TABLE audit_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

CREATE INDEX idx_properties_org ON properties(organization_id, community, price_aed);
CREATE INDEX idx_opportunities_org ON opportunities(organization_id, stage_key);
CREATE INDEX idx_timeline_org_contact ON timeline_events(organization_id, contact_id, created_at);
CREATE INDEX idx_audit_org ON audit_events(organization_id, created_at);