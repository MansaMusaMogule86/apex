import { pipelineStages } from '@/lib/demo-data'

export const DEAL_STATUSES = ['open', 'won', 'lost'] as const
export type DealStatus = (typeof DEAL_STATUSES)[number]

export type CurrencyCode = 'AED'

export interface DealValue {
  amount: number
  currency: CurrencyCode
}

export type PipelineStage = (typeof pipelineStages)[number]
export const DEAL_TERMINAL_STAGES = ['Won', 'Lost'] as const
export type DealTerminalStage = (typeof DEAL_TERMINAL_STAGES)[number]

export interface DealOwner {
  id: number
  name: string
  initials: string
}

export interface TeamMemberRow {
  id: number
  name: string
  initials: string
}

export interface DealContact {
  id: number
  name: string
}

export interface DealCompany {
  id: number
  name: string
}

export interface DealActivity {
  id: number
  kind: 'deal' | 'viewing' | 'message' | 'task' | 'system'
  actorName: string
  actionText: string
  ago: string
}

export interface DealRow {
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
  outcome: DealStatus
  ownerId: number
  updatedAgo: string | null
  createdAt: string
  aiHealth?: string | null
  lossReason?: string | null
}

export interface StageHistoryEntry {
  id: number
  fromStage: string | null
  toStage: string
  changedBy: string
  ago: string
}

export interface PaginatedDealResponse {
  items: DealRow[]
  total: number
  page: number
  pageSize: number
}

export interface DealFilters {
  query: string
  stage: string | 'all'
  ownerId: number | 'all'
  atRiskOnly: boolean
}

export interface DealSorting {
  key: 'valueAed' | 'updatedAgo' | 'stage' | 'probability'
  direction: 'asc' | 'desc'
}

export interface MoveStageRequest {
  dealId: number
  stage: string
}

export interface MoveStageResponse {
  deal: DealRow
  previousStage: string
  newStage: string
  activityCreated: boolean
}

export interface DealMutationError {
  code: 'invalid_stage' | 'invalid_pipeline' | 'not_found' | 'forbidden' | 'conflict' | 'network' | 'unknown'
  message: string
}
