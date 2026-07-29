/**
 * Viewings — `/viewings` (viewings.md).
 * Week calendar strip (Mon–Sun columns, cards placed by dayLabel/timeLabel)
 * + list view toggle. Completed viewings expand to an outcome panel
 * (interestScore 1–10 meter, feedback, next step). Live data:
 * trpc.apex.viewings.list + trpc.apex.admin.team (advisor avatars).
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays, ChevronLeft, ChevronRight, ChevronDown, List, LayoutGrid,
  Plus, CalendarPlus, Flag, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { StatusChip } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  FilterChip, OutlineButton, PersonAvatar, PrimaryButton, SkeletonBlock,
  StaggerItem, ViewToggle,
} from '@/components/ops/OpsKit'

/* ---------------- types & constants ---------------- */

type ViewingRow = {
  id: number
  propertyId: number | null
  propertyName: string
  contactId: number | null
  contactName: string
  advisorId: number | null
  dayLabel: string
  timeLabel: string
  status: string
  outcome: string | null
  interestScore: number | null
  feedback: string | null
  nextStep: string | null
}

type ViewMode = 'week' | 'list'
type StatusFilter = 'all' | 'scheduled' | 'completed' | 'cancelled'

/** Seeded demo week — viewings.md S1 ("Week of 10–16 Mar 2025", today = Thu). */
const WEEK: { key: string; date: number; label: string }[] = [
  { key: 'Mon', date: 10, label: 'Mon 10 Mar' },
  { key: 'Tue', date: 11, label: 'Tue 11 Mar' },
  { key: 'Wed', date: 12, label: 'Wed 12 Mar' },
  { key: 'Thu', date: 13, label: 'Thu 13 Mar' },
  { key: 'Fri', date: 14, label: 'Fri 14 Mar' },
  { key: 'Sat', date: 15, label: 'Sat 15 Mar' },
  { key: 'Sun', date: 16, label: 'Sun 16 Mar' },
]
const TODAY_KEY = 'Thu'
const WEEK_LABELS = ['Week of 10–16 Mar 2025', 'Week of 17–23 Mar 2025', 'Week of 3–9 Mar 2025']

const statusMeta: Record<string, { bar: string; chip: 'palm' | 'teal' | 'red' | 'amber' | 'neutral'; label: string }> = {
  scheduled: { bar: 'bg-palm-600', chip: 'palm', label: 'Scheduled' },
  completed: { bar: 'bg-teal-600', chip: 'teal', label: 'Completed' },
  cancelled: { bar: 'bg-red-600', chip: 'red', label: 'No-show' },
}

/* ---------------- interest meter (1–10, design.md §8.6 palm fill) ---------------- */

function InterestMeter({ score, className }: { score: number; className?: string }) {
  const clamped = Math.max(0, Math.min(10, score))
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="flex items-center gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className={cn('h-3 w-[5px] rounded-[2px]', i < clamped ? 'bg-palm-600' : 'bg-sunken ring-1 ring-line')}
          />
        ))}
      </span>
      <span className="tnum font-mono text-[12px] font-medium text-ink-700">{clamped}/10</span>
    </span>
  )
}

/* ---------------- outcome panel (expandable, completed viewings) ---------------- */

function OutcomePanel({ viewing }: { viewing: ViewingRow }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-2.5 space-y-2 rounded-lg bg-sunken p-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-micro font-semibold uppercase text-ink-500">Interest</span>
          {viewing.interestScore !== null ? (
            <InterestMeter score={viewing.interestScore} />
          ) : (
            <span className="text-[12px] text-ink-400">—</span>
          )}
          {viewing.outcome && (
            <StatusChip tone="teal" dot={false} className="ml-auto">
              {viewing.outcome}
            </StatusChip>
          )}
        </div>
        {viewing.feedback && (
          <p className="text-[12.5px] leading-5 text-ink-700">
            <span className="font-semibold text-ink-900">Feedback · </span>
            {viewing.feedback}
          </p>
        )}
        {viewing.nextStep && (
          <p className="flex items-start gap-1.5 text-[12.5px] leading-5 text-ink-700">
            <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-palm-600" strokeWidth={1.75} />
            <span>
              <span className="font-semibold text-ink-900">Next step · </span>
              {viewing.nextStep}
            </span>
          </p>
        )}
      </div>
    </motion.div>
  )
}

/* ---------------- week-view event card ---------------- */

