import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Search, UserRound } from 'lucide-react'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmLeads, type CrmLeadRow } from '@/lib/crm-api'

export default function Leads() {
  const [rows, setRows] = useState<CrmLeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchCrmLeads()
        if (!active) return
        setRows(result)
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
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) =>
      [row.fullName, row.source, row.formType, row.ownerName ?? '', row.opportunityStageKey ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [rows, search])

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
  }

  if (error) {
    return (
      <EmptyState
        icon={UserRound}
        title="Leads unavailable"
        description={error}
        primaryCta={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={UserRound}
        title="No persisted leads yet"
        description="Submit a lead through Lead Intake to create persisted lead records and connected CRM activity."
        primaryCta={{ label: 'Open Lead Intake', onClick: () => { window.location.href = '/relationships/intake' } }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Lead Registry</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">Persisted leads</h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-6 text-ink-500">Every row below is backed by local SQLite records from real form submissions and linked contacts/opportunities.</p>
            <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Local persisted mode</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/relationships/intake" className="inline-flex h-10 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700">
              Run Intake
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/deals" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">
              Open Deals
            </Link>
          </div>
        </div>

        <label className="relative mt-4 block w-full max-w-[340px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, source, type, owner, stage..."
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600"
          />
        </label>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserRound}
          title="No leads match your search"
          description="Try another keyword or clear filters."
          primaryCta={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <section className="overflow-hidden rounded-[22px] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-base text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Form type</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Opportunity stage</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink-900">{row.fullName}</p>
                      <p className="mt-1 text-xs text-ink-500">{row.contactId}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-700">{row.source}</td>
                    <td className="px-4 py-4 text-ink-700">{row.formType}</td>
                    <td className="px-4 py-4 text-ink-700">{row.ownerName ?? 'Unassigned'}</td>
                    <td className="px-4 py-4 text-ink-700">{row.opportunityStageKey ? row.opportunityStageKey.replaceAll('_', ' ') : 'No opportunity'}</td>
                    <td className="px-4 py-4 text-ink-500">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/relationships/${row.contactId}`} className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">Contact</Link>
                        {row.opportunityId ? (
                          <Link to={`/opportunities/${row.opportunityId}`} className="inline-flex h-9 items-center rounded-xl bg-palm-100 px-3 text-sm font-semibold text-palm-700 transition-colors hover:bg-palm-200">Opportunity</Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
