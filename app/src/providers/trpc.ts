/**
 * Mock tRPC client — frontend-only demo provider.
 * Wraps the demo-data module with tRPC-like hooks (useQuery, useMutation, useUtils).
 * All data is in-memory; mutations are local-only (no server).
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  contacts,
  companies,
  properties,
  deals,
  pipelineStages,
  team,
  currentUser,
  docTypes,
} from '@/lib/demo-data'
import type {
  DealRow,
  MoveStageRequest,
  MoveStageResponse,
  StageHistoryEntry,
} from '@/components/deals/types'
import type {
  CompanyRow,
  ContactRow,
  ConversationRow,
  DraftRow,
  MatchResult,
  MessageRow,
  RequirementRow,
  TaskRow,
  PropertyRow,
  ViewingRow,
  DocumentRowT,
  TeamRow,
} from '@/components/crm/shared.types'

/* -------------------------------------------------------------------------- */
/*  Reactive store                                                            */
/* -------------------------------------------------------------------------- */

type Listener = () => void
const listeners = new Set<Listener>()
const cache = new Map<string, unknown>()
const notify = () => { for (const l of listeners) l() }
const subscribe = (cb: Listener) => { listeners.add(cb); return () => listeners.delete(cb) }
const getSnapshot = () => cache

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) throw new Error(await response.text())
  return response.json() as Promise<T>
}

type ApiCrmTaskRow = {
  id: string
  title: string
  status: 'open' | 'done' | string
  priority: string
  dueAt: string
  contactName: string | null
  opportunityTitle: string | null
  assigneeUserId: string | null
  overdue: boolean
}

type ApiCrmViewingRow = {
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
}

type ApiCrmAutomationRow = {
  id: string
  name: string
  triggerLabel: string
  actionLabel: string
  status: string
  runsCount: number
  lastRunAgo: string | null
}

type TrpcTaskRow = TaskRow & { assigneeId: number | null }

const taskIdLookup = new Map<number, string>()
const automationIdLookup = new Map<number, string>()

function hashToPositiveInt(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return (hash % 900000000) + 1
}

function normalizeTaskPriority(priority: string): string {
  const lower = priority.toLowerCase()
  if (lower === 'high' || lower === 'p1') return 'P1'
  if (lower === 'medium' || lower === 'p2') return 'P2'
  if (lower === 'low' || lower === 'p3') return 'P3'
  return 'P2'
}

function dueLabelFromDueAt(dueAt: string, overdue: boolean, status: string): string {
  if (overdue && status !== 'done') return 'Overdue'

  const due = new Date(dueAt)
  if (Number.isNaN(due.getTime())) return 'Scheduled'

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const startOfDueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate())

  if (startOfDueDate.getTime() === startOfToday.getTime()) return 'Today'
  if (startOfDueDate.getTime() === startOfTomorrow.getTime()) return 'Tomorrow'

  return due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function mapCrmTasksToTrpc(rows: ApiCrmTaskRow[]): TrpcTaskRow[] {
  taskIdLookup.clear()
  const usedTaskIds = new Set<number>()

  return rows.map((row) => {
    let id = hashToPositiveInt(row.id)
    while (usedTaskIds.has(id)) id += 1
    usedTaskIds.add(id)
    taskIdLookup.set(id, row.id)

    return {
      id,
      title: row.title,
      dueLabel: dueLabelFromDueAt(row.dueAt, row.overdue, row.status),
      priority: normalizeTaskPriority(row.priority),
      status: row.status === 'done' ? 'done' : 'open',
      relatedType: row.opportunityTitle ? 'deal' : row.contactName ? 'contact' : null,
      relatedName: row.opportunityTitle ?? row.contactName,
      assigneeId: row.assigneeUserId ? hashToPositiveInt(row.assigneeUserId) : null,
      aiSuggested: false,
      overdue: row.overdue,
    }
  })
}

function mapCrmViewingsToTrpc(rows: ApiCrmViewingRow[]): ViewingRow[] {
  const usedIds = new Set<number>()

  return rows.map((row) => {
    let id = hashToPositiveInt(row.id)
    while (usedIds.has(id)) id += 1
    usedIds.add(id)

    return {
      id,
      contactId: row.contactId ? hashToPositiveInt(row.contactId) : 0,
      contactName: row.contactName,
      propertyId: row.propertyId ? hashToPositiveInt(row.propertyId) : null,
      propertyName: row.propertyName,
      advisorId: row.advisorUserId ? hashToPositiveInt(row.advisorUserId) : 0,
      advisorName: '',
      dayLabel: row.dayLabel,
      timeLabel: row.timeLabel,
      status: row.status,
      outcome: row.outcome,
      feedback: row.feedback,
      interestScore: row.interestScore,
      nextStep: row.nextStep,
    }
  })
}

