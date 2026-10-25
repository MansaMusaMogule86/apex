import type { CrmContactRow, CrmLeadSnapshot, CrmOpportunitySnapshot, DashboardSnapshot } from '@/lib/crm-api'
import type { LeadSliceBootstrap } from '@/lib/lead-intake-api'
import { contacts, deals, kpis, pipelineStages, properties, team } from '@/lib/demo-data'

function parseAed(value: string) {
  const numeric = Number(value.replace(/[^0-9.]/g, ''))
  const multiplier = value.includes('M') ? 1_000_000 : value.includes('K') ? 1_000 : 1
  return Math.round(numeric * multiplier)
}

function toStageKey(stageName: string) {
  return stageName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function isoMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString()
}

function parseRelativeAge(value: string) {
  const normalized = value.trim().toLowerCase()
  const minuteMatch = normalized.match(/^(\d+)m ago$/)
  if (minuteMatch) return Number(minuteMatch[1])
  const hourMatch = normalized.match(/^(\d+)h ago$/)
  if (hourMatch) return Number(hourMatch[1]) * 60
  const dayMatch = normalized.match(/^(\d+)d ago$/)
  if (dayMatch) return Number(dayMatch[1]) * 24 * 60
  const hotMatch = normalized.match(/hot/i)
  if (hotMatch) return 10
  return 12 * 60
}

function stageProbability(stageName: string) {
  const stage = toStageKey(stageName)
  const probabilities: Record<string, number> = {
    new_lead: 10,
    qualified: 20,
    proposal_sent: 40,
    negotiation: 70,
    closed_won: 100,
    closed_lost: 0,
    on_hold: 10,
  }
  return probabilities[stage] ?? 25
}

function ownerRecord(ownerName: string) {
  return team.find((member) => member.name.toLowerCase().includes(ownerName.toLowerCase()))
}

function contactDeal(contactName: string) {
  return deals.find((deal) => deal.contact === contactName)
}

function demoOpportunityId(dealId: string) {
  return `demo_opp_${dealId}`
}

function estimateBudget(contactType: string) {
  const budgetChunk = contactType.split('·')[1]?.trim() ?? ''
  const [minRaw, maxRaw] = budgetChunk
    .replace('USD', '')
    .replace('EUR', '')
    .replace('GBP', '')
    .replace('/unit', '')
    .split('–')
    .map((part) => part.trim())

  const min = minRaw ? parseAed(minRaw) : null
  const max = maxRaw ? parseAed(maxRaw) : min
  return { min, max }
}

function demoTimelineEntry(id: string, title: string, body: string, minutesAgo: number) {
  return {
    id,
    eventType: 'demo_activity',
    title,
    body,
    createdAt: isoMinutesAgo(minutesAgo),
    metadata: { source: 'demo_fallback' } as Record<string, unknown>,
  }
}

