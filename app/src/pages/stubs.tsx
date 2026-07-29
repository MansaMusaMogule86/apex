/**
 * Route stubs — simple named placeholder pages. Page agents replace these
 * with the real implementations per design.md §2.
 */
import type { ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { Hammer } from 'lucide-react'

export function Stub({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-[10px] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sunken">
        <Hammer className="h-6 w-6 text-ink-400" strokeWidth={1.5} />
      </span>
      <h2 className="mt-4 text-[16px] font-semibold text-ink-900">{title}</h2>
      <p className="mt-1.5 max-w-[52ch] text-[13px] leading-5 text-ink-500">{description}</p>
      {children}
    </div>
  )
}

export function CommandStub() {
  const [params] = useSearchParams()
  const q = params.get('q')
  return (
    <Stub
      title="Command Center"
      description="Full-page AI command center: natural-language search, conversational answers with embedded tables/charts, cited sources, and action proposals with Approve/Reject."
    >
      {q && (
        <p className="mt-4 rounded-md bg-gold-100 px-3 py-1.5 font-mono text-[12px] text-gold-600">
          q = “{q}”
        </p>
      )}
    </Stub>
  )
}

export const DashboardStub = () => (
  <Stub
    title="Dashboard"
    description="Owner/manager KPI cockpit: pipeline AED, SLA timers, forecast, stages, attribution, AI approval queue, leaderboard."
  />
)

export const InboxStub = () => (
  <Stub
    title="Inbox"
    description="Unified 3-pane inbox: WhatsApp/email threads, SLA timers, AI draft replies pending approval, contact context."
  />
)

export const RelationshipsStub = () => (
  <Stub
    title="Relationships"
    description="CRM: contacts & companies tables, filters, contact detail with unified timeline + AI summary."
  />
)

export function ContactDetailStub() {
  const { id } = useParams()
  return (
    <Stub
      title={`Contact ${id ?? ''}`}
      description="Contact detail: unified timeline, AI summary, buyer requirements panel, ranked property matching."
    />
  )
}

export const DealsStub = () => (
  <Stub
    title="Deal Flow"
    description="Kanban across the 13-stage buyer_sales pipeline + deal detail drawer."
  />
)

export function DealDetailStub() {
  const { id } = useParams()
  return (
    <Stub
      title={`Deal ${id ?? ''}`}
      description="Deal detail: stage history, offer/negotiation log, documents, next best action."
    />
  )
}

export const PropertiesStub = () => (
  <Stub
    title="Properties"
    description="Inventory grid/table with photos, statuses, property detail with gallery, price history, matched buyers."
  />
)

export function PropertyDetailStub() {
  const { id } = useParams()
  return (
    <Stub
      title={`Property ${id ?? ''}`}
      description="Property detail: gallery, price history, matched buyers with score bars."
    />
  )
}

export const ViewingsStub = () => (
  <Stub
    title="Viewings"
    description="Week calendar + list of viewings with outcome capture (interest score, feedback, next step)."
  />
)

export const TasksStub = () => (
  <Stub
    title="Tasks"
    description="Task list/board with priorities, due dates, related records, overdue escalation."
  />
)

export const DocumentsStub = () => (
  <Stub
    title="Documents"
    description="Document vault by type (passport, Emirates ID, MOU, SPA, Form A/B/F…), expiry tracking."
  />
)

export const ReportsStub = () => (
  <Stub
    title="Reports"
    description="Reports studio: forecast, response SLA, viewing performance, source attribution, commission stub."
  />
)

export const AutomationsStub = () => (
  <Stub
    title="Automations"
    description="Automation template cards (trigger → action), run log, draft-autonomy rules."
  />
)

export const AdminStub = () => (
  <Stub
    title="Administration"
    description="Team & roles, integration health (WhatsApp Business, Gmail, Outlook, calendars), pipeline & SLA config."
  />
)
