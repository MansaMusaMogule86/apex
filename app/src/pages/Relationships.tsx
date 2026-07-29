import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Building2, Search, Sparkles, Users } from 'lucide-react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/app/EmptyState'
import { fetchCrmContacts, type CrmContactRow } from '@/lib/crm-api'
import { useResilientLiveData } from '@/hooks/useResilientLiveData'

function currency(value: number | null) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(value)
}

export default function Relationships() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'contacts' | 'companies'>('contacts')

  const onLiveConnected = useCallback(() => {
    toast.success('Live data connected')
  }, [])

  const {
    mode,
    data: contactsData,
    recoverableError,
    loadLiveData,
    retryLiveData,
  } = useResilientLiveData<CrmContactRow[]>({
    loadPersisted: fetchCrmContacts,
    isEmpty: (rows) => rows.length === 0,
    onLiveConnected,
  })

  useEffect(() => {
    void loadLiveData()
  }, [loadLiveData])

  const contacts = useMemo(() => contactsData ?? [], [contactsData])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return contacts.filter((contact) => {
      if (!query) return true
      return [contact.fullName, contact.email ?? '', contact.phone ?? '', contact.source, contact.ownerName ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
  }, [contacts, search])

  if (mode === 'loading') {
    return <div className="space-y-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
  }

  if (mode === 'error') {
    return <EmptyState icon={Users} title="Contacts unavailable" description={recoverableError ?? 'Could not load contacts.'} primaryCta={{ label: 'Retry live data', onClick: () => { void retryLiveData() } }} />
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-palm-600">CRM relationships</p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.02em] text-ink-900">Contacts and companies</h1>
            <p className="mt-2 max-w-[55ch] text-sm leading-6 text-ink-500">Persisted contact records now flow from the server-backed intake pipeline into the CRM. Companies remain an honest empty state until that module is wired to real persistence.</p>
            {mode === 'persisted' ? <p className="mt-2 inline-flex rounded-full bg-palm-100 px-3 py-1 text-xs font-semibold text-palm-700">Persisted mode</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/relationships/intake" className="inline-flex h-10 items-center gap-2 rounded-xl bg-palm-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-palm-700">
              <Sparkles className="h-4 w-4" />
              Lead Intake
            </Link>
            <Link to="/dashboard" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">
              <ArrowRight className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setTab('contacts')} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${tab === 'contacts' ? 'bg-palm-100 text-palm-700' : 'bg-sunken text-ink-600'}`}>Contacts</button>
          <button type="button" onClick={() => setTab('companies')} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${tab === 'companies' ? 'bg-palm-100 text-palm-700' : 'bg-sunken text-ink-600'}`}>Companies</button>
          <label className="relative ml-auto block w-full max-w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts, email, phone, owner…" className="h-10 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-palm-600" />
          </label>
        </div>
      </section>

      {tab === 'companies' ? (
        <EmptyState icon={Building2} title="Companies are not connected yet" description="Company persistence has not been wired into the local CRM database yet. This module stays explicit about that state instead of showing placeholder records." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={mode === 'empty' ? 'No persisted contacts yet' : 'No contacts match your search'} description={mode === 'empty' ? 'Submit a lead through Lead Intake to create a real contact, opportunity, timeline, and task in the CRM.' : 'Try another keyword or clear filters.'} primaryCta={{ label: mode === 'empty' ? 'Open Lead Intake' : 'Clear search', onClick: () => {
          if (mode === 'empty') {
            window.location.href = '/relationships/intake'
          } else {
            setSearch('')
          }
        } }} secondaryCta={{ label: 'View Dashboard', onClick: () => { window.location.href = '/dashboard' } }} />
      ) : (
        <section className="overflow-hidden rounded-[22px] border border-line bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-base text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-400">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Latest stage</th>
                  <th className="px-4 py-3">Expected value</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr key={contact.id} className="border-t border-line">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-ink-900">{contact.fullName}</p>
                      <p className="mt-1 text-xs text-ink-500">{contact.email ?? contact.phone ?? 'No direct channel stored yet'}</p>
                    </td>
                    <td className="px-4 py-4 text-ink-700">{contact.preferredLanguage}</td>
                    <td className="px-4 py-4 text-ink-700">{contact.source}</td>
                    <td className="px-4 py-4 text-ink-700">{contact.ownerName ?? 'Unassigned'}</td>
                    <td className="px-4 py-4 text-ink-700">{contact.latestStageKey ? contact.latestStageKey.replaceAll('_', ' ') : 'No opportunity yet'}</td>
                    <td className="px-4 py-4 font-medium text-ink-900">{currency(contact.expectedValueAed)}</td>
                    <td className="px-4 py-4 text-ink-500">{new Date(contact.updatedAt).toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/relationships/${contact.id}`} className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-sunken">Open</Link>
                        {contact.latestOpportunityId ? <Link to={`/opportunities/${contact.latestOpportunityId}`} className="inline-flex h-9 items-center rounded-xl bg-palm-100 px-3 text-sm font-semibold text-palm-700 transition-colors hover:bg-palm-200">Opportunity</Link> : null}
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