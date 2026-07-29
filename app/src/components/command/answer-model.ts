import type { ContactVM, DealVM, PropertyVM } from '@/components/inbox/helpers'

export type AskKind = 'risk' | 'properties' | 'contacts' | 'generic'

export interface AskResultVM {
  kind: AskKind
  answer: string
  confidence: number
  sources: string[]
  proposedAction: string | null
  deals?: DealVM[]
  properties?: PropertyVM[]
  contacts?: ContactVM[]
}

export function normalizeAsk(res: {
  kind: string
  answer: string
  confidence: number
  sources: string[]
  proposedAction: string | null
  deals?: DealVM[]
  properties?: PropertyVM[]
  contacts?: ContactVM[]
}): AskResultVM {
  return {
    kind:
      res.kind === 'risk' || res.kind === 'properties' || res.kind === 'contacts'
        ? res.kind
        : 'generic',
    answer: res.answer,
    confidence: res.confidence,
    sources: res.sources,
    proposedAction: res.proposedAction,
    deals: res.deals,
    properties: res.properties,
    contacts: res.contacts,
  }
}