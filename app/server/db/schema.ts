import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
}

export const organizations = sqliteTable('organizations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  primaryLanguage: text('primary_language').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const userCredentials = sqliteTable('user_credentials', {
  userId: text('user_id').primaryKey(),
  passwordHash: text('password_hash').notNull(),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  organizationId: text('organization_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: text('expires_at').notNull(),
  revokedAt: text('revoked_at'),
  lastSeenAt: text('last_seen_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const advisorProfiles = sqliteTable('advisor_profiles', {
  userId: text('user_id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  specialtiesJson: text('specialties_json').notNull(),
  languagesJson: text('languages_json').notNull(),
  focusLocationsJson: text('focus_locations_json').notNull(),
  maxBudgetAed: integer('max_budget_aed').notNull(),
  roundRobinWeight: integer('round_robin_weight').notNull().default(1),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const pipelines = sqliteTable('pipelines', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  pipelineKey: text('pipeline_key').notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const pipelineStages = sqliteTable('pipeline_stages', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  pipelineId: text('pipeline_id').notNull(),
  stageKey: text('stage_key').notNull(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email'),
  emailNormalized: text('email_normalized'),
  phone: text('phone'),
  phoneNormalized: text('phone_normalized'),
  preferredLanguage: text('preferred_language').notNull(),
  source: text('source').notNull(),
  status: text('status').notNull().default('active'),
  ownerUserId: text('owner_user_id'),
  ...timestamps,
})

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  kind: text('kind').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const formSubmissions = sqliteTable('form_submissions', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  formType: text('form_type').notNull(),
  payloadJson: text('payload_json').notNull(),
  utmSource: text('utm_source'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const contactRequirements = sqliteTable('contact_requirements', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  budgetMinAed: integer('budget_min_aed'),
  budgetMaxAed: integer('budget_max_aed'),
  locationsJson: text('locations_json').notNull(),
  propertyTypesJson: text('property_types_json').notNull(),
  bedroomsMin: integer('bedrooms_min'),
  bedroomsMax: integer('bedrooms_max'),
  timeline: text('timeline'),
  purpose: text('purpose'),
  financing: text('financing'),
  notes: text('notes'),
  confidence: integer('confidence').notNull(),
  extractedAt: text('extracted_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const leadScores = sqliteTable('lead_scores', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  purchaseIntent: integer('purchase_intent').notNull(),
  urgency: integer('urgency').notNull(),
  budgetConfidence: integer('budget_confidence').notNull(),
  engagementStrength: integer('engagement_strength').notNull(),
  propertyFit: integer('property_fit').notNull(),
  advisorFit: integer('advisor_fit').notNull(),
  conversionProbability: integer('conversion_probability').notNull(),
  expectedDealValueAed: integer('expected_deal_value_aed').notNull(),
  expectedCloseDate: text('expected_close_date').notNull(),
  nextBestAction: text('next_best_action').notNull(),
  reasonCodesJson: text('reason_codes_json').notNull(),
  dataCompleteness: integer('data_completeness').notNull(),
  calculatedAt: text('calculated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  propertyRef: text('property_ref').notNull(),
  name: text('name').notNull(),
  community: text('community').notNull(),
  propertyType: text('property_type').notNull(),
  developer: text('developer').notNull(),
  beds: integer('beds').notNull(),
  baths: integer('baths').notNull(),
  sizeSqft: integer('size_sqft').notNull(),
  priceAed: integer('price_aed').notNull(),
  status: text('status').notNull(),
  completion: text('completion').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const propertyMatches = sqliteTable('property_matches', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  propertyId: text('property_id').notNull(),
  matchScore: integer('match_score').notNull(),
  reasonsJson: text('reasons_json').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const opportunities = sqliteTable('opportunities', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  title: text('title').notNull(),
  pipelineKey: text('pipeline_key').notNull(),
  stageKey: text('stage_key').notNull(),
  status: text('status').notNull(),
  expectedValueAed: integer('expected_value_aed').notNull(),
  probability: integer('probability').notNull(),
  advisorUserId: text('advisor_user_id').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const messageDrafts = sqliteTable('message_drafts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  opportunityId: text('opportunity_id').notNull(),
  channel: text('channel').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  status: text('status').notNull(),
  confidence: integer('confidence').notNull(),
  sourceRecordsJson: text('source_records_json').notNull(),
  approvalLevel: integer('approval_level').notNull(),
  approvedByUserId: text('approved_by_user_id'),
  deliveryMode: text('delivery_mode').notNull(),
  sentAt: text('sent_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  opportunityId: text('opportunity_id').notNull(),
  title: text('title').notNull(),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  dueAt: text('due_at').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const automations = sqliteTable('automations', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  name: text('name').notNull(),
  triggerLabel: text('trigger_label').notNull(),
  actionLabel: text('action_label').notNull(),
  status: text('status').notNull(),
  runsCount: integer('runs_count').notNull().default(0),
  lastRunAt: text('last_run_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const appointments = sqliteTable('appointments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id'),
  opportunityId: text('opportunity_id'),
  propertyId: text('property_id'),
  advisorUserId: text('advisor_user_id'),
  contactName: text('contact_name').notNull(),
  propertyName: text('property_name').notNull(),
  scheduledAt: text('scheduled_at').notNull(),
  status: text('status').notNull(),
  outcome: text('outcome'),
  feedback: text('feedback'),
  interestScore: integer('interest_score'),
  nextStep: text('next_step'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const timelineEvents = sqliteTable('timeline_events', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  contactId: text('contact_id').notNull(),
  eventType: text('event_type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  metadataJson: text('metadata_json').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const auditEvents = sqliteTable('audit_events', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  actorUserId: text('actor_user_id').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  metadataJson: text('metadata_json').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const submissionFailures = sqliteTable('submission_failures', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  source: text('source').notNull(),
  status: text('status').notNull(),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const retryJobs = sqliteTable('retry_jobs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  jobType: text('job_type').notNull(),
  status: text('status').notNull(),
  attempts: integer('attempts').notNull().default(0),
  nextRunAt: text('next_run_at'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
})

export const schema = {
  appointments,
  advisorProfiles,
  automations,
  auditEvents,
  companies,
  contactRequirements,
  contacts,
  formSubmissions,
  leadScores,
  messageDrafts,
  opportunities,
  organizations,
  pipelineStages,
  pipelines,
  properties,
  propertyMatches,
  retryJobs,
  sessions,
  submissionFailures,
  tasks,
  timelineEvents,
  userCredentials,
  users,
}

export type Schema = typeof schema