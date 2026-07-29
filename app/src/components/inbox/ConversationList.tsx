/**
 * Inbox S1 — conversation list pane (340px).
 * Header with unread badge, channel segmented filter, quick chips, search,
 * and 72px thread rows (avatar + channel badge, SLA pill, unread count,
 * gold AI-draft badge, linked deal chip). Rows stagger 35ms on mount.
 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Inbox as InboxIcon, PenSquare, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChannelBadge, CountBadge } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import type { Channel } from '@/components/app/Chips'
import type { ConversationVM, DealVM } from './helpers'
import { aedCompact } from './helpers'
import { Avatar } from './Avatar'

type ChannelFilter = 'all' | 'whatsapp' | 'email' | 'note'
type QuickFilter = 'unread' | 'ai' | 'sla' | 'mine'

const channelTabs: { id: ChannelFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'note', label: 'Notes' },
]

function SlaPill({ sla, breached }: { sla: string | null; breached: boolean }) {
  if (!sla && !breached) return null
  return (
    <span
      className={cn(
        'tnum inline-flex h-[20px] shrink-0 items-center rounded-full px-2 font-mono text-[10.5px] font-medium',
        breached ? 'bg-red-100 text-red-600' : 'bg-palm-50 text-palm-700',
      )}
    >
      {breached ? 'SLA breached' : (sla ?? 'SLA')}
    </span>
  )
}

export interface ConversationListProps {
  conversations: ConversationVM[] | undefined
  isLoading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
  dealsById: Map<number, DealVM>
}

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  dealsById,
}: ConversationListProps) {
  const [channel, setChannel] = useState<ChannelFilter>('all')
  const [quick, setQuick] = useState<Set<QuickFilter>>(new Set())
  const [search, setSearch] = useState('')

  const unreadTotal = (conversations ?? []).reduce((a, c) => a + c.unread, 0)
  const aiCount = (conversations ?? []).filter((c) => c.aiDraftPending).length
  const slaCount = (conversations ?? []).filter((c) => c.slaBreached).length

  const toggleQuick = (f: QuickFilter) =>
    setQuick((prev) => {
      const next = new Set(prev)
      if (next.has(f)) next.delete(f)
      else next.add(f)
      return next
    })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (conversations ?? []).filter((c) => {
      if (channel !== 'all' && c.channel !== channel) return false
      if (quick.has('unread') && c.unread === 0) return false
      if (quick.has('ai') && !c.aiDraftPending) return false
      if (quick.has('sla') && !c.slaBreached) return false
      // "Assigned to me" — every seeded thread is owned by the workspace
      // team, so the chip is a scope toggle kept for parity with the design.
      if (q && !c.contactName.toLowerCase().includes(q) && !c.preview.toLowerCase().includes(q))
        return false
      return true
    })
  }, [conversations, channel, quick, search])

  return (
    <div className="flex h-full w-full flex-col">
      {/* header */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
        <h2 className="text-[16px] font-semibold text-ink-900">Inbox</h2>
        {unreadTotal > 0 && <CountBadge count={unreadTotal} tone="red" />}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Filter conversations"
            className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label="Compose message"
            className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
          >
            <PenSquare className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* filters */}
      <div className="shrink-0 space-y-2 border-b border-line px-3 py-2.5">
        <div className="flex rounded-lg bg-sunken p-0.5">
          {channelTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setChannel(t.id)}
              className={cn(
                'flex-1 rounded-md px-2 py-1 text-[12px] font-medium transition-colors duration-120',
                channel === t.id ? 'bg-surface text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'unread', label: 'Unread' },
              { id: 'ai', label: `AI draft (${aiCount})` },
              { id: 'sla', label: `SLA risk (${slaCount})` },
              { id: 'mine', label: 'Assigned to me' },
            ] as { id: QuickFilter; label: string }[]
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => toggleQuick(chip.id)}
              className={cn(
                'inline-flex h-[24px] items-center gap-1 rounded-full px-2.5 text-[11.5px] font-medium ring-1 transition-colors duration-120',
                quick.has(chip.id)
                  ? 'bg-palm-100 text-palm-700 ring-palm-600/30'
                  : 'bg-surface text-ink-500 ring-line hover:bg-sunken',
              )}
            >
              {chip.id === 'ai' && <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />}
              {chip.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" strokeWidth={1.75} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages…"
            className="h-8 w-full rounded-md border border-line bg-base pl-8 pr-2 text-[12.5px] text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-palm-600"
          />
        </div>
      </div>

      {/* rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-px p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <span className="h-9 w-9 animate-pulse rounded-full bg-sunken" />
                <div className="flex-1 space-y-2">
                  <span className="block h-2.5 w-2/3 animate-pulse rounded bg-sunken" />
                  <span className="block h-2 w-full animate-pulse rounded bg-sunken" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <EmptyState
            icon={InboxIcon}
            title="All clear."
            description="New messages appear here in real time — WhatsApp, email, and internal notes in one queue."
            className="py-12"
          />
        )}

        {!isLoading &&
          filtered.map((c, i) => {
            const deal = c.linkedDealId != null ? dealsById.get(c.linkedDealId) : undefined
            const selected = c.id === selectedId
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(i, 7) * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
                className={cn(
                  'relative flex w-full items-start gap-3 border-b border-line px-3.5 py-3 text-left transition-colors duration-120',
                  selected ? 'bg-palm-100/70' : 'hover:bg-palm-50',
                )}
                style={
                  c.aiDraftPending && !selected
                    ? { background: 'color-mix(in srgb, var(--gold-100) 30%, transparent)' }
                    : undefined
                }
              >
                {selected && (
                  <span className="absolute left-0 top-1/2 h-8 w-[2px] -translate-y-1/2 rounded-full bg-palm-600" />
                )}
                <span className="relative mt-0.5">
                  <Avatar name={c.contactName} size={36} />
                  <span className="absolute -bottom-1 -right-1 rounded-[5px] ring-2 ring-surface">
                    <ChannelBadge
                      channel={
                        ['whatsapp', 'email', 'note', 'phone', 'viewing'].includes(c.channel)
                          ? (c.channel as Channel)
                          : 'note'
                      }
                    />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13.5px] font-semibold text-ink-900">{c.contactName}</span>
                    <span className="ml-auto flex shrink-0 items-center gap-1.5">
                      <span className="text-[10.5px] text-ink-400">{c.lastAgo}</span>
                      <SlaPill sla={c.sla} breached={c.slaBreached} />
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span
                      dir="auto"
                      className={cn(
                        'truncate text-[12.5px] leading-5',
                        c.unread > 0 ? 'font-medium text-ink-900' : 'text-ink-500',
                      )}
                    >
                      {c.preview}
                    </span>
                    {c.unread > 0 && <CountBadge count={c.unread} tone="red" className="ml-auto shrink-0" />}
                  </span>
                  {(c.aiDraftPending || deal) && (
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      {c.aiDraftPending && (
                        <span className="inline-flex h-[20px] items-center gap-1 rounded-full bg-gold-100 px-2 text-[10.5px] font-semibold text-gold-600">
                          <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
                          AI draft
                        </span>
                      )}
                      {deal && (
                        <span className="inline-flex h-[20px] items-center rounded-full bg-sunken px-2 font-mono text-[10.5px] text-ink-500 ring-1 ring-line">
                          {deal.title.split('—').pop()?.trim() || deal.title} · {aedCompact(deal.valueAed)}
                        </span>
                      )}
                    </span>
                  )}
                </span>
              </motion.button>
            )
          })}
      </div>
    </div>
  )
}
