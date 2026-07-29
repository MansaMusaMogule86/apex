CREATE TABLE submission_failures (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_submission_failures_org_status ON submission_failures(organization_id, status);

CREATE TABLE retry_jobs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_run_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_retry_jobs_org_status ON retry_jobs(organization_id, status);
