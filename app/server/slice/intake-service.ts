import { and, desc, eq, gte, lte, or } from 'drizzle-orm'
import type { DatabaseContext } from '../db/context'
import {
  appointments,
  advisorProfiles,
  automations,
  companies,
  auditEvents,
  contactRequirements,
  contacts,
  formSubmissions,
  leadScores,
  messageDrafts,
  opportunities,
  pipelineStages,
  properties,
  propertyMatches,
  retryJobs,
  submissionFailures,
  tasks,
  timelineEvents,
  users,
} from '../db/schema'

export interface SessionContext {
  organizationId: string
  userId: string
  role: string
}

export interface DashboardFilters {
  ownerUserId?: string
  source?: string
  stageKey?: string
  status?: string
}

export interface ActivityFilters {
  contactId?: string
  companyId?: string
  leadId?: string
  opportunityId?: string
  userId?: string
  activityType?: string
  startAt?: string
  endAt?: string
  limit?: number
}

export interface ActivityRecord {
  id: string
  organizationId: string
  actorUserId: string | null
  contactId: string | null
  opportunityId: string | null
  leadId: string | null
  activityType: string
  title: string
  body: string
  source: 'timeline' | 'audit' | 'form_submission'
  createdAt: string
}

export interface CrmCompanyRow {
  id: number
  name: string
  kind: string
}

export interface CrmTaskRow {
  id: string
  title: string
  status: string
  priority: string
  dueAt: string
  createdAt: string
  contactId: string
  contactName: string | null
  opportunityId: string
  opportunityTitle: string | null
  assigneeUserId: string | null
  assigneeName: string | null
  overdue: boolean
}

export interface CrmViewingRow {
  id: string
  contactId: string | null
  contactName: string
  propertyId: string | null
  propertyName: string
  advisorUserId: string | null
  dayLabel: string
  timeLabel: string
  status: string
  outcome: string | null
  feedback: string | null
  interestScore: number | null
  nextStep: string | null
  scheduledAt: string
  createdAt: string
}

