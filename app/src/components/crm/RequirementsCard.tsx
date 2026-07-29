/**
 * Requirements card — buyer requirement panel (design.md §6).
 * Read mode: field grid with gold provenance dots on AI-extracted fields,
 * confidence + version. Edit mode (local state): adjust budget/beds/size and
 * community / must-have chips. Footer: collapsed PRD scoring weights + palm
 * "View ranked matches" CTA.
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Pencil, Plus, Sparkles, X, Check } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { AiBadge, ConfidenceMeter } from '@/components/app/AiKit'
import { SkeletonBlock } from '@/components/crm/shared'
import { formatAed } from '@/components/crm/shared.utils'
import type { RequirementRow } from '@/components/crm/shared.types'

/* AI-extracted provenance (design: "2 fields AI-extracted", gold dot + tooltip) */
const AI_EXTRACTED: Record<string, { source: string; confidence: number }> = {
  mustHaves: { source: 'WhatsApp · 3 msgs', confidence: 91 },
  communities: { source: 'Email · Marina thread', confidence: 88 },
}

function Field({
  label,
  fieldKey,
  children,
}: {
  label: string
  fieldKey?: string
  children: React.ReactNode
}) {
  const ai = fieldKey ? AI_EXTRACTED[fieldKey] : undefined
  return (
    <div>
      <p className="flex items-center gap-1.5 text-micro font-semibold uppercase text-ink-500">
        {label}
        {ai && (
          <span
            title={`AI-extracted · ${ai.source} · ${ai.confidence}% confidence`}
            className="h-1.5 w-1.5 rounded-full bg-gold-500"
          />
        )}
      </p>
      <div className="mt-1.5 text-[13px] leading-5 text-ink-900">{children}</div>
    </div>
  )
}

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode
  onRemove?: () => void
}) {
  return (
    <span className="inline-flex h-[24px] items-center gap-1 rounded-full bg-sunken px-2.5 text-[12px] font-medium text-ink-700 ring-1 ring-line">
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="rounded-full text-ink-400 transition-colors hover:text-red-600"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      )}
    </span>
  )
}

const COMPLETION_LABEL: Record<string, string> = {
  ready: 'Ready · or handover ≤ 6 months',
  'off-plan': 'Off-plan',
  any: 'Any completion',
}

const WEIGHTS: { key: string; label: string; weight: number; color: string }[] = [
  { key: 'budget', label: 'Budget', weight: 0.3, color: '#0B5D4A' },
  { key: 'location', label: 'Location', weight: 0.2, color: '#C08A2D' },
  { key: 'type', label: 'Type', weight: 0.15, color: '#5B6B7A' },
  { key: 'beds', label: 'Beds', weight: 0.1, color: '#C0563B' },
  { key: 'size', label: 'Size', weight: 0.1, color: '#7A8C3F' },
  { key: 'timeline', label: 'Timeline', weight: 0.05, color: '#8C6D4F' },
  { key: 'features', label: 'Features', weight: 0.1, color: '#3FA984' },
]

