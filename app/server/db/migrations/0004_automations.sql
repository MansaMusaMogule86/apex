CREATE TABLE automations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  trigger_label TEXT NOT NULL,
  action_label TEXT NOT NULL,
  status TEXT NOT NULL,
  runs_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_automations_org_created ON automations(organization_id, created_at);
CREATE INDEX idx_automations_org_status ON automations(organization_id, status);
