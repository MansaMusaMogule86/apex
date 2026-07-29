import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Activity, ArrowRight, Search } from 'lucide-react'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmActivities, type CrmActivityRecord } from '@/lib/crm-api'

function formatActivityType(value: string) {
  return value.replaceAll('_', ' ')
}

export default function Activities() {
  const [rows, setRows] = useState<CrmActivityRecord[]>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([])
  const [unsupportedFilters, setUnsupportedFilters] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [contactId, setContactId] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [leadId, setLeadId] = useState('')
  const [opportunityId, setOpportunityId] = useState('')
  const [userId, setUserId] = useState('')
  const [activityType, setActivityType] = useState('')
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const query = new URLSearchParams()
        if (contactId.trim()) query.set('contactId', contactId.trim())
        if (companyId.trim()) query.set('companyId', companyId.trim())
        if (leadId.trim()) query.set('leadId', leadId.trim())
        if (opportunityId.trim()) query.set('opportunityId', opportunityId.trim())
        if (userId.trim()) query.set('userId', userId.trim())
        if (activityType.trim()) query.set('type', activityType.trim())
        if (startAt.trim()) query.set('startAt', new Date(startAt).toISOString())
        if (endAt.trim()) query.set('endAt', new Date(`${endAt}T23:59:59.999Z`).toISOString())
        query.set('limit', '400')

        const result = await fetchCrmActivities(query)
        if (!active) return

        setRows(result.items)
        setAvailableTypes(result.availableTypes)
        setUnsupportedFilters(result.unsupportedFilters)
      } catch (reason) {
        if (!active) return
        setError(reason instanceof Error ? reason.message : String(reason))
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [activityType, companyId, contactId, endAt, leadId, opportunityId, startAt, userId])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) =>
      [
        row.title,
        row.body,
        row.activityType,
        row.source,
        row.contactId ?? '',
        row.leadId ?? '',
        row.opportunityId ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, search])

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
  }

  if (error) {
    return (
      <EmptyState
        icon={Activity}
        title="Activities unavailable"
        description={error}
        primaryCta={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Activity Feed</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">Persisted CRM activities</h1>
            <p className="mt-2 max-w-[70ch] text-sm leading-6 text-ink-500">Unified timeline from timeline events, form submissions, and audit records. All data is organization-scoped and queryable with filters.</p>
            {unsupportedFilters.length > 0 ? (
              <p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                Unsupported filters in this data model: {unsupportedFilters.join(', ')}
              </p>
            ) : (
              <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Local persisted mode</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/relationships/intake" className="inline-flex h-10 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700">
              Run Intake
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Contact ID
            <input value={contactId} onChange={(event) => setContactId(event.target.value)} placeholder="contact_..." className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Lead ID
            <input value={leadId} onChange={(event) => setLeadId(event.target.value)} placeholder="lead/form id" className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Opportunity ID
            <input value={opportunityId} onChange={(event) => setOpportunityId(event.target.value)} placeholder="opp_..." className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            User ID
            <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="actor user id" className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Company ID
            <input value={companyId} onChange={(event) => setCompanyId(event.target.value)} placeholder="optional" className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Activity type
            <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600">
              <option value="">All types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>{formatActivityType(type)}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            Start date
            <input type="date" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-500">
            End date
            <input type="date" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="h-10 w-full rounded-xl border border-line px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
        </div>

        <label className="relative mt-4 block w-full max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, body, ids, source..."
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600"
          />
        </label>
      </section>

      {filteredRows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activities for current filters"
          description="Try widening the date range or removing specific entity filters."
          primaryCta={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <section className="space-y-3">
          {filteredRows.map((row) => (
            <article key={`${row.source}-${row.id}`} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{row.title}</p>
                  <p className="mt-1 text-sm text-ink-600">{row.body}</p>
                  <p className="mt-2 text-xs text-ink-400">{new Date(row.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-palm-100 px-2.5 py-1 font-semibold text-palm-700">{formatActivityType(row.activityType)}</span>
                  <span className="rounded-full bg-ink-100 px-2.5 py-1 font-semibold text-ink-700">{row.source}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-500">
                {row.contactId ? <Link to={`/relationships/${row.contactId}`} className="rounded-lg border border-line px-2.5 py-1 transition-colors hover:bg-sunken">Contact</Link> : null}
                {row.opportunityId ? <Link to={`/opportunities/${row.opportunityId}`} className="rounded-lg border border-line px-2.5 py-1 transition-colors hover:bg-sunken">Opportunity</Link> : null}
                {row.leadId ? <span className="rounded-lg border border-line px-2.5 py-1">Lead: {row.leadId}</span> : null}
                {row.actorUserId ? <span className="rounded-lg border border-line px-2.5 py-1">User: {row.actorUserId}</span> : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
