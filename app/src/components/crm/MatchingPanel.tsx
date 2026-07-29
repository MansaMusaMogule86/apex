/**
 * Property Matching Panel — matching.md centerpiece.
 * ranked, explainable matches. Every score decomposes into the 7 PRD-weighted
 * segments (budget .30 · location .20 · type .15 · beds .10 · size .10 ·
 * timeline .05 · features .10), each with its own "why" line. All sends route
 * through AI approval cards (draft autonomy); dismissals train matching.
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BedDouble, Bath, Ruler, ChevronDown, ChevronUp, Check, X, Minus, Send,
  CalendarPlus, Bookmark, Sparkles, Bell, ChevronsUpDown, AlertTriangle,
  type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { PropertyStatusChip, StatusChip } from '@/components/app/Chips'
import { ApprovalCard } from '@/components/app/AiKit'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SkeletonBlock,
} from '@/components/crm/shared'
import { formatAed, formatAedCompact } from '@/components/crm/shared.utils'
import type { MatchResult, RequirementRow } from '@/components/crm/shared.types'

/* ------------------------- segment meta (PRD order) ----------------------- */

const SEG_COLORS: Record<string, string> = {
  budget: '#0B5D4A',
  location: '#C08A2D',
  type: '#5B6B7A',
  beds: '#C0563B',
  size: '#7A8C3F',
  timeline: '#8C6D4F',
  features: '#3FA984',
}

function segPoints(seg: MatchResult['segments'][number]): number {
  return Math.round(seg.weight * seg.got * 100)
}

/* -------------------------------- score ring ------------------------------ */

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = (size - 10) / 2
  const c = 2 * Math.PI * r
  const color = score >= 75 ? 'var(--palm-600)' : score >= 55 ? 'var(--gold-500)' : 'var(--ink-400)'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth={5} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - score / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum font-mono text-[19px] font-semibold leading-5 text-ink-900">{score}</span>
        <span className="text-[9.5px] font-medium text-ink-400">/100</span>
      </div>
    </div>
  )
}

/* ----------------------------- segmented bar ------------------------------ */