function mapCrmAutomationsToTrpc(rows: ApiCrmAutomationRow[]) {
  automationIdLookup.clear()
  const usedIds = new Set<number>()

  return rows.map((row) => {
    let id = hashToPositiveInt(row.id)
    while (usedIds.has(id)) id += 1
    usedIds.add(id)
    automationIdLookup.set(id, row.id)

    return {
      id,
      name: row.name,
      triggerLabel: row.triggerLabel,
      actionLabel: row.actionLabel,
      status: row.status,
      runsCount: row.runsCount,
      lastRunAgo: row.lastRunAgo,
    }
  })
}

/* -------------------------------------------------------------------------- */
/*  Query helper — synchronous on first render, trigger-less after            */
/* -------------------------------------------------------------------------- */

interface QueryResult<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

function useQuery<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  options?: { enabled?: boolean },
): QueryResult<T> {
  const enabled = options?.enabled ?? true
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const val = snapshot.get(key) as T | undefined
  const [loading, setLoading] = useState(!snapshot.has(key) && enabled)

  useEffect(() => {
    if (!enabled || snapshot.has(key)) return
    let canceled = false
    Promise.resolve(fetcher())
      .then((result) => {
        if (canceled) return
        cache.set(key, result)
        notify()
      })
      .catch((err) => {
        if (canceled) return
        cache.set(key, err instanceof Error ? null : null)
        notify()
      })
      .finally(() => {
        if (!canceled) setLoading(false)
      })
    return () => {
      canceled = true
    }
  }, [enabled, fetcher, key, snapshot])

  const refetch = useCallback(() => {
    setLoading(true)
    Promise.resolve(fetcher())
      .then((result) => {
        cache.set(key, result)
        notify()
      })
      .finally(() => setLoading(false))
  }, [key, fetcher])

  return { data: val, isLoading: loading, isError: false, error: null, refetch }
}

/* -------------------------------------------------------------------------- */
/*  Mutation helper                                                           */
/* -------------------------------------------------------------------------- */

interface MutationOptions<TInput, TOutput> {
  onMutate?: (input: TInput) => unknown | Promise<unknown>
  onError?: (error: unknown, input: TInput, context: unknown) => void
  onSuccess?: (data: TOutput, input: TInput, context: unknown) => void
  onSettled?: (data: TOutput | undefined, error: unknown, input: TInput, context: unknown) => void
}

interface MutationResult<TInput, TOutput> {
  mutate: (input: TInput) => void
  mutateAsync: (input: TInput) => Promise<TOutput>
  isLoading: boolean
  isSuccess: boolean
  isPending: boolean
  error: Error | null
  variables: TInput | undefined
}

function useMutation<TInput, TOutput>(
  fn: (input: TInput) => TOutput | Promise<TOutput>,
  opts?: MutationOptions<TInput, TOutput>,
): MutationResult<TInput, TOutput> {
  const [isLoading, setLoading] = useState(false)
  const [isSuccess, setSuccess] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [variables, setVariables] = useState<TInput | undefined>(undefined)

  const mutate = useCallback(
    (input: TInput) => {
      setVariables(input)
      setLoading(true)
      setSuccess(false)
      setError(null)
      Promise.resolve(opts?.onMutate?.(input))
        .then((context) =>
          Promise.resolve(fn(input))
            .then((result) => {
              setSuccess(true)
              opts?.onSuccess?.(result, input, context)
              opts?.onSettled?.(result, null, input, context)
            })
            .catch((e) => {
              const err = e instanceof Error ? e : new Error(String(e))
              setError(err)
              opts?.onError?.(err, input, context)
              opts?.onSettled?.(undefined, err, input, context)
            }),
        )
        .catch((e) => {
          const err = e instanceof Error ? e : new Error(String(e))
          setError(err)
          opts?.onError?.(err, input, undefined)
          opts?.onSettled?.(undefined, err, input, undefined)
        })
        .finally(() => {
          setLoading(false)
        })
    },
    [fn, opts],
  )

  const mutateAsync = useCallback(
    async (input: TInput): Promise<TOutput> => {
      setVariables(input)
      setLoading(true)
      setSuccess(false)
      setError(null)
      const context = await Promise.resolve(opts?.onMutate?.(input))
      try {
        const result = await Promise.resolve(fn(input))
        setSuccess(true)
        opts?.onSuccess?.(result, input, context)
        opts?.onSettled?.(result, null, input, context)
        return result
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e))
        setError(err)
        opts?.onError?.(err, input, context)
        opts?.onSettled?.(undefined, err, input, context)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [fn, opts],
  )

  return { mutate, mutateAsync, isLoading, isSuccess, isPending: isLoading, error, variables }
}

