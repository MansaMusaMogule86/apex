export interface DashboardMetricSnapshot {
  totalContacts: number
  newLeads: number
  qualifiedLeads: number
  openOpportunities: number
  pipelineValue: number
  wonRevenue: number
  lostOpportunities: number
  conversionRate: number
  overdueFollowUps: number
  unassignedLeads: number
  failedSubmissions: number | null
  pendingRetries: number | null
}

export interface DashboardChartDatum {
  label: string
  value: number
}

export interface DashboardSnapshot {
  metrics: DashboardMetricSnapshot
  charts: {
    leadsBySource: DashboardChartDatum[]
    leadsByStatus: DashboardChartDatum[]
    opportunitiesByPipeline: DashboardChartDatum[]
    opportunitiesByStage: DashboardChartDatum[]
  }
  recentActivity: Array<{
    id: string
    eventType: string
    title: string
    body: string
    createdAt: string
  }>
  upcomingTasks: Array<{
    id: string
    title: string
    dueAt: string
    priority: string
    status: string
  }>
  upcomingAppointments: {
    available: boolean
    reason: string
    items: unknown[]
  }
  integrations: Array<{
    name: string
    status: string
    detail: string
  }>
  filters: {
    sources: string[]
    owners: string[]
    statuses: string[]
    stages: string[]
    pipelines: string[]
  }
}

export interface CrmContactRow {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  preferredLanguage: string
  source: string
  status: string
  ownerUserId: string | null
  ownerName: string | null
  opportunityCount: number
  latestOpportunityId: string | null
  latestStageKey: string | null
  expectedValueAed: number | null
  updatedAt: string
  createdAt: string
}

export interface CrmLeadSnapshot {
  contact: {
    id: string
    fullName: string
    email: string | null
    phone: string | null
    preferredLanguage: string
    source: string
    status: string
    ownerUserId: string | null
    createdAt: string
  }
  requirement: {
    budgetMinAed: number | null
    budgetMaxAed: number | null
    locations: string[]
    propertyTypes: string[]
    timeline: string | null
    financing: string | null
    notes: string | null
    confidence: number
  } | null
  leadScore: {
    conversionProbability: number
    nextBestAction: string
    expectedDealValueAed: number
    reasonCodes: string[]
    dataCompleteness: number
  } | null
  opportunity: {
    id: string
    title: string
    pipelineKey: string
    stageKey: string
    status: string
    expectedValueAed: number
    probability: number
    advisorUserId: string
  } | null
  draft: {
    id: string
    body: string
    status: string
    channel: string
    deliveryMode: string
  } | null
  task: {
    id: string
    title: string
    dueAt: string
    priority: string
    status: string
  } | null
  matches: Array<{
    id: string
    matchScore: number
    reasons: string[]
    property: {
      id: string
      propertyRef: string
      name: string
      community: string
      propertyType: string
      priceAed: number
      beds: number
      completion: string
    }
  }>
  timeline: Array<{
    id: string
    eventType: string
    title: string
    body: string
    createdAt: string
    metadata: Record<string, unknown>
  }>
  auditCount: number
}

export interface CrmOpportunityRow {
  id: string
  contactId: string
  contactName: string
  title: string
  pipelineKey: string
  stageKey: string
  stageName: string
  status: string
  expectedValueAed: number
  probability: number
  ownerName: string
  createdAt: string
}

export interface CrmOpportunitySnapshot {
  opportunity: CrmOpportunityRow
  contact: {
    id: string
    fullName: string
    email: string | null
    phone: string | null
    preferredLanguage: string
    source: string
  } | null
  owner: {
    id: string
    fullName: string
    email: string
    role: string
  } | null
  tasks: Array<{
    id: string
    title: string
    dueAt: string
    priority: string
    status: string
  }>
  drafts: Array<{
    id: string
    body: string
    status: string
    channel: string
    deliveryMode: string
    sourceRecords: string[]
  }>
  timeline: CrmLeadSnapshot['timeline']
}

export interface CrmLeadRow {
  id: string
  contactId: string
  formType: string
  source: string
  fullName: string
  ownerUserId: string | null
  ownerName: string | null
  status: string
  opportunityId: string | null
  opportunityStageKey: string | null
  createdAt: string
}

export interface CrmActivityRecord {
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

export interface CrmActivityFeed {
  items: CrmActivityRecord[]
  unsupportedFilters: string[]
  availableTypes: string[]
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init)
  if (!response.ok) throw new Error(await response.text())
  return response.json() as Promise<T>
}

export function fetchDashboardSnapshot(query?: URLSearchParams) {
  const suffix = query && query.toString() ? `?${query.toString()}` : ''
  return request<DashboardSnapshot>(`/api/crm/dashboard${suffix}`)
}

export function fetchCrmContacts() {
  return request<CrmContactRow[]>('/api/crm/contacts')
}

export function fetchCrmContact(contactId: string) {
  return request<CrmLeadSnapshot>(`/api/crm/contacts/${contactId}`)
}

export function fetchCrmOpportunities() {
  return request<CrmOpportunityRow[]>('/api/crm/opportunities')
}

export function fetchCrmLeads() {
  return request<CrmLeadRow[]>('/api/crm/leads')
}

export function fetchCrmActivities(query?: URLSearchParams) {
  const suffix = query && query.toString() ? `?${query.toString()}` : ''
  return request<CrmActivityFeed>(`/api/crm/activities${suffix}`)
}

export function fetchCrmTasks() {
  return request<CrmTaskRow[]>('/api/crm/tasks')
}

export function updateCrmTask(taskId: string, status: 'open' | 'done') {
  return request<CrmTaskRow>(`/api/crm/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function fetchCrmOpportunity(opportunityId: string) {
  return request<CrmOpportunitySnapshot>(`/api/crm/opportunities/${opportunityId}`)
}