function SegmentedBar({
  segments,
  hoverKey,
  onHover,
}: {
  segments: MatchResult['segments']
  hoverKey: string | null
  onHover: (key: string | null) => void
}) {
  return (
    <div className="flex h-[7px] w-full gap-[2px] overflow-hidden rounded-full bg-sunken">
      {segments.map((seg, i) => {
        const earned = seg.weight * seg.got * 100
        if (earned <= 0.5) return null
        return (
          <motion.span
            key={seg.key}
            onMouseEnter={() => onHover(seg.key)}
            onMouseLeave={() => onHover(null)}
            initial={{ width: 0 }}
            whileInView={{ width: `${earned}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
            className={cn(
              'block h-full rounded-full transition-opacity duration-120',
              hoverKey && hoverKey !== seg.key && 'opacity-30',
            )}
            style={{ background: SEG_COLORS[seg.key] ?? 'var(--ink-400)' }}
            title={`${seg.label} · +${segPoints(seg)}`}
          />
        )
      })}
    </div>
  )
}

/* -------------------------------- why list -------------------------------- */

function WhyList({
  segments,
  hoverKey,
  onHover,
}: {
  segments: MatchResult['segments']
  hoverKey: string | null
  onHover: (key: string | null) => void
}) {
  return (
    <ul className="mt-2 space-y-1">
      {segments.map((seg) => {
        const pts = segPoints(seg)
        const state: 'hit' | 'partial' | 'miss' = seg.got >= 1 ? 'hit' : seg.got > 0 ? 'partial' : 'miss'
        const Icon: LucideIcon = state === 'hit' ? Check : state === 'partial' ? Minus : X
        return (
          <li
            key={seg.key}
            onMouseEnter={() => onHover(seg.key)}
            onMouseLeave={() => onHover(null)}
            className={cn(
              'flex items-start gap-2 rounded-md px-2 py-1.5 text-[12.5px] transition-colors duration-120',
              hoverKey === seg.key && 'bg-palm-50',
            )}
          >
            <span
              className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
              style={{ background: SEG_COLORS[seg.key] ?? 'var(--ink-400)' }}
            />
            <span className="w-[76px] shrink-0 font-medium text-ink-700">{seg.label}</span>
            <span
              className={cn(
                'mt-[1px] shrink-0',
                state === 'hit' ? 'text-palm-600' : state === 'partial' ? 'text-amber-600' : 'text-ink-400',
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1 leading-[18px] text-ink-500">{seg.why}</span>
            <span
              className={cn(
                'tnum shrink-0 font-mono text-[11.5px] font-medium',
                state === 'hit' ? 'text-palm-600' : state === 'partial' ? 'text-amber-600' : 'text-ink-400',
              )}
            >
              +{pts}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/* -------------------------------- match card ------------------------------ */

const DISMISS_REASONS = ['Too small', 'Already seen', 'Not serious', 'Price moved'] as const

function MatchCard({
  match,
  contactName,
  strong,
  sent,
  shortlisted,
  sending,
  onSend,
  onApproveSent,
  onBook,
  onShortlist,
  onDismiss,
}: {
  match: MatchResult
  contactName: string
  strong: boolean
  sent: boolean
  shortlisted: boolean
  sending: boolean
  onSend: () => void
  onApproveSent: () => void
  onBook: () => void
  onShortlist: () => void
  onDismiss: (reason: string) => void
}) {
  const [whyOpen, setWhyOpen] = useState(false)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const p = match.property
  const perSqft = p.sizeSqft > 0 ? Math.round(p.priceAed / p.sizeSqft) : 0

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        'rounded-[10px] border bg-surface p-3.5',
        strong ? 'border-line' : 'border-dashed border-line-strong',
      )}
    >
      <div className="flex flex-col gap-3.5 sm:flex-row">
        {/* photo */}
        <div className="relative shrink-0">
          <img
            src={p.image ?? undefined}
            alt={p.name}
            loading="lazy"
            className="h-[126px] w-full rounded-[10px] bg-sunken object-cover sm:w-[168px]"
          />
          <PropertyStatusChip status={p.offPlan ? 'Off-plan' : p.status} className="absolute left-2 top-2 shadow-sm" />
        </div>

        {/* middle facts */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink-900">{p.name}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
                {p.community} · {p.developer}
              </p>
            </div>
            {sent && (
              <StatusChip tone="palm" dot={false} className="ml-auto shrink-0">
                Sent
              </StatusChip>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.beds} BR
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.baths} BA
            </span>
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} /> {p.sizeSqft.toLocaleString()} sqft
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-sunken px-1.5 py-0.5 text-[11px] font-medium text-ink-700">
              {p.propertyType}
            </span>
          </div>

          <p className="mt-2">
            <span className="tnum font-mono text-[14px] font-semibold text-ink-900">{formatAed(p.priceAed)}</span>
            <span className="tnum ml-2 font-mono text-[10.5px] uppercase text-ink-400">
              AED {perSqft.toLocaleString()}/sqft
            </span>
          </p>

          {p.status === 'Under Offer' && (
            <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              <AlertTriangle className="h-3 w-3" strokeWidth={2} />
              Under offer elsewhere — act fast
            </p>
          )}

          {/* actions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={onSend}
              disabled={sent}
              className="inline-flex items-center gap-1.5 rounded-md bg-palm-600 px-3 py-1.5 text-[12px] font-semibold text-white transition-all duration-120 hover:bg-palm-700 active:scale-[0.98] disabled:opacity-45"
            >
              <Send className="h-3 w-3" strokeWidth={2} />
              {sent ? 'Sent to buyer' : 'Send to buyer'}
            </button>
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
            >
              <CalendarPlus className="h-3 w-3" strokeWidth={1.75} />
              Book viewing
            </button>
            <button
              type="button"
              onClick={onShortlist}
              aria-pressed={shortlisted}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors duration-120 active:scale-[0.98]',
                shortlisted
                  ? 'border-palm-600 bg-palm-50 text-palm-700'
                  : 'border-line-strong text-ink-700 hover:bg-sunken',
              )}
            >
              <Bookmark className={cn('h-3 w-3', shortlisted && 'fill-palm-600 text-palm-600')} strokeWidth={1.75} />
              {shortlisted ? 'Shortlisted' : 'Shortlist'}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-ink-500 transition-colors duration-120 hover:bg-sunken hover:text-red-600"
                >
                  Dismiss
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Why dismiss? (trains scoring)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DISMISS_REASONS.map((reason) => (
                  <DropdownMenuItem key={reason} onClick={() => onDismiss(reason)}>
                    {reason}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* score block */}
        <div className="w-full shrink-0 border-t border-line pt-3 sm:w-[212px] sm:border-l sm:border-t-0 sm:pl-3.5 sm:pt-0">
          <div className="flex items-center gap-3">
            <ScoreRing score={match.score} />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-500">Match score</p>
              <p className="mt-0.5 text-[11.5px] leading-4 text-ink-400">
                {strong ? 'Strong match' : 'Partial match'} · 7 factors
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <SegmentedBar segments={match.segments} hoverKey={hoverKey} onHover={setHoverKey} />
          </div>
          <button
            type="button"
            onClick={() => setWhyOpen((v) => !v)}
            aria-expanded={whyOpen}
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-palm-600 transition-colors hover:text-palm-700"
          >
            Why this matched
            {whyOpen ? (
              <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* why expandable */}
      <AnimatePresence initial={false}>
        {whyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 border-t border-line pt-1">
              <WhyList segments={match.segments} hoverKey={hoverKey} onHover={setHoverKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* inline AI draft approval after Send */}
      <AnimatePresence initial={false}>
        {sending && !sent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <ApprovalCard
                title={`Draft WhatsApp to ${contactName} — pending approval`}
                confidence={86}
                sources={[
                  { kind: 'property-db', label: 'Property DB' },
                  { kind: 'note', label: 'Buyer requirements' },
                ]}
                onApprove={onApproveSent}
              >
                Hi {contactName.split(' ')[0]} — this one fits your brief: {p.name} in {p.community},{' '}
                {p.beds}BR, {p.sizeSqft.toLocaleString()} sqft at {formatAedCompact(p.priceAed)}. It scored{' '}
                {match.score}/100 against your requirements. Want me to hold a viewing slot this week?
              </ApprovalCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

/* --------------------------------- panel ---------------------------------- */

type SortKey = 'score' | 'price-asc' | 'price-desc' | 'newest'

const SORT_LABELS: Record<SortKey, string> = {
  score: 'Match score',
  'price-asc': 'Price ↑',
  'price-desc': 'Price ↓',
  newest: 'Newest',
}

export default function MatchingPanel({
  contactId,
  contactName,
  onToast,
}: {
  contactId: number
  contactName: string
  onToast: (message: string) => void
}) {
  const { data, isLoading } = trpc.apex.matching.forContact.useQuery({ contactId })
  const { data: requirementData } = trpc.apex.contacts.requirement.useQuery({ contactId })
  const matchingRows: MatchResult[] = useMemo(() => data?.matches ?? [], [data])
  const [sort, setSort] = useState<SortKey>('score')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [showPartial, setShowPartial] = useState(false)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [shortlisted, setShortlisted] = useState<Set<number>>(new Set())
  const [sentIds, setSentIds] = useState<Set<number>>(new Set())
  const [sendingId, setSendingId] = useState<number | null>(null)

  const requirement: RequirementRow | null = requirementData ?? null

  const { strong, partial } = useMemo(() => {
    const all = matchingRows.filter((m) => !dismissed.has(m.property.id))
    const visible = onlyAvailable ? all.filter((m) => m.property.status === 'Available') : all
    const sorted = [...visible].sort((a, b) => {
      if (sort === 'price-asc') return a.property.priceAed - b.property.priceAed
      if (sort === 'price-desc') return b.property.priceAed - a.property.priceAed
      if (sort === 'newest')
        return new Date(b.property.createdAt).getTime() - new Date(a.property.createdAt).getTime()
      return b.score - a.score
    })
    return {
      strong: sorted.filter((m) => m.score >= 75),
      partial: sorted.filter((m) => m.score < 75),
    }
  }, [matchingRows, dismissed, onlyAvailable, sort])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonBlock className="h-10 w-full" />
        <SkeletonBlock className="h-[168px] w-full" />
        <SkeletonBlock className="h-[168px] w-full" />
      </div>
    )
  }

  /* No requirements yet — guided empty state (matching.md S4) */
  if (!requirement) {
    return (
      <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken">
          <Sparkles className="h-7 w-7 text-gold-600" strokeWidth={1.5} />
        </span>
        <h3 className="mt-4 text-[14px] font-semibold text-ink-900">
          Define what {contactName.split(' ')[0]} is looking for
        </h3>
        <p className="mt-1.5 max-w-[46ch] text-[13px] leading-5 text-ink-500">
          No buyer requirements on file yet. Capture budget, communities and must-haves — or let AI extract
          them from the conversation history with one click.
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onToast('AI extraction drafted 6 fields — review to confirm')}
            className="inline-flex items-center gap-1.5 rounded-md border border-gold-500/50 bg-gold-100 px-4 py-2 text-[13px] font-semibold text-gold-600 transition-colors duration-120 hover:bg-gold-100/70 active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Extract from conversation · 91% est.
          </button>
          <button
            type="button"
            onClick={() => onToast('Requirements form opened')}
            className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
          >
            Add manually
          </button>
        </div>
      </div>
    )
  }

  const dismiss = (m: MatchResult, reason: string) => {
    setDismissed((prev) => new Set(prev).add(m.property.id))
    setSendingId((id) => (id === m.property.id ? null : id))
    onToast(`Got it — "${reason}" noted, future matches adjusted`)
  }

  return (
    <div>
      {/* header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-[13px] text-ink-700">
          <span className="font-semibold text-ink-900">{strong.length} strong matches</span>
          <span className="text-ink-400"> · </span>
          {partial.length} partial
        </p>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-2.5 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                {SORT_LABELS[sort]}
                <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <DropdownMenuItem key={key} onClick={() => setSort(key)}>
                  <Check
                    className={cn('mr-2 h-3.5 w-3.5', sort === key ? 'text-palm-600 opacity-100' : 'opacity-0')}
                    strokeWidth={2}
                  />
                  {SORT_LABELS[key]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            role="switch"
            aria-checked={onlyAvailable}
            onClick={() => setOnlyAvailable((v) => !v)}
            className={cn(
              'inline-flex h-8 items-center gap-2 rounded-md border px-2.5 text-[12.5px] font-medium transition-colors',
              onlyAvailable ? 'border-palm-600 bg-palm-50 text-palm-700' : 'border-line-strong text-ink-700 hover:bg-sunken',
            )}
          >
            <span
              className={cn(
                'relative h-4 w-7 rounded-full transition-colors',
                onlyAvailable ? 'bg-palm-600' : 'bg-line-strong',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
                  onlyAvailable ? 'translate-x-3.5' : 'translate-x-0.5',
                )}
              />
            </span>
            Only available
          </button>
        </div>
      </div>

      {/* weight legend */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 rounded-[10px] border border-line bg-surface px-3.5 py-2.5">
        <span className="text-micro font-semibold uppercase text-ink-500">Scoring</span>
        {(requirement ? ['budget', 'location', 'type', 'beds', 'size', 'timeline', 'features'] : []).map((key) => {
          const labels: Record<string, string> = {
            budget: 'Budget', location: 'Location', type: 'Type', beds: 'Beds',
            size: 'Size', timeline: 'Timeline', features: 'Features',
          }
          const weights: Record<string, number> = {
            budget: 0.3, location: 0.2, type: 0.15, beds: 0.1, size: 0.1, timeline: 0.05, features: 0.1,
          }
          return (
            <span key={key} className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-500" title={`${labels[key]} weight ${weights[key]}`}>
              <span className="h-2 w-2 rounded-full" style={{ background: SEG_COLORS[key] }} />
              {labels[key]}
              <span className="tnum font-mono text-[10.5px] text-ink-400">{weights[key].toFixed(2)}</span>
            </span>
          )
        })}
      </div>

      {/* strong matches */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {strong.map((m) => (
            <MatchCard
              key={m.property.id}
              match={m}
              contactName={contactName}
              strong
              sent={sentIds.has(m.property.id)}
              shortlisted={shortlisted.has(m.property.id)}
              sending={sendingId === m.property.id}
              onSend={() => setSendingId(m.property.id)}
              onApproveSent={() => {
                setSentIds((prev) => new Set(prev).add(m.property.id))
                setSendingId(null)
                onToast(`Sent on WhatsApp · ${contactName}`)
              }}
              onBook={() => onToast(`Viewing request drafted · ${m.property.name}`)}
              onShortlist={() => {
                setShortlisted((prev) => {
                  const next = new Set(prev)
                  if (next.has(m.property.id)) next.delete(m.property.id)
                  else next.add(m.property.id)
                  return next
                })
                if (!shortlisted.has(m.property.id)) onToast(`Shortlisted for ${contactName}`)
              }}
              onDismiss={(reason) => dismiss(m, reason)}
            />
          ))}
        </AnimatePresence>

        {strong.length === 0 && (
          <div className="flex flex-col items-center rounded-[10px] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
            <h3 className="text-[14px] font-semibold text-ink-900">No strong matches in inventory</h3>
            <p className="mt-1.5 max-w-[44ch] text-[13px] leading-5 text-ink-500">
              Nothing scores 75+ against these requirements right now. Relax a constraint or set an alert for
              new listings.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {['+AED 500K budget', 'Add Business Bay'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onToast(`Suggestion applied — re-ranking matches`)}
                  className="rounded-full border border-line-strong px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-sunken"
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onToast('Alert created — you will be notified when a match lists')}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[12px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                <Bell className="h-3 w-3" strokeWidth={1.75} />
                Create alert
              </button>
            </div>
          </div>
        )}
      </div>

      {/* partial matches — collapsed */}
      {partial.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowPartial((v) => !v)}
            aria-expanded={showPartial}
            className="flex w-full items-center gap-2 rounded-[10px] border border-line bg-sunken px-3.5 py-2.5 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-line"
          >
            {showPartial ? (
              <ChevronUp className="h-3.5 w-3.5 text-ink-500" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-ink-500" strokeWidth={1.75} />
            )}
            {partial.length} partial matches below 75
            <span className="ml-auto font-mono text-[11px] text-ink-400">
              best {Math.max(...partial.map((m) => m.score))}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {showPartial && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  {partial.map((m) => (
                    <MatchCard
                      key={m.property.id}
                      match={m}
                      contactName={contactName}
                      strong={false}
                      sent={sentIds.has(m.property.id)}
                      shortlisted={shortlisted.has(m.property.id)}
                      sending={sendingId === m.property.id}
                      onSend={() => setSendingId(m.property.id)}
                      onApproveSent={() => {
                        setSentIds((prev) => new Set(prev).add(m.property.id))
                        setSendingId(null)
                        onToast(`Sent on WhatsApp · ${contactName}`)
                      }}
                      onBook={() => onToast(`Viewing request drafted · ${m.property.name}`)}
                      onShortlist={() => {
                        setShortlisted((prev) => {
                          const next = new Set(prev)
                          if (next.has(m.property.id)) next.delete(m.property.id)
                          else next.add(m.property.id)
                          return next
                        })
                        if (!shortlisted.has(m.property.id)) onToast(`Shortlisted for ${contactName}`)
                      }}
                      onDismiss={(reason) => dismiss(m, reason)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* learning note */}
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-400">
        <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
        Matching learns from your dismissals · manage in Automations
      </p>
    </div>
  )
}