export interface CrmAutomationRow {
  id: string
  name: string
  triggerLabel: string
  actionLabel: string
  status: string
  runsCount: number
  lastRunAgo: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateCrmAutomationInput {
  name: string
  triggerLabel?: string
  actionLabel?: string
}

export interface CreateCrmViewingInput {
  contactId?: string | null
  contactName: string
  propertyId?: string | null
  propertyName: string
  advisorUserId?: string | null
  opportunityId?: string | null
  scheduledAt: string
  status: 'scheduled' | 'completed' | 'cancelled'
  outcome?: string | null
  feedback?: string | null
  interestScore?: number | null
  nextStep?: string | null
}

export interface CrmDealRow {
  id: number
  title: string
  contactName: string
  contactId: number
  propertyId: number | null
  propertyLine: string | null
  valueAed: number
  stage: string
  probability: number
  daysInStage: number
  nextAction: string
  atRisk: boolean
  riskNote: string | null
  outcome: 'open' | 'won' | 'lost'
  ownerId: number
  updatedAgo: string | null
  createdAt: string
  aiHealth: string | null
  lossReason: string | null
}

export interface DealStageHistoryEntry {
  id: number
  fromStage: string | null
  toStage: string
  changedBy: string
  ago: string
}

export interface MoveCrmDealStageResult {
  deal: CrmDealRow
  previousStage: string
  newStage: string
  activityCreated: boolean
}

export interface LeadIntakeInput {
  fullName: string
  email?: string
  phone?: string
  preferredLanguage: string
  source: string
  formType: string
  budgetMinAed?: number
  budgetMaxAed?: number
  locations: string[]
  propertyTypes: string[]
  bedroomsMin?: number
  bedroomsMax?: number
  timeline?: string
  purpose?: string
  financing?: string
  notes?: string
  utmSource?: string
}

export interface LeadIntakeOptions {
  forceFailAtStep?: string
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`
}

function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() || null
}

function normalizePhone(phone?: string) {
  return phone?.replace(/[^\d+]/g, '') || null
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function addDaysIso(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function parseJsonArray(value: string) {
  return JSON.parse(value) as string[]
}

function parseJsonObject(value: string | null | undefined) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>
    }
    return {}
  } catch {
    return {}
  }
}

function coalesceNonEmpty(nextValue: string | null | undefined, fallback: string | null | undefined) {
  const normalized = nextValue?.trim()
  if (!normalized) return fallback ?? null
  return normalized
}

async function runInTransaction<T>(database: DatabaseContext, work: () => Promise<T>) {
  database.client.exec('BEGIN IMMEDIATE TRANSACTION')
  try {
    const result = await work()
    database.client.exec('COMMIT')
    return result
  } catch (error) {
    database.client.exec('ROLLBACK')
    throw error
  }
}

function chooseChannel(input: LeadIntakeInput) {
  return input.phone ? 'whatsapp' : 'email'
}

async function recordAudit(database: DatabaseContext, session: SessionContext, entityType: string, entityId: string, action: string, metadata: Record<string, unknown>) {
  await database.db.insert(auditEvents).values({
    id: createId('audit'),
    organizationId: session.organizationId,
    actorUserId: session.userId,
    entityType,
    entityId,
    action,
    metadataJson: JSON.stringify(metadata),
  })
}

async function appendTimeline(database: DatabaseContext, organizationId: string, contactId: string, eventType: string, title: string, body: string, metadata: Record<string, unknown>) {
  await database.db.insert(timelineEvents).values({
    id: createId('tl'),
    organizationId,
    contactId,
    eventType,
    title,
    body,
    metadataJson: JSON.stringify(metadata),
  })
}

async function recommendAdvisor(database: DatabaseContext, session: SessionContext, input: LeadIntakeInput) {
  const advisors = await database.db
    .select({
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      primaryLanguage: users.primaryLanguage,
      specialtiesJson: advisorProfiles.specialtiesJson,
      languagesJson: advisorProfiles.languagesJson,
      focusLocationsJson: advisorProfiles.focusLocationsJson,
      maxBudgetAed: advisorProfiles.maxBudgetAed,
    })
    .from(users)
    .innerJoin(advisorProfiles, eq(users.id, advisorProfiles.userId))
    .where(and(eq(users.organizationId, session.organizationId), eq(users.isActive, true)))

  const ranked = advisors.map((advisor) => {
    const languages = parseJsonArray(advisor.languagesJson)
    const specialties = parseJsonArray(advisor.specialtiesJson)
    const locations = parseJsonArray(advisor.focusLocationsJson)
    let score = 40

    if (languages.some((language) => language.toLowerCase() === input.preferredLanguage.toLowerCase())) score += 25
    if ((input.budgetMaxAed ?? 0) >= 25000000 && specialties.includes('uhnw')) score += 25
    if (specialties.includes((input.purpose ?? '').toLowerCase())) score += 10
    if (input.locations.some((location) => locations.includes(location))) score += 15
    if ((input.budgetMaxAed ?? 0) <= advisor.maxBudgetAed) score += 10

    return {
      userId: advisor.userId,
      fullName: advisor.fullName,
      email: advisor.email,
      score,
      why: [
        languages.some((language) => language.toLowerCase() === input.preferredLanguage.toLowerCase())
          ? `Speaks ${input.preferredLanguage}`
          : `Can cover ${input.preferredLanguage}`,
        input.locations.length > 0 ? `Active in ${input.locations[0]}` : 'Handles inbound buyer leads',
        (input.budgetMaxAed ?? 0) >= 25000000 ? 'Eligible for high-value routing' : 'Within standard advisory band',
      ],
    }
  })

  ranked.sort((left, right) => right.score - left.score || left.fullName.localeCompare(right.fullName))
  return ranked[0]!
}

async function matchProperties(database: DatabaseContext, session: SessionContext, input: LeadIntakeInput) {
  const inventory = await database.db
    .select()
    .from(properties)
    .where(eq(properties.organizationId, session.organizationId))

  const matches = inventory
    .filter((property) => {
      if (input.budgetMaxAed && property.priceAed > input.budgetMaxAed * 1.1) return false
      if (input.locations.length > 0 && !input.locations.includes(property.community)) return false
      if (input.propertyTypes.length > 0 && !input.propertyTypes.includes(property.propertyType)) return false
      if (input.bedroomsMin && property.beds < input.bedroomsMin) return false
      if (input.bedroomsMax && property.beds > input.bedroomsMax) return false
      return true
    })
    .map((property) => {
      let score = 55
      const reasons: string[] = []
      if (input.budgetMaxAed && property.priceAed <= input.budgetMaxAed) {
        score += 15
        reasons.push('Within stated budget')
      }
      if (input.locations.includes(property.community)) {
        score += 15
        reasons.push(`Matches preferred location: ${property.community}`)
      }
      if (input.propertyTypes.includes(property.propertyType)) {
        score += 10
        reasons.push(`Matches requested type: ${property.propertyType}`)
      }
      if ((input.bedroomsMin ?? 0) <= property.beds && (!input.bedroomsMax || property.beds <= input.bedroomsMax)) {
        score += 10
        reasons.push(`Fits ${property.beds}BR requirement`)
      }
      return { property, matchScore: clamp(score), reasons }
    })
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 3)

  return matches
}

function calculateLeadScore(input: LeadIntakeInput, matchCount: number, advisorScore: number) {
  const purchaseIntent = clamp(55 + (input.formType === 'Property Inquiry' ? 20 : 10) + (input.locations.length > 0 ? 10 : 0))
  const urgency = clamp(
    input.timeline?.toLowerCase().includes('30') || input.timeline?.toLowerCase().includes('month')
      ? 82
      : input.timeline
        ? 66
        : 48,
  )
  const budgetConfidence = clamp(input.budgetMaxAed && input.budgetMinAed ? 88 : input.budgetMaxAed ? 72 : 44)
  const engagementStrength = clamp((input.email ? 15 : 0) + (input.phone ? 20 : 0) + (input.notes ? 20 : 5) + 35)
  const propertyFit = clamp(matchCount * 27 + (input.locations.length > 0 ? 10 : 0))
  const advisorFit = clamp(advisorScore)
  const dataCompleteness = clamp(
    [input.email, input.phone, input.budgetMaxAed, input.locations.length > 0, input.propertyTypes.length > 0, input.timeline, input.purpose]
      .filter(Boolean)
      .length * 14,
  )
  const conversionProbability = clamp((purchaseIntent * 0.25) + (urgency * 0.2) + (budgetConfidence * 0.2) + (propertyFit * 0.2) + (advisorFit * 0.15))
  const expectedDealValueAed = input.budgetMaxAed ?? input.budgetMinAed ?? 3000000
  const reasonCodes = [
    input.locations.length > 0 ? 'stated_location' : 'missing_location',
    input.budgetMaxAed ? 'budget_captured' : 'budget_missing',
    matchCount > 0 ? 'inventory_match_found' : 'inventory_gap',
    input.timeline ? 'timeline_captured' : 'timeline_missing',
  ]

  return {
    purchaseIntent,
    urgency,
    budgetConfidence,
    engagementStrength,
    propertyFit,
    advisorFit,
    conversionProbability,
    expectedDealValueAed,
    expectedCloseDate: addDaysIso(45),
    nextBestAction: 'Approve and send the personalized follow-up draft',
    reasonCodes,
    dataCompleteness,
  }
}

function buildDraftBody(input: LeadIntakeInput, advisorName: string, propertyNames: string[]) {
  const firstName = input.fullName.trim().split(/\s+/)[0] ?? 'there'
  const shortlist = propertyNames.length > 0 ? propertyNames.join(', ') : 'a shortlist aligned to your requirements'
  return `Hi ${firstName}, this is ${advisorName} from APEX. Thanks for your ${input.formType.toLowerCase()} regarding ${input.locations.join(', ') || 'Dubai'}.

I have reviewed your requirements and shortlisted ${shortlist}. Based on your stated budget and timeline, I can walk you through the best-fit options and next steps.

Would you prefer a WhatsApp overview now or a 15-minute call later today?`
}

async function getTimeline(database: DatabaseContext, session: SessionContext, contactId: string) {
  const rows = await database.db
    .select()
    .from(timelineEvents)
    .where(and(eq(timelineEvents.organizationId, session.organizationId), eq(timelineEvents.contactId, contactId)))
    .orderBy(desc(timelineEvents.createdAt))

  return rows.map((row) => ({
    id: row.id,
    eventType: row.eventType,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt,
    metadata: JSON.parse(row.metadataJson),
  }))
}

async function getContactSnapshot(database: DatabaseContext, session: SessionContext, contactId: string) {
  const contact = await database.db.query.contacts.findFirst({
    where: and(eq(contacts.organizationId, session.organizationId), eq(contacts.id, contactId)),
  })

  if (!contact) throw new Error('Contact not found')

  const requirement = await database.db.query.contactRequirements.findFirst({
    where: and(eq(contactRequirements.organizationId, session.organizationId), eq(contactRequirements.contactId, contactId)),
  })
  const score = await database.db.query.leadScores.findFirst({
    where: and(eq(leadScores.organizationId, session.organizationId), eq(leadScores.contactId, contactId)),
  })
  const opportunity = await database.db.query.opportunities.findFirst({
    where: and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.contactId, contactId)),
  })
  const draft = await database.db.query.messageDrafts.findFirst({
    where: and(eq(messageDrafts.organizationId, session.organizationId), eq(messageDrafts.contactId, contactId)),
  })
  const task = await database.db.query.tasks.findFirst({
    where: and(eq(tasks.organizationId, session.organizationId), eq(tasks.contactId, contactId)),
  })

  const matches = await database.db
    .select({
      id: propertyMatches.id,
      matchScore: propertyMatches.matchScore,
      reasonsJson: propertyMatches.reasonsJson,
      propertyId: properties.id,
      propertyRef: properties.propertyRef,
      name: properties.name,
      community: properties.community,
      propertyType: properties.propertyType,
      priceAed: properties.priceAed,
      beds: properties.beds,
      completion: properties.completion,
    })
    .from(propertyMatches)
    .innerJoin(properties, eq(propertyMatches.propertyId, properties.id))
    .where(and(eq(propertyMatches.organizationId, session.organizationId), eq(propertyMatches.contactId, contactId)))

  const auditCount = await database.db.select().from(auditEvents).where(and(eq(auditEvents.organizationId, session.organizationId), eq(auditEvents.entityId, contactId)))

  return {
    contact,
    requirement: requirement
      ? {
          ...requirement,
          locations: JSON.parse(requirement.locationsJson),
          propertyTypes: JSON.parse(requirement.propertyTypesJson),
        }
      : null,
    leadScore: score ? { ...score, reasonCodes: JSON.parse(score.reasonCodesJson) } : null,
    opportunity,
    draft: draft ? { ...draft, sourceRecords: JSON.parse(draft.sourceRecordsJson) } : null,
    task,
    matches: matches.map((row) => ({
      id: row.id,
      property: {
        id: row.propertyId,
        propertyRef: row.propertyRef,
        name: row.name,
        community: row.community,
        propertyType: row.propertyType,
        priceAed: row.priceAed,
        beds: row.beds,
        completion: row.completion,
      },
      matchScore: row.matchScore,
      reasons: JSON.parse(row.reasonsJson),
    })),
    timeline: await getTimeline(database, session, contactId),
    auditCount: auditCount.length,
  }
}

export async function createLeadIntake(database: DatabaseContext, session: SessionContext, input: LeadIntakeInput, options: LeadIntakeOptions = {}) {
  const failStep = options.forceFailAtStep?.trim() || null
  const failIfRequested = (step: string) => {
    if (failStep === step) {
      throw new Error(`Forced intake failure at ${step}`)
    }
  }

  const emailNormalized = normalizeEmail(input.email)
  const phoneNormalized = normalizePhone(input.phone)

  const result = await runInTransaction(database, async () => {
    const existingContact = await database.db.query.contacts.findFirst({
      where: and(
        eq(contacts.organizationId, session.organizationId),
        or(
          emailNormalized ? eq(contacts.emailNormalized, emailNormalized) : undefined,
          phoneNormalized ? eq(contacts.phoneNormalized, phoneNormalized) : undefined,
        )!,
      ),
    })

    const advisor = await recommendAdvisor(database, session, input)
    const matches = await matchProperties(database, session, input)
    const leadScoreValues = calculateLeadScore(input, matches.length, advisor.score)

    const contactId = existingContact?.id ?? createId('contact')
    const dedupeStatus = existingContact ? 'merged_existing_contact' : 'created_new_contact'

    if (existingContact) {
      await database.db.update(contacts).set({
        fullName: coalesceNonEmpty(input.fullName, existingContact.fullName) ?? existingContact.fullName,
        email: coalesceNonEmpty(input.email, existingContact.email),
        emailNormalized: emailNormalized ?? existingContact.emailNormalized,
        phone: coalesceNonEmpty(input.phone, existingContact.phone),
        phoneNormalized: phoneNormalized ?? existingContact.phoneNormalized,
        preferredLanguage: coalesceNonEmpty(input.preferredLanguage, existingContact.preferredLanguage) ?? existingContact.preferredLanguage,
        source: coalesceNonEmpty(input.source, existingContact.source) ?? existingContact.source,
        ownerUserId: existingContact.ownerUserId || advisor.userId,
        updatedAt: new Date().toISOString(),
      }).where(and(eq(contacts.organizationId, session.organizationId), eq(contacts.id, existingContact.id)))
    } else {
      await database.db.insert(contacts).values({
        id: contactId,
        organizationId: session.organizationId,
        fullName: input.fullName,
        email: coalesceNonEmpty(input.email, null),
        emailNormalized,
        phone: coalesceNonEmpty(input.phone, null),
        phoneNormalized,
        preferredLanguage: input.preferredLanguage,
        source: input.source,
        ownerUserId: advisor.userId,
      })
    }

    failIfRequested('after_contact_upsert')

    const formSubmissionId = createId('form')
    await database.db.insert(formSubmissions).values({
      id: formSubmissionId,
      organizationId: session.organizationId,
      contactId,
      formType: input.formType,
      payloadJson: JSON.stringify(input),
      utmSource: input.utmSource,
    })

    await database.db.insert(contactRequirements).values({
      id: createId('req'),
      organizationId: session.organizationId,
      contactId,
      budgetMinAed: input.budgetMinAed,
      budgetMaxAed: input.budgetMaxAed,
      locationsJson: JSON.stringify(input.locations),
      propertyTypesJson: JSON.stringify(input.propertyTypes),
      bedroomsMin: input.bedroomsMin,
      bedroomsMax: input.bedroomsMax,
      timeline: input.timeline,
      purpose: input.purpose,
      financing: input.financing,
      notes: input.notes,
      confidence: 82,
    })

    await database.db.insert(leadScores).values({
      id: createId('score'),
      organizationId: session.organizationId,
      contactId,
      ...leadScoreValues,
      reasonCodesJson: JSON.stringify(leadScoreValues.reasonCodes),
    })

    await database.db.delete(propertyMatches).where(and(eq(propertyMatches.organizationId, session.organizationId), eq(propertyMatches.contactId, contactId)))

    for (const match of matches) {
      await database.db.insert(propertyMatches).values({
        id: createId('match'),
        organizationId: session.organizationId,
        contactId,
        propertyId: match.property.id,
        matchScore: match.matchScore,
        reasonsJson: JSON.stringify(match.reasons),
      })
    }

    const stageKey = 'new_inquiry'
    const validStage = await database.db.query.pipelineStages.findFirst({
      where: and(
        eq(pipelineStages.organizationId, session.organizationId),
        eq(pipelineStages.stageKey, stageKey),
      ),
    })

    if (!validStage) {
      throw new Error('Intake pipeline stage is not configured')
    }

    const existingOpenOpportunity = await database.db.query.opportunities.findFirst({
      where: and(
        eq(opportunities.organizationId, session.organizationId),
        eq(opportunities.contactId, contactId),
        eq(opportunities.pipelineKey, 'buyer_leads_uhnw'),
        eq(opportunities.status, 'open'),
      ),
      orderBy: [desc(opportunities.createdAt)],
    })

    const opportunityId = existingOpenOpportunity?.id ?? createId('opp')
    if (existingOpenOpportunity) {
      await database.db.update(opportunities).set({
        stageKey,
        expectedValueAed: leadScoreValues.expectedDealValueAed,
        probability: leadScoreValues.conversionProbability,
      }).where(and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.id, existingOpenOpportunity.id)))
    } else {
      await database.db.insert(opportunities).values({
        id: opportunityId,
        organizationId: session.organizationId,
        contactId,
        title: `${input.fullName} — ${input.formType}`,
        pipelineKey: 'buyer_leads_uhnw',
        stageKey,
        status: 'open',
        expectedValueAed: leadScoreValues.expectedDealValueAed,
        probability: leadScoreValues.conversionProbability,
        advisorUserId: advisor.userId,
      })
    }

    failIfRequested('after_opportunity_upsert')

    const draftId = createId('draft')
    const channel = chooseChannel(input)
    await database.db.insert(messageDrafts).values({
      id: draftId,
      organizationId: session.organizationId,
      contactId,
      opportunityId,
      channel,
      subject: channel === 'email' ? `Next steps for ${input.locations[0] ?? 'your property search'}` : null,
      body: buildDraftBody(input, advisor.fullName, matches.map((match) => match.property.name)),
      status: 'pending_approval',
      confidence: clamp((leadScoreValues.purchaseIntent + leadScoreValues.propertyFit + advisor.score) / 3),
      sourceRecordsJson: JSON.stringify([
        `form_submission:${formSubmissionId}`,
        `opportunity:${opportunityId}`,
        ...matches.map((match) => `property:${match.property.id}`),
      ]),
      approvalLevel: 3,
      deliveryMode: process.env.APEX_ENABLE_MESSAGE_SIMULATION === 'false' ? 'provider' : 'simulation',
    })

    await appendTimeline(database, session.organizationId, contactId, 'contact_created', 'Contact created', `Created from ${input.formType} and assigned to ${advisor.fullName}.`, { dedupeStatus, advisorUserId: advisor.userId })
    await appendTimeline(database, session.organizationId, contactId, 'requirements_extracted', 'Requirements extracted', `Captured ${input.locations.join(', ') || 'location pending'} and ${input.propertyTypes.join(', ') || 'property type pending'} preferences.`, { confidence: 82 })
    await appendTimeline(database, session.organizationId, contactId, 'lead_scored', 'Lead score calculated', `Conversion probability set to ${leadScoreValues.conversionProbability}%.`, { score: leadScoreValues })
    await appendTimeline(database, session.organizationId, contactId, 'opportunity_created', 'Opportunity created', 'Opportunity opened in Buyer Leads — UHNW at New Inquiry.', { opportunityId, stageKey })
    await appendTimeline(database, session.organizationId, contactId, 'draft_generated', 'Follow-up draft generated', `Prepared a ${channel} draft for advisor approval.`, { draftId, channel })

    await recordAudit(database, session, 'contact', contactId, 'contact.upserted', { dedupeStatus })
    await recordAudit(database, session, 'form_submission', formSubmissionId, 'form.submitted', { formType: input.formType })
    await recordAudit(database, session, 'requirement', contactId, 'requirements.extracted', { confidence: 82 })
    await recordAudit(database, session, 'lead_score', contactId, 'lead_score.calculated', leadScoreValues)
    await recordAudit(database, session, 'opportunity', opportunityId, existingOpenOpportunity ? 'opportunity.updated' : 'opportunity.created', { pipelineKey: 'buyer_leads_uhnw', stageKey })
    await recordAudit(database, session, 'message_draft', draftId, 'draft.generated', { channel })

    failIfRequested('after_audit')

    const snapshot = await getContactSnapshot(database, session, contactId)
    return {
      dedupeStatus,
      advisorRecommendation: advisor,
      contactId,
      formSubmissionId,
      ...snapshot,
    }
  })

  return result
}

export async function approveDraft(database: DatabaseContext, session: SessionContext, draftId: string) {
  const draft = await database.db.query.messageDrafts.findFirst({
    where: and(eq(messageDrafts.organizationId, session.organizationId), eq(messageDrafts.id, draftId)),
  })

  if (!draft) throw new Error('Draft not found')

  await database.db.update(messageDrafts).set({
    status: 'sent',
    approvedByUserId: session.userId,
    sentAt: new Date().toISOString(),
  }).where(and(eq(messageDrafts.organizationId, session.organizationId), eq(messageDrafts.id, draftId)))

  const taskId = createId('task')
  await database.db.insert(tasks).values({
    id: taskId,
    organizationId: session.organizationId,
    contactId: draft.contactId,
    opportunityId: draft.opportunityId,
    title: 'Follow up on the approved AI outreach within 24 hours',
    status: 'open',
    priority: 'high',
    dueAt: addDaysIso(1),
  })

  await appendTimeline(database, session.organizationId, draft.contactId, 'draft_approved', 'Draft approved and sent', `Approved by advisor and ${draft.deliveryMode === 'simulation' ? 'sent in development simulation mode' : 'queued for provider delivery'}.`, { draftId, deliveryMode: draft.deliveryMode })
  await appendTimeline(database, session.organizationId, draft.contactId, 'task_created', 'Follow-up task created', 'Created a next-step task linked to the new opportunity.', { taskId })

  await recordAudit(database, session, 'message_draft', draft.id, 'draft.approved', { deliveryMode: draft.deliveryMode })
  await recordAudit(database, session, 'task', taskId, 'task.created', { contactId: draft.contactId })

  return getContactSnapshot(database, session, draft.contactId)
}

export async function getLeadContact(database: DatabaseContext, session: SessionContext, contactId: string) {
  return getContactSnapshot(database, session, contactId)
}

export async function listRecentLeadContacts(database: DatabaseContext, session: SessionContext) {
  const rows = await database.db.query.contacts.findMany({
    where: eq(contacts.organizationId, session.organizationId),
    orderBy: [desc(contacts.updatedAt)],
    limit: 12,
  })

  return rows.map((row) => ({
    id: row.id,
    fullName: row.fullName,
    preferredLanguage: row.preferredLanguage,
    source: row.source,
    updatedAt: row.updatedAt,
  }))
}

export async function getBuyerPipelineStages(database: DatabaseContext, session: SessionContext) {
  return database.db.query.pipelineStages.findMany({
    where: and(eq(pipelineStages.organizationId, session.organizationId), eq(pipelineStages.pipelineId, 'pipe_buyer_leads_uhnw')),
    orderBy: [pipelineStages.sortOrder],
  })
}

function inRange(createdAt: string, days?: number) {
  if (!days) return true
  const now = Date.now()
  const then = new Date(createdAt).getTime()
  return then >= now - days * 24 * 60 * 60 * 1000
}

function formatAgo(dateLike: string) {
  const value = new Date(dateLike).getTime()
  if (Number.isNaN(value)) return null
  const deltaMs = Date.now() - value
  const deltaMinutes = Math.max(0, Math.floor(deltaMs / (60 * 1000)))
  if (deltaMinutes < 1) return 'just now'
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`
  const deltaHours = Math.floor(deltaMinutes / 60)
  if (deltaHours < 24) return `${deltaHours}h ago`
  const deltaDays = Math.floor(deltaHours / 24)
  return `${deltaDays}d ago`
}

function formatDayLabel(dateLike: string) {
  const value = new Date(dateLike)
  if (Number.isNaN(value.getTime())) return 'Sat'
  return value.toLocaleDateString('en-US', { weekday: 'short' })
}

function formatTimeLabel(dateLike: string) {
  const value = new Date(dateLike)
  if (Number.isNaN(value.getTime())) return '10:00'
  return value.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function coerceScheduledAt(value: string) {
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()

  const fallback = new Date()
  fallback.setMinutes(fallback.getMinutes() + 30)
  return fallback.toISOString()
}

function hashToPositiveInt(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return (hash % 900000000) + 1
}

function buildNumericIdMap(values: string[]) {
  const sorted = [...new Set(values)].sort((left, right) => left.localeCompare(right))
  const used = new Set<number>()
  const map = new Map<string, number>()

  for (const value of sorted) {
    let candidate = hashToPositiveInt(value)
    while (used.has(candidate)) candidate += 1
    used.add(candidate)
    map.set(value, candidate)
  }

  return map
}

function mapOpportunityOutcome(stageName: string, status: string): 'open' | 'won' | 'lost' {
  if (status === 'won' || stageName === 'Won') return 'won'
  if (status === 'lost' || stageName === 'Lost') return 'lost'
  return 'open'
}

function mapProbability(stageIndex: number, totalStages: number, status: 'open' | 'won' | 'lost') {
  if (status === 'won') return 100
  if (status === 'lost') return 0
  if (stageIndex < 0 || totalStages <= 0) return 45
  return clamp(10 + Math.round((stageIndex / Math.max(1, totalStages - 1)) * 80))
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export async function listCrmContacts(database: DatabaseContext, session: SessionContext) {
  const [contactRows, opportunityRows, ownerRows] = await Promise.all([
    database.db.query.contacts.findMany({
      where: eq(contacts.organizationId, session.organizationId),
      orderBy: [desc(contacts.updatedAt)],
    }),
    database.db.query.opportunities.findMany({
      where: eq(opportunities.organizationId, session.organizationId),
      orderBy: [desc(opportunities.createdAt)],
    }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
  ])

  const owners = new Map(ownerRows.map((row) => [row.id, row.fullName]))
  const opportunitiesByContact = new Map<string, typeof opportunityRows>()
  for (const opportunity of opportunityRows) {
    const list = opportunitiesByContact.get(opportunity.contactId) ?? []
    list.push(opportunity)
    opportunitiesByContact.set(opportunity.contactId, list)
  }

  return contactRows.map((contact) => {
    const records = opportunitiesByContact.get(contact.id) ?? []
    const latest = records[0] ?? null
    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      preferredLanguage: contact.preferredLanguage,
      source: contact.source,
      status: contact.status,
      ownerUserId: contact.ownerUserId,
      ownerName: contact.ownerUserId ? owners.get(contact.ownerUserId) ?? null : null,
      opportunityCount: records.length,
      latestOpportunityId: latest?.id ?? null,
      latestStageKey: latest?.stageKey ?? null,
      expectedValueAed: latest?.expectedValueAed ?? null,
      updatedAt: contact.updatedAt,
      createdAt: contact.createdAt,
    }
  })
}

export async function listCrmCompanies(database: DatabaseContext, session: SessionContext): Promise<CrmCompanyRow[]> {
  const companyRows = await database.db.query.companies.findMany({
    where: eq(companies.organizationId, session.organizationId),
    orderBy: [companies.name],
  })

  const idMap = buildNumericIdMap(companyRows.map((row) => row.id))

  return companyRows.map((row) => ({
    id: idMap.get(row.id) ?? hashToPositiveInt(row.id),
    name: row.name,
    kind: row.kind,
  }))
}

export async function listCrmOpportunities(database: DatabaseContext, session: SessionContext) {
  const [opportunityRows, contactRows, stageRows, ownerRows] = await Promise.all([
    database.db.query.opportunities.findMany({
      where: eq(opportunities.organizationId, session.organizationId),
      orderBy: [desc(opportunities.createdAt)],
    }),
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.pipelineStages.findMany({ where: eq(pipelineStages.organizationId, session.organizationId) }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
  ])

  const contactsById = new Map(contactRows.map((row) => [row.id, row]))
  const stagesByKey = new Map(stageRows.map((row) => [row.stageKey, row.name]))
  const ownersById = new Map(ownerRows.map((row) => [row.id, row.fullName]))

  return opportunityRows.map((opportunity) => ({
    ...opportunity,
    contactName: contactsById.get(opportunity.contactId)?.fullName ?? 'Unknown contact',
    stageName: stagesByKey.get(opportunity.stageKey) ?? opportunity.stageKey,
    ownerName: ownersById.get(opportunity.advisorUserId) ?? 'Unassigned',
  }))
}

export async function listCrmTeam(database: DatabaseContext, session: SessionContext) {
  const userRows = await database.db.query.users.findMany({
    where: and(eq(users.organizationId, session.organizationId), eq(users.isActive, true)),
    orderBy: [users.fullName],
  })

  const idMap = buildNumericIdMap(userRows.map((row) => row.id))

  return userRows.map((row) => ({
    id: idMap.get(row.id) ?? hashToPositiveInt(row.id),
    name: row.fullName,
    title: row.role,
    initials: initialsFromName(row.fullName),
    email: row.email,
    role: row.role,
    isCurrent: row.id === session.userId,
  }))
}

export async function getOpportunitySnapshot(database: DatabaseContext, session: SessionContext, opportunityId: string) {
  const opportunity = await database.db.query.opportunities.findFirst({
    where: and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.id, opportunityId)),
  })

  if (!opportunity) throw new Error('Opportunity not found')

  const [contact, owner, stage, relatedTasks, relatedDrafts, timeline] = await Promise.all([
    database.db.query.contacts.findFirst({
      where: and(eq(contacts.organizationId, session.organizationId), eq(contacts.id, opportunity.contactId)),
    }),
    database.db.query.users.findFirst({
      where: and(eq(users.organizationId, session.organizationId), eq(users.id, opportunity.advisorUserId)),
    }),
    database.db.query.pipelineStages.findFirst({
      where: and(eq(pipelineStages.organizationId, session.organizationId), eq(pipelineStages.stageKey, opportunity.stageKey)),
    }),
    database.db.query.tasks.findMany({
      where: and(eq(tasks.organizationId, session.organizationId), eq(tasks.opportunityId, opportunityId)),
      orderBy: [desc(tasks.createdAt)],
    }),
    database.db.query.messageDrafts.findMany({
      where: and(eq(messageDrafts.organizationId, session.organizationId), eq(messageDrafts.opportunityId, opportunityId)),
      orderBy: [desc(messageDrafts.createdAt)],
    }),
    getTimeline(database, session, opportunity.contactId),
  ])

  return {
    opportunity: {
      ...opportunity,
      stageName: stage?.name ?? opportunity.stageKey,
    },
    contact,
    owner,
    tasks: relatedTasks,
    drafts: relatedDrafts.map((draft) => ({ ...draft, sourceRecords: JSON.parse(draft.sourceRecordsJson) })),
    timeline,
  }
}

function mapTimelineActivityType(eventType: string) {
  if (eventType.includes('form')) return 'form_submission'
  if (eventType.includes('draft')) return 'message'
  if (eventType.includes('opportunity')) return 'opportunity'
  if (eventType.includes('status')) return 'status_change'
  if (eventType.includes('assignment')) return 'assignment_change'
  if (eventType.includes('workflow')) return 'workflow_event'
  return 'note'
}

function mapAuditActivityType(action: string, entityType: string) {
  if (action.startsWith('auth.')) return 'authentication'
  if (entityType === 'opportunity' || action.includes('opportunity')) return 'opportunity'
  if (action.includes('stage')) return 'status_change'
  if (action.includes('approved') || action.includes('rejected')) return 'administrative'
  if (entityType === 'message_draft' || entityType === 'inbox_draft') return 'message'
  if (entityType === 'task') return 'note'
  if (entityType === 'form_submission') return 'form_submission'
  if (entityType === 'session' || action.includes('session') || action.includes('login') || action.includes('logout')) return 'authentication'
  return 'administrative'
}

export async function listActivityFeed(database: DatabaseContext, session: SessionContext, filters: ActivityFilters = {}) {
  const limit = Math.max(1, Math.min(filters.limit ?? 200, 500))
  const [timelineRows, submissionRows, auditRows, opportunityRows] = await Promise.all([
    database.db.query.timelineEvents.findMany({
      where: and(
        eq(timelineEvents.organizationId, session.organizationId),
        filters.contactId ? eq(timelineEvents.contactId, filters.contactId) : undefined,
        filters.startAt ? gte(timelineEvents.createdAt, filters.startAt) : undefined,
        filters.endAt ? lte(timelineEvents.createdAt, filters.endAt) : undefined,
      ),
      orderBy: [desc(timelineEvents.createdAt)],
      limit,
    }),
    database.db.query.formSubmissions.findMany({
      where: and(
        eq(formSubmissions.organizationId, session.organizationId),
        filters.contactId ? eq(formSubmissions.contactId, filters.contactId) : undefined,
        filters.leadId ? eq(formSubmissions.id, filters.leadId) : undefined,
        filters.startAt ? gte(formSubmissions.createdAt, filters.startAt) : undefined,
        filters.endAt ? lte(formSubmissions.createdAt, filters.endAt) : undefined,
      ),
      orderBy: [desc(formSubmissions.createdAt)],
      limit,
    }),
    database.db.query.auditEvents.findMany({
      where: and(
        eq(auditEvents.organizationId, session.organizationId),
        filters.userId ? eq(auditEvents.actorUserId, filters.userId) : undefined,
        filters.opportunityId ? and(eq(auditEvents.entityType, 'opportunity'), eq(auditEvents.entityId, filters.opportunityId)) : undefined,
        filters.startAt ? gte(auditEvents.createdAt, filters.startAt) : undefined,
        filters.endAt ? lte(auditEvents.createdAt, filters.endAt) : undefined,
      ),
      orderBy: [desc(auditEvents.createdAt)],
      limit,
    }),
    database.db.query.opportunities.findMany({ where: eq(opportunities.organizationId, session.organizationId) }),
  ])

  const latestOpportunityByContact = new Map<string, (typeof opportunityRows)[number]>()
  for (const row of opportunityRows) {
    if (!latestOpportunityByContact.has(row.contactId)) {
      latestOpportunityByContact.set(row.contactId, row)
    }
  }

  const activities: ActivityRecord[] = [
    ...timelineRows.map((row) => {
      const metadata = parseJsonObject(row.metadataJson)
      const metadataOpportunityId = typeof metadata.opportunityId === 'string' ? metadata.opportunityId : null
      return {
        id: row.id,
        organizationId: row.organizationId,
        actorUserId: null,
        contactId: row.contactId,
        opportunityId: metadataOpportunityId ?? latestOpportunityByContact.get(row.contactId)?.id ?? null,
        leadId: null,
        activityType: mapTimelineActivityType(row.eventType),
        title: row.title,
        body: row.body,
        source: 'timeline',
        createdAt: row.createdAt,
      }
    }),
    ...submissionRows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      actorUserId: null,
      contactId: row.contactId,
      opportunityId: latestOpportunityByContact.get(row.contactId)?.id ?? null,
      leadId: row.id,
      activityType: 'form_submission',
      title: `${row.formType} submitted`,
      body: 'Lead submission captured and persisted.',
      source: 'form_submission',
      createdAt: row.createdAt,
    })),
    ...auditRows.map((row) => ({
      id: row.id,
      organizationId: row.organizationId,
      actorUserId: row.actorUserId,
      contactId: null,
      opportunityId: row.entityType === 'opportunity' ? row.entityId : null,
      leadId: row.entityType === 'form_submission' ? row.entityId : null,
      activityType: mapAuditActivityType(row.action, row.entityType),
      title: row.action.replaceAll('.', ' '),
      body: `${row.entityType} ${row.entityId}`,
      source: 'audit',
      createdAt: row.createdAt,
    })),
  ]

  const contactScoped = filters.contactId
    ? activities.filter((row) => row.contactId === filters.contactId)
    : activities

  const opportunityScoped = filters.opportunityId
    ? contactScoped.filter((row) => row.opportunityId === filters.opportunityId)
    : contactScoped

  const leadScoped = filters.leadId
    ? opportunityScoped.filter((row) => row.leadId === filters.leadId)
    : opportunityScoped

  const userScoped = filters.userId
    ? leadScoped.filter((row) => row.actorUserId === filters.userId)
    : leadScoped

  const typeScoped = filters.activityType
    ? userScoped.filter((row) => row.activityType === filters.activityType)
    : userScoped

  const sorted = typeScoped.sort((left, right) =>
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )

  return {
    items: sorted.slice(0, limit),
    unsupportedFilters: [
      ...(filters.companyId ? ['companyId'] : []),
    ],
    availableTypes: [
      'call',
      'email',
      'message',
      'meeting',
      'note',
      'status_change',
      'assignment_change',
      'form_submission',
      'opportunity',
      'workflow_event',
      'authentication',
      'administrative',
    ],
  }
}

