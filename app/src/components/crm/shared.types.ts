import type { DealRow } from '@/components/deals/types'

export interface ContactRow {
	id: number
	name: string
	contactType: string
	companyId: number | null
	ownerId: number
	nationality: string
	languages: string
	phone: string
	email: string
	source: string
	budgetLabel: string
	lastContactAgo: string
	aiDraftPending: boolean
	overdue: boolean
	aiSummary: string | null
	aiConfidence: number | null
	status: string
	createdAt: string
}

export interface CompanyRow {
	id: number
	name: string
	kind: string
}

export interface TeamRow {
	id: number
	name: string
	title: string
	initials: string
	email: string | null
	role: string
	isCurrent: boolean
}

export interface RequirementRow {
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

export interface PropertyRow {
	id: number
	ref: string
	propertyRef: string
	name: string
	community: string
	propertyType: string
	developer: string
	priceAed: number
	beds: number
	status: string
	completion: string
	offPlan: boolean
	agentId: number
	sizeSqft: number
	createdAt: string
	baths?: number
	image?: string | null
	portals?: string[]
	features?: string[]
}

export interface MatchResult {
	id?: number
	property: PropertyRow
	score: number
	segments: Array<{
		key: string
		label: string
		weight: number
		got: number
		why: string
	}>
	matchNote: string | null
	shortlisted: boolean
	sent: boolean
}

export interface ConversationRow {
	id: number
	contactId: number
	contactName: string
	channel: 'whatsapp' | 'email' | 'note' | 'phone' | 'viewing' | string
	preview: string
	lastAgo: string
	slaBreached: boolean
	sla: string | null
	aiDraftPending: boolean
	unread: number
}

export interface MessageRow {
	id: number | string
	senderName: string
	direction: 'in' | 'out' | string
	ago: string
	body: string
}

export interface DraftRow {
	id: number
	body: string
	status: string
	channel: string
	createdAgo: string
	confidence: number
	sources: string[]
}

export interface TaskRow {
	id: number
	title: string
	dueLabel: string
	priority: string
	status: string
	relatedType: string | null
	relatedName: string | null
	aiSuggested: boolean
	overdue: boolean
}

export interface ViewingRow {
	id: number
	contactId: number
	contactName: string
	propertyName: string
	propertyId: number | null
	advisorId: number
	advisorName: string
	dayLabel: string
	timeLabel: string
	status: string
	outcome: string | null
	feedback: string | null
	interestScore: number | null
	nextStep: string | null
}

export type { DealRow }

export interface DocumentRowT {
	id: number
	name: string
	docType: string
	relatedType: string
	relatedName: string | null
	status: 'valid' | 'expiring' | 'expired' | string
	expiryLabel: string | null
	sizeLabel?: string
	uploadedAgo?: string
}