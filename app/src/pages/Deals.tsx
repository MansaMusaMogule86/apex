/**
 * Deal Flow — `/deals` (deals.md).
 * 13-stage Buyer Sales kanban: 296px bg-sunken columns with stage dot, name,
 * count, Σ AED mono header; deal cards grouped by stage (design.md §8.5);
 * drag & drop via @dnd-kit with optimistic `apex.deals.moveStage` mutation,
 * Undo toast, Lost loss-reason AlertDialog, once-per-session Won confetti.
 * Toolbar: pipeline selector, Kanban/List toggle, owner/value/stage filters,
 * at-risk toggle, search, pipeline summary, + Deal. List view = DataTable.
 */
import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleAlert,
  Handshake,
  Kanban,
  Plus,
  Search,
  Table,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '@/components/app/DataTable'
import { EmptyState } from '@/components/app/EmptyState'
import { StatusChip, DaysInStagePill } from '@/components/app/Chips'
import { Toaster } from '@/components/ui/sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SortableDealCard, { DealCardView } from '@/components/deals/DealCard'
import { dealDragId, parseDealDragId } from '@/components/deals/drag'
import DealDrawer from '@/components/deals/DealDrawer'
import LostReasonDialog from '@/components/deals/LostReasonDialog'
import WonConfetti from '@/components/deals/WonConfetti'
import OwnerAvatar from '@/components/deals/OwnerAvatar'
import { useMoveStage } from '@/components/deals/useMoveStage'
import { pipelineStages } from '@/lib/demo-data'
import {
  LOST_STAGE,
  WON_STAGE,
  aedCompact,
  aedFull,
  ownerOf,
  stageChipTone,
  type DealRow,
  type PipelineStage,
  type TeamMemberRow,
} from '@/components/deals/utils'

/* ------------------------------ dnd helpers ----------------------------- */

function columnDroppableId(stage: string): string {
  return `col:${stage}`
}

function resolveDropStage(overId: string | number | null, deals: DealRow[]): string | null {
  if (overId == null) return null
  const id = String(overId)
  if (id.startsWith('col:')) return id.slice(4)
  const dealId = parseDealDragId(id)
  if (dealId != null) return deals.find((d) => d.id === dealId)?.stage ?? null
  return null
}

const DEAL_STAGE_SET = new Set<string>(pipelineStages)

function stageOrder(stages: PipelineStage[], stage: string): number {
  const index = stages.findIndex((s) => s === stage)
  return index >= 0 ? index : stages.length
}

function isPipelineStage(stage: string): stage is PipelineStage {
  return DEAL_STAGE_SET.has(stage)
}

/* ------------------------------ kanban column --------------------------- */

