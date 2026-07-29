/**
 * Deal Flow utils — stage names, formatting, type helpers.
 * AED formatting (design.md §9), deterministic pastel-ink avatar tones
 * (same pattern as the scaffold AppShell Avatar, replicated locally),
 * and pipeline-stage helpers.
 */
import type { TeamMemberRow } from './types'

export { DEAL_STATUSES, type DealStatus, type CurrencyCode, type DealValue, type DealRow, type DealContact, type DealCompany, type DealActivity, type PaginatedDealResponse, type DealFilters, type DealSorting, type MoveStageRequest, type MoveStageResponse, type DealMutationError, type StageHistoryEntry, type PipelineStage, DEAL_TERMINAL_STAGES, type DealTerminalStage } from './types'

export type { TeamMemberRow } from './types'

export interface PropertyRow {
  id: number
  image?: string | null
  name: string
  community: string
  developer?: string
  beds: number
  status?: string
  sizeSqft: number
  priceAed: number
  propertyRef?: string
  propertyType?: string
  completion?: string
}

/* ------------------------------ currency ------------------------------- */

/** Full record format: `AED 2,950,000` (design.md §9). */
export function aedFull(value: number): string {
  return `AED ${Math.round(value).toLocaleString('en-US')}`
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s
}

/** Compact card/axis format: `AED 2.95M` / `AED 925K` (design.md §9). */
export function aedCompact(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `AED ${trimZeros((value / 1_000_000).toFixed(2))}M`
  if (abs >= 1_000) return `AED ${trimZeros((value / 1_000).toFixed(1))}K`
  return `AED ${Math.round(value)}`
}

/* ------------------------- avatar tones (§6) ---------------------------- */

/** Deterministic pastel-ink avatar pairs (hash of name → 6 muted pairs). */
export const avatarPairs: [string, string][] = [
  ['#E7F1ED', '#0B5D4A'],
  ['#F7EFDD', '#A97B1F'],
  ['#E9EDF0', '#5B6B7A'],
  ['#F9E9E6', '#B4372A'],
  ['#EFF0E2', '#7A8C3F'],
  ['#F0EAE4', '#8C6D4F'],
]

export function avatarTone(name: string): [string, string] {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return avatarPairs[h % avatarPairs.length]
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

/* ----------------------------- pipeline -------------------------------- */

export const WON_STAGE = 'Won'
export const LOST_STAGE = 'Lost'

export function isTerminalStage(stage: string): boolean {
  return stage === WON_STAGE || stage === LOST_STAGE
}

/** The forward stage after `current` (never Lost — that is an explicit action). */
export function nextStage(stages: string[], current: string): string | null {
  const idx = stages.indexOf(current)
  if (idx < 0) return null
  for (let i = idx + 1; i < stages.length; i++) {
    if (stages[i] !== LOST_STAGE) return stages[i]
  }
  return null
}

export type StageChipTone = 'palm' | 'red' | 'neutral'

export function stageChipTone(stage: string): StageChipTone {
  if (stage === WON_STAGE) return 'palm'
  if (stage === LOST_STAGE) return 'red'
  return 'neutral'
}

/* ------------------------------ owners --------------------------------- */

export interface OwnerInfo {
  name: string
  initials: string
}

/** Map a deal's ownerId to the team member (live `apex.admin.team` data). */
export function ownerOf(team: TeamMemberRow[] | undefined, ownerId: number | null): OwnerInfo | null {
  if (ownerId == null || !team) return null
  const member = team.find((m) => m.id === ownerId)
  return member ? { name: member.name, initials: member.initials } : null
}