export async function getDashboardSnapshot(database: DatabaseContext, session: SessionContext, filters: DashboardFilters = {}) {
  const [contactRows, opportunityRows, formRows, taskRows, appointmentRows, failedSubmissionRows, retryJobRows, activityFeed] = await Promise.all([
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.opportunities.findMany({ where: eq(opportunities.organizationId, session.organizationId) }),
    database.db.query.formSubmissions.findMany({ where: eq(formSubmissions.organizationId, session.organizationId) }),
    database.db.query.tasks.findMany({ where: eq(tasks.organizationId, session.organizationId) }),
    database.db.query.appointments.findMany({ where: eq(appointments.organizationId, session.organizationId) }),
    database.db.query.submissionFailures.findMany({ where: eq(submissionFailures.organizationId, session.organizationId) }),
    database.db.query.retryJobs.findMany({ where: eq(retryJobs.organizationId, session.organizationId) }),
    listActivityFeed(database, session, { limit: 12 }),
  ])

  const filteredContacts = contactRows.filter((row) => {
    if (filters.ownerUserId && row.ownerUserId !== filters.ownerUserId) return false
    if (filters.source && row.source !== filters.source) return false
    if (filters.status && row.status !== filters.status) return false
    return true
  })

  const contactIds = new Set(filteredContacts.map((row) => row.id))
  const filteredOpportunities = opportunityRows.filter((row) => {
    if (!contactIds.has(row.contactId)) return false
    if (filters.ownerUserId && row.advisorUserId !== filters.ownerUserId) return false
    if (filters.stageKey && row.stageKey !== filters.stageKey) return false
    return true
  })

  const openOpportunities = filteredOpportunities.filter((row) => row.status === 'open')
  const wonOpportunities = filteredOpportunities.filter((row) => row.status === 'won')
  const lostOpportunities = filteredOpportunities.filter((row) => row.status === 'lost')
  const qualifiedLeads = filteredOpportunities.filter((row) => row.stageKey !== 'new_inquiry').length
  const pipelineValue = openOpportunities.reduce((sum, row) => sum + row.expectedValueAed, 0)
  const wonRevenue = wonOpportunities.reduce((sum, row) => sum + row.expectedValueAed, 0)
  const conversionRate = filteredOpportunities.length > 0 ? Math.round((wonOpportunities.length / filteredOpportunities.length) * 100) : 0

  const leadsBySource = Object.entries(filteredContacts.reduce<Record<string, number>>((acc, row) => {
    acc[row.source] = (acc[row.source] ?? 0) + 1
    return acc
  }, {})).map(([label, value]) => ({ label, value }))

  const leadsByStatus = Object.entries(filteredContacts.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1
    return acc
  }, {})).map(([label, value]) => ({ label, value }))

  const opportunitiesByStage = Object.entries(filteredOpportunities.reduce<Record<string, number>>((acc, row) => {
    acc[row.stageKey] = (acc[row.stageKey] ?? 0) + 1
    return acc
  }, {})).map(([label, value]) => ({ label, value }))

  const opportunitiesByPipeline = Object.entries(filteredOpportunities.reduce<Record<string, number>>((acc, row) => {
    acc[row.pipelineKey] = (acc[row.pipelineKey] ?? 0) + 1
    return acc
  }, {})).map(([label, value]) => ({ label, value }))

  const upcomingTasks = taskRows
    .filter((row) => row.status === 'open')
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime())
    .slice(0, 8)

  const overdueFollowUps = taskRows.filter((row) => row.status === 'open' && new Date(row.dueAt).getTime() < Date.now())

  const upcomingAppointments = appointmentRows
    .filter((row) => row.status === 'scheduled' && new Date(row.scheduledAt).getTime() >= Date.now())
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime())
    .slice(0, 8)

  return {
    metrics: {
      totalContacts: filteredContacts.length,
      newLeads: formRows.filter((row) => contactIds.has(row.contactId) && inRange(row.createdAt, 7)).length,
      qualifiedLeads,
      openOpportunities: openOpportunities.length,
      pipelineValue,
      wonRevenue,
      lostOpportunities: lostOpportunities.length,
      conversionRate,
      overdueFollowUps: overdueFollowUps.length,
      unassignedLeads: filteredContacts.filter((row) => !row.ownerUserId).length,
      failedSubmissions: failedSubmissionRows.filter((row) => row.status !== 'resolved').length,
      pendingRetries: retryJobRows.filter((row) => row.status === 'pending').length,
    },
    charts: {
      leadsBySource,
      leadsByStatus,
      opportunitiesByPipeline,
      opportunitiesByStage,
    },
    recentActivity: activityFeed.items.map((row) => ({
      id: row.id,
      eventType: row.activityType,
      title: row.title,
      body: row.body,
      createdAt: row.createdAt,
    })),
    upcomingTasks,
    upcomingAppointments: {
      available: true,
      reason: upcomingAppointments.length > 0
        ? `${upcomingAppointments.length} persisted appointment${upcomingAppointments.length === 1 ? '' : 's'} scheduled.`
        : 'No upcoming appointments in persisted CRM yet.',
      items: upcomingAppointments.map((row) => ({
        id: row.id,
        contactName: row.contactName,
        propertyName: row.propertyName,
        status: row.status,
        scheduledAt: row.scheduledAt,
      })),
    },
    integrations: [
      { name: 'Lead Intake API', status: 'healthy', detail: 'Persisted local API is responding.' },
      { name: 'Messaging delivery provider', status: 'not_configured', detail: 'Development simulation only. No provider configured.' },
      { name: 'Calendar integration', status: 'healthy', detail: 'Persisted appointments are available in the local CRM slice.' },
    ],
    filters: {
      sources: [...new Set(contactRows.map((row) => row.source))].sort(),
      owners: [...new Set(contactRows.map((row) => row.ownerUserId).filter(Boolean))],
      statuses: [...new Set(contactRows.map((row) => row.status))].sort(),
      stages: [...new Set(opportunityRows.map((row) => row.stageKey))].sort(),
      pipelines: [...new Set(opportunityRows.map((row) => row.pipelineKey))].sort(),
    },
  }
}

