/**
 * Contact Quick Drawer — record side panel (design.md §8.6).
 * condensed header (avatar, chips, quick-copy), tabs Overview · Timeline ·
 * Requirements · Docs, footer Log activity + Open full page.
 */
import { useState } from 'react'
import { Copy, FileText, SquarePen } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import RecordDrawer from '@/components/app/RecordDrawer'
import { AiSummaryBlock } from '@/components/app/AiKit'
import { StatusChip } from '@/components/app/Chips'
import ContactTimeline from '@/components/crm/ContactTimeline'
import {
  Avatar,
  ContactTypeChips,
  SkeletonBlock,
} from '@/components/crm/shared'
import { formatAedCompact, formatDate } from '@/components/crm/shared.utils'
import type { CompanyRow, ContactRow, DocumentRowT, TeamRow } from '@/components/crm/shared.types'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'docs', label: 'Docs' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
      <div className="mt-1 text-[13px] leading-5 text-ink-900">{children}</div>
    </div>
  )
}

function QuickCopy({ value }: { value: string }) {
  return (
    <button
      type="button"
      aria-label={`Copy ${value}`}
      onClick={(e) => {
        e.stopPropagation()
        void navigator.clipboard?.writeText(value).catch(() => undefined)
      }}
      className="rounded p-0.5 text-ink-400 transition-colors hover:bg-sunken hover:text-palm-600"
    >
      <Copy className="h-3 w-3" strokeWidth={1.75} />
    </button>
  )
}

function RequirementsTab({ contactId }: { contactId: number }) {
  const { data: req, isLoading } = trpc.apex.contacts.requirement.useQuery({ contactId })
  if (isLoading) return <SkeletonBlock className="h-40 w-full" />
  if (!req)
    return (
      <p className="py-6 text-center text-[13px] text-ink-500">
        No buyer requirements captured yet for this contact.
      </p>
    )
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <Field label="Budget">
        <span className="tnum font-mono text-[12.5px]">
          {formatAedCompact(req.budgetMin)} – {formatAedCompact(req.budgetMax)}
        </span>
      </Field>
      <Field label="Beds · Size">
        <span className="tnum font-mono text-[12.5px]">
          {req.bedsMin}–{req.bedsMax} BR · ≥{req.sizeMin.toLocaleString()} sqft
        </span>
      </Field>
      <Field label="Communities">{req.communities.join(', ')}</Field>
      <Field label="Types">{req.propertyTypes.join(', ')}</Field>
      <Field label="Completion">{req.completion}</Field>
      <Field label="Timeline">{req.timeline}</Field>
      <Field label="Must-haves">{req.mustHaves.join(' · ')}</Field>
      <Field label="Confidence">
        <span className="tnum font-mono text-[12.5px] text-gold-600">
          {req.confidence}% · v{req.version}
        </span>
      </Field>
    </div>
  )
}

function DocsTab({ contact, onToast }: { contact: ContactRow; onToast: (m: string) => void }) {
  const { data: docs, isLoading } = trpc.apex.documents.list.useQuery()
  if (isLoading) return <SkeletonBlock className="h-32 w-full" />
  const documents: DocumentRowT[] = docs ?? []
  const firstName = contact.name.split(' ')[0]!
  const mine = documents.filter((d) => d.relatedName?.includes(firstName))
  if (mine.length === 0)
    return (
      <p className="py-6 text-center text-[13px] text-ink-500">
        No documents on file. Upload from the Documents vault.
      </p>
    )
  return (
    <ul className="space-y-2">
      {mine.map((d) => (
        <li key={d.id} className="flex items-center gap-2.5 rounded-lg border border-line px-3 py-2">
          <FileText className="h-4 w-4 shrink-0 text-ink-400" strokeWidth={1.75} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-medium text-ink-900">{d.name}</span>
            <span className="block text-[11px] text-ink-500">
              {d.docType} · {d.expiryLabel ?? '—'}
            </span>
          </span>
          <StatusChip
            tone={d.status === 'valid' ? 'palm' : d.status === 'expiring' ? 'amber' : 'red'}
            dot={false}
          >
            {d.status}
          </StatusChip>
          <button
            type="button"
            onClick={() => onToast('Document downloaded')}
            className="text-[11.5px] font-medium text-palm-600 hover:text-palm-700"
          >
            View
          </button>
        </li>
      ))}
    </ul>
  )
}