function BoardColumn({
  stage,
  deals,
  stages,
  team,
  highlight,
  pulse,
  onOpenDeal,
  onMoveSelect,
}: {
  stage: string
  deals: DealRow[]
  stages: string[]
  team: TeamMemberRow[] | undefined
  /** currently dragged-over target */
  highlight: boolean
  /** at-risk toggle entrance pulse */
  pulse: boolean
  onOpenDeal: (id: number) => void
  onMoveSelect: (deal: DealRow, stage: string) => void
}) {
  const [collapsed, setCollapsed] = useState(stage === LOST_STAGE)
  const { setNodeRef } = useDroppable({ id: columnDroppableId(stage), data: { stage } })
  const total = deals.reduce((s, d) => s + d.valueAed, 0)
  const isWon = stage === WON_STAGE
  const isLost = stage === LOST_STAGE

  return (
    <section
      className={cn(
        'flex max-h-full w-[296px] shrink-0 flex-col rounded-xl bg-sunken transition-colors duration-180',
        highlight && 'bg-palm-50 outline-dashed outline-2 -outline-offset-4 outline-palm-600/50',
      )}
      aria-label={`${stage} column, ${deals.length} deals`}
    >
      <header className="flex items-center gap-2 px-3 pb-2 pt-3">
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            isWon ? 'bg-palm-600' : isLost ? 'bg-red-600' : 'bg-palm-600',
          )}
        />
        <h2
          className={cn(
            'truncate text-[13px] font-semibold leading-5',
            isWon ? 'text-palm-700' : isLost ? 'text-red-600' : 'text-ink-900',
          )}
        >
          {isWon ? 'Won (MTD)' : stage}
        </h2>
        <span className="tnum font-mono text-[11px] text-ink-500">{deals.length}</span>
        <span className="tnum ml-auto font-mono text-[11.5px] font-medium text-ink-700">
          {aedCompact(total)}
        </span>
        <button
          type="button"
          aria-label={collapsed ? `Expand ${stage}` : `Collapse ${stage}`}
          onClick={() => setCollapsed((v) => !v)}
          className="rounded p-0.5 text-ink-400 transition-colors hover:bg-surface hover:text-ink-900"
        >
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-180', collapsed && '-rotate-90')}
            strokeWidth={1.75}
          />
        </button>
      </header>

      {!collapsed && (
        <div
          ref={setNodeRef}
          className="mx-2 mb-2 min-h-[72px] flex-1 space-y-2 overflow-y-auto rounded-lg p-1"
        >
          <SortableContext items={deals.map((d) => dealDragId(d.id))} strategy={verticalListSortingStrategy}>
            {deals.map((deal) => (
              <SortableDealCard
                key={deal.id}
                deal={deal}
                owner={ownerOf(team, deal.ownerId)}
                stages={stages}
                pulse={pulse && deal.atRisk && deal.outcome === 'open'}
                onOpen={() => onOpenDeal(deal.id)}
                onMoveSelect={(s) => onMoveSelect(deal, s)}
              />
            ))}
          </SortableContext>
          {deals.length === 0 && (
            <div
              className={cn(
                'flex h-20 items-center justify-center rounded-lg border border-dashed text-[12px]',
                highlight ? 'border-palm-600/60 text-palm-700' : 'border-line-strong text-ink-400',
              )}
            >
              Drop deals here
            </div>
          )}
        </div>
      )}
    </section>
  )
}

/* -------------------------------- toolbar ------------------------------- */