export default function RequirementsCard({
  contactId,
  matchCount,
  onViewMatches,
  onToast,
}: {
  contactId: number
  matchCount?: number
  onViewMatches: () => void
  onToast: (message: string) => void
}) {
  const { data: req, isLoading } = trpc.apex.contacts.requirement.useQuery({ contactId })
  const [editing, setEditing] = useState(false)
  const [weightsOpen, setWeightsOpen] = useState(false)
  const [draft, setDraft] = useState<RequirementRow | null>(null)

  if (isLoading) return <SkeletonBlock className="h-[340px] w-full" />
  if (!req) return null

  const requirement: RequirementRow = req
  const shown: RequirementRow = editing && draft ? draft : requirement
  const aiFieldCount = Object.keys(AI_EXTRACTED).length

  const startEdit = () => {
    setDraft({ ...requirement, communities: [...requirement.communities], mustHaves: [...requirement.mustHaves], propertyTypes: [...requirement.propertyTypes] })
    setEditing(true)
  }

  const numInput = (value: number, onChange: (n: number) => void, width = 'w-[92px]') => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={cn(
        'tnum h-7 rounded-md border border-line-strong bg-surface px-2 font-mono text-[12px] text-ink-900',
        'transition-shadow duration-120 focus:border-palm-600 focus:outline-none',
        width,
      )}
    />
  )

  return (
    <section className="rounded-[10px] border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Buyer requirements</h2>
        <span title={`${aiFieldCount} fields AI-extracted from conversations`}>
          <AiBadge />
        </span>
        <span className="text-[11px] text-ink-400">v{req.version}</span>
        <div className="ml-auto flex items-center gap-2">
          <ConfidenceMeter value={req.confidence} showLabel={false} />
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
            >
              <Pencil className="h-3 w-3" strokeWidth={1.75} />
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                onToast('Requirements saved · matches re-ranked')
              }}
              className="inline-flex items-center gap-1 rounded-md bg-palm-600 px-2.5 py-1 text-[12px] font-semibold text-white transition-colors hover:bg-palm-700"
            >
              <Check className="h-3 w-3" strokeWidth={2} />
              Done
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 px-4 py-4 sm:grid-cols-2">
        <Field label="Budget range">
          {editing && draft ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {numInput(draft.budgetMin, (n) => setDraft({ ...draft, budgetMin: n }))}
              <span className="text-ink-400">–</span>
              {numInput(draft.budgetMax, (n) => setDraft({ ...draft, budgetMax: n }))}
            </span>
          ) : (
            <span className="tnum font-mono text-[13px]">
              {formatAed(shown.budgetMin)} – {formatAed(shown.budgetMax)}
            </span>
          )}
        </Field>

        <Field label="Communities" fieldKey="communities">
          <span className="flex flex-wrap gap-1.5">
            {shown.communities.map((c) => (
              <Chip
                key={c}
                onRemove={
                  editing && draft
                    ? () => setDraft({ ...draft, communities: draft.communities.filter((x) => x !== c) })
                    : undefined
                }
              >
                {c}
              </Chip>
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => {
                  const next = window.prompt('Add community')
                  if (next && draft) setDraft({ ...draft, communities: [...draft.communities, next] })
                }}
                className="inline-flex h-[24px] items-center gap-1 rounded-full border border-dashed border-line-strong px-2 text-[11.5px] font-medium text-ink-500 hover:border-palm-600 hover:text-palm-600"
              >
                <Plus className="h-3 w-3" strokeWidth={2} /> add
              </button>
            )}
          </span>
        </Field>

        <Field label="Property types">
          <span className="flex flex-wrap gap-1.5">
            {shown.propertyTypes.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </span>
        </Field>

        <Field label="Beds · Size">
          {editing && draft ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {numInput(draft.bedsMin, (n) => setDraft({ ...draft, bedsMin: n }), 'w-[56px]')}
              <span className="text-ink-400">–</span>
              {numInput(draft.bedsMax, (n) => setDraft({ ...draft, bedsMax: n }), 'w-[56px]')}
              <span className="text-ink-400">BR · ≥</span>
              {numInput(draft.sizeMin, (n) => setDraft({ ...draft, sizeMin: n }))}
              <span className="text-ink-400">sqft</span>
            </span>
          ) : (
            <span className="tnum font-mono text-[13px]">
              {shown.bedsMin}–{shown.bedsMax} BR · ≥ {shown.sizeMin.toLocaleString()} sqft
            </span>
          )}
        </Field>

        <Field label="Completion">
          {COMPLETION_LABEL[shown.completion] ?? shown.completion}
        </Field>

        <Field label="Purpose · Financing">
          <span className="capitalize">{shown.purpose}</span>
          <span className="text-ink-400"> · </span>
          <span className="capitalize">{shown.financing}</span>
        </Field>

        <Field label="Purchase timeline">
          {shown.timeline}
        </Field>

        <Field label="Must-haves" fieldKey="mustHaves">
          <span className="flex flex-wrap gap-1.5">
            {shown.mustHaves.map((m) => (
              <Chip
                key={m}
                onRemove={
                  editing && draft
                    ? () => setDraft({ ...draft, mustHaves: draft.mustHaves.filter((x) => x !== m) })
                    : undefined
                }
              >
                {m}
              </Chip>
            ))}
            {editing && (
              <button
                type="button"
                onClick={() => {
                  const next = window.prompt('Add must-have')
                  if (next && draft) setDraft({ ...draft, mustHaves: [...draft.mustHaves, next] })
                }}
                className="inline-flex h-[24px] items-center gap-1 rounded-full border border-dashed border-line-strong px-2 text-[11.5px] font-medium text-ink-500 hover:border-palm-600 hover:text-palm-600"
              >
                <Plus className="h-3 w-3" strokeWidth={2} /> add
              </button>
            )}
          </span>
        </Field>
      </div>

      {/* weight editor — collapsed */}
      <div className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => setWeightsOpen((v) => !v)}
          aria-expanded={weightsOpen}
          className="flex w-full items-center gap-2 text-[12px] font-medium text-ink-500 transition-colors hover:text-ink-900"
        >
          {weightsOpen ? (
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
          )}
          Scoring weights · advanced
          <span className="ml-auto font-mono text-[11px] text-ink-400">Σ 1.00</span>
        </button>
        <AnimatePresence initial={false}>
          {weightsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="overflow-hidden"
            >
              <ul className="mt-3 space-y-2">
                {WEIGHTS.map((w) => (
                  <li key={w.key} className="flex items-center gap-2.5">
                    <span className="w-[64px] text-[11.5px] text-ink-500">{w.label}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: w.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${w.weight * 100}%` }}
                        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                      />
                    </span>
                    <span className="tnum w-8 text-right font-mono text-[11px] text-ink-700">
                      {w.weight.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-400">
                <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
                PRD defaults — rebalancing applies to future re-ranks
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={onViewMatches}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-palm-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
        >
          View ranked matches{matchCount !== undefined ? ` (${matchCount})` : ''}
        </button>
      </div>
    </section>
  )
}
