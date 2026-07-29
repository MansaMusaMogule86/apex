/**
 * Contact timeline — unified activity feed (relationships.md S2).
 * viewings, tasks and system events into one newest-first vertical timeline
 * with icon nodes, filter chips and expandable entries. Pending AI drafts
 * attach as gold approval cards (draft autonomy).
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MessageCircle, Mail, CalendarDays, ListChecks, Tag, ChevronDown,
  Sparkles, Star, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { ApprovalCard } from '@/components/app/AiKit'
import { StatusChip, PriorityChip, OverdueBadge } from '@/components/app/Chips'
import { SkeletonBlock } from '@/components/crm/shared'
import { agoToMinutes, formatDate } from '@/components/crm/shared.utils'
import type { ContactRow, ConversationRow, DraftRow, MessageRow, TaskRow, ViewingRow } from '@/components/crm/shared.types'

/* ------------------------------- entry model ------------------------------ */

type EntryKind = 'whatsapp' | 'email' | 'viewing' | 'task' | 'system'

interface TimelineEntry {
  id: string
  kind: EntryKind
  title: string
  body?: string
  agoLabel: string
  /** sort key — minutes since event; negative = upcoming */
  minutes: number
  conversationId?: number
  expandable?: boolean
  accent?: 'gold' | 'red'
  trailing?: React.ReactNode
}

const KIND_META: Record<EntryKind, { icon: LucideIcon; fg: string; bg: string; filter: string }> = {
  whatsapp: { icon: MessageCircle, fg: 'text-wa-green', bg: 'bg-wa-green/10', filter: 'WhatsApp' },
  email: { icon: Mail, fg: 'text-mail-slate', bg: 'bg-mail-slate/10', filter: 'Email' },
  viewing: { icon: CalendarDays, fg: 'text-palm-600', bg: 'bg-palm-100', filter: 'Viewings' },
  task: { icon: ListChecks, fg: 'text-ink-500', bg: 'bg-sunken', filter: 'Tasks' },
  system: { icon: Tag, fg: 'text-ink-400', bg: 'bg-sunken', filter: 'System' },
}

const FILTERS = ['All', 'WhatsApp', 'Email', 'Viewings', 'Tasks', 'System'] as const

/* ------------------------- lazy conversation bodies ----------------------- */

function ConversationMessages({ conversationId }: { conversationId: number }) {
  const { data: messages, isLoading } = trpc.apex.inbox.messages.useQuery({ conversationId })
  if (isLoading) return <SkeletonBlock className="h-16 w-full" />
  const rows: MessageRow[] = messages ?? []
  if (rows.length === 0)
    return <p className="text-[12.5px] text-ink-400">No messages synced.</p>
  return (
    <ul className="space-y-2">
      {rows.map((m) => (
        <li
          key={m.id}
          className={cn(
            'rounded-lg px-3 py-2 text-[12.5px] leading-[18px]',
            m.direction === 'in' ? 'bg-sunken text-ink-900' : 'bg-palm-50 text-ink-900 ring-1 ring-palm-100',
          )}
        >
          <p className="mb-0.5 flex items-center gap-2 text-[11px] font-medium text-ink-500">
            {m.senderName}
            <span className="text-ink-400">{m.direction === 'in' ? 'incoming' : 'sent'}</span>
            <span className="ml-auto font-mono text-[10.5px] text-ink-400">{m.ago}</span>
          </p>
          {m.body}
        </li>
      ))}
    </ul>
  )
}

function ConversationDraft({
  conversationId,
  contactName,
  onToast,
}: {
  conversationId: number
  contactName: string
  onToast: (message: string) => void
}) {
  const utils = trpc.useUtils()
  const { data: draft } = trpc.apex.inbox.draft.useQuery({ conversationId })
  const draftRow: DraftRow | undefined = draft
  const approve = trpc.apex.inbox.approveDraft.useMutation({
    onSuccess: () => {
      void utils.apex.inbox.draft.invalidate()
      void utils.apex.inbox.conversations.invalidate()
      onToast(`Reply sent on WhatsApp · ${contactName}`)
    },
  })
  const reject = trpc.apex.inbox.rejectDraft.useMutation({
    onSuccess: () => {
      void utils.apex.inbox.draft.invalidate()
      onToast('Draft rejected')
    },
  })
  if (!draftRow || draftRow.status !== 'pending') return null
  return (
    <div className="mt-3">
      <ApprovalCard
        title={`Draft reply to ${contactName} — pending approval`}
        confidence={draftRow.confidence}
        sources={draftRow.sources.map((s) => ({
          kind: s.toLowerCase().includes('whatsapp') ? ('whatsapp' as const) : s.toLowerCase().includes('email') ? ('email' as const) : s.toLowerCase().includes('dld') ? ('dld' as const) : ('property-db' as const),
          label: s,
        }))}
        onApprove={() => approve.mutate({ id: draftRow.id })}
        onReject={() => reject.mutate({ id: draftRow.id })}
      >
        {draftRow.body}
      </ApprovalCard>
    </div>
  )
}