/* -------------------------------------------------------------------------- */
/*  Data builders — map demo data to the VM shapes the pages expect           */
/* -------------------------------------------------------------------------- */

function buildTeamRows(): TeamRow[] {
  return team.map((m, i) => ({
    id: i + 1,
    name: m.name,
    title: m.role,
    initials: m.initials,
    email: `${m.name.toLowerCase().replace(/\s+/g, '.')}@marinacrest.ae`,
    role: m.admin ? 'admin' : 'advisor',
    isCurrent: m.name === currentUser.name,
  }))
}

function buildDealRows(): DealRow[] {
  return deals.map((d, i) => {
    const price = Number(d.value.replace(/[^0-9.]/g, ''))
    const multiplier = d.value.includes('M') ? 1_000_000 : d.value.includes('K') ? 1_000 : 1
    const valueAed = price * multiplier
    const stageIdx = pipelineStages.indexOf(d.stage as (typeof pipelineStages)[number])
    const prob = stageIdx >= 0 ? Math.min(100, stageIdx * 8 + 10) : 50
    return {
      id: i + 1,
      title: `${d.contact} — ${d.property ?? d.value}`,
      contactName: d.contact,
      contactId: i + 1,
      propertyId: d.property ? i + 1 : null,
      propertyLine: d.property ?? null,
      valueAed,
      stage: d.stage,
      probability: prob,
      daysInStage: d.daysInStage ?? 0,
      nextAction: d.atRisk ? 'Follow up required' : 'Review next step',
      atRisk: d.atRisk ?? false,
      riskNote: d.atRisk ? 'No activity in 12+ days' : null,
      outcome: d.stage === 'Won' ? 'won' : 'open',
      ownerId: (i % team.length) + 1,
      updatedAgo: `${(i % 7) + 1}d ago`,
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    }
  })
}

function buildDashboardBundle() {
  const dealRows = buildDealRows()
  const openDeals = dealRows.filter((d) => d.outcome === 'open')
  const wonDeals = dealRows.filter((d) => d.outcome === 'won')
  const teamRows = buildTeamRows()

  const stageCounts = pipelineStages.map((stage) => {
    const stageDeals = dealRows.filter((d) => d.stage === stage)
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((s, d) => s + d.valueAed, 0),
    }
  })

  const pipelineAed = openDeals.reduce((s, d) => s + d.valueAed, 0)
  const weightedAed = openDeals.reduce((s, d) => s + Math.round((d.valueAed * d.probability) / 100), 0)
  const wonAed = wonDeals.reduce((s, d) => s + d.valueAed, 0)

  return {
    team: teamRows,
    kpis: {
      pipelineAed,
      pipelineDelta: 12,
      weightedAed,
      newLeadsWeek: 34,
      newLeadsDelta: 8,
      medianResponse: '8m 12s',
      medianResponseDelta: 38,
      overdueFollowUps: 7,
      viewingsWeek: 18,
      closedMtd: wonAed,
      closedDealsMtd: wonDeals.length,
      commissionMtd: Math.round(wonAed * 0.02),
      aiApprovalsPending: 5,
      syncSuccess: '99.4%',
      aiPrecision: '91.2%',
      wau: '74%',
      inboxUnread: 12,
    },
    stageCounts,
    atRisk: openDeals.filter((d) => d.atRisk),
    activities: [
      { id: 1, kind: 'deal', actorName: 'Omar Farouk', actionText: 'Li Na moved to New Inquiry', ago: '20m ago' },
      { id: 2, kind: 'viewing', actorName: 'Layla Haddad', actionText: 'Viewing completed at Palm Jumeirah', ago: '1h ago' },
      { id: 3, kind: 'message', actorName: 'Ahmed Al Rashid', actionText: 'Sent a WhatsApp message', ago: '2h ago' },
      { id: 4, kind: 'task', actorName: 'System', actionText: 'Follow-up with Charlotte Bennett overdue', ago: '3h ago' },
      { id: 5, kind: 'deal', actorName: 'Priya Nair', actionText: 'Arjun Mehta advanced to Properties Shortlisted', ago: '4h ago' },
    ],
  }
}

