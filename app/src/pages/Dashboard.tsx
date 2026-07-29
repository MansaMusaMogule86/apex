import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AlertTriangle, CalendarDays, Database, FileWarning, FolderSync, Inbox, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchDashboardSnapshot, type DashboardSnapshot } from '@/lib/crm-api'
import { useResilientLiveData } from '@/hooks/useResilientLiveData'

type RangeKey = '7d' | '30d' | '90d'

const ranges: Array<{ key: RangeKey; label: string }> = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
]

function currency(value: number) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value)
}

function isDashboardEmpty(snapshot: DashboardSnapshot) {
  if (!snapshot.metrics || !snapshot.charts || !snapshot.filters) {
    throw new Error('Live dashboard payload is malformed.')
  }

  return (
    snapshot.metrics.totalContacts === 0 &&
    snapshot.metrics.openOpportunities === 0 &&
    snapshot.recentActivity.length === 0 &&
    snapshot.upcomingTasks.length === 0
  )
}

function StatusPill({ tone, children }: { tone: 'palm' | 'amber' | 'red' | 'slate'; children: string }) {
  const map = {
    palm: 'bg-palm-100 text-palm-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-600',
    slate: 'bg-sunken text-ink-700',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[tone]}`}>{children}</span>
}

export default function Dashboard() {
  const [range, setRange] = useState<RangeKey>('30d')
  const [sourceFilter, setSourceFilter] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const loadPersisted = useCallback(() => {
    const params = new URLSearchParams()
    if (sourceFilter) params.set('source', sourceFilter)
    if (stageFilter) params.set('stage', stageFilter)
    if (statusFilter) params.set('status', statusFilter)
    params.set('range', range)
    return fetchDashboardSnapshot(params)
  }, [range, sourceFilter, stageFilter, statusFilter])

  const onLiveConnected = useCallback(() => {
    toast.success('Live data connected')
  }, [])

  const { mode, data: snapshot, recoverableError, loadLiveData, retryLiveData } = useResilientLiveData({
    loadPersisted,
    isEmpty: isDashboardEmpty,
    onLiveConnected,
  })

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  const metrics = snapshot?.metrics
  const integrationIssues = useMemo(
    () => snapshot?.integrations.filter((integration) => integration.status !== 'healthy') ?? [],
    [snapshot],
  )

  if (mode === 'loading') {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-[18px] border border-line bg-white" />)}</div>
  }

  if (mode === 'error' || !snapshot || !metrics) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Dashboard unavailable"
        description={recoverableError ?? 'The CRM dashboard could not load.'}
        primaryCta={{ label: 'Retry live data', onClick: () => { void retryLiveData() } }}
      />
    )
  }

  if (mode === 'empty') {
    return (
      <EmptyState
        icon={Inbox}
        title="Persisted CRM has no dashboard records yet"
        description="This is a persisted empty state. Submit a lead to create contacts, opportunities, and activity."
        primaryCta={{ label: 'Open Lead Intake', onClick: () => { window.location.href = '/relationships/intake' } }}
      />
    )
  }

  const statCards = [
    { label: 'Total contacts', value: String(metrics.totalContacts), hint: 'Persisted CRM contacts' },
    { label: 'New leads', value: String(metrics.newLeads), hint: 'Form-driven lead submissions' },
    { label: 'Qualified leads', value: String(metrics.qualifiedLeads), hint: 'Opportunities beyond New Inquiry' },
    { label: 'Open opportunities', value: String(metrics.openOpportunities), hint: 'Active pipeline records' },
    { label: 'Pipeline value', value: currency(metrics.pipelineValue), hint: 'Sum of open expected value' },
    { label: 'Won revenue', value: currency(metrics.wonRevenue), hint: 'Persisted won opportunity value' },
    { label: 'Lost opportunities', value: String(metrics.lostOpportunities), hint: 'Explicitly lost records' },
    { label: 'Conversion rate', value: `${metrics.conversionRate}%`, hint: 'Won / total opportunities' },
  ]

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">CRM command dashboard</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">Operational revenue view</h1>
            <p className="mt-2 max-w-[60ch] text-sm leading-6 text-ink-500">Persisted dashboard metrics for leads, contacts, opportunities, task follow-up, and recent CRM activity. No static demo numbers are used in this view.</p>
            {mode === 'persisted' ? <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Persisted mode</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/relationships/intake" className="inline-flex h-10 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700">
              <UserPlus className="h-4 w-4" />
              New lead intake
            </Link>
            <Link to="/relationships" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">
              <Users className="h-4 w-4" />
              Open contacts
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {ranges.map((item) => (
            <button key={item.key} type="button" onClick={() => setRange(item.key)} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${range === item.key ? 'bg-palm-100 text-palm-700' : 'bg-sunken text-ink-600'}`}>
              {item.label}
            </button>
          ))}
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="ml-auto h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink-700">
            <option value="">All sources</option>
            {snapshot.filters.sources.map((source) => <option key={source}>{source}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink-700">
            <option value="">All statuses</option>
            {snapshot.filters.statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="h-9 rounded-xl border border-line bg-white px-3 text-sm text-ink-700">
            <option value="">All stages</option>
            {snapshot.filters.stages.map((stage) => <option key={stage}>{stage}</option>)}
          </select>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-[18px] border border-line bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-400">{card.label}</p>
            <p className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-ink-900">{card.value}</p>
            <p className="mt-2 text-[12px] leading-5 text-ink-500">{card.hint}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink-900">Pipeline and lead distribution</h2>
              <Link to="/relationships" className="text-sm font-medium text-palm-600 hover:text-palm-700">Open CRM records</Link>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-400">Leads by source</p>
                <div className="mt-3 space-y-3">
                  {snapshot.charts.leadsBySource.length > 0 ? snapshot.charts.leadsBySource.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-sm text-ink-700"><span>{row.label}</span><span>{row.value}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-sunken"><div className="h-2 rounded-full bg-palm-600" style={{ width: `${Math.max(8, (row.value / Math.max(...snapshot.charts.leadsBySource.map((item) => item.value))) * 100)}%` }} /></div>
                    </div>
                  )) : <p className="text-sm text-ink-500">No persisted lead-source data yet.</p>}
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-400">Opportunities by stage</p>
                <div className="mt-3 space-y-3">
                  {snapshot.charts.opportunitiesByStage.length > 0 ? snapshot.charts.opportunitiesByStage.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-sm text-ink-700"><span>{row.label.replaceAll('_', ' ')}</span><span>{row.value}</span></div>
                      <div className="mt-1 h-2 rounded-full bg-sunken"><div className="h-2 rounded-full bg-gold-500" style={{ width: `${Math.max(8, (row.value / Math.max(...snapshot.charts.opportunitiesByStage.map((item) => item.value))) * 100)}%` }} /></div>
                    </div>
                  )) : <p className="text-sm text-ink-500">No persisted opportunities yet.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink-900">Recent CRM activity</h2>
              <StatusPill tone="slate">{`${snapshot.recentActivity.length} events`}</StatusPill>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.recentActivity.length > 0 ? snapshot.recentActivity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line bg-base p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="text-xs text-ink-400">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{item.body}</p>
                </div>
              )) : <EmptyState icon={Inbox} title="No CRM activity yet" description="Submit a lead through Lead Intake to create contacts, activities, opportunities, tasks, and audit records." primaryCta={{ label: 'Open Lead Intake', onClick: () => { window.location.href = '/relationships/intake' } }} />}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink-900">Upcoming tasks</h2>
              <StatusPill tone={metrics.overdueFollowUps > 0 ? 'red' : 'palm'}>{`${metrics.overdueFollowUps} overdue`}</StatusPill>
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.upcomingTasks.length > 0 ? snapshot.upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-line bg-base p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{task.title}</p>
                    <StatusPill tone={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'amber' : 'slate'}>{task.priority}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">Due {new Date(task.dueAt).toLocaleString()}</p>
                </div>
              )) : <p className="text-sm text-ink-500">No upcoming persisted tasks yet.</p>}
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink-900">Upcoming appointments</h2>
              <CalendarDays className="h-4 w-4 text-ink-400" />
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.upcomingAppointments.items.length > 0
                ? snapshot.upcomingAppointments.items.map((item) => {
                    const record = item as { id: string; contactName: string; propertyName: string; scheduledAt: string; status: string }
                    return (
                      <div key={record.id} className="rounded-2xl border border-line bg-base p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-ink-900">{record.contactName}</p>
                          <StatusPill tone={record.status === 'scheduled' ? 'palm' : record.status === 'completed' ? 'amber' : 'slate'}>{record.status}</StatusPill>
                        </div>
                        <p className="mt-1 text-sm text-ink-600">{record.propertyName}</p>
                        <p className="mt-1 text-sm text-ink-600">{new Date(record.scheduledAt).toLocaleString()}</p>
                      </div>
                    )
                  })
                : <div className="rounded-2xl border border-dashed border-line bg-base p-4 text-sm text-ink-500">{snapshot.upcomingAppointments.reason}</div>}
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-ink-900">Integration health</h2>
              <Database className="h-4 w-4 text-ink-400" />
            </div>
            <div className="mt-4 space-y-3">
              {snapshot.integrations.map((integration) => (
                <div key={integration.name} className="rounded-2xl border border-line bg-base p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{integration.name}</p>
                    <StatusPill tone={integration.status === 'healthy' ? 'palm' : integration.status === 'not_configured' ? 'amber' : 'red'}>{integration.status.replaceAll('_', ' ')}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">{integration.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Operational alerts</h2>
            <div className="mt-4 space-y-3 text-sm text-ink-600">
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-base p-4"><FileWarning className="mt-0.5 h-4 w-4 text-amber-600" /><div><p className="font-semibold text-ink-900">Failed submissions</p><p>{metrics.failedSubmissions === null ? 'Unavailable until submission failure persistence is added.' : String(metrics.failedSubmissions)}</p></div></div>
              <div className="flex items-start gap-3 rounded-2xl border border-line bg-base p-4"><FolderSync className="mt-0.5 h-4 w-4 text-amber-600" /><div><p className="font-semibold text-ink-900">Pending retries</p><p>{metrics.pendingRetries === null ? 'Unavailable until retry-job persistence is added.' : String(metrics.pendingRetries)}</p></div></div>
              {integrationIssues.length > 0 ? <div className="flex items-start gap-3 rounded-2xl border border-line bg-base p-4"><AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" /><div><p className="font-semibold text-ink-900">Integration follow-up</p><p>{integrationIssues.length} integration area(s) need configuration before production use.</p></div></div> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}