export async function listCrmLeads(database: DatabaseContext, session: SessionContext) {
  const [submissionRows, contactRows, opportunityRows, ownerRows] = await Promise.all([
    database.db.query.formSubmissions.findMany({
      where: eq(formSubmissions.organizationId, session.organizationId),
      orderBy: [desc(formSubmissions.createdAt)],
    }),
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.opportunities.findMany({ where: eq(opportunities.organizationId, session.organizationId) }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
  ])

  const contactsById = new Map(contactRows.map((row) => [row.id, row]))
  const ownersById = new Map(ownerRows.map((row) => [row.id, row.fullName]))
  const latestOpportunityByContact = new Map<string, (typeof opportunityRows)[number]>()

  for (const row of opportunityRows) {
    if (!latestOpportunityByContact.has(row.contactId)) {
      latestOpportunityByContact.set(row.contactId, row)
    }
  }

  return submissionRows.map((submission) => {
    const contact = contactsById.get(submission.contactId)
    const opportunity = latestOpportunityByContact.get(submission.contactId)
    return {
      id: submission.id,
      contactId: submission.contactId,
      formType: submission.formType,
      source: contact?.source ?? 'unknown',
      fullName: contact?.fullName ?? 'Unknown contact',
      ownerUserId: contact?.ownerUserId ?? null,
      ownerName: contact?.ownerUserId ? ownersById.get(contact.ownerUserId) ?? null : null,
      status: contact?.status ?? 'unknown',
      opportunityId: opportunity?.id ?? null,
      opportunityStageKey: opportunity?.stageKey ?? null,
      createdAt: submission.createdAt,
    }
  })
}

async function buildDealRowsForOrganization(database: DatabaseContext, session: SessionContext) {
  const [opportunityRows, contactRows, userRows, stageRows, stageChangeAuditRows] = await Promise.all([
    database.db.query.opportunities.findMany({
      where: eq(opportunities.organizationId, session.organizationId),
      orderBy: [desc(opportunities.createdAt)],
    }),
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
    database.db.query.pipelineStages.findMany({
      where: eq(pipelineStages.organizationId, session.organizationId),
      orderBy: [pipelineStages.sortOrder],
    }),
    database.db.query.auditEvents.findMany({
      where: and(
        eq(auditEvents.organizationId, session.organizationId),
        eq(auditEvents.entityType, 'opportunity'),
        eq(auditEvents.action, 'deal.stage_changed'),
      ),
      orderBy: [desc(auditEvents.createdAt)],
    }),
  ])

  const opportunityIdMap = buildNumericIdMap(opportunityRows.map((row) => row.id))
  const contactIdMap = buildNumericIdMap(contactRows.map((row) => row.id))
  const ownerIdMap = buildNumericIdMap(userRows.map((row) => row.id))

  const contactsById = new Map(contactRows.map((row) => [row.id, row]))
  const stagesByKey = new Map(stageRows.map((row) => [row.stageKey, row.name]))
  const stagesByName = new Map(stageRows.map((row) => [row.name, row.stageKey]))
  const stageOrderByKey = new Map(stageRows.map((row) => [row.stageKey, row.sortOrder]))
  const latestStageChangeByOpportunity = new Map(stageChangeAuditRows.map((row) => [row.entityId, row]))

  const rows: CrmDealRow[] = opportunityRows.map((opportunity) => {
    const contact = contactsById.get(opportunity.contactId)
    const stageName = stagesByKey.get(opportunity.stageKey) ?? (opportunity.stageKey === 'won' ? 'Won' : opportunity.stageKey === 'lost' ? 'Lost' : opportunity.stageKey)
    const outcome = mapOpportunityOutcome(stageName, opportunity.status)
    const sortOrder = stageOrderByKey.get(opportunity.stageKey) ?? -1
    const daysInStage = Math.max(0, Math.floor((Date.now() - new Date(opportunity.createdAt).getTime()) / (24 * 60 * 60 * 1000)))
    const atRisk = outcome === 'open' && daysInStage >= 10
    const latestChange = latestStageChangeByOpportunity.get(opportunity.id)

    return {
      id: opportunityIdMap.get(opportunity.id) ?? hashToPositiveInt(opportunity.id),
      title: opportunity.title,
      contactName: contact?.fullName ?? 'Unknown contact',
      contactId: contactIdMap.get(opportunity.contactId) ?? hashToPositiveInt(opportunity.contactId),
      propertyId: null,
      propertyLine: null,
      valueAed: opportunity.expectedValueAed,
      stage: stageName,
      probability: mapProbability(sortOrder - 1, stageRows.length, outcome),
      daysInStage,
      nextAction: outcome === 'open' ? 'Review next step' : 'Closed outcome reached',
      atRisk,
      riskNote: atRisk ? 'No stage movement in 10+ days' : null,
      outcome,
      ownerId: ownerIdMap.get(opportunity.advisorUserId) ?? 1,
      updatedAgo: formatAgo(latestChange?.createdAt ?? opportunity.createdAt),
      createdAt: opportunity.createdAt,
      aiHealth: atRisk ? 'No recent stage progression. Follow up now.' : 'Current momentum looks healthy.',
      lossReason: outcome === 'lost' ? 'Closed lost' : null,
    }
  })

  return {
    rows,
    stageNames: [
      ...stageRows.map((row) => row.name),
      ...(['Won', 'Lost'] as const).filter((name) => !stagesByName.has(name)),
    ],
    opportunityIdMap,
    stageRows,
    stagesByName,
    stagesByKey,
  }
}

export async function listCrmDeals(database: DatabaseContext, session: SessionContext) {
  const model = await buildDealRowsForOrganization(database, session)
  return model.rows
}

export async function listCrmDealStages(database: DatabaseContext, session: SessionContext) {
  const model = await buildDealRowsForOrganization(database, session)
  return model.stageNames
}

export async function getCrmDeal(database: DatabaseContext, session: SessionContext, dealId: number) {
  const model = await buildDealRowsForOrganization(database, session)
  return model.rows.find((row) => row.id === dealId) ?? null
}

export async function getCrmDealHistory(database: DatabaseContext, session: SessionContext, dealId: number) {
  const model = await buildDealRowsForOrganization(database, session)
  const deal = model.rows.find((row) => row.id === dealId)
  if (!deal) return []

  const opportunityId = Array.from(model.opportunityIdMap.entries()).find(([, numericId]) => numericId === deal.id)?.[0]
  if (!opportunityId) return []

  const opportunity = await database.db.query.opportunities.findFirst({
    where: and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.id, opportunityId)),
  })
  if (!opportunity) return []

  const [historyRows, actors] = await Promise.all([
    database.db.query.auditEvents.findMany({
      where: and(
        eq(auditEvents.organizationId, session.organizationId),
        eq(auditEvents.entityType, 'opportunity'),
        eq(auditEvents.entityId, opportunity.id),
        eq(auditEvents.action, 'deal.stage_changed'),
      ),
      orderBy: [desc(auditEvents.createdAt)],
      limit: 100,
    }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
  ])

  const actorById = new Map(actors.map((row) => [row.id, row.fullName]))
  const mapped = historyRows.map((row, index) => {
    const metadata = parseJsonObject(row.metadataJson)
    const fromStage = typeof metadata.fromStage === 'string' ? metadata.fromStage : null
    const toStage = typeof metadata.toStage === 'string' ? metadata.toStage : deal.stage

    return {
      id: index + 1,
      fromStage,
      toStage,
      changedBy: actorById.get(row.actorUserId) ?? row.actorUserId,
      ago: formatAgo(row.createdAt) ?? 'just now',
    } satisfies DealStageHistoryEntry
  })

  if (mapped.length > 0) return mapped
  return [{
    id: 1,
    fromStage: null,
    toStage: deal.stage,
    changedBy: 'System',
    ago: formatAgo(opportunity.createdAt) ?? 'just now',
  }]
}