function ViewToggle({
  view,
  onChange,
}: {
  view: 'kanban' | 'list'
  onChange: (v: 'kanban' | 'list') => void
}) {
  const options = [
    { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
    { id: 'list' as const, label: 'List', icon: Table },
  ]
  return (
    <div className="flex items-center rounded-lg bg-sunken p-0.5">
      {options.map((o) => {
        const Icon = o.icon
        const isActive = view === o.id
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-180',
              isActive ? 'text-ink-900' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="deals-view-pill"
                className="absolute inset-0 rounded-md bg-surface shadow-e1"
                transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="relative z-10">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* --------------------------------- page --------------------------------- */

export default function Deals() {
  const stagesQ = trpc.apex.deals.stages.useQuery()
  const dealsQ = trpc.apex.deals.list.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()

  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [query, setQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [atRiskOnly, setAtRiskOnly] = useState(false)
  const [stageFilter, setStageFilter] = useState('all')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [drawerDealId, setDrawerDealId] = useState<number | null>(null)
  const [lostDeal, setLostDeal] = useState<DealRow | null>(null)
  const [lostOpen, setLostOpen] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)

  const { move, confettiKey } = useMoveStage()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const stages = useMemo<PipelineStage[]>(() => (stagesQ.data ?? [...pipelineStages]) as PipelineStage[], [stagesQ.data])
  const deals = useMemo<DealRow[]>(() => dealsQ.data ?? [], [dealsQ.data])
  const team: TeamMemberRow[] | undefined = teamQ.data

  /* filters */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const min = minValue.trim() === '' ? null : Number(minValue) * 1_000_000
    const max = maxValue.trim() === '' ? null : Number(maxValue) * 1_000_000
    return deals.filter((d) => {
      if (atRiskOnly && !(d.atRisk && d.outcome === 'open')) return false
      if (ownerFilter !== 'all' && d.ownerId !== Number(ownerFilter)) return false
      if (min != null && Number.isFinite(min) && d.valueAed < min) return false
      if (max != null && Number.isFinite(max) && d.valueAed > max) return false
      if (
        q &&
        !`${d.contactName} ${d.title} ${d.propertyLine}`.toLowerCase().includes(q)
      )
        return false
      return true
    })
  }, [deals, query, ownerFilter, atRiskOnly, minValue, maxValue])

  const listRows = useMemo(
    () => (stageFilter === 'all' ? filtered : filtered.filter((d) => d.stage === stageFilter)),
    [filtered, stageFilter],
  )

  const byStage = useMemo(() => {
    const map = new Map<string, DealRow[]>()
    for (const s of stages) map.set(s, [])
    for (const d of filtered) map.get(d.stage)?.push(d)
    return map
  }, [stages, filtered])

  const visibleStages = useMemo(
    () => (stageFilter === 'all' ? stages : stages.filter((s) => s === stageFilter)),
    [stages, stageFilter],
  )

  /* pipeline summary (unfiltered — the workspace numbers) */
  const summary = useMemo(() => {
    const open = deals.filter((d) => d.outcome === 'open')
    const won = deals.filter((d) => d.outcome === 'won')
    const lost = deals.filter((d) => d.outcome === 'lost')
    return {
      openAed: open.reduce((s, d) => s + d.valueAed, 0),
      weightedAed: open.reduce((s, d) => s + (d.valueAed * d.probability) / 100, 0),
      wonCount: won.length,
      wonAed: won.reduce((s, d) => s + d.valueAed, 0),
      lostCount: lost.length,
      lostAed: lost.reduce((s, d) => s + d.valueAed, 0),
    }
  }, [deals])

  /* dnd */
  const activeDeal = activeDragId
    ? (() => {
        const id = parseDealDragId(activeDragId)
        return id != null ? (deals.find((d) => d.id === id) ?? null) : null
      })()
    : null

  const requestStage = (deal: DealRow, stage: string) => {
    if (stage === deal.stage) return
    if (stage === LOST_STAGE) {
      setLostDeal(deal)
      setLostOpen(true)
      return
    }
    move(deal, stage)
  }

  const onDragStart = (e: DragStartEvent) => setActiveDragId(String(e.active.id))
  const onDragOver = (e: DragOverEvent) =>
    setOverStage(e.over ? resolveDropStage(e.over.id, filtered) : null)
  const endDrag = () => {
    setActiveDragId(null)
    setOverStage(null)
  }
  const onDragEnd = (e: DragEndEvent) => {
    const stage = e.over ? resolveDropStage(e.over.id, filtered) : null
    const deal = activeDeal
    endDrag()
    if (deal && stage) requestStage(deal, stage)
  }

  const isLoading = stagesQ.isLoading || dealsQ.isLoading
  const [dealDialogOpen, setDealDialogOpen] = useState(false)
  const [newDeal, setNewDeal] = useState<{
    contact: string
    stage: PipelineStage
    value: string
    property: string
  }>({ contact: '', stage: pipelineStages[0], value: '', property: '' })

  const pipelineStagesArr: PipelineStage[] = (stagesQ.data ?? [...pipelineStages]) as PipelineStage[]

  const submitNewDeal = () => {
    if (!newDeal.contact.trim()) return
    const val = newDeal.value.replace(/[^0-9.]/g, '')
    const numVal = Number(val) * (newDeal.value.includes('M') ? 1_000_000 : newDeal.value.includes('K') ? 1_000 : 1)
    const dealRow: DealRow = {
      id: Date.now(),
      title: `${newDeal.contact} — ${newDeal.property || newDeal.stage}`,
      contactName: newDeal.contact,
      contactId: 0,
      propertyId: null,
      propertyLine: newDeal.property || null,
      valueAed: numVal || 5000000,
      stage: newDeal.stage,
      probability: pipelineStagesArr.indexOf(newDeal.stage) * 8 + 10,
      daysInStage: 0,
      nextAction: 'Review next step',
      atRisk: false,
      riskNote: null,
      outcome: 'open',
      ownerId: 1,
      updatedAgo: 'just now',
      createdAt: new Date().toISOString(),
    }
    // Push into the mock store
    const existing = (window as Window & { __mockDealsCache?: DealRow[] }).__mockDealsCache ?? []
    existing.push(dealRow)
    ;(window as Window & { __mockDealsCache?: DealRow[] }).__mockDealsCache = existing
    // Invalidate the query cache
    try {
      const cache = new Map<string, unknown>()
      const stored = cache.get('deals.list') as DealRow[] | undefined
      if (stored) cache.set('deals.list', [...stored, dealRow])
    } catch { /* noop */ }
    setDealDialogOpen(false)
    setNewDeal({ contact: '', stage: pipelineStages[0], value: '', property: '' })
    toast.success(`${newDeal.contact} added to ${newDeal.stage}`)
  }

  /* list view columns (deals.md §S3) */
  const listColumns: Column<DealRow>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Deal',
        sortable: true,
        render: (d) => (
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{d.title}</span>
            {d.atRisk && d.outcome === 'open' && (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-600" strokeWidth={1.75} />
            )}
          </span>
        ),
      },
      { key: 'contactName', header: 'Contact', sortable: true },
      {
        key: 'propertyLine',
        header: 'Property',
        render: (d) => <span className="block max-w-[220px] truncate text-ink-500">{d.propertyLine}</span>,
      },
      {
        key: 'stage',
        header: 'Stage',
        sortable: true,
        sortValue: (d) => stageOrder(stages, d.stage),
        render: (d) => <StatusChip tone={stageChipTone(d.stage)}>{d.stage}</StatusChip>,
      },
      {
        key: 'valueAed',
        header: 'Value',
        align: 'right',
        sortable: true,
        render: (d) => <span className="tnum font-mono text-[12.5px]">{aedFull(d.valueAed)}</span>,
      },
      {
        key: 'probability',
        header: 'Prob.',
        align: 'right',
        sortable: true,
        render: (d) => <span className="tnum font-mono text-[12.5px] text-ink-500">{d.probability}%</span>,
      },
      {
        key: 'weighted',
        header: 'Weighted',
        align: 'right',
        sortable: true,
        sortValue: (d) => (d.valueAed * d.probability) / 100,
        render: (d) => (
          <span className="tnum font-mono text-[12.5px] text-ink-500">
            {aedFull(Math.round((d.valueAed * d.probability) / 100))}
          </span>
        ),
      },
      {
        key: 'ownerId',
        header: 'Owner',
        render: (d) => {
          const o = ownerOf(team, d.ownerId)
          return o ? (
            <span className="flex items-center gap-2">
              <OwnerAvatar name={o.name} initials={o.initials} size={20} />
              <span className="truncate text-ink-700">{o.name.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="text-ink-400">—</span>
          )
        },
      },
      {
        key: 'daysInStage',
        header: 'In stage',
        sortable: true,
        render: (d) => <DaysInStagePill days={d.daysInStage} />,
      },
      {
        key: 'nextAction',
        header: 'Next action',
        render: (d) => <span className="block max-w-[200px] truncate text-ink-500">{d.nextAction ?? '—'}</span>,
      },
      { key: 'updatedAgo', header: 'Updated', render: (d) => <span className="text-ink-400">{d.updatedAgo ?? '—'}</span> },
    ],
    [stages, team],
  )

  return (
    <div className="flex h-[calc(100dvh-104px)] flex-col">
      {/* S1 — toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-center gap-2 pb-4"
      >
        {/* pipeline selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-900 transition-colors hover:bg-sunken"
            >
              Buyer Sales
              <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Pipeline</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Check className="mr-2 h-3.5 w-3.5 text-palm-600" strokeWidth={2} />
              Buyer Sales
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="justify-between">
              Leasing <span className="text-[10.5px] text-ink-400">soon</span>
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="justify-between">
              Seller Mandates <span className="text-[10.5px] text-ink-400">soon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ViewToggle view={view} onChange={setView} />

        {/* owner filter */}
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="h-9 w-[168px] border-line-strong text-[13px]">
            <SelectValue placeholder="All advisors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All advisors</SelectItem>
            {(team ?? []).map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* value range */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors',
                minValue || maxValue
                  ? 'border-palm-600 bg-palm-50 text-palm-700'
                  : 'border-line-strong text-ink-700 hover:bg-sunken',
              )}
            >
              Value
              {(minValue || maxValue) && (
                <span className="tnum font-mono text-[11px]">
                  {minValue || '0'}–{maxValue || '∞'}M
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64">
            <p className="mb-2 text-micro font-semibold uppercase text-ink-500">Value range (AED M)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Min"
                value={minValue}
                onChange={(e) => setMinValue(e.target.value)}
                className="h-8 w-full rounded-md border border-line-strong px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-palm-600"
              />
              <span className="text-ink-400">–</span>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Max"
                value={maxValue}
                onChange={(e) => setMaxValue(e.target.value)}
                className="h-8 w-full rounded-md border border-line-strong px-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-palm-600"
              />
            </div>
            {(minValue || maxValue) && (
              <button
                type="button"
                onClick={() => {
                  setMinValue('')
                  setMaxValue('')
                }}
                className="mt-2 text-[12px] font-medium text-palm-600 hover:underline"
              >
                Clear range
              </button>
            )}
          </PopoverContent>
        </Popover>

        {/* at-risk toggle */}
        <button
          type="button"
          aria-pressed={atRiskOnly}
          onClick={() => setAtRiskOnly((v) => !v)}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium transition-colors',
            atRiskOnly
              ? 'border-red-600/40 bg-red-100 text-red-600'
              : 'border-line-strong text-ink-700 hover:bg-sunken',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', atRiskOnly ? 'bg-red-600' : 'bg-red-600/70')} />
          At risk
        </button>

        {/* stage filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="h-9 w-[188px] border-line-strong text-[13px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" strokeWidth={1.75} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals…"
            className="h-9 w-[180px] rounded-md border border-line-strong bg-surface pl-8 pr-7 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-palm-600"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-900"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* pipeline summary + new deal */}
        <div className="ml-auto flex items-center gap-2.5">
          <p className="tnum hidden font-mono text-[12px] text-ink-500 xl:block">
            Open pipeline <span className="font-semibold text-ink-900">{aedCompact(summary.openAed)}</span>
            {' · '}Weighted <span className="font-semibold text-ink-900">{aedCompact(summary.weightedAed)}</span>
          </p>
          <StatusChip tone="palm" className="hidden md:inline-flex">
            Won {summary.wonCount} · {aedCompact(summary.wonAed)}
          </StatusChip>
          <StatusChip tone="red" className="hidden md:inline-flex">
            Lost {summary.lostCount} · {aedCompact(summary.lostAed)}
          </StatusChip>
          <button
            type="button"
            onClick={() => setDealDialogOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-palm-600 px-3.5 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Deal
          </button>
        </div>
      </motion.div>

      {/* S2/S3 — board or table */}
      {isLoading ? (
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="w-[296px] shrink-0 rounded-xl bg-sunken p-3">
              <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-line" />
              <div className="space-y-2">
                <div className="h-28 animate-pulse rounded-[10px] bg-surface" />
                <div className="h-28 animate-pulse rounded-[10px] bg-surface" />
              </div>
            </div>
          ))}
        </div>
      ) : deals.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-line bg-surface">
          <EmptyState
            icon={Handshake}
            title="Add your first deal"
            description="Your pipeline is empty. Create a deal manually or import an existing book from CSV to get moving."
            primaryCta={{ label: 'Add your first deal', onClick: () => setDealDialogOpen(true) }}
            secondaryCta={{
              label: 'Import from CSV',
              onClick: () => toast.info('CSV import ships with the next milestone.'),
            }}
          />
        </div>
      ) : view === 'kanban' ? (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
          onDragCancel={endDrag}
        >
          <div className="min-h-0 flex-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%_-_24px),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%_-_24px),transparent)]">
            <div className="flex h-full items-stretch gap-4 pr-6">
              {visibleStages.map((stage, i) => (
                <motion.div
                  key={stage}
                  initial={i < 6 ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: Math.min(i, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="flex max-h-full"
                >
                  <BoardColumn
                    stage={stage}
                    deals={byStage.get(stage) ?? []}
                    stages={stages}
                    team={team}
                    highlight={overStage === stage && activeDeal != null && activeDeal.stage !== stage}
                    pulse={atRiskOnly}
                    onOpenDeal={setDrawerDealId}
                    onMoveSelect={requestStage}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 0.18, easing: 'cubic-bezier(.2,.8,.2,1)' }}>
            {activeDeal ? (
              <div className="w-[280px]">
                <DealCardView
                  deal={activeDeal}
                  owner={ownerOf(team, activeDeal.ownerId)}
                  stages={stages}
                  onMoveSelect={() => undefined}
                  overlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <DataTable
            columns={listColumns}
            data={listRows}
            rowKey={(d) => String(d.id)}
            onRowClick={(d) => setDrawerDealId(d.id)}
            total={listRows.length}
            pageSize={25}
            emptyState={
              <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-ink-500">
                <CircleAlert className="h-4 w-4 text-ink-400" strokeWidth={1.75} />
                No deals match the current filters.
              </div>
            }
          />
        </div>
      )}

      {/* drawer, dialogs, effects */}
      <DealDrawer dealId={drawerDealId} onClose={() => setDrawerDealId(null)} />
      <LostReasonDialog
        deal={lostDeal}
        open={lostOpen}
        onOpenChange={setLostOpen}
        onConfirm={() => lostDeal && move(lostDeal, LOST_STAGE)}
      />
      <WonConfetti burstKey={confettiKey} />
      <Toaster position="bottom-right" />

      {/* New deal modal */}
      {dealDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">New deal</h2>
              <p className="mt-1 text-[13px] text-ink-500">Add a deal to the pipeline. It starts in the selected stage.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Contact name</label>
                <input
                  value={newDeal.contact}
                  onChange={(e) => setNewDeal((p) => ({ ...p, contact: e.target.value }))}
                  placeholder="e.g. Ahmed Al Rashid"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Stage</label>
                <select
                  value={newDeal.stage}
                  onChange={(e) => {
                    const nextStage = e.currentTarget.value
                    if (isPipelineStage(nextStage)) {
                      setNewDeal((p) => ({ ...p, stage: nextStage }))
                    }
                  }}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none focus:border-palm-600"
                >
                  {pipelineStagesArr.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Value</label>
                <input
                  value={newDeal.value}
                  onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
                  placeholder="e.g. AED 3.2M or 3200000"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Property (optional)</label>
                <input
                  value={newDeal.property}
                  onChange={(e) => setNewDeal((p) => ({ ...p, property: e.target.value }))}
                  placeholder="e.g. Marina Gate 2BR"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDealDialogOpen(false)}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitNewDeal}
                disabled={!newDeal.contact.trim()}
                className="inline-flex h-9 items-center rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98] disabled:opacity-50"
              >
                Add deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