function ViewingCard({
  viewing,
  advisor,
  expanded,
  onToggle,
}: {
  viewing: ViewingRow
  advisor?: { name: string; initials: string }
  expanded: boolean
  onToggle: () => void
}) {
  const meta = statusMeta[viewing.status] ?? statusMeta.scheduled!
  const isCompleted = viewing.status === 'completed'
  return (
    <div
      className={cn(
        'group relative rounded-lg border border-line bg-surface pl-3 pr-2.5 pt-2 pb-2 transition-shadow duration-120',
        'hover:shadow-e1',
        isCompleted && 'cursor-pointer',
      )}
    >
      {/* colored status bar (3px left) */}
      <span className={cn('absolute inset-y-0 left-0 w-[3px] rounded-l-lg', meta.bar)} />
      <button
        type="button"
        onClick={isCompleted ? onToggle : undefined}
        className={cn('block w-full text-left', !isCompleted && 'cursor-default')}
      >
        <div className="flex items-center gap-1.5">
          <span className="tnum font-mono text-[11px] font-medium text-ink-500">{viewing.timeLabel}</span>
          <StatusChip tone={meta.chip} dot={false} className="h-[18px] px-1.5 text-[10px]">
            {meta.label}
          </StatusChip>
          {isCompleted && (
            <ChevronDown
              className={cn('ml-auto h-3.5 w-3.5 text-ink-400 transition-transform duration-180', expanded && 'rotate-180')}
              strokeWidth={1.75}
            />
          )}
        </div>
        <p className="mt-1 truncate text-[12.5px] font-semibold leading-4 text-ink-900">{viewing.contactName}</p>
        <p className="mt-0.5 truncate text-[11.5px] leading-4 text-ink-500">{viewing.propertyName}</p>
        <div className="mt-1.5 flex items-center justify-between">
          {isCompleted && viewing.interestScore !== null ? (
            <span className="tnum font-mono text-[10.5px] font-medium text-palm-700">
              ★ {viewing.interestScore}/10
            </span>
          ) : (
            <span />
          )}
          {advisor && <PersonAvatar name={advisor.name} initialsOverride={advisor.initials} size={16} />}
        </div>
      </button>
      <AnimatePresence>{expanded && isCompleted && <OutcomePanel viewing={viewing} />}</AnimatePresence>
    </div>
  )
}

/* ---------------- page ---------------- */

