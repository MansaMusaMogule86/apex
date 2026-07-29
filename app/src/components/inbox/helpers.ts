/**
 * Shared helpers + view-model types for the Inbox / Command pages.
 * VMs are structural subsets of the tRPC payload shapes (api-contract.md) so
 * components stay decoupled from the server while remaining type-safe.
 */
import type { SourceChipItem, SourceKind } from '@/components/app/AiKit'

/* ------------------------------ view models ------------------------------ */

export interface ConversationVM {
  id: number
  contactId: number | null
  contactName: string
  channel: string // whatsapp | email | note
  preview: string
  lastAgo: string
  unread: number
  sla: string | null
  slaBreached: boolean
  linkedDealId: number | null
  aiDraftPending: boolean
}

export interface MessageVM {
  id: number
  conversationId: number
  direction: string // in | out
  senderName: string
  body: string
  ago: string
}

export interface DraftVM {
  id: number
  conversationId: number
  body: string
  confidence: number
  sources: string[]
  status: string
  createdAgo: string
}

export interface ContactVM {
  id: number
  name: string
  contactType: string
  nationality: string
  languages: string
  phone: string
  email: string
  source: string
  budgetLabel: string | null
  lastContactAgo: string | null
  aiDraftPending: boolean
  overdue: boolean
  aiSummary: string | null
  aiConfidence: number | null
}

export interface DealVM {
  id: number
  title: string
  contactName: string
  propertyId: number | null
  propertyLine: string | null
  valueAed: number
  stage: string
  daysInStage: number
  nextAction: string | null
  atRisk: boolean
  riskNote: string | null
  outcome: string
  updatedAgo: string | null
}

export interface RequirementVM {
  budgetMin: number
  budgetMax: number
  communities: string[]
  propertyTypes: string[]
  bedsMin: number
  bedsMax: number
  completion: string
  purpose: string
  financing: string
  timeline: string
  mustHaves: string[]
}

export interface PropertyVM {
  id: number
  ref: string
  name: string
  community: string
  developer: string
  beds: number
  baths: number
  sizeSqft: number
  priceAed: number
  status: string
  completion: string
  image: string
}

export interface TaskVM {
  id: number
  title: string
  priority: string
  dueLabel: string
  status: string
  relatedType: string | null
  relatedName: string | null
  aiSuggested: boolean
  overdue: boolean
}

export interface AiActionVM {
  id: number
  kind: string
  title: string
  summary: string
  confidence: number
  sources: string[]
  status: string
  createdAgo: string
}

/* ------------------------------ text / i18n ------------------------------ */

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
const CYRILLIC_RE = /[Ѐ-ӿ]/

export function isArabic(text: string): boolean {
  return ARABIC_RE.test(text)
}

export function isNonEnglish(text: string): boolean {
  return ARABIC_RE.test(text) || CYRILLIC_RE.test(text)
}

/** Direction attribute for a message body (RTL Arabic renders correctly). */
export function textDir(text: string): 'rtl' | 'ltr' {
  return isArabic(text) ? 'rtl' : 'ltr'
}

/**
 * Some seeded bilingual messages embed an English translation as a trailing
 * parenthetical — split it out so the UI can offer "Show translation".
 */
export function splitEmbeddedTranslation(body: string): { main: string; translation: string } | null {
  if (!isNonEnglish(body)) return null
  const m = body.match(/^([\s\S]*?)\s*\(([^()]+)\)\s*$/)
  if (!m) return null
  const translation = m[2].trim()
  // only treat as a translation if the parenthetical is mostly latin script
  if (isNonEnglish(translation)) return null
  return { main: m[1].trim(), translation }
}

/* ------------------------------ formatting ------------------------------- */

export function aed(n: number): string {
  return `AED ${n.toLocaleString('en-US')}`
}

export function aedCompact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    const s = v >= 10 ? v.toFixed(1) : v.toFixed(2)
    return `AED ${s.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}M`
  }
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`
  return aed(n)
}

/** Split an AI summary prose string into bullet sentences. */
export function splitSummary(text: string): string[] {
  return text
    .split(/(?<=[.!])\s+/)
    .map((s) => s.trim().replace(/[.!]$/, ''))
    .filter(Boolean)
    .slice(0, 5)
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name
}

/* ------------------------------ source chips ----------------------------- */

function sourceKind(label: string): SourceKind {
  const l = label.toLowerCase()
  if (l.includes('whatsapp')) return 'whatsapp'
  if (l.includes('email') || l.includes('gmail') || l.includes('outlook')) return 'email'
  if (l.includes('property') || l.includes('listing')) return 'property-db'
  if (l.includes('dld')) return 'dld'
  if (l.includes('document') || l.includes('file') || l.includes('pdf')) return 'document'
  if (l.includes('web') || l.includes('portal') || l.includes('index')) return 'web'
  return 'note'
}

/** Map plain-string source labels from the API into AiKit source chips. */
export function sourceChips(sources: string[]): SourceChipItem[] {
  return sources.map((label) => ({ kind: sourceKind(label), label }))
}

/* ------------------------------ channels --------------------------------- */

export function channelLabel(channel: string): string {
  if (channel === 'whatsapp') return 'WhatsApp Business'
  if (channel === 'email') return 'Gmail'
  return 'Internal note'
}

export function channelRibbon(channel: string): string {
  if (channel === 'whatsapp') return 'WhatsApp Business · synced 2m ago'
  if (channel === 'email') return 'Gmail · omar@marinacrest.ae'
  return 'Internal note · visible to the team'
}
