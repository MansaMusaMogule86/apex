import { contacts as demoContacts, deals as demoDeals } from '../src/lib/demo-data'

export interface ConversationRow {
  id: number
  organizationId: string
  contactId: number | null
  contactName: string
  channel: string
  preview: string
  lastAgo: string
  unread: number
  sla: string | null
  slaBreached: boolean
  linkedDealId: number | null
  aiDraftPending: boolean
}

export interface MessageRow {
  id: number
  conversationId: number
  direction: 'in' | 'out'
  senderName: string
  body: string
  ago: string
}

export interface DraftRow {
  id: number
  organizationId: string
  conversationId: number
  body: string
  confidence: number
  sources: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAgo: string
}

const previews = [
  'Looking forward to viewing the property on Saturday...',
  'I received the documents you sent. Let me review...',
  'Can you send me more options in Dubai Marina?',
  'Thank you for the update. We will proceed with the offer.',
  'Hi, just checking on the status of the MOU.',
  'Please find attached the signed Form A.',
  'Internal note: Client called to reschedule viewing.',
  'Following up on the DAMAC Lagoons townhouse.',
]

function buildConversations(): ConversationRow[] {
  return demoContacts.slice(0, 8).map((contact, index) => ({
    id: index + 1,
    organizationId: index % 7 === 0 ? 'org_other_brokerage' : 'org_apex_demo',
    contactId: index + 1,
    contactName: contact.name,
    channel: index < 5 ? 'whatsapp' : index < 7 ? 'email' : 'note',
    preview: previews[index] ?? previews[0]!,
    lastAgo: `${[20, 40, 60, 120, 180, 300, 600, 1440][index]}m ago`,
    unread: [3, 0, 1, 0, 2, 0, 0, 0][index] ?? 0,
    sla: [null, null, '2m', null, null, null, null, null][index] ?? null,
    slaBreached: [false, false, true, false, false, false, false, false][index] ?? false,
    linkedDealId: index < demoDeals.length ? index + 1 : null,
    aiDraftPending: [true, false, false, false, true, false, false, false][index] ?? false,
  }))
}

function buildMessages(conversationId: number) {
  const conversations = buildConversations()
  const conversation = conversations.find((item) => item.id === conversationId)
  const name = conversation?.contactName ?? 'Unknown'
  return [
    { id: 1, conversationId, direction: 'in' as const, senderName: name, body: 'Hi, I\'m interested in the properties we discussed. Can we schedule a viewing?', ago: '3d ago' },
    { id: 2, conversationId, direction: 'out' as const, senderName: 'Omar Farouk', body: 'Absolutely! I have availability this Saturday at 11am or 2pm. Which works best for you?', ago: '3d ago' },
    { id: 3, conversationId, direction: 'in' as const, senderName: name, body: 'Saturday at 11am works perfectly. Please send the address.', ago: '2d ago' },
    { id: 4, conversationId, direction: 'out' as const, senderName: 'Omar Farouk', body: 'Great, I\'ll send the details via WhatsApp. Looking forward to meeting you!', ago: '2d ago' },
    { id: 5, conversationId, direction: 'in' as const, senderName: name, body: 'Looking forward to viewing the property on Saturday. Also, do you have any other options in the same community?', ago: '20m ago' },
  ]
}

function buildDraft(conversationId: number): DraftRow | null {
  const conversations = buildConversations()
  const conversation = conversations.find((item) => item.id === conversationId)
  if (!conversation?.aiDraftPending) return null
  return {
    id: conversationId,
    organizationId: conversation.organizationId,
    conversationId,
    body: `Hi ${conversation.contactName.split(' ')[0]}, thank you for your message! I have a few more options in that community that I think you'll love. Let me send them over. Would you be available for a call this week to discuss?`,
    confidence: 87,
    sources: ['WhatsApp history (last 30 days)', 'Property DB', 'Contact preferences'],
    status: 'pending',
    createdAgo: '5m ago',
  }
}

  const drafts = new Map<number, DraftRow>()
for (const conversation of buildConversations()) {
  const draft = buildDraft(conversation.id)
  if (draft) drafts.set(conversation.id, draft)
}

export function listConversations(organizationId: string) {
  return buildConversations().filter((conversation) => conversation.organizationId === organizationId)
}

export function listMessages(conversationId: number, organizationId: string) {
  const conversation = buildConversations().find((item) => item.id === conversationId && item.organizationId === organizationId)
  if (!conversation) throw new Error('Conversation not found')
  return buildMessages(conversationId)
}

export function getDraft(conversationId: number, organizationId: string) {
  const draft = drafts.get(conversationId) ?? null
  if (!draft || draft.organizationId !== organizationId) return null
  return draft
}

export function approveDraft(draftId: number, organizationId: string) {
  const draft = drafts.get(draftId)
  if (!draft) throw new Error('Draft not found')
  if (draft.organizationId !== organizationId) throw new Error('Draft not found')
  if (draft.status !== 'pending') throw new Error('Draft already resolved')
  drafts.set(draftId, { ...draft, status: 'approved' })
  return drafts.get(draftId)!
}

export function rejectDraft(draftId: number, organizationId: string) {
  const draft = drafts.get(draftId)
  if (!draft) throw new Error('Draft not found')
  if (draft.organizationId !== organizationId) throw new Error('Draft not found')
  if (draft.status !== 'pending') throw new Error('Draft already resolved')
  drafts.set(draftId, { ...draft, status: 'rejected' })
  return drafts.get(draftId)!
}