export async function moveCrmDealStage(database: DatabaseContext, session: SessionContext, dealId: number, nextStageNameOrKey: string): Promise<MoveCrmDealStageResult> {
  const model = await buildDealRowsForOrganization(database, session)
  const deal = model.rows.find((row) => row.id === dealId)
  if (!deal) throw new Error('Deal not found')

  const opportunityId = Array.from(model.opportunityIdMap.entries()).find(([, numericId]) => numericId === deal.id)?.[0]
  if (!opportunityId) throw new Error('Deal not found')

  const opportunity = await database.db.query.opportunities.findFirst({
    where: and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.id, opportunityId)),
  })
  if (!opportunity) throw new Error('Deal not found')

  const stageRows = model.stageRows
  const stageByName = new Map(stageRows.map((row) => [row.name, row]))
  const stageByKey = new Map(stageRows.map((row) => [row.stageKey, row]))

  const byName = stageByName.get(nextStageNameOrKey)
  const byKey = stageByKey.get(nextStageNameOrKey)
  const resolvedStageName = byName?.name ?? byKey?.name ?? (nextStageNameOrKey === 'Won' || nextStageNameOrKey === 'Lost' ? nextStageNameOrKey : null)
  const resolvedStageKey = byName?.stageKey ?? byKey?.stageKey ?? (nextStageNameOrKey === 'Won' ? 'won' : nextStageNameOrKey === 'Lost' ? 'lost' : null)

  if (!resolvedStageName || !resolvedStageKey) {
    throw new Error('Invalid stage')
  }

  const currentStageName = model.stagesByKey.get(opportunity.stageKey) ?? opportunity.stageKey
  const alreadyAtTarget = opportunity.stageKey === resolvedStageKey || currentStageName === resolvedStageName

  if (!alreadyAtTarget) {
    const outcome = resolvedStageName === 'Won' ? 'won' : resolvedStageName === 'Lost' ? 'lost' : 'open'
    const stageIndex = stageRows.findIndex((row) => row.stageKey === resolvedStageKey)
    const probability = mapProbability(stageIndex, stageRows.length, outcome)

    await database.db
      .update(opportunities)
      .set({
        stageKey: resolvedStageKey,
        status: outcome,
        probability,
      })
      .where(and(eq(opportunities.organizationId, session.organizationId), eq(opportunities.id, opportunity.id)))

    await recordAudit(database, session, 'opportunity', opportunity.id, 'deal.stage_changed', {
      fromStage: currentStageName,
      toStage: resolvedStageName,
      fromStageKey: opportunity.stageKey,
      toStageKey: resolvedStageKey,
    })
  }

  const refreshed = await getCrmDeal(database, session, dealId)
  if (!refreshed) throw new Error('Deal not found')

  return {
    deal: refreshed,
    previousStage: currentStageName,
    newStage: resolvedStageName,
    activityCreated: !alreadyAtTarget,
  }
}

