import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Bot, Building2, CheckCircle2, Clock3, FileText, Mail, Phone, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useResilientLiveData } from '@/hooks/useResilientLiveData'
import {
  approveLeadDraft,
  fetchLeadSliceBootstrap,
  submitLeadIntake,
  type LeadIntakePayload,
  type LeadIntakeResult,
  type LeadMatch,
  type LeadSliceBootstrap,
  type TimelineEntry,
} from '@/lib/lead-intake-api'

const defaultPayload: LeadIntakePayload = {
  fullName: '',
  email: '',
  phone: '',
  preferredLanguage: 'English',
  source: 'Website',
  formType: 'Property Inquiry',
  budgetMinAed: 3000000,
  budgetMaxAed: 9000000,
  locations: ['Downtown Dubai'],
  propertyTypes: ['Apartment'],
  bedroomsMin: 2,
  bedroomsMax: 3,
  timeline: 'Within 30 days',
  purpose: 'Investor',
  financing: 'Cash',
  notes: '',
  utmSource: 'direct',
}

function NumberField({ label, value, onChange }: { label: string; value?: number; onChange: (value?: number) => void }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[12px] font-medium text-ink-500">{label}</span>
      <input
        type="number"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
        className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600"
      />
    </label>
  )
}

export default function LeadIntake() {
  const [payload, setPayload] = useState<LeadIntakePayload>(defaultPayload)
  const [result, setResult] = useState<LeadIntakeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [approving, setApproving] = useState(false)

  const onLiveConnected = useCallback(() => {
    toast.success('Live data connected')
  }, [])

  const {
    mode,
    data: bootstrap,
    recoverableError,
    loadLiveData,
    retryLiveData,
  } = useResilientLiveData<LeadSliceBootstrap>({
    loadPersisted: fetchLeadSliceBootstrap,
    isEmpty: () => false,
    onLiveConnected,
  })

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  const updateListField = (key: 'locations' | 'propertyTypes', value: string) => {
    setPayload((current) => ({
      ...current,
      [key]: value.split(',').map((item) => item.trim()).filter(Boolean),
    }))
  }

  const onSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const intakeResult = await submitLeadIntake(payload)
      setResult(intakeResult)
      await loadLiveData()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setSubmitting(false)
    }
  }

  const onApprove = async () => {
    if (!result?.draft?.id) return
    setApproving(true)
    setError(null)
    try {
      const updated = await approveLeadDraft(result.draft.id)
      setResult(updated)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setApproving(false)
    }
  }

  if (mode === 'loading') {
    return <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
  }

  if (mode === 'error') {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Lead intake bootstrap failed: {recoverableError ?? 'Unknown error'}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { void retryLiveData() }} className="inline-flex h-10 items-center rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white">Retry live data</button>
          <Link to="/relationships" className="inline-flex h-10 items-center rounded-xl border border-line px-4 text-sm font-medium text-ink-700">Back to relationships</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">Vertical Slice</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-ink-900">Real lead intake</h1>
            <p className="mt-2 max-w-[42ch] text-sm leading-6 text-ink-500">
              This screen runs the first server-backed APEX flow: form submission, dedupe, requirements extraction, lead scoring, advisor recommendation, matching, opportunity creation, draft approval, simulated delivery, timeline, task, and audit.
            </p>
            {mode === 'persisted' ? <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Persisted mode</p> : null}
          </div>
          <Link to="/relationships" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">
            Relationships
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[12px] font-medium text-ink-500">Full name</span>
            <input value={payload.fullName} onChange={(event) => setPayload((current) => ({ ...current, fullName: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Email</span>
            <input value={payload.email ?? ''} onChange={(event) => setPayload((current) => ({ ...current, email: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Phone</span>
            <input value={payload.phone ?? ''} onChange={(event) => setPayload((current) => ({ ...current, phone: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Preferred language</span>
            <select value={payload.preferredLanguage} onChange={(event) => setPayload((current) => ({ ...current, preferredLanguage: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600">
              {['English', 'Arabic', 'French', 'Russian', 'Chinese'].map((language) => <option key={language}>{language}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Form type</span>
            <select value={payload.formType} onChange={(event) => setPayload((current) => ({ ...current, formType: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600">
              {(bootstrap?.forms ?? ['Property Inquiry']).map((form) => <option key={form}>{form}</option>)}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Lead source</span>
            <input value={payload.source} onChange={(event) => setPayload((current) => ({ ...current, source: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <NumberField label="Budget min (AED)" value={payload.budgetMinAed} onChange={(value) => setPayload((current) => ({ ...current, budgetMinAed: value }))} />
          <NumberField label="Budget max (AED)" value={payload.budgetMaxAed} onChange={(value) => setPayload((current) => ({ ...current, budgetMaxAed: value }))} />
          <NumberField label="Bedrooms min" value={payload.bedroomsMin} onChange={(value) => setPayload((current) => ({ ...current, bedroomsMin: value }))} />
          <NumberField label="Bedrooms max" value={payload.bedroomsMax} onChange={(value) => setPayload((current) => ({ ...current, bedroomsMax: value }))} />
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[12px] font-medium text-ink-500">Preferred locations</span>
            <input value={payload.locations.join(', ')} onChange={(event) => updateListField('locations', event.target.value)} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[12px] font-medium text-ink-500">Property types</span>
            <input value={payload.propertyTypes.join(', ')} onChange={(event) => updateListField('propertyTypes', event.target.value)} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Timeline</span>
            <input value={payload.timeline ?? ''} onChange={(event) => setPayload((current) => ({ ...current, timeline: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Purpose</span>
            <input value={payload.purpose ?? ''} onChange={(event) => setPayload((current) => ({ ...current, purpose: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5">
            <span className="text-[12px] font-medium text-ink-500">Financing</span>
            <input value={payload.financing ?? ''} onChange={(event) => setPayload((current) => ({ ...current, financing: event.target.value }))} className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-[12px] font-medium text-ink-500">Advisor notes</span>
            <textarea value={payload.notes ?? ''} onChange={(event) => setPayload((current) => ({ ...current, notes: event.target.value }))} rows={4} className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
        </div>

        {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-[12px] text-ink-500">Backend-powered. Records persist in the local APEX slice database.</div>
          <button type="button" onClick={onSubmit} disabled={mode !== 'persisted' || submitting || payload.fullName.trim().length < 2} className="inline-flex h-11 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Run intake'}
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-400">Latest result</p>
              <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink-900">Intelligence output</h2>
            </div>
            {result?.draft?.status === 'pending_approval' ? (
              <button type="button" onClick={onApprove} disabled={approving || mode !== 'persisted'} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gold-500 px-4 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-400 disabled:opacity-50">
                {approving ? 'Approving…' : 'Approve draft'}
                <CheckCircle2 className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {result ? (
            <div className="mt-5 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Dedupe', value: (result.dedupeStatus ?? 'existing_contact_snapshot').replaceAll('_', ' '), icon: ShieldCheck },
                  { label: 'Advisor', value: result.advisorRecommendation.fullName, icon: Users },
                  { label: 'Opportunity stage', value: result.opportunity.stageKey.replaceAll('_', ' '), icon: FileText },
                  { label: 'Conversion', value: `${result.leadScore.conversionProbability}%`, icon: Bot },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-line bg-base px-4 py-3">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-ink-900">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-line bg-base p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Requirements extracted</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.requirement.locations.map((item: string) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-700 ring-1 ring-line">{item}</span>)}
                  {result.requirement.propertyTypes.map((item: string) => <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-700 ring-1 ring-line">{item}</span>)}
                </div>
                <p className="mt-3 text-sm text-ink-600">Budget AED {result.requirement.budgetMinAed?.toLocaleString()} to AED {result.requirement.budgetMaxAed?.toLocaleString()} · {result.requirement.timeline} · {result.requirement.financing}</p>
              </div>

              <div className="rounded-2xl border border-line bg-base p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Property matches</p>
                <div className="mt-3 space-y-3">
                  {result.matches.map((match: LeadMatch) => (
                    <div key={match.id} className="rounded-2xl border border-line bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{match.property.name}</p>
                          <p className="mt-1 text-xs text-ink-500">{match.property.community} · {match.property.propertyType} · {match.property.beds}BR</p>
                        </div>
                        <div className="rounded-full bg-palm-100 px-2.5 py-1 text-xs font-semibold text-palm-700">{match.matchScore}%</div>
                      </div>
                      <p className="mt-2 text-sm text-ink-600">AED {match.property.priceAed.toLocaleString()} · {match.property.completion}</p>
                      <ul className="mt-2 space-y-1 text-xs text-ink-500">
                        {match.reasons.map((reason: string) => <li key={reason}>• {reason}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-base p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Draft and next step</p>
                <p className="mt-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm leading-6 text-ink-800 whitespace-pre-line">{result.draft.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className={cn('rounded-full px-2.5 py-1 font-semibold', result.draft.status === 'sent' ? 'bg-palm-100 text-palm-700' : 'bg-gold-100 text-gold-600')}>{result.draft.status.replaceAll('_', ' ')}</span>
                  <span>Channel: {result.draft.channel}</span>
                  <span>Delivery: {result.draft.deliveryMode}</span>
                  <span>Audit events: {result.auditCount}</span>
                  <Link to={`/relationships/${result.contact.id}`} className="font-semibold text-palm-600 hover:text-palm-700">Open contact</Link>
                  {result.opportunity ? <Link to={`/opportunities/${result.opportunity.id}`} className="font-semibold text-palm-600 hover:text-palm-700">Open opportunity</Link> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-base p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">Contact timeline</p>
                <div className="mt-3 space-y-3">
                  {result.timeline.map((event: TimelineEntry) => (
                    <div key={event.id} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                      <div className="mt-0.5 rounded-full bg-palm-100 p-2 text-palm-700"><Clock3 className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900">{event.title}</p>
                        <p className="mt-1 text-sm text-ink-600">{event.body}</p>
                        <p className="mt-1 text-xs text-ink-400">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-base px-5 py-8 text-sm text-ink-500">
              Submit the intake form to create a real contact, score it, match inventory, open an opportunity, and generate an approval-gated follow-up draft.
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-400">
            <Building2 className="h-3.5 w-3.5" />
            Recent server contacts
          </div>
          <div className="mt-4 space-y-3">
            {(bootstrap?.contacts ?? []).map((contact) => (
              <div key={contact.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-base px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{contact.fullName}</p>
                  <p className="mt-1 text-xs text-ink-500">{contact.preferredLanguage} · {contact.source}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-ink-400">
                  {contact.source.toLowerCase().includes('email') ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                  {new Date(contact.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}