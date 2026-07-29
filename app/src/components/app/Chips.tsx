/**
 * Chips & badges — design.md §8.7 with §3.3 semantic mapping.
 * Status chips: radius-full, 11.5px 600, tint bg + 600-shade text + 6px dot.
 */
import type { ReactNode } from 'react'
import { MessageCircle, Mail, StickyNote, Phone, CalendarDays, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- generic status chip ---------- */

type ChipTone = 'palm' | 'amber' | 'red' | 'neutral' | 'teal' | 'gold' | 'slate'

const toneClasses: Record<ChipTone, string> = {
  palm: 'bg-palm-100 text-palm-700',
  amber: 'bg-amber-100 text-amber-600',
  red: 'bg-red-100 text-red-600',
  neutral: 'bg-sunken text-ink-500',
  teal: 'bg-transparent text-teal-600 ring-1 ring-teal-600/40',
  gold: 'bg-gold-100 text-gold-600',
  slate: 'bg-sunken text-mail-slate',
}

const dotClasses: Record<ChipTone, string> = {
  palm: 'bg-palm-600',
  amber: 'bg-amber-600',
  red: 'bg-red-600',
  neutral: 'bg-ink-400',
  teal: 'bg-teal-600',
  gold: 'bg-gold-600',
  slate: 'bg-mail-slate',
}

export function StatusChip({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: ChipTone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-semibold',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[tone])} />}
      {children}
    </span>
  )
}

/** Property status chip — §3.3: Available palm · Under Offer amber · Sold neutral · Off-plan teal outline */
export function PropertyStatusChip({ status, className }: { status: string; className?: string }) {
  const map: Record<string, ChipTone> = {
    Available: 'palm',
    'Under Offer': 'amber',
    Sold: 'neutral',
    'Off-plan': 'teal',
  }
  return (
    <StatusChip tone={map[status] ?? 'neutral'} className={className}>
      {status}
    </StatusChip>
  )
}

/** Deal outcome chip — Won palm · Lost red */
export function OutcomeChip({ outcome, className }: { outcome: 'Won' | 'Lost' | string; className?: string }) {
  return (
    <StatusChip tone={outcome === 'Won' ? 'palm' : outcome === 'Lost' ? 'red' : 'neutral'} className={className}>
      {outcome}
    </StatusChip>
  )
}

/** Task priority chip — P1 red · P2 amber · P3 neutral */
export function PriorityChip({ priority, className }: { priority: 1 | 2 | 3; className?: string }) {
  const tones: Record<number, ChipTone> = { 1: 'red', 2: 'amber', 3: 'neutral' }
  return (
    <StatusChip tone={tones[priority]} dot={false} className={className}>
      P{priority}
    </StatusChip>
  )
}

/** Overdue badge — red text badge */
export function OverdueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-[18px] items-center rounded-full bg-red-100 px-2 text-[10px] font-bold uppercase tracking-wide text-red-600',
        className,
      )}
    >
      Overdue
    </span>
  )
}

/** Days-in-stage pill — ≤3d neutral · 4–7d amber · >7d red (§3.3) */
export function DaysInStagePill({ days, className }: { days: number; className?: string }) {
  const tone =
    days <= 3
      ? 'bg-sunken text-ink-500'
      : days <= 7
        ? 'bg-amber-100 text-amber-600'
        : 'bg-red-100 text-red-600'
  return (
    <span
      className={cn(
        'tnum inline-flex h-[20px] items-center rounded-full px-2 font-mono text-[10.5px] font-medium',
        tone,
        className,
      )}
    >
      {days}d in stage
    </span>
  )
}

/* ---------- channel badges (18px rounded square) ---------- */

export type Channel = 'whatsapp' | 'email' | 'note' | 'phone' | 'viewing'

const channelMeta: Record<Channel, { icon: LucideIcon; fg: string; bg: string; label: string }> = {
  whatsapp: { icon: MessageCircle, fg: 'text-wa-green', bg: 'bg-wa-green/10', label: 'WhatsApp' },
  email: { icon: Mail, fg: 'text-mail-slate', bg: 'bg-mail-slate/10', label: 'Email' },
  note: { icon: StickyNote, fg: 'text-ink-400', bg: 'bg-sunken', label: 'Internal note' },
  phone: { icon: Phone, fg: 'text-ink-500', bg: 'bg-sunken', label: 'Phone' },
  viewing: { icon: CalendarDays, fg: 'text-palm-600', bg: 'bg-palm-100', label: 'Viewing' },
}

export function ChannelBadge({ channel, className }: { channel: Channel; className?: string }) {
  const meta = channelMeta[channel]
  const Icon = meta.icon
  return (
    <span
      title={meta.label}
      className={cn(
        'inline-flex h-[18px] w-[18px] items-center justify-center rounded-[5px]',
        meta.bg,
        className,
      )}
    >
      <Icon className={cn('h-3 w-3', meta.fg)} strokeWidth={1.75} />
    </span>
  )
}

/* ---------- count badges (unread red / AI gold) ---------- */

export function CountBadge({
  count,
  tone = 'red',
  className,
}: {
  count: number | string
  /** red = unread counts · gold = AI pending */
  tone?: 'red' | 'gold'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 font-mono text-[10px] font-medium leading-none',
        tone === 'red' ? 'bg-red-600 text-white' : 'bg-gold-400 text-ink-900',
        className,
      )}
    >
      {count}
    </span>
  )
}

/** Sync/health dot — Connected palm · Degraded amber · Error red (§3.3) */
export function HealthDot({
  status,
  className,
}: {
  status: 'connected' | 'degraded' | 'error'
  className?: string
}) {
  const tone = status === 'connected' ? 'bg-palm-600' : status === 'degraded' ? 'bg-amber-600' : 'bg-red-600'
  return <span className={cn('inline-block h-1.5 w-1.5 rounded-full', tone, className)} />
}
