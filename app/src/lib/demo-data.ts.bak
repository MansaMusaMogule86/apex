/**
 * APEX shared demo data — single source of truth (design.md §9).
 * Reuse across all pages. Formatting: currency `AED 2,950,000` full,
 * compact `AED 2.95M` on cards/axes. Dates `12 Mar 2025`; relative `2h ago`.
 */

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
  admin?: boolean
}

export const workspace = {
  name: 'Marina Crest Realty',
  label: 'APEX · Marina Crest Realty',
}

export const currentUser: TeamMember = {
  id: 'u-omar',
  name: 'Omar Farouk',
  role: 'Senior Advisor',
  initials: 'OF',
  admin: true,
}

export const team: TeamMember[] = [
  { id: 'u-layla', name: 'Layla Haddad', role: 'Managing Broker', initials: 'LH', admin: true },
  currentUser,
  { id: 'u-priya', name: 'Priya Nair', role: 'Advisor', initials: 'PN' },
  { id: 'u-daniel', name: 'Daniel Kovacs', role: 'Advisor', initials: 'DK' },
  { id: 'u-chen', name: 'Chen Wei', role: 'Advisor', initials: 'CW' },
  { id: 'u-sara', name: 'Sara Al Mansoori', role: 'Listing Manager', initials: 'SA' },
]

export type ContactType = 'Buyer' | 'Investor' | 'Seller' | 'Landlord'

export interface Contact {
  id: string
  name: string
  type: string
  budget: string
  lang: string
  source: string
  owner: string
  lastContact: string
  flag?: 'ai-draft' | 'overdue' | 'new' | 'mou'
}

export const contacts: Contact[] = [
  { id: 'c-01', name: 'Arjun Mehta', type: 'Buyer · Investor (IN)', budget: 'AED 4–6M', lang: 'EN/HI', source: 'Property Finder', owner: 'Omar', lastContact: '3d ago', flag: 'ai-draft' },
  { id: 'c-02', name: 'Charlotte Bennett', type: 'Buyer (UK)', budget: 'AED 2.5–3.2M', lang: 'EN', source: 'Bayut', owner: 'Priya', lastContact: '5h ago' },
  { id: 'c-03', name: 'Dmitri Volkov', type: 'Buyer · Investor (RU)', budget: 'AED 8–12M', lang: 'RU/EN', source: 'Referral', owner: 'Layla', lastContact: '1d ago' },
  { id: 'c-04', name: 'Li Na', type: 'Buyer (CN)', budget: 'AED 3–4M', lang: 'ZH/EN', source: 'Website', owner: 'Chen', lastContact: '20m ago' },
  { id: 'c-05', name: 'Ahmed Al Rashid', type: 'Buyer · End-user (AE)', budget: 'AED 5.5–7M', lang: 'AR/EN', source: 'WhatsApp', owner: 'Omar', lastContact: '2h ago' },
  { id: 'c-06', name: 'Fatima Hassan', type: 'Landlord · Seller (AE)', budget: 'JVC portfolio', lang: 'AR/EN', source: 'Walk-in', owner: 'Sara', lastContact: '4d ago' },
  { id: 'c-07', name: 'Jonas Weber', type: 'Buyer (DE)', budget: 'AED 1.8–2.4M', lang: 'EN/DE', source: 'Dubizzle', owner: 'Daniel', lastContact: '6h ago' },
  { id: 'c-08', name: 'Aisha Rahman', type: 'Buyer · First-time (UK)', budget: 'AED 850K–1.1M', lang: 'EN', source: 'Property Finder', owner: 'Priya', lastContact: '1h ago' },
  { id: 'c-09', name: 'Rajesh Kapoor', type: 'Investor (IN)', budget: 'AED 2–3M /unit', lang: 'EN/HI', source: 'Referral', owner: 'Omar', lastContact: '3d ago', flag: 'overdue' },
  { id: 'c-10', name: 'Elena Petrova', type: 'Seller (RU)', budget: 'Palm villa AED 28M', lang: 'RU/EN', source: 'Bayut', owner: 'Layla', lastContact: '2d ago' },
  { id: 'c-11', name: 'Zhang Wei', type: 'Buyer (CN)', budget: 'AED 9–10M', lang: 'ZH/EN', source: 'Property Finder', owner: 'Chen', lastContact: 'MOU stage', flag: 'mou' },
  { id: 'c-12', name: 'Khalid Al Suwaidi', type: 'Buyer (SA)', budget: 'AED 3–3.8M', lang: 'AR/EN', source: 'WhatsApp', owner: 'Daniel', lastContact: '40m ago', flag: 'new' },
]

