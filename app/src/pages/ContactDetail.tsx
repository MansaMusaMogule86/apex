import { useCallback, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, FileText, MessageCircle, Sparkles, Target } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmContact, type CrmLeadSnapshot } from '@/lib/crm-api'
import { buildDemoCrmContactSnapshot } from '@/lib/demo-crm-fallbacks'
import { useResilientLiveData } from '@/hooks/useResilientLiveData'

function currency(value?: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value)
}

export default function ContactDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const onLiveConnected = useCallback(() => {
    toast.success('Live data connected')
  }, [])

  const {
    mode,
    data: snapshot,
    recoverableError,
    loadLiveData,
    retryLiveData,
  } = useResilientLiveData<CrmLeadSnapshot>({
    loadPersisted: () => fetchCrmContact(id),
    buildDemoData: () => buildDemoCrmContactSnapshot(id),
    isEmpty: () => false,
    onLiveConnected,
  })

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  // If contact not found (404), redirect to relationships list
  useEffect(() => {
    if (mode === 'error' && recoverableError?.includes('404')) {
      navigate('/relationships', { replace: true })
    }
  }, [mode, recoverableError, navigate])

  if (mode === 'loading') return <div className="space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-line bg-white" />)}</div>

  if (mode === 'error' || !snapshot) {
    return <EmptyState icon={AlertTriangle} title="Contact unavailable" description={recoverableError ?? 'The contact could not be loaded.'} primaryCta={{ label: 'Retry live data', onClick: () => { void retryLiveData() } }} secondaryCta={{ label: 'Back to Relationships', onClick: () => { navigate('/relationships') } }} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <Link to="/relationships" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-palm-600"><ArrowLeft className="h-4 w-4" />Relationships</Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Persisted CRM contact</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">{snapshot.contact.fullName}</h1>
            <p className="mt-2 text-sm leading-6 text-ink-500">{snapshot.contact.email ?? snapshot.contact.phone ?? 'No direct channel stored'} · {snapshot.contact.preferredLanguage} · {snapshot.contact.source}</p>
            {mode === 'persisted' ? <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Persisted mode</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {snapshot.opportunity ? <Link to={`/opportunities/${snapshot.opportunity.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700"><Target className="h-4 w-4" />Open opportunity</Link> : null}
            <Link to="/relationships/intake" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken"><Sparkles className="h-4 w-4" />Lead Intake</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Timeline</h2>
            <div className="mt-4 space-y-3">
              {snapshot.timeline.map((event) => (
                <div key={event.id} className="flex gap-3 rounded-2xl border border-line bg-base p-4">
                  <div className="mt-0.5 rounded-full bg-palm-100 p-2 text-palm-700"><Clock3 className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{event.title}</p>
                    <p className="mt-1 text-sm text-ink-600">{event.body}</p>
                    <p className="mt-1 text-xs text-ink-400">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Property matches</h2>
            <div className="mt-4 space-y-3">
              {snapshot.matches.length > 0 ? snapshot.matches.map((match) => (
                <div key={match.id} className="rounded-2xl border border-line bg-base p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{match.property.name}</p>
                      <p className="mt-1 text-xs text-ink-500">{match.property.community} · {match.property.propertyType} · {match.property.beds}BR</p>
                    </div>
                    <span className="rounded-full bg-palm-100 px-2.5 py-1 text-xs font-semibold text-palm-700">{match.matchScore}%</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">{currency(match.property.priceAed)} · {match.property.completion}</p>
                  <ul className="mt-2 space-y-1 text-xs text-ink-500">{match.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
                </div>
              )) : <p className="text-sm text-ink-500">No persisted property matches yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Lead score and requirements</h2>
            {snapshot.leadScore ? (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-base p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Conversion probability</p><p className="mt-2 text-2xl font-semibold text-ink-900">{snapshot.leadScore.conversionProbability}%</p></div>
                  <div className="rounded-2xl border border-line bg-base p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Expected deal value</p><p className="mt-2 text-2xl font-semibold text-ink-900">{currency(snapshot.leadScore.expectedDealValueAed)}</p></div>
                </div>
                <p className="text-sm text-ink-600">Next best action: {snapshot.leadScore.nextBestAction}</p>
                <div className="flex flex-wrap gap-2">{snapshot.leadScore.reasonCodes.map((code) => <span key={code} className="rounded-full bg-sunken px-2.5 py-1 text-xs font-medium text-ink-700">{code.replaceAll('_', ' ')}</span>)}</div>
              </div>
            ) : <p className="mt-4 text-sm text-ink-500">No lead score recorded yet.</p>}
            {snapshot.requirement ? (
              <div className="mt-5 rounded-2xl border border-line bg-base p-4 text-sm text-ink-600">
                <p><strong className="text-ink-900">Budget:</strong> {currency(snapshot.requirement.budgetMinAed)} to {currency(snapshot.requirement.budgetMaxAed)}</p>
                <p className="mt-2"><strong className="text-ink-900">Locations:</strong> {snapshot.requirement.locations.join(', ') || '—'}</p>
                <p className="mt-2"><strong className="text-ink-900">Property types:</strong> {snapshot.requirement.propertyTypes.join(', ') || '—'}</p>
                <p className="mt-2"><strong className="text-ink-900">Timeline:</strong> {snapshot.requirement.timeline ?? '—'}</p>
                <p className="mt-2"><strong className="text-ink-900">Financing:</strong> {snapshot.requirement.financing ?? '—'}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
            <h2 className="text-[18px] font-semibold text-ink-900">Opportunity and follow-up</h2>
            {snapshot.opportunity ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-line bg-base p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink-900">{snapshot.opportunity.title}</p>
                    <span className="rounded-full bg-gold-100 px-2.5 py-1 text-xs font-semibold text-gold-600">{snapshot.opportunity.stageKey.replaceAll('_', ' ')}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">Pipeline: {snapshot.opportunity.pipelineKey} · Probability {snapshot.opportunity.probability}%</p>
                </div>

                {snapshot.draft ? (
                  <div className="rounded-2xl border border-line bg-base p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><MessageCircle className="h-4 w-4 text-palm-600" />Current draft</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-700">{snapshot.draft.body}</p>
                    <p className="mt-2 text-xs text-ink-400">{snapshot.draft.status} · {snapshot.draft.channel} · {snapshot.draft.deliveryMode}</p>
                  </div>
                ) : null}

                {snapshot.task ? (
                  <div className="rounded-2xl border border-line bg-base p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><CheckCircle2 className="h-4 w-4 text-palm-600" />Follow-up task</p>
                    <p className="mt-2 text-sm text-ink-700">{snapshot.task.title}</p>
                    <p className="mt-1 text-xs text-ink-400">Due {new Date(snapshot.task.dueAt).toLocaleString()} · {snapshot.task.priority}</p>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-line bg-base p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><FileText className="h-4 w-4 text-palm-600" />Audit coverage</p>
                  <p className="mt-2 text-sm text-ink-700">{snapshot.auditCount} audit event(s) recorded for this CRM contact workflow.</p>
                </div>
              </div>
            ) : <p className="mt-4 text-sm text-ink-500">No persisted opportunity exists for this contact yet.</p>}
          </div>
        </div>
      </section>
    </div>
  )
}