export async function listCrmTasks(database: DatabaseContext, session: SessionContext) {
  const [taskRows, contactRows, opportunityRows, userRows] = await Promise.all([
    database.db.query.tasks.findMany({
      where: eq(tasks.organizationId, session.organizationId),
      orderBy: [desc(tasks.createdAt)],
    }),
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.opportunities.findMany({ where: eq(opportunities.organizationId, session.organizationId) }),
    database.db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) }),
  ])

  const contactsById = new Map(contactRows.map((row) => [row.id, row]))
  const opportunitiesById = new Map(opportunityRows.map((row) => [row.id, row]))
  const usersById = new Map(userRows.map((row) => [row.id, row]))

  return taskRows.map((row) => {
    const contact = contactsById.get(row.contactId)
    const opportunity = opportunitiesById.get(row.opportunityId)
    const assignee = opportunity ? usersById.get(opportunity.advisorUserId) : null

    return {
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      dueAt: row.dueAt,
      createdAt: row.createdAt,
      contactId: row.contactId,
      contactName: contact?.fullName ?? null,
      opportunityId: row.opportunityId,
      opportunityTitle: opportunity?.title ?? null,
      assigneeUserId: assignee?.id ?? null,
      assigneeName: assignee?.fullName ?? null,
      overdue: row.status !== 'done' && new Date(row.dueAt).getTime() < Date.now(),
    } satisfies CrmTaskRow
  })
}

