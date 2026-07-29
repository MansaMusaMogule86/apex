import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CheckCircle2, Filter, Search } from 'lucide-react'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmTasks, updateCrmTask, type CrmTaskRow } from '@/lib/crm-api'

type FilterKey = 'all' | 'open' | 'done' | 'overdue' | 'mine'

function priorityRank(priority: string) {
  if (priority === 'high') return 0
  if (priority === 'medium') return 1
  return 2
}

function dueLabel(value: string) {
  return new Date(value).toLocaleString()
}

export default function TasksPersisted() {
  const [rows, setRows] = useState<CrmTaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchCrmTasks()
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

  const sorted = useMemo(() => {
    return [...rows].sort((left, right) => {
      if (left.status !== right.status) {
        if (left.status === 'open') return -1
        if (right.status === 'open') return 1
      }
      if (left.overdue !== right.overdue) return left.overdue ? -1 : 1
      const priorityDelta = priorityRank(left.priority) - priorityRank(right.priority)
      if (priorityDelta !== 0) return priorityDelta
      return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()
    })
  }, [rows])

  const mineUserId = useMemo(() => {
    const firstAssigned = rows.find((row) => row.assigneeUserId)
    return firstAssigned?.assigneeUserId ?? null
  }, [rows])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    let base = sorted

    if (filter === 'open') base = base.filter((row) => row.status === 'open')
    if (filter === 'done') base = base.filter((row) => row.status === 'done')
    if (filter === 'overdue') base = base.filter((row) => row.overdue)
    if (filter === 'mine' && mineUserId) base = base.filter((row) => row.assigneeUserId === mineUserId)
    if (filter === 'mine' && !mineUserId) base = []

    if (!query) return base

    return base.filter((row) =>
      [
        row.title,
        row.contactName ?? '',
        row.opportunityTitle ?? '',
        row.assigneeName ?? '',
        row.priority,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    )
  }, [filter, mineUserId, search, sorted])

  const counts = useMemo(() => {
    return {
      all: rows.length,
      open: rows.filter((row) => row.status === 'open').length,
      done: rows.filter((row) => row.status === 'done').length,
      overdue: rows.filter((row) => row.overdue).length,
      mine: mineUserId ? rows.filter((row) => row.assigneeUserId === mineUserId).length : 0,
    }
  }, [mineUserId, rows])

  const toggleStatus = async (task: CrmTaskRow) => {
    const nextStatus = task.status === 'done' ? 'open' : 'done'
    setUpdatingTaskId(task.id)
    setError(null)

    try {
      const updated = await updateCrmTask(task.id, nextStatus)
      setRows((current) => current.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setUpdatingTaskId(null)
    }
  }

  if (loading) {
    return <div className="space-y-3">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
  }

  if (error && rows.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="Tasks unavailable"
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Task Operations</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">Persisted task queue</h1>
            <p className="mt-2 max-w-[70ch] text-sm leading-6 text-ink-500">Tasks are loaded from the local CRM database and status changes are persisted server-side with audit events.</p>
            <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Local persisted mode</p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="inline-flex h-10 items-center rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">Dashboard</Link>
            <Link to="/relationships/intake" className="inline-flex h-10 items-center rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700">Lead Intake</Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {([
            ['all', 'All', counts.all],
            ['open', 'Open', counts.open],
            ['overdue', 'Overdue', counts.overdue],
            ['mine', 'Mine', counts.mine],
            ['done', 'Done', counts.done],
          ] as Array<[FilterKey, string, number]>).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${filter === key ? 'border-palm-600 bg-palm-50 text-palm-700' : 'border-line bg-white text-ink-700 hover:bg-sunken'}`}
            >
              <Filter className="h-3.5 w-3.5" />
              {label}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-ink-500">{count}</span>
            </button>
          ))}
        </div>

        <label className="relative mt-4 block w-full max-w-[420px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, contact, opportunity, assignee..."
            className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600"
          />
        </label>

        {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tasks for current filter"
          description="Try another filter or clear your search."
          primaryCta={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <section className="overflow-hidden rounded-[22px] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-base text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Related</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink-900">{row.title}</p>
                      <p className="mt-1 text-xs text-ink-500">{row.contactName ?? row.contactId}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-700">{row.priority}</td>
                    <td className="px-4 py-4 text-ink-700">
                      <span className={row.overdue ? 'font-semibold text-red-600' : ''}>{dueLabel(row.dueAt)}</span>
                    </td>
                    <td className="px-4 py-4 text-ink-700">{row.assigneeName ?? 'Unassigned'}</td>
                    <td className="px-4 py-4 text-ink-700">
                      {row.opportunityId ? <Link to={`/opportunities/${row.opportunityId}`} className="inline-flex rounded-lg border border-line px-2 py-1 text-xs font-medium transition-colors hover:bg-sunken">{row.opportunityTitle ?? 'Opportunity'}</Link> : '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'done' ? 'bg-palm-100 text-palm-700' : 'bg-sunken text-ink-700'}`}>{row.status}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => void toggleStatus(row)}
                        disabled={updatingTaskId === row.id}
                        className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken disabled:opacity-50"
                      >
                        {updatingTaskId === row.id ? 'Saving…' : row.status === 'done' ? 'Reopen' : 'Complete'}
                      </button>
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