function buildContactRows(): ContactRow[] {
  return contacts.map((c, i) => ({
    id: i + 1,
    name: c.name,
    contactType: c.type,
    companyId: (i % companies.length) + 1,
    ownerId: (i % team.length) + 1,
    nationality: c.lang.includes('AR') ? 'UAE' : c.lang.includes('HI') ? 'India' : c.lang.includes('ZH') ? 'China' : c.lang.includes('RU') ? 'Russia' : 'United Kingdom',
    languages: c.lang,
    phone: `+971 50 ${String(1000000 + i * 77777).slice(1, 7)}`,
    email: `${c.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
    source: c.source,
    budgetLabel: c.budget,
    lastContactAgo: c.lastContact,
    aiDraftPending: c.flag === 'ai-draft',
    overdue: c.flag === 'overdue',
    aiSummary: c.flag === 'ai-draft' ? 'This buyer has been actively searching for properties in the Downtown area. Recent conversations suggest strong interest in 2BR units.' : null,
    aiConfidence: c.flag === 'ai-draft' ? 87 : null,
    status: 'active',
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 7).toISOString(),
  }))
}

function buildProperties(): PropertyRow[] {
  return properties.map((p, i) => ({
    id: i + 1,
    ref: p.code,
    propertyRef: p.code,
    name: p.name,
    community: p.community,
    developer: p.developer,
    propertyType: p.spec.startsWith('1BR') ? 'Apartment' : p.spec.startsWith('2BR') ? 'Apartment' : p.spec.startsWith('3BR') ? 'Apartment' : p.spec.startsWith('4BR') || p.spec.startsWith('5BR') ? 'Villa' : 'Apartment',
    beds: Number(p.spec.match(/(\d+)BR/)?.[1] ?? 2),
    baths: Number(p.spec.match(/(\d+)BA/)?.[1] ?? 2),
    sizeSqft: Number(p.size.replace(/[^0-9]/g, '')),
    priceAed: p.price,
    status: p.status,
    completion: p.readiness,
    offPlan: p.readiness.startsWith('Off-plan'),
    agentId: (i % team.length) + 1,
    image: p.photo,
    portals: ['Property Finder', 'Bayut'],
    features: ['Balcony', 'Central A/C', 'Built-in Wardrobes', 'Covered Parking'],
    createdAt: new Date(Date.now() - (i + 1) * 43200000).toISOString(),
  }))
}

function buildDocuments(): DocumentRowT[] {
  return docTypes.map((t, i) => ({
    id: i + 1,
    name: `${t.replace(/\s+/g, '_')}_${contacts[i % contacts.length].name.replace(/\s+/g, '_')}.pdf`,
    docType: t,
    relatedType: i % 2 === 0 ? 'contact' : i % 3 === 0 ? 'deal' : 'property',
    relatedName: contacts[i % contacts.length].name,
    status: i % 5 === 4 ? 'expired' : i % 4 === 0 ? 'expiring' : 'valid',
    expiryLabel: i % 5 === 4 ? 'Expired 12d ago' : i % 4 === 0 ? 'Expires in 30d' : null,
    sizeLabel: `${Math.round(Math.random() * 500 + 100)} KB`,
    uploadedAgo: `${(i + 1) * 2}d ago`,
  }))
}

function buildIntegrations() {
  return [
    { id: 1, name: 'WhatsApp Business', provider: 'Meta', status: 'connected', lastSync: '1m ago', icon: 'message-circle' },
    { id: 2, name: 'Gmail', provider: 'Google', status: 'connected', lastSync: '5m ago', icon: 'mail' },
    { id: 3, name: 'Outlook Calendar', provider: 'Microsoft', status: 'connected', lastSync: '12m ago', icon: 'calendar' },
    { id: 4, name: 'Property Finder', provider: 'Property Finder', status: 'connected', lastSync: '3h ago', icon: 'building' },
    { id: 5, name: 'Bayut', provider: 'Bayut / Dubizzle', status: 'degraded', lastSync: '1d ago', icon: 'building' },
    { id: 6, name: 'Dubai REST (DLD)', provider: 'Dubai Land Department', status: 'connected', lastSync: '2h ago', icon: 'file-text' },
  ]
}

function buildAiApprovals() {
  return [
    { id: 1, kind: 'follow_up', title: 'Draft follow-up to Arjun Mehta', summary: 'AI drafted a WhatsApp message asking about Beach Isle interest — 3d since last contact.', confidence: 92, sources: ['WhatsApp history', 'Contact profile'], status: 'pending', createdAgo: '15m ago' },
    { id: 2, kind: 'matching', title: 'Match Jonas Weber with DAMAC Lagoons', summary: '84% match score — budget AED 2.4M, 3BR preference, DAMAC Lagoons within budget.', confidence: 84, sources: ['Buyer requirements', 'Property DB'], status: 'pending', createdAgo: '1h ago' },
    { id: 3, kind: 'extraction', title: 'Extract details from Charlotte Bennett email', summary: 'Detected Emirates ID, passport, and proof of funds in email attachment.', confidence: 78, sources: ['Email attachment scan'], status: 'pending', createdAgo: '2h ago' },
    { id: 4, kind: 'reassignment', title: 'Reassign Aisha Rahman to Priya', summary: 'Aisha\'s requirements match Priya\'s recent listings in Dubai Marina.', confidence: 71, sources: ['Deal pipeline', 'Agent performance'], status: 'pending', createdAgo: '3h ago' },
    { id: 5, kind: 'automation', title: 'Trigger welcome flow for Khalid Al Suwaidi', summary: 'New contact from WhatsApp — run new lead welcome automation.', confidence: 95, sources: ['Automation rules', 'Contact profile'], status: 'pending', createdAgo: '40m ago' },
  ]
}

function buildAiAskResponse(q: string) {
  const lower = q.toLowerCase()
  if (lower.includes('risk') || lower.includes('at risk')) {
    const atRisk = buildDealRows().filter((d) => d.atRisk)
    return {
      kind: 'risk',
      answer: `Found ${atRisk.length} deals at risk this month. The main factors are inactivity (12+ days without contact) and pending offers.`,
      confidence: 91,
      sources: ['Deal Flow pipeline', 'Contact activity log'],
      proposedAction: 'Send follow-up reminders to the advisors of at-risk deals',
      deals: atRisk,
    }
  }
  if (lower.includes('2br') || lower.includes('2 bed') || lower.includes('downtown') || lower.includes('under aed 3')) {
    const matching = buildProperties().filter((p) => p.beds === 2 && p.priceAed < 3000000 && p.community.toLowerCase().includes('downtown'))
    return {
      kind: 'properties',
      answer: `Found ${matching.length} 2BR properties in Downtown Dubai under AED 3M.`,
      confidence: 94,
      sources: ['Property DB'],
      proposedAction: 'Send these properties to the buyer',
      properties: matching,
    }
  }
  if (lower.includes('buyer') || lower.includes('budget') || lower.includes('5m')) {
    const highBudget = buildContactRows().filter((c) => {
      const budget = c.budgetLabel ?? ''
      const match = budget.match(/(\d+(?:\.\d+)?)\s*M/)
      return match && Number(match[1]) >= 5
    })
    return {
      kind: 'contacts',
      answer: `${highBudget.length} buyers with budgets above AED 5M. Showing those not contacted in 3+ days.`,
      confidence: 88,
      sources: ['Contact database', 'Activity log'],
      proposedAction: 'Create follow-up tasks for these buyers',
      contacts: highBudget,
    }
  }
  return {
    kind: 'generic',
    answer: `Based on the current data, your pipeline stands at AED 67.0M with 13 active deals. The weighted forecast is AED 32.7M. You have 34 new leads this week, and the median first response time is 8m 12s (38% improvement QoQ).\n\nKey action items:\n- 7 overdue follow-ups need attention\n- 5 AI approvals are pending review\n- 2 deals are flagged at risk (Rajesh Kapoor and Dmitri Volkov)`,
    confidence: 95,
    sources: ['Dashboard bundle', 'Deal Flow pipeline', 'Inbox activity'],
    proposedAction: null,
  }
}

/* -------------------------------------------------------------------------- */
/*  Property matching data                                                    */
/* -------------------------------------------------------------------------- */

function buildMatchingForContact(contactId: number): MatchResult[] {
  const contactRows = buildContactRows()
  const contact = contactRows[contactId - 1] ?? contactRows[0]
  const allProperties = buildProperties()
  const budget = contact?.budgetLabel ?? 'AED 2–4M'
  const budgetMatch = budget.match(/(\d+(?:\.\d+)?)\s*M/)
  let maxBudget = 4000000
  if (budgetMatch) {
    const parts = budget.split('–')
    if (parts.length > 1) {
      maxBudget = Number(parts[1].replace(/[^0-9.]/g, '')) * 1000000
    } else {
      maxBudget = Number(budgetMatch[1]) * 1000000
    }
  }

  return allProperties
    .filter((p) => p.priceAed <= maxBudget * 1.2)
    .slice(0, 4)
    .map((p, i) => ({
      property: p,
      score: Math.round(90 - i * 12),
      segments: [
        { key: 'budget', label: 'Budget', weight: 0.30, got: p.priceAed <= maxBudget ? 1.0 : 0.5, why: p.priceAed <= maxBudget ? `AED ${(p.priceAed / 1000000).toFixed(1)}M ≤ AED ${(maxBudget / 1000000).toFixed(1)}M` : `AED ${(p.priceAed / 1000000).toFixed(1)}M slightly over budget` },
        { key: 'location', label: 'Location', weight: 0.20, got: 0.8, why: `${p.community} — popular with ${contact?.nationality ?? 'investors'}` },
        { key: 'type', label: 'Property type', weight: 0.15, got: 1.0, why: 'Matches buyer preference' },
        { key: 'beds', label: 'Bedrooms', weight: 0.10, got: 0.8, why: `${p.beds}BR configuration` },
        { key: 'size', label: 'Size', weight: 0.10, got: 0.7, why: `${p.sizeSqft} sqft` },
      ],
      matchNote: i === 0 ? 'Strong match — within budget and preferred community' : i === 1 ? 'Good alternative — slightly different community' : null,
      shortlisted: i === 0,
      sent: false,
    }))
}

function buildRequirement(contactId: number): RequirementRow {
  return {
    id: contactId,
    contactId,
    budgetMin: 2000000,
    budgetMax: 4000000,
    communities: ['Dubai Marina', 'Downtown Dubai', 'Emaar Beachfront'],
    propertyTypes: ['Apartment', 'Penthouse'],
    bedsMin: 2,
    bedsMax: 3,
    sizeMin: 1000,
    completion: 'Ready',
    purpose: 'Investment',
    financing: 'Mortgage',
    timeline: 'Within 3 months',
    mustHaves: ['Sea view', 'Balcony', 'Covered parking'],
    confidence: 85,
    version: 1,
  }
}

/* -------------------------------------------------------------------------- */
/*  Mock tRPC object                                                          */
/* -------------------------------------------------------------------------- */

function mockUseUtils() {
  const invalidate = () => notify()
  const createQueryHelpers = <TInput, TOutput>(resolveKey: (input: TInput | undefined) => string) => ({
    cancel: async () => undefined,
    getData: (input?: TInput) => cache.get(resolveKey(input)) as TOutput | undefined,
    setData: (input: TInput | undefined, updater: TOutput | ((old: TOutput | undefined) => TOutput | undefined)) => {
      const key = resolveKey(input)
      const current = cache.get(key) as TOutput | undefined
      const next = typeof updater === 'function' ? (updater as (old: TOutput | undefined) => TOutput | undefined)(current) : updater
      cache.set(key, next)
      notify()
    },
    invalidate: () => {
      notify()
    },
  })
  const apex = {
    ai: { approvals: { invalidate }, all: { invalidate } },
    deals: {
      list: createQueryHelpers<undefined, DealRow[]>(() => 'deals.list'),
      stages: createQueryHelpers<undefined, string[]>(() => 'deals.stages'),
      get: createQueryHelpers<{ id: number }, DealRow | null>((input) => `deals.get.${input?.id ?? 0}`),
      stageHistory: createQueryHelpers<{ dealId: number }, StageHistoryEntry[]>((input) => `deals.history.${input?.dealId ?? 0}`),
    },
    inbox: { conversations: { invalidate }, messages: { invalidate }, draft: { invalidate } },
    tasks: { list: { invalidate } },
    properties: { list: { invalidate } },
    admin: { team: { invalidate }, integrations: { invalidate } },
    dashboard: { bundle: { invalidate } },
    contacts: { list: { invalidate }, requirement: { invalidate } },
    matching: { forContact: { invalidate } },
    viewings: { list: { invalidate } },
    companies: { list: { invalidate } },
    documents: { list: { invalidate } },
    automations: { list: { invalidate } },
  }
  return { apex }
}

type QueriesClient = {
  apex: {
    properties: {
      matchedBuyers: (input: { propertyId: number }) => { data?: unknown; isLoading?: boolean }
    }
  }
}

export const trpc = {
  useUtils: mockUseUtils,

  useQueries: (cb: (t: QueriesClient) => { data?: unknown; isLoading?: boolean }[]) => {
    try {
      return cb(trpc).map((q) => ({
        data: q?.data ?? undefined,
        isLoading: q?.isLoading ?? false,
        error: null,
        refetch: () => {},
      }))
    } catch {
      return []
    }
  },

  apex: {
    // -- Dashboard --
    dashboard: {
      bundle: {
        useQuery: () => useQuery('dashboard.bundle', () => buildDashboardBundle()),
      },
    },

    // -- Admin --
    admin: {
      team: {
        useQuery: () => useQuery('admin.team', () => request<TeamRow[]>('/api/crm/team')),
      },
      integrations: {
        useQuery: () => useQuery('admin.integrations', () => buildIntegrations()),
      },
    },

    // -- Deals --
    deals: {
      list: {
        useQuery: () => useQuery('deals.list', () => request<DealRow[]>('/api/crm/deals')),
      },
      stages: {
        useQuery: () => useQuery('deals.stages', () => request<string[]>('/api/crm/deals/stages')),
      },
      get: {
        useQuery: ({ id }: { id: number }, extra?: { enabled?: boolean }) => useQuery(`deals.get.${id}`, () => request<DealRow>(`/api/crm/deals/${id}`), { enabled: extra?.enabled ?? id > 0 }),
      },
      stageHistory: {
        useQuery: ({ dealId }: { dealId: number }, extra?: { enabled?: boolean }) => useQuery(`deals.history.${dealId}`, () => request<StageHistoryEntry[]>(`/api/crm/deals/${dealId}/stage-history`), { enabled: extra?.enabled ?? dealId > 0 }),
      },
      moveStage: {
        useMutation: (opts?: MutationOptions<MoveStageRequest, MoveStageResponse>) => {
          return useMutation((input: MoveStageRequest) => request<MoveStageResponse>(`/api/crm/deals/${input.dealId}/move-stage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stage: input.stage }),
          }), opts)
        },
      },
    },

    // -- Contacts --
    contacts: {
      list: {
        useQuery: () => useQuery('contacts.list', () => buildContactRows()),
      },
      get: {
        useQuery: ({ id }: { id: number }, extra?: { enabled?: boolean }) => useQuery(`contacts.get.${id}`, () => buildContactRows().find((c) => c.id === id) ?? null, { enabled: extra?.enabled ?? id > 0 }),
      },
      requirement: {
        useQuery: ({ contactId }: { contactId: number }, extra?: { enabled?: boolean }) => useQuery(`contacts.requirement.${contactId}`, () => buildRequirement(contactId), { enabled: extra?.enabled ?? contactId > 0 }),
      },
    },

    // -- Companies --
    companies: {
      list: {
        useQuery: () => useQuery('companies.list', () => request<CompanyRow[]>('/api/crm/companies')),
      },
    },

    // -- Properties --
    properties: {
      list: {
        useQuery: () => useQuery('properties.list', () => buildProperties()),
      },
      get: {
        useQuery: ({ id }: { id: number }, extra?: { enabled?: boolean }) => useQuery(`properties.get.${id}`, () => buildProperties().find((p) => p.id === id) ?? null, { enabled: extra?.enabled ?? id > 0 }),
      },
      matchedBuyers: Object.assign(
        () => {
          const all = buildContactRows().slice(0, 3)
          const data = all.map((c, i) => ({
            requirement: buildRequirement(c.id),
            contact: { id: c.id, name: c.name, contactType: c.contactType, nationality: c.nationality, languages: c.languages, budgetLabel: c.budgetLabel, lastContactAgo: c.lastContactAgo, aiDraftPending: c.aiDraftPending, overdue: c.overdue },
            score: Math.round(85 - i * 15),
          }))
          return { data, isLoading: false, error: null, refetch: () => {} }
        },
        {
          useQuery: ({ propertyId }: { propertyId: number }, extra?: { enabled?: boolean }) => useQuery(`properties.matchedBuyers.${propertyId}`, () => {
            const all = buildContactRows().slice(0, 3)
            return all.map((c, i) => ({
              requirement: buildRequirement(c.id),
              contact: { id: c.id, name: c.name, contactType: c.contactType, nationality: c.nationality, languages: c.languages, budgetLabel: c.budgetLabel, lastContactAgo: c.lastContactAgo, aiDraftPending: c.aiDraftPending, overdue: c.overdue },
              score: Math.round(85 - i * 15),
            }))
          }, { enabled: extra?.enabled ?? true }),
        }
      ),
      priceHistory: {
        useQuery: ({ propertyId }: { propertyId: number }, extra?: { enabled?: boolean }) => useQuery(`properties.priceHistory.${propertyId}`, () => [
          { id: 1, propertyId, priceAed: 3200000, label: 'Listed 6 months ago' },
          { id: 2, propertyId, priceAed: 3100000, label: 'Reduced 3 months ago' },
          { id: 3, propertyId, priceAed: 2950000, label: 'Current price' },
        ], { enabled: extra?.enabled ?? true }),
      },
    },

    // -- Matching --
    matching: {
      forContact: {
        useQuery: ({ contactId }: { contactId: number }) => useQuery(`matching.forContact.${contactId}`, () => ({
          matches: buildMatchingForContact(contactId),
          lastRunAgo: '2h ago',
        })),
      },
    },

    // -- Inbox --
    inbox: {
      conversations: {
        useQuery: () => useQuery('inbox.conversations', () => request<ConversationRow[]>('/api/crm/inbox/conversations')),
      },
      messages: {
        useQuery: ({ conversationId }: { conversationId: number }, extra?: { enabled?: boolean }) =>
          useQuery(`inbox.messages.${conversationId}`, () => request<MessageRow[]>(`/api/crm/inbox/messages/${conversationId}`), { enabled: extra?.enabled ?? true }),
      },
      draft: {
        useQuery: ({ conversationId }: { conversationId: number }, extra?: { enabled?: boolean }) =>
          useQuery(`inbox.draft.${conversationId}`, () => request<DraftRow>(`/api/crm/inbox/draft/${conversationId}`), { enabled: extra?.enabled ?? true }),
      },
      approveDraft: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation((input: { id: number }) => request(`/api/crm/inbox/draft/${input.id}/approve`, { method: 'POST' }), opts)
        },
      },
      rejectDraft: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation((input: { id: number }) => request(`/api/crm/inbox/draft/${input.id}/reject`, { method: 'POST' }), opts)
        },
      },
    },

    // -- Tasks --
    tasks: {
      list: {
        useQuery: () => useQuery('tasks.list', async () => {
          const rows = await request<ApiCrmTaskRow[]>('/api/crm/tasks')
          return mapCrmTasksToTrpc(rows)
        }),
      },
      toggle: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation(async (input: { id: number }) => {
            const persistedTaskId = taskIdLookup.get(input.id)
            if (!persistedTaskId) throw new Error('Task not found')

            const currentRows = (cache.get('tasks.list') as TrpcTaskRow[] | undefined) ?? []
            const current = currentRows.find((row) => row.id === input.id)
            const nextStatus = current?.status === 'done' ? 'open' : 'done'

            await request(`/api/crm/tasks/${persistedTaskId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: nextStatus }),
            })

            const refreshed = await request<ApiCrmTaskRow[]>('/api/crm/tasks')
            cache.set('tasks.list', mapCrmTasksToTrpc(refreshed))
            notify()

            return { success: true }
          }, opts)
        },
      },
    },

    // -- Viewings --
    viewings: {
      list: {
        useQuery: () => useQuery('viewings.list', async () => {
          const rows = await request<ApiCrmViewingRow[]>('/api/crm/viewings')
          return mapCrmViewingsToTrpc(rows)
        }),
      },
      create: {
        useMutation: (opts?: MutationOptions<{ contactName: string; propertyName: string; scheduledAt: string; status: string }, unknown>) => {
          return useMutation(async (input: { contactName: string; propertyName: string; scheduledAt: string; status: string }) => {
            await request('/api/crm/viewings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            })

            const refreshed = await request<ApiCrmViewingRow[]>('/api/crm/viewings')
            cache.set('viewings.list', mapCrmViewingsToTrpc(refreshed))
            notify()
            return { success: true }
          }, opts)
        },
      },
    },

    // -- Documents --
    documents: {
      list: {
        useQuery: () => useQuery('documents.list', () => buildDocuments()),
      },
    },

    // -- Automations --
    automations: {
      list: {
        useQuery: () => useQuery('automations.list', async () => {
          const rows = await request<ApiCrmAutomationRow[]>('/api/crm/automations')
          return mapCrmAutomationsToTrpc(rows)
        }),
      },
      create: {
        useMutation: (opts?: MutationOptions<{ name: string; triggerLabel: string; actionLabel: string }, unknown>) => {
          return useMutation(async (input: { name: string; triggerLabel: string; actionLabel: string }) => {
            await request('/api/crm/automations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(input),
            })

            const refreshed = await request<ApiCrmAutomationRow[]>('/api/crm/automations')
            cache.set('automations.list', mapCrmAutomationsToTrpc(refreshed))
            notify()
            return { success: true }
          }, opts)
        },
      },
      toggle: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation(async (input: { id: number }) => {
            const persistedAutomationId = automationIdLookup.get(input.id)
            if (!persistedAutomationId) throw new Error('Automation not found')

            const currentRows = (cache.get('automations.list') as Array<{ id: number; status: string }> | undefined) ?? []
            const current = currentRows.find((row) => row.id === input.id)
            const nextStatus = current?.status === 'active' ? 'paused' : 'active'

            await request(`/api/crm/automations/${persistedAutomationId}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: nextStatus }),
            })

            const refreshed = await request<ApiCrmAutomationRow[]>('/api/crm/automations')
            cache.set('automations.list', mapCrmAutomationsToTrpc(refreshed))
            notify()

            return { success: true }
          }, opts)
        },
      },
    },

    // -- AI --
    ai: {
      approvals: {
        useQuery: () => useQuery('ai.approvals', () => buildAiApprovals()),
      },
      all: {
        useQuery: () => useQuery('ai.all', () => buildAiApprovals()),
      },
      ask: {
        useMutation: () => {
          return useMutation((input: { q: string }) => buildAiAskResponse(input.q))
        },
      },
      approve: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation((input: { id: number }) => {
            console.log(`[mock] AI action ${input.id} approved`)
            return { success: true }
          }, opts)
        },
      },
      reject: {
        useMutation: (opts?: MutationOptions<{ id: number }, unknown>) => {
          return useMutation((input: { id: number }) => {
            console.log(`[mock] AI action ${input.id} rejected`)
            return { success: true }
          }, opts)
        },
      },
    },

    // -- Reports (uses dashboard bundle + deals) --
    reports: {
      bundle: {
        useQuery: () => useQuery('dashboard.bundle', () => buildDashboardBundle()),
      },
    },
  },
}