export async function listCrmViewings(database: DatabaseContext, session: SessionContext): Promise<CrmViewingRow[]> {
  const [appointmentRows, contactRows, propertyRows] = await Promise.all([
    database.db.query.appointments.findMany({
      where: eq(appointments.organizationId, session.organizationId),
      orderBy: [desc(appointments.scheduledAt)],
    }),
    database.db.query.contacts.findMany({ where: eq(contacts.organizationId, session.organizationId) }),
    database.db.query.properties.findMany({ where: eq(properties.organizationId, session.organizationId) }),
  ])

  const contactsById = new Map(contactRows.map((row) => [row.id, row.fullName]))
  const propertiesById = new Map(propertyRows.map((row) => [row.id, row.name]))

  return appointmentRows.map((row) => ({
    id: row.id,
    contactId: row.contactId,
    contactName: row.contactName || (row.contactId ? contactsById.get(row.contactId) ?? 'Unknown contact' : 'Unknown contact'),
    propertyId: row.propertyId,
    propertyName: row.propertyName || (row.propertyId ? propertiesById.get(row.propertyId) ?? 'Unknown property' : 'Unknown property'),
    advisorUserId: row.advisorUserId,
    dayLabel: formatDayLabel(row.scheduledAt),
    timeLabel: formatTimeLabel(row.scheduledAt),
    status: row.status,
    outcome: row.outcome,
    feedback: row.feedback,
    interestScore: row.interestScore,
    nextStep: row.nextStep,
    scheduledAt: row.scheduledAt,
    createdAt: row.createdAt,
  }))
}

