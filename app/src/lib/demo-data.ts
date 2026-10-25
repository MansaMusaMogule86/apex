/**
 * Nexus shared demo data — single source of truth.
 * Reuse across all pages. Formatting: currency `USD 295,000` full,
 * compact `USD 295K` on cards/axes. Dates `12 Mar 2025`; relative `2h ago`.
 */

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
  admin?: boolean
}

export const workspace = {
  name: 'Nexus Demo Company',
  label: 'NEXUS · Nexus Demo Company',
}

export const currentUser: TeamMember = {
  id: 'u-admin',
  name: 'Alex Admin',
  role: 'System Administrator',
  initials: 'AA',
  admin: true,
}

export const team: TeamMember[] = [
  { id: 'u-manager', name: 'Morgan Manager', role: 'Sales Manager', initials: 'MM', admin: true },
  currentUser,
  { id: 'u-sales1', name: 'Sam Sales', role: 'Account Executive', initials: 'SS' },
  { id: 'u-sales2', name: 'Jordan Rep', role: 'Account Executive', initials: 'JR' },
  { id: 'u-sales3', name: 'Taylor Closer', role: 'Senior Account Executive', initials: 'TC' },
  { id: 'u-ops', name: 'Casey Ops', role: 'Operations Manager', initials: 'CO' },
]

export type ContactType = 'Lead' | 'Prospect' | 'Customer' | 'Partner'

export interface Contact {
  id: string
  name: string
  type: string
  budget: string
  lang: string
  source: string
  owner: string
  lastContact: string
  flag?: 'ai-draft' | 'overdue' | 'new' | 'hot'
}

export const contacts: Contact[] = [
  { id: 'c-01', name: 'Acme Corporation', type: 'Customer · Enterprise', budget: 'USD 500K+', lang: 'EN', source: 'Website', owner: 'Sam', lastContact: '3d ago', flag: 'ai-draft' },
  { id: 'c-02', name: 'TechStart Inc', type: 'Prospect · SMB', budget: 'USD 50-100K', lang: 'EN', source: 'LinkedIn', owner: 'Jordan', lastContact: '5h ago' },
  { id: 'c-03', name: 'GlobalTech Solutions', type: 'Customer · Mid-Market', budget: 'USD 200-500K', lang: 'EN/ES', source: 'Referral', owner: 'Morgan', lastContact: '1d ago' },
  { id: 'c-04', name: 'InnovateLabs', type: 'Lead · Startup', budget: 'USD 25-50K', lang: 'EN', source: 'Website', owner: 'Taylor', lastContact: '20m ago' },
  { id: 'c-05', name: 'Meridian Enterprises', type: 'Customer · Enterprise', budget: 'USD 1M+', lang: 'EN', source: 'Trade Show', owner: 'Sam', lastContact: '2h ago' },
  { id: 'c-06', name: 'BlueWave Partners', type: 'Partner · Agency', budget: 'N/A', lang: 'EN', source: 'Partner Program', owner: 'Casey', lastContact: '4d ago' },
  { id: 'c-07', name: 'DataFlow Systems', type: 'Prospect · Mid-Market', budget: 'USD 100-200K', lang: 'EN/DE', source: 'Cold Outreach', owner: 'Jordan', lastContact: '6h ago' },
  { id: 'c-08', name: 'NextGen Ventures', type: 'Lead · Investor', budget: 'USD 10M+', lang: 'EN', source: 'Referral', owner: 'Morgan', lastContact: '1h ago' },
  { id: 'c-09', name: 'ScaleUp Co', type: 'Customer · SMB', budget: 'USD 10-25K', lang: 'EN', source: 'Website', owner: 'Sam', lastContact: '3d ago', flag: 'overdue' },
  { id: 'c-10', name: 'Vertex Analytics', type: 'Prospect · Enterprise', budget: 'USD 500K-1M', lang: 'EN/FR', source: 'LinkedIn', owner: 'Taylor', lastContact: '2d ago' },
  { id: 'c-11', name: 'Quantum Dynamics', type: 'Lead · Startup', budget: 'USD 10-25K', lang: 'EN', source: 'Content Marketing', owner: 'Casey', lastContact: 'Hot', flag: 'hot' },
  { id: 'c-12', name: 'Apex Partners', type: 'Partner · Reseller', budget: 'N/A', lang: 'EN', source: 'Partner Program', owner: 'Jordan', lastContact: '40m ago', flag: 'new' },
]

