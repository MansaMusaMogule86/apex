/**
 * AI Governance Kit — design.md §8.8. Reuse verbatim on every page.
 * Every AI output carries: gold sparkle marker, confidence meter, source
 * citation chips, and Approve / Edit / Reject controls when an action leaves
 * the system.
 */
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles, Check, Pencil, X, MessageCircle, Mail, Database, FileText, Globe,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- AI badge ---------- */

export function AiBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1 rounded-full bg-gold-100 px-2',
        className,
      )}
    >
      <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
      <span className="text-[11px] font-bold leading-none text-gold-600">AI</span>
    </span>
  )
}

/* ---------- Confidence meter ---------- */

export function ConfidenceMeter({
  value,
  showLabel = true,
  className,
}: {
  /** 0–100 */
  value: number
  showLabel?: boolean
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="h-1 w-11 overflow-hidden rounded-full bg-gold-100">
        <span className="block h-full rounded-full bg-gold-500" style={{ width: `${pct}%` }} />
      </span>
      <span className="tnum font-mono text-[12.5px] font-medium leading-[18px] text-gold-600">
        {pct}%
      </span>
      {showLabel && <span className="text-[12px] text-ink-500">confidence</span>}
    </span>
  )
}

/* ---------- Source chips ---------- */

export type SourceKind = 'whatsapp' | 'email' | 'property-db' | 'dld' | 'document' | 'web' | 'note'

const sourceIcons: Record<SourceKind, { icon: LucideIcon; className: string }> = {
  whatsapp: { icon: MessageCircle, className: 'text-wa-green' },
  email: { icon: Mail, className: 'text-mail-slate' },
  'property-db': { icon: Database, className: 'text-ink-500' },
  dld: { icon: Globe, className: 'text-teal-600' },
  document: { icon: FileText, className: 'text-ink-500' },
  web: { icon: Globe, className: 'text-ink-500' },
  note: { icon: FileText, className: 'text-ink-400' },
}

export interface SourceChipItem {
  kind: SourceKind
  label: string
  /** excerpt shown on hover */
  excerpt?: string
}

export function SourceChips({ sources, className }: { sources: SourceChipItem[]; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1.5', className)}>
      {sources.map((s, i) => {
        const meta = sourceIcons[s.kind]
        const Icon = meta.icon
        return (
          <span
            key={`${s.label}-${i}`}
            title={s.excerpt ?? s.label}
            className="inline-flex h-[22px] cursor-default items-center gap-1.5 rounded-full bg-sunken px-2.5 text-[11.5px] text-ink-700 ring-1 ring-line"
          >
            <Icon className={cn('h-3 w-3', meta.className)} strokeWidth={1.75} />
            {s.label}
          </span>
        )
      })}
    </span>
  )
}

/* ---------- Approval card ---------- */

export interface ApprovalCardProps {
  /** e.g. "Draft reply to Arjun Mehta — pending approval" */
  title: string
  confidence: number
  sources?: SourceChipItem[]
  /** proposed text / action preview */
  children: ReactNode
  onApprove?: () => void
  onEdit?: () => void
  onReject?: () => void
  className?: string
}

export function ApprovalCard({
  title,
  confidence,
  sources,
  children,
  onApprove,
  onEdit,
  onReject,
  className,
}: ApprovalCardProps) {
  const [resolved, setResolved] = useState<null | 'approved' | 'rejected'>(null)

  const act = (kind: 'approved' | 'rejected', cb?: () => void) => {
    setResolved(kind)
    window.setTimeout(() => cb?.(), 240)
  }

  return (
    <AnimatePresence>
      {!resolved && (
        <motion.div
          layout
          exit={{ height: 0, opacity: 0, marginTop: 0, marginBottom: 0 }}
          transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className={cn('overflow-hidden', className)}
        >
          <div className="rounded-[10px] border border-line border-l-2 border-l-gold-500 bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-600" strokeWidth={1.75} />
              <p className="text-[13.5px] font-semibold text-ink-900">{title}</p>
              <ConfidenceMeter value={confidence} className="ml-auto" />
            </div>
            <div className="mt-3 rounded-lg bg-sunken p-3.5 text-[13.5px] leading-[22px] text-ink-900">
              {children}
            </div>
            {sources && sources.length > 0 && <SourceChips sources={sources} className="mt-3" />}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => act('approved', onApprove)}
                className="inline-flex items-center gap-1.5 rounded-md bg-palm-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-all duration-120 hover:bg-palm-700 active:scale-[0.98]"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                Approve &amp; send
              </button>
              <button
                type="button"
                onClick={() => onEdit?.()}
                className="inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => act('rejected', onReject)}
                className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium text-red-600 transition-colors duration-120 hover:bg-red-100 active:scale-[0.98]"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Reject
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ---------- AI summary block ---------- */

export function AiSummaryBlock({
  title = 'AI summary',
  confidence,
  bullets,
  sources,
  className,
}: {
  title?: string
  confidence?: number
  bullets: string[]
  sources?: SourceChipItem[]
  className?: string
}) {
  return (
    <div
      className={cn('rounded-[10px] p-4', className)}
      style={{ background: 'color-mix(in srgb, var(--gold-100) 40%, transparent)' }}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.75} />
        <p className="text-[13px] font-semibold text-ink-900">{title}</p>
        {confidence !== undefined && (
          <span className="tnum ml-auto font-mono text-[12px] font-medium text-gold-600">
            {confidence}%
          </span>
        )}
      </div>
      <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-ink-700">
        {bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      {sources && sources.length > 0 && <SourceChips sources={sources} className="mt-3" />}
    </div>
  )
}
