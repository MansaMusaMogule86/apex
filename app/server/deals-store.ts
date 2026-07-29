import { currentUser, deals as demoDeals, pipelineStages as demoPipelineStages, team as demoTeam } from '../src/lib/demo-data'

export interface DealRow {
  id: number
  organizationId: string
  title: string
  contactName: string
  contactId: number
  propertyId: number | null
  propertyLine: string | null
  valueAed: number
  stage: string
  probability: number
  daysInStage: number
  nextAction: string | null
  atRisk: boolean
  riskNote: string | null
  outcome: 'open' | 'won' | 'lost'
  lossReason: string | null
  ownerId: number | null
  updatedAgo: string | null
  aiHealth: string | null
}

export interface StageHistoryEntry {
  id: string
  fromStage: string | null
  toStage: string
  changedBy: string
  ago: string
}

const stageNames = [...demoPipelineStages, 'Lost']
const allowedStages = new Set(stageNames)

function parseValue(value: string): number {
  const numeric = Number(value.replace(/[^0-9.]/g, ''))
  const multiplier = value.includes('M') ? 1_000_000 : value.includes('K') ? 1_000 : 1
  return Math.round(numeric * multiplier)
}

function buildInitialDeals(): DealRow[] {
  return demoDeals.map((deal, index) => {
    const stageIndex = stageNames.indexOf(deal.stage)
    const probability = stageIndex >= 0 ? Math.min(100, stageIndex * 8 + 10) : 50
    const ownerId = (index % demoTeam.length) + 1
    const propertyId = deal.property ? index + 1 : null
    const atRisk = Boolean(deal.atRisk)
    const won = deal.stage === 'Won'
    const lost = deal.stage === 'Lost'

    return {
      id: index + 1,
      organizationId: index % 7 === 0 ? 'org_other_brokerage' : 'org_apex_demo',
      title: `${deal.contact} — ${deal.property ?? deal.value}`,
      contactName: deal.contact,
      contactId: index + 1,
      propertyId,
      propertyLine: deal.property ?? null,
      valueAed: parseValue(deal.value),
      stage: deal.stage,
      probability,
      daysInStage: deal.daysInStage ?? 0,
      nextAction: won || lost ? null : atRisk ? 'Follow up required' : 'Review next step',
      atRisk,
      riskNote: atRisk ? 'No activity in 12+ days' : null,
      outcome: won ? 'won' : lost ? 'lost' : 'open',
      lossReason: lost ? 'Closed lost' : null,
      ownerId,
      updatedAgo: `${(index % 7) + 1}d ago`,
      aiHealth: atRisk ? 'No recent contact. Follow up now.' : 'Current activity looks healthy.',
    }
  })
}

function buildInitialHistory(deal: DealRow): StageHistoryEntry[] {
  const currentIndex = stageNames.indexOf(deal.stage)
  const startIndex = Math.max(0, currentIndex - 2)
  const history: StageHistoryEntry[] = []

  for (let index = startIndex; index <= currentIndex; index++) {
    const toStage = stageNames[index] ?? deal.stage
    const fromStage = index === 0 ? null : stageNames[index - 1] ?? null
    history.unshift({
      id: `hist-${deal.id}-${index}`,
      fromStage,
      toStage,
      changedBy: demoTeam[(deal.id - 1) % demoTeam.length]?.name ?? currentUser.name,
      ago: `${Math.max(0, currentIndex - index) + 1}d ago`,
    })
  }

  if (history.length === 0) {
    history.push({
      id: `hist-${deal.id}-0`,
      fromStage: null,
      toStage: deal.stage,
      changedBy: demoTeam[(deal.id - 1) % demoTeam.length]?.name ?? currentUser.name,
      ago: 'just now',
    })
  }

  return history
}

let deals = buildInitialDeals()
const histories = new Map<number, StageHistoryEntry[]>()

for (const deal of deals) {
  histories.set(deal.id, buildInitialHistory(deal))
}

export function listDeals(organizationId: string) {
  return deals.filter((deal) => deal.organizationId === organizationId).map((deal) => ({ ...deal }))
}

export function getDeal(dealId: number, organizationId: string) {
  return deals.find((deal) => deal.id === dealId && deal.organizationId === organizationId) ?? null
}

export function listStages() {
  return [...stageNames]
}

export function getDealHistory(dealId: number, organizationId: string) {
  const deal = getDeal(dealId, organizationId)
  if (!deal) return []
  return [...(histories.get(dealId) ?? [])]
}

export function moveDealStage(dealId: number, stage: string, organizationId: string, changedBy: string) {
  if (!allowedStages.has(stage)) {
    throw new Error('Invalid stage')
  }

  const index = deals.findIndex((deal) => deal.id === dealId && deal.organizationId === organizationId)
  if (index < 0) throw new Error('Deal not found')

  const previous = deals[index]!
  if (previous.stage === stage) {
    return { ...previous }
  }

  const nextOutcome = stage === 'Won' ? 'won' : stage === 'Lost' ? 'lost' : 'open'
  const updated: DealRow = {
    ...previous,
    stage,
    outcome: nextOutcome,
    lossReason: stage === 'Lost' ? 'Closed lost' : null,
    daysInStage: 0,
    updatedAgo: 'just now',
    nextAction: nextOutcome === 'open' ? 'Review next step' : null,
  }

  deals = [...deals.slice(0, index), updated, ...deals.slice(index + 1)]
  histories.set(dealId, [
    {
      id: `hist-${dealId}-${Date.now()}`,
      fromStage: previous.stage,
      toStage: stage,
      changedBy,
      ago: 'just now',
    },
    ...(histories.get(dealId) ?? []),
  ])

  return { ...updated }
}