export const companies = [
  { id: 'co-1', name: 'Acme Corporation', kind: 'Customer · Enterprise' },
  { id: 'co-2', name: 'TechStart Inc', kind: 'Prospect · SMB' },
  { id: 'co-3', name: 'GlobalTech Solutions', kind: 'Customer · Mid-Market' },
  { id: 'co-4', name: 'InnovateLabs', kind: 'Lead · Startup' },
  { id: 'co-5', name: 'Meridian Enterprises', kind: 'Customer · Enterprise' },
]

export const properties = [
  { id: 'prod-1', name: 'Enterprise Plan', category: 'Software', price: 'USD 990K/yr', status: 'Active' },
  { id: 'prod-2', name: 'Professional Plan', category: 'Software', price: 'USD 290K/yr', status: 'Active' },
  { id: 'prod-3', name: 'Starter Plan', category: 'Software', price: 'USD 99K/yr', status: 'Active' },
  { id: 'prod-4', name: 'Custom Implementation', category: 'Services', price: 'Custom', status: 'Available' },
  { id: 'prod-5', name: 'Training & Onboarding', category: 'Services', price: 'USD 25K', status: 'Available' },
]

export type PipelineStage =
  | 'New Lead'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost'
  | 'On Hold'

export const pipelineStages = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
  'On Hold',
] as const

export interface Deal {
  id: string
  contact: string
  stage: (typeof pipelineStages)[number]
  value: string
  product?: string
  atRisk?: boolean
  daysInStage?: number
}

export const deals: Deal[] = [
  { id: 'd-01', contact: 'InnovateLabs', stage: 'New Lead', value: 'USD 25K', product: 'Starter Plan', daysInStage: 0 },
  { id: 'd-02', contact: 'DataFlow Systems', stage: 'New Lead', value: 'USD 150K', product: 'Professional Plan', daysInStage: 0 },
  { id: 'd-03', contact: 'TechStart Inc', stage: 'Qualified', value: 'USD 75K', product: 'Professional Plan', daysInStage: 2 },
  { id: 'd-04', contact: 'NextGen Ventures', stage: 'Proposal Sent', value: 'USD 500K', product: 'Enterprise Plan', daysInStage: 3 },
  { id: 'd-05', contact: 'Acme Corporation', stage: 'Negotiation', value: 'USD 1.2M', product: 'Enterprise Plan', daysInStage: 5 },
  { id: 'd-06', contact: 'ScaleUp Co', stage: 'Closed Won', value: 'USD 99K', product: 'Starter Plan', daysInStage: 1 },
  { id: 'd-07', contact: 'Vertex Analytics', stage: 'Proposal Sent', value: 'USD 750K', product: 'Enterprise Plan', daysInStage: 4 },
  { id: 'd-08', contact: 'Quantum Dynamics', stage: 'Qualified', value: 'USD 25K', atRisk: true, daysInStage: 12 },
  { id: 'd-09', contact: 'Meridian Enterprises', stage: 'Negotiation', value: 'USD 2M', product: 'Enterprise Plan + Services', daysInStage: 6 },
  { id: 'd-10', contact: 'GlobalTech Solutions', stage: 'Closed Won', value: 'USD 350K', product: 'Professional Plan', daysInStage: 2 },
  { id: 'd-11', contact: 'Apex Partners', stage: 'Closed Won', value: 'USD 150K', product: 'Partner Program', daysInStage: 3 },
  { id: 'd-12', contact: 'BlueWave Partners', stage: 'Closed Won', value: 'USD 50K', product: 'Partner Program', daysInStage: 7 },
  { id: 'd-13', contact: 'DataFlow Systems', stage: 'On Hold', value: 'USD 150K', product: 'Professional Plan', daysInStage: 5 },
]

export const kpis = {
  openPipeline: 'USD 5.2M',
  openPipelineDelta: '+12.3% MoM',
  weightedForecast: 'USD 2.1M',
  newLeadsWeek: 34,
  newLeadsDelta: '+8 WoW',
  medianFirstResponse: '8m 12s',
  firstResponseTarget: 'target ≤ 10m',
  firstResponseDelta: '−38% QoQ',
  overdueFollowUps: 7,
  meetingsWeek: 18,
  closedMtd: 'USD 870K',
  closedDealsMtd: 3,
  revenueMtd: 'USD 1.1M',
  aiApprovalsPending: 5,
  syncSuccess: '99.4%',
  aiPrecision: '91.2%',
  wau: '74%',
  inboxUnread: 12,
}

export const leadSources = ['Website', 'LinkedIn', 'Referral', 'Cold Outreach', 'Trade Show', 'Content Marketing', 'Partner Program', 'Email Campaign']

export const docTypes = [
  'Contract', 'NDA', 'Proposal', 'Invoice', 'Purchase Order',
  'Statement of Work', 'MSA', 'SLA', 'Data Processing Agreement', 'Security Questionnaire',
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
