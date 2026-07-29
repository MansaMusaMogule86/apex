export interface LeadIntakePayload {
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

export interface LeadSliceBootstrap {
  contacts: Array<{ id: string; fullName: string; preferredLanguage: string; source: string; updatedAt: string }>
  forms: string[]
  stages: Array<{ id: string; name: string; stageKey: string; sortOrder: number }>
}

export interface LeadMatch {
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
}

export interface TimelineEntry {
  id: string
  eventType: string
  title: string
  body: string
  createdAt: string
  metadata: Record<string, unknown>
}

export interface LeadIntakeResult {
  dedupeStatus?: string
  advisorRecommendation: {
    userId: string
    fullName: string
    email: string
    score: number
    why: string[]
  }
  contact: {
    id: string
    fullName: string
    preferredLanguage: string
    source: string
  }
  requirement: {
    budgetMinAed?: number | null
    budgetMaxAed?: number | null
    locations: string[]
    propertyTypes: string[]
    timeline?: string | null
    financing?: string | null
  }
  leadScore: {
    conversionProbability: number
    reasonCodes: string[]
  }
  opportunity: {
    id: string
    stageKey: string
  }
  draft: {
    id: string
    body: string
    status: string
    channel: string
    deliveryMode: string
  }
  task: {
    id: string
    title: string
  } | null
  matches: LeadMatch[]
  timeline: TimelineEntry[]
  auditCount: number
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchLeadSliceBootstrap() {
  return request<LeadSliceBootstrap>('/api/slice/bootstrap')
}

export function submitLeadIntake(payload: LeadIntakePayload) {
  return request<LeadIntakeResult>('/api/slice/intake', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function approveLeadDraft(draftId: string) {
  return request<LeadIntakeResult>(`/api/slice/drafts/${draftId}/approve`, {
    method: 'POST',
  })
}