export default function ContactQuickDrawer({
  contact,
  onClose,
  onOpenFullPage,
  onToast,
}: {
  contact: ContactRow | null
  onClose: () => void
  onOpenFullPage: (contact: ContactRow) => void
  onToast: (message: string) => void
}) {
  const [tab, setTab] = useState('overview')
  const { data: team } = trpc.apex.admin.team.useQuery()
  const { data: companies } = trpc.apex.companies.list.useQuery()
  const teamRows: TeamRow[] = (team ?? []) as TeamRow[]
  const companyRows: CompanyRow[] = companies ?? []

  const owner = contact ? teamRows.find((t) => t.id === contact.ownerId) : undefined
  const company = contact ? companyRows.find((c) => c.id === contact.companyId) : undefined

  return (
    <RecordDrawer
      open={contact !== null}
      onClose={onClose}
      avatar={contact ? <Avatar name={contact.name} size={36} /> : undefined}
      title={contact?.name ?? ''}
      subtitle={
        contact ? (
          <span className="inline-flex items-center gap-1">
            {contact.phone} <QuickCopy value={contact.phone} />
          </span>
        ) : undefined
      }
      chips={
        contact && (
          <>
            <ContactTypeChips contactType={contact.contactType} />
            <StatusChip tone={contact.status === 'active' ? 'palm' : 'neutral'}>
              {contact.status}
            </StatusChip>
            {contact.aiDraftPending && <StatusChip tone="gold">AI draft</StatusChip>}
          </>
        )
      }
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      onOpenFullPage={contact ? () => onOpenFullPage(contact) : undefined}
      footer={
        <>
          <button
            type="button"
            onClick={() => contact && onOpenFullPage(contact)}
            className="mr-auto rounded-md px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
          >
            Open full page ↗
          </button>
          <button
            type="button"
            onClick={() => onToast('Activity logged')}
            className="inline-flex items-center gap-1.5 rounded-md bg-palm-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98]"
          >
            <SquarePen className="h-3.5 w-3.5" strokeWidth={1.75} />
            Log activity
          </button>
        </>
      }
    >
      {contact && (
        <div>
          {tab === 'overview' && (
            <div className="space-y-4">
              {contact.aiSummary && (
                <AiSummaryBlock
                  confidence={contact.aiConfidence ?? undefined}
                  bullets={[contact.aiSummary]}
                  sources={[
                    { kind: 'whatsapp', label: 'WhatsApp' },
                    { kind: 'email', label: 'Email' },
                    { kind: 'property-db', label: 'Viewing log' },
                  ]}
                />
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                <Field label="Email">
                  <span className="inline-flex items-center gap-1 break-all">
                    {contact.email} <QuickCopy value={contact.email} />
                  </span>
                </Field>
                <Field label="Phone">
                  <span className="tnum inline-flex items-center gap-1">
                    {contact.phone} <QuickCopy value={contact.phone} />
                  </span>
                </Field>
                <Field label="Nationality">{contact.nationality}</Field>
                <Field label="Languages">{contact.languages}</Field>
                <Field label="Lead source">{contact.source}</Field>
                <Field label="Owner">
                  {owner ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Avatar name={owner.name} size={20} /> {owner.name}
                    </span>
                  ) : (
                    '—'
                  )}
                </Field>
                <Field label="Company">{company?.name ?? '—'}</Field>
                <Field label="Budget">{contact.budgetLabel ?? '—'}</Field>
                <Field label="Last contact">{contact.lastContactAgo ?? '—'}</Field>
                <Field label="Client since">{formatDate(contact.createdAt)}</Field>
              </div>
            </div>
          )}
          {tab === 'timeline' && <ContactTimeline contact={contact} onToast={onToast} compact />}
          {tab === 'requirements' && <RequirementsTab contactId={contact.id} />}
          {tab === 'docs' && <DocsTab contact={contact} onToast={onToast} />}
        </div>
      )}
    </RecordDrawer>
  )
}