export const companies = [
  { id: 'co-1', name: 'Meridian Capital LLC', kind: 'Institutional · DIFC' },
  { id: 'co-2', name: 'Gulf Rose Holdings', kind: 'Family office' },
  { id: 'co-3', name: 'Volga Investments FZE', kind: 'Investment vehicle' },
]

export type PropertyStatus = 'Available' | 'Under Offer' | 'Sold' | 'Off-plan'

export interface Property {
  id: string
  code: string
  name: string
  community: string
  developer: string
  spec: string
  size: string
  price: number
  priceCompact: string
  status: PropertyStatus
  readiness: string
  agent: string
  photo: string
}

export const properties: Property[] = [
  { id: 'p-01', code: 'P1', name: 'Address Residences Penthouse', community: 'Downtown Dubai', developer: 'Emaar', spec: '3BR Penthouse · 4BA', size: '2,410 sqft', price: 9800000, priceCompact: 'AED 9.8M', status: 'Available', readiness: 'Ready', agent: 'Layla', photo: '/prop-address-penthouse.jpg' },
  { id: 'p-02', code: 'P2', name: 'Marina Gate Tower 2, #1804', community: 'Dubai Marina', developer: 'Select Group', spec: '2BR Apt · 2BA', size: '1,310 sqft', price: 2950000, priceCompact: 'AED 2.95M', status: 'Under Offer', readiness: 'Ready', agent: 'Omar', photo: '/prop-marina-gate.jpg' },
  { id: 'p-03', code: 'P3', name: 'Signature Villa, Frond N', community: 'Palm Jumeirah', developer: 'Nakheel', spec: '5BR Villa · 6BA', size: '7,200 sqft', price: 28000000, priceCompact: 'AED 28.0M', status: 'Available', readiness: 'Ready', agent: 'Layla', photo: '/prop-signature-villa.jpg' },
  { id: 'p-04', code: 'P4', name: 'Binghatti Heights, #512', community: 'JVC', developer: 'Binghatti', spec: '1BR Apt · 1BA', size: '642 sqft', price: 925000, priceCompact: 'AED 925K', status: 'Available', readiness: 'Ready', agent: 'Sara', photo: '/prop-binghatti-heights.jpg' },
  { id: 'p-05', code: 'P5', name: 'Golf Place Villa 17', community: 'Dubai Hills Estate', developer: 'Emaar', spec: '4BR Villa · 5BA', size: '4,850 sqft', price: 11500000, priceCompact: 'AED 11.5M', status: 'Available', readiness: 'Ready', agent: 'Sara', photo: '/prop-golf-place-villa.jpg' },
  { id: 'p-06', code: 'P6', name: 'Beach Isle Tower 1, #2201', community: 'Emaar Beachfront', developer: 'Emaar', spec: '2BR Apt · 2BA', size: '1,180 sqft', price: 3600000, priceCompact: 'AED 3.6M', status: 'Available', readiness: 'Ready', agent: 'Omar', photo: '/prop-beach-isle.jpg' },
  { id: 'p-07', code: 'P7', name: 'DAMAC Towers by Paramount, #1108', community: 'Business Bay', developer: 'DAMAC', spec: '2BR Apt · 3BA', size: '1,240 sqft', price: 2100000, priceCompact: 'AED 2.1M', status: 'Available', readiness: 'Ready', agent: 'Daniel', photo: '/prop-damac-paramount.jpg' },
  { id: 'p-08', code: 'P8', name: 'Sobha Hartland Waves, #706', community: 'MBR City', developer: 'Sobha', spec: '1BR Apt · 1BA', size: '719 sqft', price: 1350000, priceCompact: 'AED 1.35M', status: 'Off-plan', readiness: 'Off-plan Q4 2026', agent: 'Priya', photo: '/prop-sobha-waves.jpg' },
  { id: 'p-09', code: 'P9', name: 'DAMAC Lagoons, Santorini 34', community: 'DAMAC Lagoons', developer: 'DAMAC', spec: '4BR Townhouse · 4BA', size: '2,273 sqft', price: 2400000, priceCompact: 'AED 2.4M', status: 'Off-plan', readiness: 'Off-plan Q2 2026', agent: 'Daniel', photo: '/prop-damac-lagoons.jpg' },
  { id: 'p-10', code: 'P10', name: 'Bluewaters Residences 5, #903', community: 'Bluewaters Island', developer: 'Meraas', spec: '2BR Apt · 3BA', size: '1,355 sqft', price: 4200000, priceCompact: 'AED 4.2M', status: 'Available', readiness: 'Ready', agent: 'Chen', photo: '/prop-bluewaters.jpg' },
]

