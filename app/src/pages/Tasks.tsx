/**
 * Tasks — `/tasks` (tasks.md).
 * List (DataTable) / board toggle over trpc.apex.tasks.list with summary
 * strip, filter chips (My tasks · Overdue · AI-suggested · Done), round
 * done-checkboxes wired to trpc.apex.tasks.toggle (+invalidate), priority
 * chips, related-record chips, assignee avatars, overdue escalation.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Check, Sparkles, LayoutList, Kanban, Plus, CheckCircle2, Zap, Users, Building2,
  Handshake, CalendarDays, FileText, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '@/components/app/DataTable'
import { OverdueBadge, PriorityChip } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import {
  FilterChip, PersonAvatar, PrimaryButton, StaggerItem, TableSkeleton, ViewToggle,
} from '@/components/ops/OpsKit'

/* ---------------- types ---------------- */

type TaskRow = {
  id: number
  title: string
  priority: string
  dueLabel: string
  status: string
  relatedType: string | null
  relatedName: string | null
  assigneeId: number | null
  aiSuggested: boolean
  overdue: boolean
}

type ViewMode = 'list' | 'board'
type Filter = 'all' | 'mine' | 'overdue' | 'ai' | 'done'

const relatedIcons: Record<string, LucideIcon> = {
  contact: Users,
  deal: Handshake,
  property: Building2,
  viewing: CalendarDays,
  document: FileText,
}

function parsePriority(p: string): 1 | 2 | 3 {
  const n = Number(p.replace(/\D/g, ''))
  return n === 1 ? 1 : n === 3 ? 3 : 2
}

/* ---------- round done-checkbox (tasks.md S2: hover ring palm, palm fill) ---------- */

function DoneCheckbox({
  done,
  pending,
  onToggle,
}: {
  done: boolean
  pending?: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-label={done ? 'Mark task open' : 'Mark task done'}
      aria-pressed={done}
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all duration-180',
        done
          ? 'border-palm-600 bg-palm-600 text-white'
          : 'border-line-strong bg-surface hover:border-palm-600 hover:ring-2 hover:ring-palm-100',
        pending && 'opacity-50',
      )}
    >
      {done && <Check className="h-3 w-3" strokeWidth={2.5} />}
    </button>
  )
}

/* ---------- related-record chip ---------- */

function RelatedChip({ type, name }: { type: string | null; name: string | null }) {
  if (!name) return <span className="text-[12px] text-ink-400">—</span>
  const Icon = relatedIcons[type ?? ''] ?? FileText
  return (
    <span className="inline-flex max-w-[260px] items-center gap-1.5 rounded-full bg-sunken py-0.5 pl-1.5 pr-2.5 text-[11.5px] text-ink-700 ring-1 ring-line">
      <Icon className="h-3 w-3 shrink-0 text-ink-500" strokeWidth={1.75} />
      <span className="truncate">{name}</span>
    </span>
  )
}

/* ---------- task title with AI sparkle ---------- */

function TaskTitle({ task }: { task: TaskRow }) {
  const done = task.status === 'done'
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span
        className={cn(
          'truncate text-[13.5px] font-medium transition-colors duration-200',
          done ? 'text-ink-400 line-through' : 'text-ink-900',
        )}
      >
        {task.title}
      </span>
      {task.aiSuggested && (
        <span title="Created by APEX AI · draft autonomy">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-600" strokeWidth={1.75} />
        </span>
      )}
    </span>
  )
}

/* ---------------- page ---------------- */