/* --------------------------------- timeline ------------------------------- */

export default function ContactTimeline({
  contact,
  onToast,
  compact = false,
}: {
  contact: ContactRow
  onToast: (message: string) => void
  compact?: boolean
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [openIds, setOpenIds] = useState<Set<string>>(new Set())

  const { data: conversations, isLoading: convoLoading } = trpc.apex.inbox.conversations.useQuery()
  const { data: tasks, isLoading: tasksLoading } = trpc.apex.tasks.list.useQuery()
  const { data: viewings, isLoading: viewingsLoading } = trpc.apex.viewings.list.useQuery()
  const conversationRows = useMemo<ConversationRow[]>(() => conversations ?? [], [conversations])
  const taskRows = useMemo<TaskRow[]>(() => tasks ?? [], [tasks])
  const viewingRows = useMemo<ViewingRow[]>(() => viewings ?? [], [viewings])

  const entries = useMemo<TimelineEntry[]>(() => {
    const out: TimelineEntry[] = []
    const firstName = contact.name.split(' ')[0]!

    for (const c of conversationRows.filter((c) => c.contactId === contact.id)) {
      const kind: EntryKind = c.channel === 'whatsapp' ? 'whatsapp' : c.channel === 'email' ? 'email' : 'system'
      out.push({
        id: `convo-${c.id}`,
        kind,
        title: `${KIND_META[kind].filter} — ${c.preview}`,
        agoLabel: c.lastAgo,
        minutes: agoToMinutes(c.lastAgo),
        conversationId: c.id,
        expandable: true,
        trailing: (
          <span className="inline-flex items-center gap-1.5">
            {c.slaBreached && <StatusChip tone="red">{c.sla ?? 'SLA breached'}</StatusChip>}
            {c.aiDraftPending && (
              <StatusChip tone="gold" dot={false}>
                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                AI draft
              </StatusChip>
            )}
            {c.unread > 0 && (
              <span className="tnum inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 font-mono text-[10px] font-medium text-white">
                {c.unread}
              </span>
            )}
          </span>
        ),
      })
    }

    for (const v of viewingRows.filter((v) => v.contactId === contact.id)) {
      const completed = v.status === 'completed'
      out.push({
        id: `viewing-${v.id}`,
        kind: 'viewing',
        title: completed
          ? `Viewing completed — ${v.propertyName}`
          : `Viewing ${v.status} — ${v.propertyName} · ${v.dayLabel} ${v.timeLabel}`,
        body: completed
          ? [
              v.outcome ? `Outcome: ${v.outcome}` : null,
              v.feedback ? `“${v.feedback}”` : null,
              v.nextStep ? `Next step: ${v.nextStep}` : null,
            ]
              .filter(Boolean)
              .join(' · ')
          : `Scheduled with advisor · ${v.dayLabel} at ${v.timeLabel}`,
        agoLabel: completed ? v.dayLabel : `${v.dayLabel} ${v.timeLabel}`,
        minutes: completed ? 60 * 24 * 2 : -1,
        expandable: completed,
        trailing:
          completed && v.interestScore !== null ? (
            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-amber-600">
              <Star className="h-3 w-3 fill-amber-600" strokeWidth={1.75} />
              interest {v.interestScore}/10
            </span>
          ) : undefined,
      })
    }

    for (const t of taskRows.filter(
      (t) => t.relatedName?.includes(firstName) || (t.relatedType === 'contact' && t.relatedName === contact.name),
    )) {
      const p = t.priority === 'P1' ? 1 : t.priority === 'P2' ? 2 : 3
      out.push({
        id: `task-${t.id}`,
        kind: 'task',
        title: `${t.status === 'done' ? 'Task completed' : 'Task'} — ${t.title}`,
        body: `${t.relatedType ? `${t.relatedType}: ` : ''}${t.relatedName ?? ''} · due ${t.dueLabel}`,
        agoLabel: t.dueLabel,
        minutes: t.status === 'done' ? 60 * 24 : t.overdue ? -0.5 : 30,
        accent: t.overdue && t.status !== 'done' ? 'red' : undefined,
        trailing: (
          <span className="inline-flex items-center gap-1.5">
            <PriorityChip priority={p} />
            {t.overdue && t.status !== 'done' && <OverdueBadge />}
            {t.aiSuggested && (
              <StatusChip tone="gold" dot={false}>
                <Sparkles className="h-3 w-3" strokeWidth={1.75} />
                AI
              </StatusChip>
            )}
          </span>
        ),
      })
    }

    out.push({
      id: 'system-created',
      kind: 'system',
      title: `Created from ${contact.source} lead`,
      body: `Added to workspace · owner assigned · ${formatDate(contact.createdAt)}`,
      agoLabel: formatDate(contact.createdAt),
      minutes: Number.MAX_SAFE_INTEGER,
    })

    return out.sort((a, b) => a.minutes - b.minutes)
  }, [conversationRows, taskRows, viewingRows, contact])

  const visible = useMemo(
    () => entries.filter((e) => filter === 'All' || KIND_META[e.kind].filter === filter),
    [entries, filter],
  )

  if (convoLoading || tasksLoading || viewingsLoading) {
    return (
      <div className="space-y-3">
        <SkeletonBlock className="h-14 w-full" />
        <SkeletonBlock className="h-14 w-full" />
        <SkeletonBlock className="h-14 w-full" />
      </div>
    )
  }

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div>
      {/* filter chips */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'h-7 rounded-full px-3 text-[12px] font-medium transition-colors duration-120',
              filter === f ? 'bg-palm-100 text-palm-700' : 'bg-sunken text-ink-500 hover:text-ink-900',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="py-8 text-center text-[13px] text-ink-500">No {filter.toLowerCase()} activity yet.</p>
      )}

      {/* vertical timeline */}
      <ol className="relative">
        <motion.span
          aria-hidden
          className="absolute bottom-2 left-[13px] top-2 w-[2px] origin-top bg-line"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        />
        {visible.map((entry, i) => {
          const meta = KIND_META[entry.kind]
          const Icon = meta.icon
          const open = openIds.has(entry.id)
          return (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, delay: Math.min(i, 7) * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative pb-4 pl-9 last:pb-0"
            >
              <span
                className={cn(
                  'absolute left-0 top-0.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-surface',
                  meta.bg,
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', meta.fg)} strokeWidth={1.75} />
              </span>

              <div
                className={cn(
                  'rounded-[10px] border bg-surface px-3.5 py-2.5',
                  entry.accent === 'red' ? 'border-red-600/40' : 'border-line',
                )}
              >
                <button
                  type="button"
                  disabled={!entry.expandable}
                  onClick={() => entry.expandable && toggle(entry.id)}
                  className={cn(
                    'flex w-full items-start gap-2 text-left',
                    entry.expandable ? 'cursor-pointer' : 'cursor-default',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium leading-[18px] text-ink-900">
                      {entry.title}
                    </span>
                    {(!entry.expandable || open) && entry.body && (
                      <span className="mt-1 block text-[12.5px] leading-[18px] text-ink-500">{entry.body}</span>
                    )}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="tnum font-mono text-[11px] text-ink-400">{entry.agoLabel}</span>
                    {entry.expandable && (
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 text-ink-400 transition-transform duration-200',
                          open && 'rotate-180',
                        )}
                        strokeWidth={1.75}
                      />
                    )}
                  </span>
                </button>

                {entry.trailing && <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{entry.trailing}</div>}

                <AnimatePresence initial={false}>
                  {open && entry.conversationId !== undefined && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2.5 border-t border-line pt-2.5">
                        <ConversationMessages conversationId={entry.conversationId} />
                        <ConversationDraft
                          conversationId={entry.conversationId}
                          contactName={contact.name}
                          onToast={onToast}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          )
        })}
      </ol>

      {!compact && (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-ink-400">
          <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
          Timeline is auto-assembled from WhatsApp, email, viewings and tasks — AI drafts need your approval.
        </p>
      )}
    </div>
  )
}