export default function Viewings() {
  const [mode, setMode] = useState<ViewMode>('week')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [weekOffset, setWeekOffset] = useState(0)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [newViewing, setNewViewing] = useState({ contactName: '', propertyName: '', dateTime: '', status: 'scheduled' })

  const viewingsQ = trpc.apex.viewings.list.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const createViewing = trpc.apex.viewings.create.useMutation()

  const advisorById = useMemo(() => {
    const map = new Map<number, { name: string; initials: string }>()
    for (const m of teamQ.data ?? []) map.set(m.id, { name: m.name, initials: m.initials })
    return map
  }, [teamQ.data])

  const filtered = useMemo(() => {
    const rows = (viewingsQ.data ?? []) as ViewingRow[]
    const byStatus = statusFilter === 'all' ? rows : rows.filter((v) => v.status === statusFilter)
    return [...byStatus].sort((a, b) => a.timeLabel.localeCompare(b.timeLabel))
  }, [viewingsQ.data, statusFilter])

  const byDay = useMemo(() => {
    const map = new Map<string, ViewingRow[]>()
    for (const d of WEEK) map.set(d.key, [])
    for (const v of filtered) {
      const key = WEEK.some((d) => d.key === v.dayLabel) ? v.dayLabel : 'Sat'
      map.get(key)!.push(v)
    }
    return map
  }, [filtered])

  const stats = useMemo(() => {
    const rows = (viewingsQ.data ?? []) as ViewingRow[]
    const live = rows.filter((v) => v.status !== 'cancelled')
    const completed = rows.filter((v) => v.status === 'completed')
    const scores = completed.map((v) => v.interestScore).filter((s): s is number => s !== null)
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    return {
      total: live.length,
      completion: rows.length ? Math.round((completed.length / rows.length) * 100) : 0,
      avg,
    }
  }, [viewingsQ.data])

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const isLoading = viewingsQ.isLoading
  const weekLabel = WEEK_LABELS[weekOffset] ?? WEEK_LABELS[0]!

  const submitNewViewing = async () => {
    if (!newViewing.contactName.trim() || !newViewing.propertyName.trim()) return
    const scheduledAt = newViewing.dateTime
      ? new Date(newViewing.dateTime).toISOString()
      : new Date(Date.now() + 30 * 60 * 1000).toISOString()

    try {
      await createViewing.mutateAsync({
        contactName: newViewing.contactName.trim(),
        propertyName: newViewing.propertyName.trim(),
        scheduledAt,
        status: newViewing.status,
      })
      setScheduleDialogOpen(false)
      setNewViewing({ contactName: '', propertyName: '', dateTime: '', status: 'scheduled' })
      toast.success(`Viewing scheduled for ${newViewing.contactName.trim()}`)
    } catch {
      toast.error('Could not schedule viewing. Please try again.')
    }
  }

  const toggleOptions: { value: ViewMode; label: string; icon: LucideIcon }[] = [
    { value: 'week', label: 'Week', icon: LayoutGrid },
    { value: 'list', label: 'List', icon: List },
  ]

  return (
    <div className="space-y-4">
      {/* toolbar — viewings.md shell */}
      <div className="flex flex-wrap items-center gap-2.5">
        <ViewToggle options={toggleOptions} value={mode} onChange={setMode} />
        <div className="flex items-center gap-1 rounded-lg border border-line bg-surface px-1 py-0.5">
          <button
            type="button"
            aria-label="Previous week"
            onClick={() => setWeekOffset((o) => Math.min(2, o + 1) % 3)}
            className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <span className="px-1 text-[12.5px] font-medium text-ink-900">{weekLabel}</span>
          <button
            type="button"
            aria-label="Next week"
            onClick={() => setWeekOffset((o) => (o + 1) % 3)}
            className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <OutlineButton onClick={() => setWeekOffset(0)} className="h-8 px-3 text-[12.5px]">
          Today
        </OutlineButton>
        <div className="mx-1 hidden h-5 w-px bg-line md:block" />
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'scheduled', 'completed', 'cancelled'] as StatusFilter[]).map((s) => (
            <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : (statusMeta[s]?.label ?? s)}
            </FilterChip>
          ))}
        </div>
        <PrimaryButton icon={Plus} onClick={() => setScheduleDialogOpen(true)} className="ml-auto">
          Schedule viewing
        </PrimaryButton>
      </div>

      {/* body */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBlock className="h-9 w-full" />
              <SkeletonBlock className="h-24 w-full" />
              <SkeletonBlock className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[10px] border border-line bg-surface">
          <EmptyState
            icon={CalendarDays}
            title="No viewings scheduled"
            description="Nothing on the calendar for this filter — schedule a viewing or sync a connected calendar."
            primaryCta={{ label: 'Schedule viewing', onClick: () => setScheduleDialogOpen(true) }}
            secondaryCta={{ label: 'Sync calendar', onClick: () => undefined }}
          />
        </div>
      ) : mode === 'week' ? (
        /* S1 — week calendar strip */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          {WEEK.map((day, di) => {
            const items = byDay.get(day.key) ?? []
            const isToday = day.key === TODAY_KEY
            return (
              <div
                key={day.key}
                className={cn(
                  'flex min-h-[220px] flex-col rounded-[10px] border p-2',
                  isToday ? 'border-palm-100 bg-palm-50' : 'border-line bg-surface/60',
                )}
              >
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-micro font-semibold uppercase text-ink-500">{day.key}</span>
                  <span
                    className={cn(
                      'tnum flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold',
                      isToday ? 'bg-palm-600 text-white' : 'text-ink-700',
                    )}
                  >
                    {day.date}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  {items.map((v, i) => (
                    <StaggerItem key={v.id} index={di + i}>
                      <ViewingCard
                        viewing={v}
                        advisor={v.advisorId !== null ? advisorById.get(v.advisorId) : undefined}
                        expanded={expanded.has(v.id)}
                        onToggle={() => toggleExpand(v.id)}
                      />
                    </StaggerItem>
                  ))}
                  {items.length === 0 && (
                    <button
                      type="button"
                      className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line-strong text-ink-400 transition-colors duration-120 hover:border-palm-600/40 hover:bg-palm-50 hover:text-palm-700"
                    >
                      <CalendarPlus className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* S3 — list view grouped by day (sticky day headers) */
        <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
          {WEEK.map((day) => {
            const items = byDay.get(day.key) ?? []
            if (items.length === 0) return null
            return (
              <div key={day.key}>
                <div className="sticky top-14 z-10 flex items-center gap-2 border-b border-line bg-sunken px-4 py-2 shadow-[0_1px_0_var(--line)]">
                  <span className="text-[12px] font-semibold text-ink-900">{day.label}</span>
                  <span className="tnum font-mono text-[10.5px] text-ink-500">
                    · {items.length} viewing{items.length === 1 ? '' : 's'}
                  </span>
                </div>
                {items.map((v) => {
                  const meta = statusMeta[v.status] ?? statusMeta.scheduled!
                  const advisor = v.advisorId !== null ? advisorById.get(v.advisorId) : undefined
                  const isCompleted = v.status === 'completed'
                  const isOpen = expanded.has(v.id)
                  return (
                    <div key={v.id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        onClick={isCompleted ? () => toggleExpand(v.id) : undefined}
                        className={cn(
                          'grid w-full grid-cols-[52px_1.2fr_1.4fr_auto] items-center gap-3 px-4 py-2.5 text-left transition-colors duration-120 hover:bg-palm-50 md:grid-cols-[52px_1.1fr_1.4fr_1fr_auto_auto]',
                          !isCompleted && 'cursor-default',
                        )}
                      >
                        <span className="tnum font-mono text-[11.5px] font-medium text-ink-500">{v.timeLabel}</span>
                        <span className="truncate text-[13px] font-semibold text-ink-900">{v.contactName}</span>
                        <span className="truncate text-[12.5px] text-ink-500">{v.propertyName}</span>
                        <span className="hidden items-center gap-1.5 md:flex">
                          {advisor && (
                            <>
                              <PersonAvatar name={advisor.name} initialsOverride={advisor.initials} size={20} />
                              <span className="text-[12px] text-ink-500">{advisor.name.split(' ')[0]}</span>
                            </>
                          )}
                        </span>
                        <StatusChip tone={meta.chip} dot={false} className="hidden md:inline-flex">
                          {meta.label}
                        </StatusChip>
                        <span className="flex items-center justify-end gap-2">
                          {isCompleted && v.interestScore !== null && (
                            <InterestMeter score={v.interestScore} className="hidden lg:inline-flex" />
                          )}
                          {isCompleted && (
                            <ChevronDown
                              className={cn('h-3.5 w-3.5 text-ink-400 transition-transform duration-180', isOpen && 'rotate-180')}
                              strokeWidth={1.75}
                            />
                          )}
                        </span>
                      </button>
                      <AnimatePresence>
                        {isOpen && isCompleted && (
                          <div className="px-4 pb-3">
                            <OutcomePanel viewing={v} />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* S4 — stats footer strip */}
      {!isLoading && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-[13px] text-ink-700">
          <span>
            <span className="tnum font-semibold text-ink-900">{stats.total}</span> this week
          </span>
          <span>
            <span className="tnum font-semibold text-ink-900">{stats.completion}%</span> completion rate
          </span>
          <span>
            Avg interest{' '}
            <span className="tnum font-semibold text-ink-900">
              {stats.avg !== null ? `${stats.avg.toFixed(1)}/10` : '—'}
            </span>
          </span>
          <span>
            <span className="tnum font-semibold text-ink-900">6</span> offers followed viewings (MTD)
          </span>
        </div>
      )}

      <Toaster position="bottom-right" />

      {/* Schedule viewing modal */}
      {scheduleDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">Schedule viewing</h2>
              <p className="mt-1 text-[13px] text-ink-500">Add a viewing to the calendar. Fill in the details below.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Contact name</label>
                <input
                  value={newViewing.contactName}
                  onChange={(e) => setNewViewing((p) => ({ ...p, contactName: e.target.value }))}
                  placeholder="e.g. Ahmed Al Rashid"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Property name</label>
                <input
                  value={newViewing.propertyName}
                  onChange={(e) => setNewViewing((p) => ({ ...p, propertyName: e.target.value }))}
                  placeholder="e.g. Marina Gate 2BR"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Date / Time</label>
                <input
                  type="datetime-local"
                  value={newViewing.dateTime}
                  onChange={(e) => setNewViewing((p) => ({ ...p, dateTime: e.target.value }))}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Status</label>
                <select
                  value={newViewing.status}
                  onChange={(e) => setNewViewing((p) => ({ ...p, status: e.target.value }))}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none focus:border-palm-600"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setScheduleDialogOpen(false); setNewViewing({ contactName: '', propertyName: '', dateTime: '', status: 'scheduled' }) }}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewViewing}
                disabled={!newViewing.contactName.trim() || !newViewing.propertyName.trim()}
                className="inline-flex h-9 items-center rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98] disabled:opacity-50"
              >
                Schedule viewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