export function buildDemoDashboardSnapshot(): DashboardSnapshot {
  const openDeals = deals.filter((deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost')
  const pipelineValue = openDeals.reduce((sum, deal) => sum + parseAed(deal.value), 0)
  const leadsBySource = Object.entries(
    contacts.reduce<Record<string, number>>((acc, contact) => {
      acc[contact.source] = (acc[contact.source] ?? 0) + 1
      return acc
    }, {}),
  ).map(([label, value]) => ({ label, value }))

  return {
    metrics: {
      totalContacts: contacts.length,
      newLeads: kpis.newLeadsWeek,
      qualifiedLeads: deals.filter((deal) => deal.stage === 'Qualified').length,
      openOpportunities: openDeals.length,
      pipelineValue,
      wonRevenue: 0,
      lostOpportunities: 0,
      conversionRate: 0,
      overdueFollowUps: kpis.overdueFollowUps,
      unassignedLeads: 0,
      failedSubmissions: null,
      pendingRetries: null,
    },
    charts: {
      leadsBySource,
      leadsByStatus: [{ label: 'active', value: contacts.length }],
      opportunitiesByPipeline: [{ label: 'sales_standard', value: deals.length }],
      opportunitiesByStage: pipelineStages.map((stage) => ({
        label: stage,
        value: deals.filter((deal) => deal.stage === stage).length,
      })),
    },
    recentActivity: [
      { id: 'act-1', eventType: 'deal_created', title: 'New deal created', body: 'ScaleUp Co — Starter Plan (USD 99K)', createdAt: isoMinutesAgo(30) },
      { id: 'act-2', eventType: 'deal_won', title: 'Deal won', body: 'GlobalTech Solutions — Professional Plan (USD 350K)', createdAt: isoMinutesAgo(120) },
      { id: 'act-3', eventType: 'contact_created', title: 'New contact', body: 'Quantum Dynamics added', createdAt: isoMinutesAgo(240) },
    ],
    upcomingTasks: [
      {
        id: 'demo_task_1',
        title: 'Follow up on at-risk opportunities',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
      },
    ],
    upcomingAppointments: {
      available: false,
      reason: 'Calendar integration is not connected in demo mode.',
      items: [],
    },
    integrations: [
      { name: 'Meta (Facebook/Instagram)', status: 'degraded', detail: 'Demo mode active. Start API server for live sync status.' },
      { name: 'LinkedIn', status: 'degraded', detail: 'Demo mode active. Start API server for persisted health checks.' },
      { name: 'Email', status: 'degraded', detail: 'Demo mode active. Start API server for persisted health checks.' },
    ],
    filters: {
      sources: [...new Set(contacts.map((contact) => contact.source))],
      owners: [...new Set(contacts.map((contact) => contact.owner))],
      statuses: ['active'],
      stages: [...pipelineStages],
      pipelines: ['sales_standard'],
    },
  }
}

export function buildDemoReportsSnapshot(): DashboardSnapshot {
  const openDeals = deals.filter((deal) => deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost')
  const pipelineValue = openDeals.reduce((sum, deal) => sum + parseAed(deal.value), 0)
  const leadsBySource = Object.entries(
    contacts.reduce<Record<string, number>>((acc, contact) => {
      acc[contact.source] = (acc[contact.source] ?? 0) + 1
      return acc
    }, {}),
  ).map(([label, value]) => ({ label, value }))

  return {
    metrics: {
      totalContacts: contacts.length,
      newLeads: kpis.newLeadsWeek,
      qualifiedLeads: deals.filter((deal) => deal.stage === 'Qualified').length,
      openOpportunities: openDeals.length,
      pipelineValue,
      wonRevenue: 0,
      lostOpportunities: 0,
      conversionRate: 0,
      overdueFollowUps: kpis.overdueFollowUps,
      unassignedLeads: 0,
      failedSubmissions: null,
      pendingRetries: null,
    },
    charts: {
      leadsBySource,
      leadsByStatus: [{ label: 'active', value: contacts.length }],
      opportunitiesByPipeline: [{ label: 'sales_standard', value: deals.length }],
      opportunitiesByStage: pipelineStages.map((stage) => ({
        label: stage,
        value: deals.filter((deal) => deal.stage === stage).length,
      })),
    },
    recentActivity: [
      {
        id: 'demo_1',
        eventType: 'demo_mode',
        title: 'Demo dashboard loaded',
        body: 'API is unavailable, so sample operational data is shown to keep the workspace usable.',
        createdAt: new Date().toISOString(),
      },
    ],
    upcomingTasks: [
      {
        id: 'demo_task_1',
        title: 'Follow up on at-risk opportunities',
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
      },
    ],
    upcomingAppointments: {
      available: false,
      reason: 'Calendar integration is not connected in demo mode.',
      items: [],
    },
    integrations: [
      { name: 'Meta (Facebook/Instagram)', status: 'degraded', detail: 'Demo mode active. Start API server for live sync status.' },
      { name: 'LinkedIn', status: 'degraded', detail: 'Demo mode active. Start API server for persisted health checks.' },
      { name: 'Email', status: 'degraded', detail: 'Demo mode active. Start API server for persisted health checks.' },
    ],
    filters: {
      sources: [...new Set(contacts.map((contact) => contact.source))],
      owners: [...new Set(contacts.map((contact) => contact.owner))],
      statuses: ['active'],
      stages: [...pipelineStages],
      pipelines: ['sales_standard'],
    },
  }
}

export function buildDemoCrmContacts(): CrmContactRow[] {
  return contacts.map((contact) => {
    const deal = contactDeal(contact.name)
    const dealValue = deal ? parseAed(deal.value) : null

    return {
      id: contact.id,
      fullName: contact.name,
      email: null,
      phone: null,
      preferredLanguage: contact.lang,
      source: contact.source,
      status: 'active',
      ownerUserId: ownerRecord(contact.owner)?.id ?? null,
      ownerName: contact.owner,
      opportunityCount: deal ? 1 : 0,
      latestOpportunityId: deal ? demoOpportunityId(deal.id) : null,
      latestStageKey: deal ? toStageKey(deal.stage) : null,
      expectedValueAed: dealValue,
      updatedAt: isoMinutesAgo(parseRelativeAge(contact.lastContact)),
      createdAt: isoMinutesAgo(parseRelativeAge(contact.lastContact) + 10_080),
    }
  })
}

export function buildDemoCrmContactSnapshot(contactId: string): CrmLeadSnapshot | null {
  const contact = contacts.find((row) => row.id === contactId)
  if (!contact) return null

  const deal = contactDeal(contact.name)
  const budget = estimateBudget(contact.type)
  const opportunity = deal
    ? {
        id: demoOpportunityId(deal.id),
        title: `${contact.name} opportunity`,
        pipelineKey: 'sales_standard',
        stageKey: toStageKey(deal.stage),
        status: 'open',
        expectedValueAed: parseAed(deal.value),
        probability: stageProbability(deal.stage),
        advisorUserId: ownerRecord(contact.owner)?.id ?? 'u-admin',
      }
    : null

  const pickedMatches = properties
    .slice()
    .sort((a, b) => Math.abs(parseAed(a.price) - (budget.max ?? parseAed(a.price))) - Math.abs(parseAed(b.price) - (budget.max ?? parseAed(b.price))))
    .slice(0, 3)

  return {
    contact: {
      id: contact.id,
      fullName: contact.name,
      email: null,
      phone: null,
      preferredLanguage: contact.lang,
      source: contact.source,
      status: 'active',
      ownerUserId: ownerRecord(contact.owner)?.id ?? null,
      createdAt: isoMinutesAgo(parseRelativeAge(contact.lastContact) + 20_160),
    },
    requirement: {
      budgetMinAed: budget.min,
      budgetMaxAed: budget.max,
      locations: ['Global'],
      propertyTypes: ['Software', 'Services'],
      timeline: 'Within 90 days',
      financing: 'Cash',
      notes: `Derived from demo contact profile ${contact.id}.`,
      confidence: 0.68,
    },
    leadScore: {
      conversionProbability: deal ? stageProbability(deal.stage) : 30,
      nextBestAction: deal ? 'Confirm next client touchpoint and update stage notes.' : 'Qualify lead and capture full requirement profile.',
      expectedDealValueAed: deal ? parseAed(deal.value) : budget.max ?? 0,
      reasonCodes: deal ? ['stage_progression_signal', 'owner_engaged'] : ['intake_pending'],
      dataCompleteness: 0.7,
    },
    opportunity,
    draft: deal
      ? {
          id: `demo_draft_${deal.id}`,
          body: `Hi ${contact.name}, sharing a shortlist aligned to your preferences. Confirm your preferred viewing windows and we will proceed.`,
          status: 'pending_approval',
          channel: 'email',
          deliveryMode: 'advisor_send',
        }
      : null,
    task: deal
      ? {
          id: `demo_task_${deal.id}`,
          title: `Follow up ${contact.name} on ${deal.stage}`,
          dueAt: isoMinutesAgo(-240),
          priority: 'medium',
          status: 'pending',
        }
      : null,
    matches: pickedMatches.map((property, index) => ({
      id: `demo_match_${contact.id}_${index}`,
      matchScore: Math.max(70, 94 - index * 6),
      reasons: ['Budget aligned', 'Category preference overlap', 'Active status'],
      property: {
        id: property.id,
        propertyRef: property.id,
        name: property.name,
        community: property.category,
        propertyType: property.category,
        priceAed: parseAed(property.price),
        beds: 0,
        completion: property.status,
      },
    })),
    timeline: [
      demoTimelineEntry(`demo_contact_${contact.id}_1`, 'Demo contact opened', 'This timeline is rendered from fallback data while the API is unavailable.', parseRelativeAge(contact.lastContact) + 30),
      demoTimelineEntry(`demo_contact_${contact.id}_2`, 'Last touchpoint', `${contact.owner} contacted ${contact.name}.`, parseRelativeAge(contact.lastContact)),
    ],
    auditCount: 2,
  }
}

export function buildDemoCrmOpportunitySnapshot(opportunityId: string): CrmOpportunitySnapshot | null {
  const deal = deals.find((row) => row.id === opportunityId || demoOpportunityId(row.id) === opportunityId)
  if (!deal) return null

  const contact = contacts.find((row) => row.name === deal.contact)
  const owner = contact ? ownerRecord(contact.owner) : null

  return {
    opportunity: {
      id: demoOpportunityId(deal.id),
      contactId: contact?.id ?? 'demo_contact',
      contactName: deal.contact,
      title: `${deal.contact} opportunity`,
      pipelineKey: 'buyer_sales',
      stageKey: toStageKey(deal.stage),
      stageName: deal.stage,
      status: 'open',
      expectedValueAed: parseAed(deal.value),
      probability: stageProbability(deal.stage),
      ownerName: contact?.owner ?? 'Unassigned',
      createdAt: isoMinutesAgo(10_080),
    },
    contact: contact
      ? {
          id: contact.id,
          fullName: contact.name,
          email: null,
          phone: null,
          preferredLanguage: contact.lang,
          source: contact.source,
        }
      : null,
    owner: owner
      ? {
          id: owner.id,
          fullName: owner.name,
          email: `${owner.name.toLowerCase().replace(/\s+/g, '.')}@apex.local`,
          role: owner.role,
        }
      : null,
    tasks: [
      {
        id: `demo_task_${deal.id}`,
        title: `Progress ${deal.contact} from ${deal.stage}`,
        dueAt: isoMinutesAgo(-360),
        priority: 'high',
        status: 'pending',
      },
    ],
    drafts: [
      {
        id: `demo_draft_${deal.id}`,
        body: `Hi ${deal.contact}, confirming next steps for ${deal.stage}. Reply with your preferred time for a call today.`,
        status: 'pending_approval',
        channel: 'email',
        deliveryMode: 'advisor_send',
        sourceRecords: [deal.id],
      },
    ],
    timeline: [
      demoTimelineEntry(`demo_opportunity_${deal.id}_1`, 'Demo opportunity opened', 'This timeline comes from fallback records because the API request failed.', (deal.daysInStage ?? 1) * 24 * 60 + 10),
      demoTimelineEntry(`demo_opportunity_${deal.id}_2`, `Stage set to ${deal.stage}`, 'Advisor marked this opportunity at the current stage.', (deal.daysInStage ?? 1) * 24 * 60),
    ],
  }
}

export function buildDemoLeadSliceBootstrap(): LeadSliceBootstrap {
  return {
    contacts: contacts.slice(0, 8).map((contact) => ({
      id: contact.id,
      fullName: contact.name,
      preferredLanguage: contact.lang,
      source: contact.source,
      updatedAt: isoMinutesAgo(parseRelativeAge(contact.lastContact)),
    })),
    forms: ['Property Inquiry', 'Buyer Qualification', 'Investor Intake'],
    stages: pipelineStages.map((stage, index) => ({
      id: `demo_stage_${index + 1}`,
      name: stage,
      stageKey: toStageKey(stage),
      sortOrder: index,
    })),
  }
}
