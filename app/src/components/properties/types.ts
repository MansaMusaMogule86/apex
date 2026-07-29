/**
 * DTO shapes for the properties pages — structural mirrors of the APEX tRPC
 * payloads (api-contract.md). Frontend code must not import from api/ or db/,
 * so these structural types keep page components type-safe without coupling.
 */

export interface PropertyDto {
  id: number
  ref: string
  name: string
  community: string
  developer: string
  propertyType: string
  beds: number
  baths: number
  sizeSqft: number
  priceAed: number
  status: string // Available | Under Offer | Sold
  completion: string // Ready | Off-plan Q4 2026
  offPlan: boolean
  agentId: number | null
  image: string
  portals: string[] | null
  features: string[] | null
}

export interface TeamMemberDto {
  id: number
  name: string
  title: string
  initials: string
  email: string | null
  role: string
  isCurrent: boolean
}

export interface RequirementDto {
  id: number
  contactId: number
  budgetMin: number
  budgetMax: number
  communities: string[]
  propertyTypes: string[]
  bedsMin: number
  bedsMax: number
  sizeMin: number
  completion: string
  purpose: string
  financing: string
  timeline: string
  mustHaves: string[]
  confidence: number
  version: number
}

export interface ContactDto {
  id: number
  name: string
  contactType: string
  nationality: string
  languages: string
  budgetLabel: string | null
  lastContactAgo: string | null
  aiDraftPending: boolean
  overdue: boolean
}

/** Reverse match row from apex.properties.matchedBuyers */
export interface MatchedBuyerDto {
  requirement: RequirementDto
  contact: ContactDto | null
  score: number
}

export interface PricePointDto {
  id: number
  propertyId: number
  priceAed: number
  label: string
}
