import { useCallback, useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { AlertTriangle, ArrowLeft, CheckCircle2, MessageCircle, Target } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmOpportunity, type CrmOpportunitySnapshot } from '@/lib/crm-api'
import { useResilientLiveData } from '@/hooks/useResilientLiveData'

function currency(value: number) {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value)
}

export default function OpportunityDetail() {
  const { id = '' } = useParams()
  const onLiveConnected = useCallback(() => {
    toast.success('Live data connected')
  }, [])

  const {
    mode,
    data: snapshot,
    recoverableError,
    loadLiveData,
    retryLiveData,
  } = useResilientLiveData<CrmOpportunitySnapshot>({
    loadPersisted: () => fetchCrmOpportunity(id),
    isEmpty: () => false,
    onLiveConnected,
  })

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  if (mode === 'loading') return <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-line bg-white" />)}</div>

  if (mode === 'error' || !snapshot) {
    return <EmptyState icon={AlertTriangle} title="Opportunity unavailable" description={recoverableError ?? 'The opportunity could not be loaded.'} primaryCta={{ label: 'Retry live data', onClick: () => { void retryLiveData() } }} secondaryCta={{ label: 'Back to Dashboard', onClick: () => { window.location.href = '/dashboard' } }} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-palm-600"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Persisted opportunity</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">{snapshot.opportunity.title}</h1>
            <p className="mt-2 text-sm text-ink-500">{snapshot.opportunity.stageName} · {currency(snapshot.opportunity.expectedValueAed)} · Probability {snapshot.opportunity.probability}%</p>
            {mode === 'persisted' ? <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Persisted mode</p> : null}
          </div>
          {snapshot.contact ? <Link to={`/relationships/${snapshot.contact.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken"><Target className="h-4 w-4" />Open contact</Link> : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
          <h2 className="text-[18px] font-semibold text-ink-900">Activity timeline</h2>
          <div className="mt-4 space-y-3">
            {snapshot.timeline.map((event) => (
              <div key={event.id} className="rounded-2xl border border-line bg-base p-4">
                <p className="text-sm font-semibold text-ink-900">{event.title}</p>
                <p className="mt-1 text-sm text-ink-600">{event.body}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(event.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Related follow-up tasks</h2>
            <div className="mt-4 space-y-3">
              {snapshot.tasks.length > 0 ? snapshot.tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-line bg-base p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><CheckCircle2 className="h-4 w-4 text-palm-600" />{task.title}</p>
                  <p className="mt-1 text-xs text-ink-400">Due {new Date(task.dueAt).toLocaleString()} · {task.priority}</p>
                </div>
              )) : <p className="text-sm text-ink-500">No persisted tasks yet.</p>}
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Draft communications</h2>
            <div className="mt-4 space-y-3">
              {snapshot.drafts.length > 0 ? snapshot.drafts.map((draft) => (
                <div key={draft.id} className="rounded-2xl border border-line bg-base p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><MessageCircle className="h-4 w-4 text-palm-600" />{draft.channel} · {draft.status}</p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-700">{draft.body}</p>
                </div>
              )) : <p className="text-sm text-ink-500">No drafts linked to this opportunity yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}