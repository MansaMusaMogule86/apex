/**
 * Documents — `/documents` (documents.md).
 * Compliance vault: left doc-type rail with counts + status filters,
 * DataTable of trpc.apex.documents.list with file-type icons, status chips
 * (valid palm / expiring amber / expired red) + expiry labels, related
 * record chips, size + uploadedAgo. Compliance banner when docs expire.
 */
import { useMemo, useState } from 'react'
import {
  FileText, FileImage, FolderOpen, Search, Upload, Sparkles, ShieldAlert,
  Users, Handshake, Building2, X, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '@/components/app/DataTable'
import { StatusChip } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import { FilterChip, PrimaryButton, TableSkeleton } from '@/components/ops/OpsKit'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

/* ---------------- types & taxonomy ---------------- */

type DocRow = {
  id: number
  name: string
  docType: string
  relatedType: string
  relatedName: string
  status: string
  expiryLabel: string | null
  sizeLabel: string | null
  uploadedAgo: string | null
}

/** Canonical DLD doc-type taxonomy (design.md §9) */
const DOC_TYPES = [
  'Passport', 'Emirates ID', 'Proof of Funds', 'Mortgage Pre-Approval',
  'Form A', 'Form B', 'Form F', 'MOU', 'SPA', 'NOC', 'Title Deed', 'Tenancy Contract',
]

type StatusFilter = 'all' | 'valid' | 'expiring' | 'expired'

const statusMeta: Record<string, { tone: 'palm' | 'amber' | 'red'; label: string; expiryClass: string }> = {
  valid: { tone: 'palm', label: 'Valid', expiryClass: 'text-ink-500' },
  expiring: { tone: 'amber', label: 'Expiring', expiryClass: 'text-amber-600' },
  expired: { tone: 'red', label: 'Expired', expiryClass: 'text-red-600' },
}

const relatedIcons: Record<string, LucideIcon> = {
  contact: Users,
  deal: Handshake,
  property: Building2,
}

function fileIcon(name: string): { icon: LucideIcon; className: string } {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {
    return { icon: FileImage, className: 'text-teal-600' }
  }
  if (ext === 'doc' || ext === 'docx') return { icon: FileText, className: 'text-mail-slate' }
  return { icon: FileText, className: 'text-red-600' }
}

/* ---------------- page ---------------- */

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [newDoc, setNewDoc] = useState({ name: '', docType: DOC_TYPES[0], relatedName: '' })

  const submitDoc = () => {
    if (!newDoc.name.trim()) return
    const doc = {
      id: Date.now(),
      name: newDoc.name,
      docType: newDoc.docType,
      relatedType: 'contact',
      relatedName: newDoc.relatedName.trim() || 'Unlinked',
      status: 'valid',
      expiryLabel: null,
      sizeLabel: `${Math.round(Math.random() * 500 + 50)} KB`,
      uploadedAgo: 'just now',
    }
    const existing = (window as Window & { __mockDocsCache?: DocRow[] }).__mockDocsCache ?? []
    existing.push(doc)
    ;(window as Window & { __mockDocsCache?: DocRow[] }).__mockDocsCache = existing
    setUploadOpen(false)
    setNewDoc({ name: '', docType: DOC_TYPES[0], relatedName: '' })
    toast.success(`${doc.name} uploaded`)
  }

  const docsQ = trpc.apex.documents.list.useQuery()
  const docs = useMemo(() => (docsQ.data ?? []) as DocRow[], [docsQ.data])

  const typeCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of docs) map.set(d.docType, (map.get(d.docType) ?? 0) + 1)
    return map
  }, [docs])

  const statusCounts = useMemo(
    () => ({
      valid: docs.filter((d) => d.status === 'valid').length,
      expiring: docs.filter((d) => d.status === 'expiring').length,
      expired: docs.filter((d) => d.status === 'expired').length,
    }),
    [docs],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return docs.filter((d) => {
      if (typeFilter !== 'all' && d.docType !== typeFilter) return false
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      if (q && !`${d.name} ${d.relatedName} ${d.docType}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [docs, typeFilter, statusFilter, query])

  const attention = statusCounts.expiring + statusCounts.expired

  const columns: Column<DocRow>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortValue: (d) => d.name,
      render: (d) => {
        const meta = fileIcon(d.name)
        const Icon = meta.icon
        return (
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sunken">
              <Icon className={cn('h-4 w-4', meta.className)} strokeWidth={1.75} />
            </span>
            <span className="truncate text-[13px] font-medium text-ink-900">{d.name}</span>
          </span>
        )
      },
    },
    {
      key: 'docType',
      header: 'Type',
      width: 150,
      render: (d) => (
        <StatusChip tone="neutral" dot={false}>
          {d.docType}
        </StatusChip>
      ),
    },
    {
      key: 'related',
      header: 'Linked record',
      render: (d) => {
        const Icon = relatedIcons[d.relatedType] ?? FileText
        return (
          <span className="inline-flex max-w-[240px] items-center gap-1.5 rounded-full bg-sunken py-0.5 pl-1.5 pr-2.5 text-[11.5px] text-ink-700 ring-1 ring-line">
            <Icon className="h-3 w-3 shrink-0 text-ink-500" strokeWidth={1.75} />
            <span className="truncate">{d.relatedName}</span>
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: 190,
      render: (d) => {
        const meta = statusMeta[d.status] ?? statusMeta.valid!
        return (
          <span className="flex flex-col gap-0.5">
            <StatusChip tone={meta.tone} className="w-fit">
              {meta.label}
            </StatusChip>
            {d.expiryLabel && (
              <span className={cn('tnum font-mono text-[10.5px]', meta.expiryClass)}>{d.expiryLabel}</span>
            )}
          </span>
        )
      },
    },
    {
      key: 'uploadedAgo',
      header: 'Uploaded',
      width: 110,
      render: (d) => <span className="tnum text-[12.5px] text-ink-500">{d.uploadedAgo ?? '—'}</span>,
    },
    {
      key: 'sizeLabel',
      header: 'Size',
      width: 90,
      align: 'right',
      render: (d) => <span className="tnum font-mono text-[12px] text-ink-500">{d.sizeLabel ?? '—'}</span>,
    },
  ]

  const statusFilters: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all', label: 'All statuses', count: docs.length },
    { key: 'valid', label: 'Valid', count: statusCounts.valid },
    { key: 'expiring', label: 'Expiring', count: statusCounts.expiring },
    { key: 'expired', label: 'Expired', count: statusCounts.expired },
  ]

  const railItem = (key: string, label: string, count: number, active: boolean, onClick: () => void) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors duration-140',
        active ? 'bg-palm-100 font-semibold text-palm-700' : 'text-ink-700 hover:bg-sunken',
      )}
    >
      {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-palm-600" />}
      <FileText className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-palm-600' : 'text-ink-400')} strokeWidth={1.75} />
      <span className="truncate">{label}</span>
      <span className="tnum ml-auto font-mono text-[10.5px] text-ink-400">{count}</span>
    </button>
  )

  return (
    <div className="space-y-4">
      {/* S5 — compliance banner (only when something needs attention) */}
      {!bannerDismissed && attention > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line border-l-2 border-l-amber-600 bg-surface px-4 py-3">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" strokeWidth={1.75} />
          <p className="text-[13px] text-ink-900">
            <span className="tnum font-semibold text-amber-600">{attention} document{attention === 1 ? '' : 's'}</span>
            <span className="text-ink-700">
              {' '}
              {statusCounts.expired > 0
                ? `expired or expiring — ${statusCounts.expired} already expired`
                : 'expire within 45 days'}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('expiring')
              setTypeFilter('all')
            }}
            className="inline-flex h-8 items-center rounded-md border border-line-strong px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-sunken"
          >
            View
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium text-gold-600 transition-colors hover:bg-gold-100"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Draft renewal requests
          </button>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setBannerDismissed(true)}
            className="ml-auto rounded-md p-1.5 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      )}

      <div className="flex gap-5">
        {/* S1 — type rail (desktop) */}
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <div className="rounded-[10px] border border-line bg-surface p-2">
            <p className="px-2.5 pb-1.5 pt-1 text-micro font-semibold uppercase text-ink-500">Document type</p>
            {railItem('all', 'All documents', docs.length, typeFilter === 'all', () => setTypeFilter('all'))}
            {DOC_TYPES.map((t) =>
              railItem(t, t, typeCounts.get(t) ?? 0, typeFilter === t, () => setTypeFilter(t)),
            )}
          </div>
          <div className="mt-3 rounded-[10px] border border-line bg-surface p-2">
            <p className="px-2.5 pb-1.5 pt-1 text-micro font-semibold uppercase text-ink-500">Status</p>
            {statusFilters.map((s) =>
              railItem(s.key, s.label, s.count, statusFilter === s.key, () => setStatusFilter(s.key)),
            )}
          </div>
        </aside>

        {/* S2 — main */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex h-9 min-w-[240px] flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 focus-within:border-palm-600 md:max-w-[340px]">
              <Search className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Document, contact, deal…"
                className="h-full w-full bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
            </div>
            <PrimaryButton icon={Upload} className="ml-auto" onClick={() => setUploadOpen(true)}>
              Upload
            </PrimaryButton>
          </div>

          {/* mobile filter chips (rail hidden < lg) */}
          <div className="flex flex-wrap items-center gap-1.5 lg:hidden">
            <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} count={docs.length}>
              All
            </FilterChip>
            {DOC_TYPES.filter((t) => (typeCounts.get(t) ?? 0) > 0).map((t) => (
              <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} count={typeCounts.get(t) ?? 0}>
                {t}
              </FilterChip>
            ))}
          </div>

          {docsQ.isLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <DataTable<DocRow>
              columns={columns}
              data={filtered}
              rowKey={(d) => String(d.id)}
              total={filtered.length}
              emptyState={
                <EmptyState
                  icon={FolderOpen}
                  title={typeFilter === 'all' ? 'No documents yet' : `No ${typeFilter} documents`}
                  description="Upload files to the vault or change filters — APEX AI will auto-detect the type and suggest a linked record."
                  primaryCta={{ label: 'Upload', onClick: () => setUploadOpen(true) }}
                  secondaryCta={{
                    label: 'Clear filters',
                    onClick: () => {
                      setTypeFilter('all')
                      setStatusFilter('all')
                      setQuery('')
                    },
                  }}
                />
              }
            />
          )}
        </div>
      </div>
      <Toaster position="bottom-right" />

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">Upload document</h2>
              <p className="mt-1 text-[13px] text-ink-500">Add a file to the document vault.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">File name</label>
                <input
                  value={newDoc.name}
                  onChange={(e) => setNewDoc((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Passport_Arjun_Mehta.pdf"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Document type</label>
                <select
                  value={newDoc.docType}
                  onChange={(e) => setNewDoc((p) => ({ ...p, docType: e.target.value }))}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none focus:border-palm-600"
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Linked contact / deal (optional)</label>
                <input
                  value={newDoc.relatedName}
                  onChange={(e) => setNewDoc((p) => ({ ...p, relatedName: e.target.value }))}
                  placeholder="e.g. Arjun Mehta"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setUploadOpen(false); setNewDoc({ name: '', docType: DOC_TYPES[0], relatedName: '' }) }}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDoc}
                disabled={!newDoc.name.trim()}
                className="inline-flex h-9 items-center rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98] disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