export const pipelineStages = [
  'New Inquiry',
  'Qualified',
  'Requirements Confirmed',
  'Properties Shortlisted',
  'Viewing Scheduled',
  'Viewing Completed',
  'Offer Made',
  'Negotiation',
  'MOU Signed',
  'SPA Executed',
  'Payment in Progress',
  'Handover',
  'Won',
] as const

export interface Deal {
  id: string
  contact: string
  stage: (typeof pipelineStages)[number]
  value: string
  property?: string
  atRisk?: boolean
  daysInStage?: number
}

export const deals: Deal[] = [
  { id: 'd-01', contact: 'Li Na', stage: 'New Inquiry', value: 'AED 4.2M', property: 'Bluewaters 2BR', daysInStage: 0 },
  { id: 'd-02', contact: 'Khalid Al Suwaidi', stage: 'New Inquiry', value: 'AED 3.5M', property: 'Downtown 2BR', daysInStage: 0 },
  { id: 'd-03', contact: 'Jonas Weber', stage: 'Qualified', value: 'AED 2.4M', property: 'DAMAC Lagoons TH', daysInStage: 2 },
  { id: 'd-04', contact: 'Charlotte Bennett', stage: 'Requirements Confirmed', value: 'AED 2.9M', daysInStage: 3 },
  { id: 'd-05', contact: 'Arjun Mehta', stage: 'Properties Shortlisted', value: 'AED 4.8M', daysInStage: 5 },
  { id: 'd-06', contact: 'Aisha Rahman', stage: 'Viewing Scheduled', value: 'AED 0.925M', daysInStage: 1 },
  { id: 'd-07', contact: 'Dmitri Volkov', stage: 'Viewing Completed', value: 'AED 18.5M', property: 'Signature Villa, Frond N', daysInStage: 4 },
  { id: 'd-08', contact: 'Rajesh Kapoor', stage: 'Offer Made', value: 'AED 2.05M', atRisk: true, daysInStage: 12 },
  { id: 'd-09', contact: 'Ahmed Al Rashid', stage: 'Negotiation', value: 'AED 10.8M', property: 'Golf Place Villa 17', daysInStage: 6 },
  { id: 'd-10', contact: 'Zhang Wei', stage: 'MOU Signed', value: 'AED 9.6M', property: 'Address Residences Penthouse', daysInStage: 2 },
  { id: 'd-11', contact: 'Maria Fernandes', stage: 'SPA Executed', value: 'AED 1.32M', property: 'Sobha Hartland Waves', daysInStage: 3 },
  { id: 'd-12', contact: 'Viktor Ivanov', stage: 'Payment in Progress', value: 'AED 3.4M', property: 'Marina Gate T1 2BR', daysInStage: 7 },
  { id: 'd-13', contact: 'Deepak Sharma', stage: 'Handover', value: 'AED 2.6M', property: 'JVC townhouse', daysInStage: 5 },
]

export const kpis = {
  openPipeline: 'AED 67.0M',
  openPipelineDelta: '+12.3% MoM',
  weightedForecast: 'AED 32.7M',
  newLeadsWeek: 34,
  newLeadsDelta: '+8 WoW',
  medianFirstResponse: '8m 12s',
  firstResponseTarget: 'target ≤ 10m',
  firstResponseDelta: '−38% QoQ',
  overdueFollowUps: 7,
  viewingsWeek: 18,
  closedMtd: 'AED 8.7M',
  closedDealsMtd: 3,
  commissionMtd: 'AED 174,000',
  aiApprovalsPending: 5,
  syncSuccess: '99.4%',
  aiPrecision: '91.2%',
  wau: '74%',
  inboxUnread: 12,
}

export const leadSources = ['Property Finder', 'Bayut', 'Dubizzle', 'Website', 'WhatsApp', 'Referral', 'Walk-in']

export const docTypes = [
  'Passport', 'Emirates ID', 'Proof of Funds', 'Mortgage Pre-Approval',
  'Form A', 'Form B', 'Form F', 'MOU', 'SPA', 'NOC', 'Title Deed', 'Tenancy Contract',
]

/** Deterministic pastel-ink avatar pairs (hash of name → 6 muted pairs) */
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
