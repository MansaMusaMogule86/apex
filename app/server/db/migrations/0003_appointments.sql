CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  contact_id TEXT,
  opportunity_id TEXT,
  property_id TEXT,
  advisor_user_id TEXT,
  contact_name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL,
  outcome TEXT,
  feedback TEXT,
  interest_score INTEGER,
  next_step TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (contact_id) REFERENCES contacts(id),
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id),
  FOREIGN KEY (property_id) REFERENCES properties(id),
  FOREIGN KEY (advisor_user_id) REFERENCES users(id)
);

CREATE INDEX idx_appointments_org_scheduled ON appointments(organization_id, scheduled_at);
CREATE INDEX idx_appointments_org_status ON appointments(organization_id, status);