export async function listCrmAutomations(database: DatabaseContext, session: SessionContext): Promise<CrmAutomationRow[]> {
  const rows = await database.db.query.automations.findMany({
    where: eq(automations.organizationId, session.organizationId),
    orderBy: [desc(automations.createdAt)],
  })

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    triggerLabel: row.triggerLabel,
    actionLabel: row.actionLabel,
    status: row.status,
    runsCount: row.runsCount,
    lastRunAgo: row.lastRunAt ? formatAgo(row.lastRunAt) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }))
}

export async function createCrmAutomation(database: DatabaseContext, session: SessionContext, input: CreateCrmAutomationInput) {
  const automationId = createId('auto')
  const nowIso = new Date().toISOString()

  await database.db.insert(automations).values({
    id: automationId,
    organizationId: session.organizationId,
    name: input.name.trim(),
    triggerLabel: input.triggerLabel?.trim() || 'Custom trigger',
    actionLabel: input.actionLabel?.trim() || 'Custom action',
    status: 'draft',
    runsCount: 0,
    lastRunAt: null,
    updatedAt: nowIso,
  })

  await recordAudit(database, session, 'automation', automationId, 'automation.created', {
    status: 'draft',
  })

  const created = await database.db.query.automations.findFirst({
    where: and(eq(automations.organizationId, session.organizationId), eq(automations.id, automationId)),
  })

  if (!created) throw new Error('Automation not found')
  return created
}

export async function setCrmAutomationStatus(database: DatabaseContext, session: SessionContext, automationId: string, status: 'active' | 'paused' | 'draft') {
  const existing = await database.db.query.automations.findFirst({
    where: and(eq(automations.organizationId, session.organizationId), eq(automations.id, automationId)),
  })

  if (!existing) throw new Error('Automation not found')

  await database.db.update(automations)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(automations.organizationId, session.organizationId), eq(automations.id, automationId)))

  await recordAudit(database, session, 'automation', automationId, 'automation.status_changed', {
    from: existing.status,
    to: status,
  })

  const updated = await database.db.query.automations.findFirst({
    where: and(eq(automations.organizationId, session.organizationId), eq(automations.id, automationId)),
  })

  if (!updated) throw new Error('Automation not found')
  return updated
}

export async function createCrmViewing(database: DatabaseContext, session: SessionContext, input: CreateCrmViewingInput) {
  const appointmentId = createId('apt')
  const scheduledAt = coerceScheduledAt(input.scheduledAt)

  await database.db.insert(appointments).values({
    id: appointmentId,
    organizationId: session.organizationId,
    contactId: input.contactId ?? null,
    opportunityId: input.opportunityId ?? null,
    propertyId: input.propertyId ?? null,
    advisorUserId: input.advisorUserId ?? null,
    contactName: input.contactName.trim(),
    propertyName: input.propertyName.trim(),
    scheduledAt,
    status: input.status,
    outcome: input.outcome ?? null,
    feedback: input.feedback ?? null,
    interestScore: input.interestScore ?? null,
    nextStep: input.nextStep ?? null,
  })

  await recordAudit(database, session, 'appointment', appointmentId, 'appointment.created', {
    status: input.status,
    scheduledAt,
    contactId: input.contactId ?? null,
    propertyId: input.propertyId ?? null,
  })

  if (input.contactId) {
    await appendTimeline(
      database,
      session.organizationId,
      input.contactId,
      'viewing.scheduled',
      `Viewing scheduled · ${input.propertyName.trim()}`,
      `Viewing set for ${new Date(scheduledAt).toLocaleString('en-GB')}`,
      { appointmentId, status: input.status },
    )
  }

  const created = await database.db.query.appointments.findFirst({
    where: and(eq(appointments.organizationId, session.organizationId), eq(appointments.id, appointmentId)),
  })

  if (!created) throw new Error('Appointment not found')
  return created
}

export async function setCrmTaskStatus(database: DatabaseContext, session: SessionContext, taskId: string, nextStatus: 'open' | 'done') {
  const existing = await database.db.query.tasks.findFirst({
    where: and(eq(tasks.organizationId, session.organizationId), eq(tasks.id, taskId)),
  })

  if (!existing) throw new Error('Task not found')

  await database.db.update(tasks)
    .set({ status: nextStatus })
    .where(and(eq(tasks.organizationId, session.organizationId), eq(tasks.id, taskId)))

  await recordAudit(database, session, 'task', taskId, 'task.status_changed', {
    from: existing.status,
    to: nextStatus,
  })

  const updated = await database.db.query.tasks.findFirst({
    where: and(eq(tasks.organizationId, session.organizationId), eq(tasks.id, taskId)),
  })

  if (!updated) throw new Error('Task not found')
  return updated
}