export default function Tasks() {
  const [mode, setMode] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<Filter>('all')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'P2', dueLabel: '' })

  const tasksQ = trpc.apex.tasks.list.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const utils = trpc.useUtils()

  const toggleM = trpc.apex.tasks.toggle.useMutation({
    onSettled: () => utils.apex.tasks.list.invalidate(),
  })

  const tasks = useMemo(() => (tasksQ.data ?? []) as TaskRow[], [tasksQ.data])
  const memberById = useMemo(() => {
    const map = new Map<number, { name: string; initials: string; isCurrent: boolean }>()
    for (const m of teamQ.data ?? []) map.set(m.id, { name: m.name, initials: m.initials, isCurrent: m.isCurrent })
    return map
  }, [teamQ.data])
  const currentId = useMemo(() => (teamQ.data ?? []).find((m: { isCurrent: boolean; id: number }) => m.isCurrent)?.id, [teamQ.data])

  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'done')
    return {
      dueToday: open.filter((t) => t.dueLabel.startsWith('Today')).length,
      overdue: open.filter((t) => t.overdue).length,
      done: tasks.filter((t) => t.status === 'done').length,
      ai: tasks.filter((t) => t.aiSuggested).length,
      mine: currentId ? open.filter((t) => t.assigneeId === currentId).length : 0,
      all: tasks.length,
    }
  }, [tasks, currentId])

  const filtered = useMemo(() => {
    let rows = tasks
    if (filter === 'mine' && currentId) rows = rows.filter((t) => t.assigneeId === currentId && t.status !== 'done')
    else if (filter === 'mine') rows = rows.filter((t) => t.status !== 'done')
    else if (filter === 'overdue') rows = rows.filter((t) => t.overdue && t.status !== 'done')
    else if (filter === 'ai') rows = rows.filter((t) => t.aiSuggested)
    else if (filter === 'done') rows = rows.filter((t) => t.status === 'done')
    // default order: overdue open → open by priority → done last
    const rank = (t: TaskRow) => (t.status === 'done' ? 2 : t.overdue ? 0 : 1)
    const prio = (t: TaskRow) => parsePriority(t.priority)
    return [...rows].sort((a, b) => rank(a) - rank(b) || prio(a) - prio(b) || a.dueLabel.localeCompare(b.dueLabel))
  }, [tasks, filter, currentId])

  const columns: Column<TaskRow>[] = [
    {
      key: 'done',
      header: '',
      width: 36,
      render: (t) => (
        <DoneCheckbox
          done={t.status === 'done'}
          pending={toggleM.isPending && toggleM.variables?.id === t.id}
          onToggle={() => toggleM.mutate({ id: t.id })}
        />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: 84,
      sortable: true,
      sortValue: (t) => parsePriority(t.priority),
      render: (t) => <PriorityChip priority={parsePriority(t.priority)} />,
    },
    {
      key: 'title',
      header: 'Task',
      sortable: true,
      sortValue: (t) => t.title,
      render: (t) => <TaskTitle task={t} />,
    },
    {
      key: 'related',
      header: 'Related',
      render: (t) => <RelatedChip type={t.relatedType} name={t.relatedName} />,
    },
    {
      key: 'due',
      header: 'Due',
      width: 150,
      render: (t) => {
        const isOverdue = t.overdue && t.status !== 'done'
        return (
          <span className="flex items-center gap-2">
            <span className={cn('tnum font-mono text-[12px]', isOverdue ? 'font-semibold text-red-600' : 'text-ink-500')}>
              {t.dueLabel}
            </span>
            {isOverdue && <OverdueBadge />}
          </span>
        )
      },
    },
    {
      key: 'assignee',
      header: 'Owner',
      width: 72,
      render: (t) => {
        const m = t.assigneeId !== null ? memberById.get(t.assigneeId) : undefined
        return m ? <PersonAvatar name={m.name} initialsOverride={m.initials} size={24} /> : null
      },
    },
  ]

  const boardColumns = useMemo(() => {
    const open = filtered.filter((t) => t.status !== 'done')
    return [
      { key: 'todo', label: 'To do', hint: null as string | null, rows: open.filter((t) => !t.overdue) },
      { key: 'overdue', label: 'Overdue', hint: 'Needs attention', rows: open.filter((t) => t.overdue) },
      { key: 'done', label: 'Done', hint: null, rows: filtered.filter((t) => t.status === 'done') },
    ]
  }, [filtered])

  const isLoading = tasksQ.isLoading

  const submitNewTask = () => {
    if (!newTask.title.trim()) return
    const taskRow = {
      id: Date.now(),
      title: newTask.title.trim(),
      priority: newTask.priority,
      dueLabel: newTask.dueLabel || 'Today',
      status: 'open',
      relatedType: null,
      relatedName: null,
      assigneeId: null,
      aiSuggested: false,
      overdue: false,
    }
    const existing = (window as Window & { __mockTasksCache?: TaskRow[] }).__mockTasksCache ?? []
    existing.push(taskRow)
    ;(window as Window & { __mockTasksCache?: TaskRow[] }).__mockTasksCache = existing
    setTaskDialogOpen(false)
    setNewTask({ title: '', priority: 'P2', dueLabel: '' })
    toast.success(`Task "${taskRow.title}" created`)
  }

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <ViewToggle
          options={[
            { value: 'list', label: 'List', icon: LayoutList },
            { value: 'board', label: 'Board', icon: Kanban },
          ]}
          value={mode}
          onChange={setMode}
        />
        <div className="mx-1 hidden h-5 w-px bg-line md:block" />
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} count={counts.all}>
            All
          </FilterChip>
          <FilterChip active={filter === 'mine'} onClick={() => setFilter('mine')} count={counts.mine}>
            My tasks
          </FilterChip>
          <FilterChip active={filter === 'overdue'} onClick={() => setFilter('overdue')} count={counts.overdue} tone="red">
            Overdue
          </FilterChip>
          <FilterChip active={filter === 'ai'} onClick={() => setFilter('ai')} count={counts.ai} tone="gold">
            AI-suggested
          </FilterChip>
          <FilterChip active={filter === 'done'} onClick={() => setFilter('done')} count={counts.done}>
            Done
          </FilterChip>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setTaskDialogOpen(true)} className="ml-auto">
          Task
        </PrimaryButton>
      </div>

      {/* S1 — summary strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[10px] border border-line bg-surface px-4 py-3 text-[13px] text-ink-700">
        <span>
          Due today <span className="tnum font-semibold text-ink-900">{counts.dueToday}</span>
        </span>
        <span className="text-red-600">
          Overdue <span className="tnum font-semibold">{counts.overdue}</span>
        </span>
        <span>
          Done this week <span className="tnum font-semibold text-ink-900">{counts.done}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-gold-600">
          AI-created <span className="tnum font-semibold">{counts.ai}</span>
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
      </div>

      {/* S4 — escalation banner (dismissible; shows when overdue ≥ 5) */}
      {!bannerDismissed && counts.overdue >= 5 && (
        <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line border-l-2 border-l-red-600 bg-surface px-4 py-3">
          <p className="text-[13px] text-ink-900">
            <span className="tnum font-semibold text-red-600">{counts.overdue} overdue follow-ups</span>
            <span className="text-ink-500"> — </span>
            <Sparkles className="mb-0.5 inline h-3.5 w-3.5 text-gold-600" strokeWidth={1.75} />
            <span className="text-ink-700"> APEX can draft catch-up messages for them</span>
          </p>
          <Link
            to="/command"
            className="inline-flex h-8 items-center rounded-md border border-gold-500/50 px-3 text-[12.5px] font-medium text-gold-600 transition-colors hover:bg-gold-100"
          >
            Review drafts
          </Link>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            className="ml-auto rounded-md px-2 py-1 text-[12px] text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* body */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : mode === 'list' ? (
        <DataTable<TaskRow>
          columns={columns}
          data={filtered}
          rowKey={(t) => String(t.id)}
          emptyState={
            <EmptyState
              icon={CheckCircle2}
              title={filter === 'done' ? 'Nothing completed yet' : "You're caught up"}
              description={
                filter === 'done'
                  ? 'Completed tasks land here — check one off to build momentum.'
                  : 'No open tasks in this view. New follow-ups from APEX AI and automations will appear here first.'
              }
            />
          }
        />
      ) : (
        /* S3 — board view */
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {boardColumns.map((col) => (
            <div key={col.key} className="flex min-h-[240px] flex-col rounded-xl bg-sunken p-2.5">
              <div className="flex items-center gap-2 px-1.5 pb-2.5">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    col.key === 'overdue' ? 'bg-red-600' : col.key === 'done' ? 'bg-palm-600' : 'bg-ink-400',
                  )}
                />
                <span className="text-[13px] font-semibold text-ink-900">{col.label}</span>
                <span className="tnum font-mono text-[10.5px] text-ink-500">{col.rows.length}</span>
                {col.hint && <span className="ml-auto text-[10.5px] font-medium text-red-600">{col.hint}</span>}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {col.rows.map((t, i) => {
                  const m = t.assigneeId !== null ? memberById.get(t.assigneeId) : undefined
                  return (
                    <StaggerItem key={t.id} index={i}>
                      <div className="rounded-[10px] border border-line bg-surface p-3 transition-shadow duration-120 hover:shadow-e1">
                        <div className="flex items-start gap-2">
                          <DoneCheckbox
                            done={t.status === 'done'}
                            pending={toggleM.isPending && toggleM.variables?.id === t.id}
                            onToggle={() => toggleM.mutate({ id: t.id })}
                          />
                          <TaskTitle task={t} />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <PriorityChip priority={parsePriority(t.priority)} />
                          <RelatedChip type={t.relatedType} name={t.relatedName} />
                        </div>
                        <div className="mt-2.5 flex items-center gap-2">
                          {m && <PersonAvatar name={m.name} initialsOverride={m.initials} size={20} />}
                          <span
                            className={cn(
                              'tnum ml-auto rounded-full px-2 py-0.5 font-mono text-[10.5px]',
                              t.overdue && t.status !== 'done' ? 'bg-red-100 font-semibold text-red-600' : 'bg-sunken text-ink-500',
                            )}
                          >
                            {t.dueLabel}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  )
                })}
                {col.rows.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line-strong py-8 text-[12px] text-ink-400">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* S4 — automation stub row */}
      {!isLoading && (
        <Link
          to="/automations"
          className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface px-4 py-3 text-[13px] text-ink-700 transition-colors duration-120 hover:bg-palm-50"
        >
          <Zap className="h-4 w-4 text-palm-600" strokeWidth={1.75} />
          <span>
            Auto-create follow-up task 2 days after viewing — <span className="font-semibold text-palm-700">Active</span>
            <span className="tnum text-ink-500"> · 42 runs</span>
          </span>
        </Link>
      )}

      <Toaster position="bottom-right" />

      {/* New task modal */}
      {taskDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">New task</h2>
              <p className="mt-1 text-[13px] text-ink-500">Create a new task. Assign priority and a due date.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Title</label>
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Follow up with Ahmed"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none focus:border-palm-600"
                >
                  <option value="P1">P1 — High</option>
                  <option value="P2">P2 — Medium</option>
                  <option value="P3">P3 — Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Due date</label>
                <input
                  value={newTask.dueLabel}
                  onChange={(e) => setNewTask((p) => ({ ...p, dueLabel: e.target.value }))}
                  placeholder="e.g. Today, Tomorrow, 25 Mar"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setTaskDialogOpen(false); setNewTask({ title: '', priority: 'P2', dueLabel: '' }) }}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewTask}
                disabled={!newTask.title.trim()}
                className="inline-flex h-9 items-center rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98] disabled:opacity-50"
              >
                Add task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
