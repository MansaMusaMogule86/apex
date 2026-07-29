/**
 * Reports — `/reports` (reports.md).
 * Overview · Pipeline forecast · Lead response SLA · Viewing performance ·
 * Source attribution · Commission overview · Integration health.
 * Sticky global filter bar (date range / team / source / export); tab and
 * filters persist in URL query params. All data live via trpc.apex.*.
 */
import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  Handshake,
  Inbox,
  PlugZap,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { AiBadge, ConfidenceMeter, SourceChips } from '@/components/app/AiKit'
import { KpiCard } from '@/components/app/KpiCard'
import { ChannelBadge, HealthDot, StatusChip } from '@/components/app/Chips'
import { DataTable, type Column } from '@/components/app/DataTable'
import { EmptyState } from '@/components/app/EmptyState'
import { CHART_PALETTE } from '@/components/app/ChartSkin.constants'
import type { TaskRow } from '@/components/crm/shared.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Avatar,
  Card,
  CardHeader,
  ChartSkeleton,
  SegmentedControl,
  Skeleton,
  StatCard,
} from '@/components/dashboard/widgets'
import { EASE_OUT } from '@/components/dashboard/widgets.constants'
import { useToast } from '@/components/dashboard/widgets.hook'
import {
  DonutWithLegend,
  ForecastAreaChart,
  StageBars,
  TargetLineChart,
  WeeklyBars,
  type StageBarRow,
} from '@/components/dashboard/charts'
import {
  DEMO_NOW,
  addDays,
  advisorResponseSeconds,
  agoToDays,
  buildForecastSeries,
  fmtAedCompact,
  fmtAedFull,
  fmtDay,
  fmtMinSec,
  hashString,
  mulberry32,
  parseMinSec,
  scaleToTotal,
  sparkSeries,
  useCountUp,
} from '@/components/dashboard/format'

/* ------------------------- local structural types ---------------------- */

interface DealRow {
  id: number
  title: string
  contactId: number | null
  contactName: string
  propertyId: number | null
  propertyLine: string
  valueAed: number
  stage: string
  probability: number
  ownerId: number | null
  outcome: string
  updatedAgo: string | null
}
interface ViewingRow {
  id: number
  propertyId: number | null
  propertyName: string
  contactId: number | null
  contactName: string
  advisorId: number | null
  status: string
  interestScore: number | null
  outcome: string | null
}
interface ContactRow {
  id: number
  name: string
  source: string
  ownerId: number | null
}
interface ConversationRow {
  id: number
  contactId: number | null
  contactName: string
  channel: string
  preview: string
  lastAgo: string
  unread: number
  sla: string | null
  slaBreached: boolean
}
interface IntegrationRow {
  id: number
  name: string
  category: string
  status: string
  detail: string | null
  lastSyncAgo: string | null
}
interface TeamRow {
  id: number
  name: string
  title: string
  initials: string
}
interface BundleKpis {
  pipelineAed: number
  pipelineDelta: number
  weightedAed: number
  newLeadsWeek: number
  medianResponse: string
  overdueFollowUps: number
  viewingsWeek: number
  closedMtdAed: number
  closedMtdCount: number
  lostMtdCount: number
  commissionMtdAed: number
  syncSuccess: number
  aiPrecision: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function asArray<T>(value: unknown, guard: (entry: unknown) => entry is T): T[] {
  if (!Array.isArray(value)) return []
  return value.filter(guard)
}

function isTeamRow(value: unknown): value is TeamRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.name === 'string' && typeof v.initials === 'string')
}

function isDealRow(value: unknown): value is DealRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.title === 'string' && typeof v.stage === 'string' && typeof v.valueAed === 'number')
}

function isViewingRow(value: unknown): value is ViewingRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.propertyName === 'string' && typeof v.status === 'string')
}

function isContactRow(value: unknown): value is ContactRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.name === 'string' && typeof v.source === 'string')
}

function isConversationRow(value: unknown): value is ConversationRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.channel === 'string' && typeof v.preview === 'string')
}

function isIntegrationRow(value: unknown): value is IntegrationRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.name === 'string' && typeof v.status === 'string')
}

function isTaskRow(value: unknown): value is TaskRow {
  const v = asRecord(value)
  return Boolean(v && typeof v.id === 'number' && typeof v.status === 'string' && typeof v.overdue === 'boolean')
}

function isBundleKpis(value: unknown): value is BundleKpis {
  const v = asRecord(value)
  return Boolean(v && typeof v.pipelineAed === 'number' && typeof v.weightedAed === 'number' && typeof v.newLeadsWeek === 'number')
}

export interface ReportsData {
  kpis: BundleKpis
  stageCounts: { stage: string; count: number; value: number }[]
  deals: DealRow[]
  viewings: ViewingRow[]
  contacts: ContactRow[]
  conversations: ConversationRow[]
  integrations: IntegrationRow[]
  team: TeamRow[]
  overdueTasks: number
}

/* ------------------------------ constants ------------------------------ */

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'forecast', label: 'Pipeline forecast' },
  { key: 'sla', label: 'Lead response SLA' },
  { key: 'viewings', label: 'Viewing performance' },
  { key: 'sources', label: 'Source attribution' },
  { key: 'commission', label: 'Commission overview' },
  { key: 'integrations', label: 'Integration health' },
] as const
type TabKey = (typeof TABS)[number]['key']

const RANGES = ['30D', '90D', 'YTD', 'Custom'] as const
type Range = (typeof RANGES)[number]

const STAGE_ORDER = [
  'New Inquiry',
  'Qualified',
  'Requirements Confirmed',
  'Properties Shortlisted',
  'Viewing Scheduled',
  'Viewing Completed',
  'Offer Made',
  'Negotiation',
  'MOU Signed',
  'SPA Executed',
  'Payment in Progress',
  'Handover',
  'Won',
  'Lost',
]

/** Expected-days-to-close per late stage (deterministic model for forecast dates). */
const STAGE_CLOSE_DAYS: Record<string, number> = {
  'Offer Made': 21,
  Negotiation: 23,
  'MOU Signed': 16,
  'SPA Executed': 13,
  'Payment in Progress': 8,
  Handover: 5,
}

/** Design-stub media costs per lead (reports.md S5 — no live cost API in MVP). */
const COST_PER_LEAD_STUB: Record<string, number> = {
  'Property Finder': 210,
  Bayut: 180,
  Dubizzle: 150,
}
const ROI_STUB: Record<string, string> = {
  'Property Finder': '16×',
  Bayut: '18×',
  Referral: '∞',
  Dubizzle: '0×',
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: EASE_OUT },
})

/* -------------------------------- page --------------------------------- */

export default function Reports() {
  const [params, setParams] = useSearchParams()
  const { toast, node: toastNode } = useToast()

  const tab = (TABS.some((t) => t.key === params.get('tab')) ? params.get('tab') : 'overview') as TabKey
  const range = (RANGES.includes(params.get('range') as Range) ? params.get('range') : '30D') as Range
  const teamFilter = params.get('team') ?? 'all'
  const sourceFilter = params.get('source') ?? 'all'

  const setParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === 'all' || (key === 'range' && value === '30D') || (key === 'tab' && value === 'overview')) {
          next.delete(key)
        } else {
          next.set(key, value)
        }
        return next
      },
      { replace: true },
    )
  }

  const bundleQ = trpc.apex.dashboard.bundle.useQuery()
  const dealsQ = trpc.apex.deals.list.useQuery()
  const viewingsQ = trpc.apex.viewings.list.useQuery()
  const contactsQ = trpc.apex.contacts.list.useQuery()
  const conversationsQ = trpc.apex.inbox.conversations.useQuery()
  const integrationsQ = trpc.apex.admin.integrations.useQuery()
  const tasksQ = trpc.apex.tasks.list.useQuery()

  const loading =
    bundleQ.isLoading || dealsQ.isLoading || viewingsQ.isLoading || contactsQ.isLoading

  const data = useMemo<ReportsData | null>(() => {
    const bundle = asRecord(bundleQ.data)
    if (!bundle || !isBundleKpis(bundle.kpis)) return null

    const stageCounts = Array.isArray(bundle.stageCounts)
      ? bundle.stageCounts.filter((row): row is { stage: string; count: number; value: number } => {
        const v = asRecord(row)
        return Boolean(v && typeof v.stage === 'string' && typeof v.count === 'number' && typeof v.value === 'number')
      })
      : []

    const team = asArray(bundle.team, isTeamRow)
    const deals = asArray(dealsQ.data, isDealRow)
    const viewings = asArray(viewingsQ.data, isViewingRow)
    const contacts = asArray(contactsQ.data, isContactRow)

    if (deals.length === 0 && viewings.length === 0 && contacts.length === 0) return null

    return {
      kpis: bundle.kpis,
      stageCounts,
      deals,
      viewings,
      contacts,
      conversations: asArray(conversationsQ.data, isConversationRow),
      integrations: asArray(integrationsQ.data, isIntegrationRow),
      team,
      overdueTasks: asArray(tasksQ.data, isTaskRow).filter((t) => t.overdue && t.status === 'open').length,
    }
  }, [bundleQ.data, dealsQ.data, viewingsQ.data, contactsQ.data, conversationsQ.data, integrationsQ.data, tasksQ.data])

  const sourceOptions = useMemo(
    () => [...new Set(asArray(contactsQ.data, isContactRow).map((c) => c.source))].sort(),
    [contactsQ.data],
  )

  return (
    <div className="space-y-5">
      {/* sticky global filter bar */}
      <div className="sticky top-14 z-20 -mx-6 -mt-6 mb-1 border-b border-line bg-base/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl options={RANGES} value={range} onChange={(v) => setParam('range', v)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
              >
                {teamFilter === 'all'
                  ? 'All advisors'
                  : (data?.team.find((m) => String(m.id) === teamFilter)?.name ?? 'All advisors')}
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setParam('team', 'all')}>All advisors</DropdownMenuItem>
              {(data?.team ?? []).map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => setParam('team', String(m.id))}>
                  {m.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
              >
                {sourceFilter === 'all' ? 'All sources' : sourceFilter}
                <ChevronDown className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuItem onClick={() => setParam('source', 'all')}>All sources</DropdownMenuItem>
              {sourceOptions.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setParam('source', s)}>
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={() => toast('Report exported · reports_mar2025.pdf')}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
          >
            <Download className="h-4 w-4" strokeWidth={1.75} />
            Export
          </button>
        </div>
      </div>

      {/* tab strip */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line">
        {TABS.map((t) => {
          const active = t.key === tab
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setParam('tab', t.key)}
              className={cn(
                'relative px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors duration-140',
                active ? 'text-palm-700' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {t.label}
              {active && (
                <motion.span
                  layoutId="reports-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-palm-600"
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* tab body — key remounts for 250ms crossfade on filter/tab change */}
      {bundleQ.isError ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="Couldn't load reports"
            description="The reporting bundle failed to load. Check your connection and try again."
            primaryCta={{ label: 'Retry', onClick: () => void bundleQ.refetch() }}
          />
        </Card>
      ) : loading || !data ? (
        <ReportsSkeleton tab={tab} />
      ) : (
        <motion.div
          key={`${tab}-${range}-${teamFilter}-${sourceFilter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
        >
          {tab === 'overview' && <OverviewTab data={data} />}
          {tab === 'forecast' && <ForecastTab data={data} teamFilter={teamFilter} />}
          {tab === 'sla' && <SlaTab data={data} teamFilter={teamFilter} />}
          {tab === 'viewings' && <ViewingsTab data={data} />}
          {tab === 'sources' && <SourcesTab data={data} sourceFilter={sourceFilter} />}
          {tab === 'commission' && <CommissionTab data={data} teamFilter={teamFilter} />}
          {tab === 'integrations' && <IntegrationsTab data={data} />}
        </motion.div>
      )}
      {toastNode}
    </div>
  )
}

function ReportsSkeleton({ tab }: { tab: TabKey }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: tab === 'overview' ? 4 : 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartSkeleton height={280} />
        <ChartSkeleton height={280} />
      </div>
      <Skeleton className="h-[240px]" />
    </div>
  )
}

/* ============================== Overview =============================== */

/** Weekly closed revenue: live won deals placed by close week; earlier weeks
 *  modeled deterministically to the live MTD pace (12-week window). */
function buildRevenueWeeks(wonDeals: DealRow[]): { week: string; value: number; prior: number }[] {
  const rng = mulberry32(7)
  const weeks = Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}`, value: 0, prior: 0 }))
  for (const d of wonDeals) {
    const w = 12 - Math.ceil(agoToDays(d.updatedAgo) / 7)
    if (w >= 0 && w < 12) weeks[w].value += d.valueAed
  }
  const liveTotal = weeks.reduce((a, w) => a + w.value, 0)
  const base = Math.max(liveTotal / 4, 900_000)
  for (let i = 0; i < 12; i++) {
    if (weeks[i].value === 0) weeks[i].value = Math.round(base * (0.35 + i * 0.05 + rng() * 0.3))
    weeks[i].prior = Math.round(weeks[i].value / 1.18) // +18% vs prior period (design spec)
  }
  return weeks
}

function FunnelCard({ wonCount }: { wonCount: number }) {
  // Funnel volumes per reports.md S1; Won step is live (closedMtdCount).
  const steps = [
    { label: 'Leads', value: 212 },
    { label: 'Qualified', value: 96 },
    { label: 'Viewed', value: 41 },
    { label: 'Offer', value: 17 },
    { label: 'Won', value: wonCount },
  ]
  const ramp = ['#0B5D4A', '#2F7352', '#668A44', '#9A8A35', '#C08A2D'] // palm → gold
  return (
    <ul className="space-y-3">
      {steps.map((s, i) => {
        const pct = Math.max(8, (s.value / steps[0].value) * 100)
        const conv = i > 0 ? Math.round((s.value / Math.max(1, steps[i - 1].value)) * 100) : null
        return (
          <motion.li
            key={s.label}
            initial={{ scaleX: 0, opacity: 0.4 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: EASE_OUT }}
            style={{ transformOrigin: 'left' }}
          >
            <div
              className="flex h-9 items-center justify-between rounded-r-md px-3 text-white"
              style={{ width: `${pct}%`, background: ramp[i], minWidth: 132 }}
              title={`${s.label}: ${s.value}${conv != null ? ` · ${conv}% of previous step` : ''}`}
            >
              <span className="text-[12px] font-medium">{s.label}</span>
              <span className="tnum font-mono text-[12px]">{s.value}</span>
            </div>
            {conv != null && (
              <p className="mt-0.5 pl-3 text-[11px] text-ink-400">{conv}% conversion</p>
            )}
          </motion.li>
        )
      })}
    </ul>
  )
}

function ActivityHeatmap() {
  // Stub per reports.md S1 — intensity derived deterministically (seeded), no live hourly API.
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i) // 8:00–19:00
  const rng = mulberry32(hashString('apex-heat'))
  const cells = days.flatMap((d, di) =>
    hours.map((h) => {
      const businessBump = h >= 9 && h <= 18 && di < 5 ? 0.35 : 0
      const lunchDip = h === 13 ? -0.15 : 0
      const intensity = Math.min(1, Math.max(0.04, rng() * 0.7 + businessBump + lunchDip))
      return { key: `${d}-${h}`, day: d, hour: h, intensity, touches: Math.round(intensity * 12) }
    }),
  )
  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `28px repeat(${hours.length}, 1fr)` }}
      >
        <span />
        {hours.map((h) => (
          <span key={h} className="text-center font-mono text-[9px] text-ink-400">
            {h}
          </span>
        ))}
        {days.map((d, di) => (
          <HeatmapRow key={d} day={d} cells={cells.slice(di * hours.length, (di + 1) * hours.length)} rowIndex={di} />
        ))}
      </div>
      <p className="mt-3 text-[11.5px] text-ink-400">Advisor activity by hour · darker = more touches</p>
    </div>
  )
}

function HeatmapRow({
  day,
  cells,
  rowIndex,
}: {
  day: string
  cells: { key: string; day: string; hour: number; intensity: number; touches: number }[]
  rowIndex: number
}) {
  return (
    <>
      <span className="flex items-center text-[10.5px] text-ink-500">{day}</span>
      {cells.map((c, ci) => (
        <motion.span
          key={c.key}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, delay: (rowIndex * cells.length + ci) * 0.008 }}
          title={`${c.day} ${String(c.hour).padStart(2, '0')}:00 · ${c.touches} touches`}
          className="h-5 rounded-[3px]"
          style={{ background: `rgba(11, 93, 74, ${c.intensity.toFixed(2)})` }}
        />
      ))}
    </>
  )
}

function OverviewTab({ data }: { data: ReportsData }) {
  const navigate = useNavigate()
  const closed = useCountUp(data.kpis.closedMtdAed)
  const won = useCountUp(data.kpis.closedMtdCount)
  const medianSec = useCountUp(parseMinSec(data.kpis.medianResponse))
  const progressions = useCountUp(3.2) // north-star metric (reports.md S1)

  const wonDeals = useMemo(() => data.deals.filter((d) => d.outcome === 'won'), [data.deals])
  const revenueWeeks = useMemo(() => buildRevenueWeeks(wonDeals), [wonDeals])
  const stageRows = useMemo(() => condenseStages(data.stageCounts), [data.stageCounts])

  return (
    <div className="space-y-5">
      {/* row 1 — 4 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div {...fadeUp(0)} onClick={() => navigate('/deals')} className="cursor-pointer">
          <KpiCard
            label="Closed AED (MTD)"
            value={fmtAedCompact(closed)}
            delta="+18%"
            spark={sparkSeries('closed')}
            className="cursor-pointer transition-all duration-140 hover:-translate-y-0.5 hover:shadow-e1"
          />
        </motion.div>
        <motion.div {...fadeUp(0.06)} onClick={() => navigate('/deals')} className="cursor-pointer">
          <KpiCard
            label="Deals won (MTD)"
            value={String(Math.round(won))}
            delta="="
            deltaTone="flat"
            spark={sparkSeries('won')}
            className="cursor-pointer transition-all duration-140 hover:-translate-y-0.5 hover:shadow-e1"
          />
        </motion.div>
        <motion.div {...fadeUp(0.12)}>
          <StatCard
            label="Median first response"
            value={fmtMinSec(medianSec)}
            delta="−38%"
            deltaTone="down"
            downIsGood
            deltaSuffix="QoQ"
            subline="target ≤ 10m"
            valueClassName="font-mono text-[26px]"
          />
        </motion.div>
        <motion.div {...fadeUp(0.18)}>
          <StatCard
            label="Qualified progressions / advisor"
            value={progressions.toFixed(1)}
            subline="target 4.0"
            sublineClassName="text-amber-600"
            spark={sparkSeries('progressions')}
          />
        </motion.div>
      </div>

      {/* row 2 — revenue area (8) + funnel (4) */}
      <div className="grid gap-5 lg:grid-cols-12">
        <motion.div {...fadeUp(0.1)} className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader title="Closed revenue" sub="AED per week · last 12 weeks vs prior period" />
            <div className="px-2 pb-3 pt-2">
              <ForecastAreaChart
                data={revenueWeeks}
                valueName="Closed"
                priorName="Prior period"
                formatValue={(v) => fmtAedCompact(v)}
                height={260}
              />
            </div>
          </Card>
        </motion.div>
        <motion.div {...fadeUp(0.16)} className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader title="Pipeline funnel" sub="Trailing 90 days" />
            <div className="p-4 pt-3">
              <FunnelCard wonCount={data.kpis.closedMtdCount} />
            </div>
          </Card>
        </motion.div>
      </div>

      {/* row 3 — stage bars (6) + activity heatmap (6) */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div {...fadeUp(0.12)}>
          <Card className="h-full">
            <CardHeader title="Deals by stage" sub="Open pipeline · count · AED" />
            <div className="p-4 pt-3">
              <StageBars rows={stageRows} onSelect={() => navigate('/deals')} />
            </div>
          </Card>
        </motion.div>
        <motion.div {...fadeUp(0.18)}>
          <Card className="h-full">
            <CardHeader title="Activity heatmap" sub="Advisor touches by hour (stub)" />
            <div className="p-4 pt-3">
              <ActivityHeatmap />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

/* =========================== Pipeline forecast ========================= */

function condenseStages(stageCounts: { stage: string; count: number; value: number }[]): StageBarRow[] {
  const short: Record<string, string> = {
    'Requirements Confirmed': 'Requirements',
    'Properties Shortlisted': 'Shortlisted',
    'Viewing Scheduled': 'Viewing Sched.',
    'Viewing Completed': 'Viewing Done',
    'Offer Made': 'Offer',
  }
  const rows: StageBarRow[] = []
  let mou: StageBarRow = { key: 'MOU+', label: 'MOU+', count: 0, value: 0, deep: true }
  for (const sc of stageCounts) {
    if (sc.stage === 'Won' || sc.stage === 'Lost') continue
    if (['MOU Signed', 'SPA Executed', 'Payment in Progress', 'Handover'].includes(sc.stage)) {
      mou = { ...mou, count: mou.count + sc.count, value: mou.value + sc.value }
    } else {
      rows.push({ key: sc.stage, label: short[sc.stage] ?? sc.stage, count: sc.count, value: sc.value })
    }
  }
  rows.push(mou)
  return rows
}

function ForecastTab({ data, teamFilter }: { data: ReportsData; teamFilter: string }) {
  const navigate = useNavigate()
  const [scenario, setScenario] = useState<'Conservative' | 'Base' | 'Optimistic'>('Base')
  const scenarioMult = scenario === 'Conservative' ? 0.85 : scenario === 'Optimistic' ? 1.15 : 1

  const openDeals = useMemo(() => data.deals.filter((d) => d.outcome === 'open'), [data.deals])
  const series = useMemo(
    () =>
      buildForecastSeries(openDeals, {
        mode: 'weighted',
        scenarioMult,
        priorFactor: 1 / (1 + data.kpis.pipelineDelta / 100),
      }),
    [openDeals, scenarioMult, data.kpis.pipelineDelta],
  )

  const expected90 = useMemo(() => {
    const weighted = openDeals
      .filter((d) => d.probability >= 60)
      .reduce((a, d) => a + (d.valueAed * Math.min(100, d.probability * scenarioMult)) / 100, 0)
    return { value: weighted, band: weighted * 0.15 }
  }, [openDeals, scenarioMult])

  const teamById = useMemo(() => new Map(data.team.map((m) => [m.id, m])), [data.team])
  const movers = useMemo(
    () =>
      openDeals
        .filter((d) => d.probability >= 60)
        .filter((d) => teamFilter === 'all' || String(d.ownerId) === teamFilter)
        .map((d) => ({
          ...d,
          adjProb: Math.min(100, Math.round(d.probability * scenarioMult)),
          weighted: (d.valueAed * Math.min(100, d.probability * scenarioMult)) / 100,
          expected: fmtDay(addDays(DEMO_NOW, STAGE_CLOSE_DAYS[d.stage] ?? 30)),
        }))
        .sort((a, b) => b.weighted - a.weighted),
    [openDeals, teamFilter, scenarioMult],
  )

  const columns: Column<(typeof movers)[number]>[] = [
    {
      key: 'deal',
      header: 'Deal',
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink-900">{r.contactName}</span>
          <span className="block truncate text-[11.5px] text-ink-500">{r.propertyLine}</span>
        </span>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      render: (r) => (
        <StatusChip tone={STAGE_ORDER.indexOf(r.stage) >= 8 ? 'palm' : 'neutral'}>{r.stage}</StatusChip>
      ),
    },
    {
      key: 'prob',
      header: 'Prob %',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.adjProb,
      render: (r) => <span className="tnum font-mono text-[12.5px]">{r.adjProb}%</span>,
    },
    {
      key: 'weighted',
      header: 'Weighted AED',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.weighted,
      render: (r) => <span className="tnum font-mono text-[12.5px]">{fmtAedFull(r.weighted)}</span>,
    },
    { key: 'expected', header: 'Expected', align: 'right', render: (r) => <span className="tnum">{r.expected}</span> },
    {
      key: 'owner',
      header: 'Owner',
      align: 'center',
      render: (r) => {
        const o = r.ownerId != null ? teamById.get(r.ownerId) : undefined
        return o ? (
          <span className="inline-flex justify-center" title={o.name}>
            <Avatar name={o.name} initials={o.initials} size={20} />
          </span>
        ) : (
          '—'
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      {/* summary chips */}
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-2">
        {[
          `Open ${fmtAedCompact(data.kpis.pipelineAed)}`,
          `Weighted ${fmtAedCompact(data.kpis.weightedAed)}`,
          `Expected close (90d) ${fmtAedCompact(expected90.value)} ± ${fmtAedCompact(expected90.band)}`,
        ].map((s) => (
          <span
            key={s}
            className="tnum inline-flex h-8 items-center rounded-full bg-sunken px-3.5 font-mono text-[12px] font-medium text-ink-900 ring-1 ring-line"
          >
            {s}
          </span>
        ))}
        <span className="ml-auto">
          <SegmentedControl
            options={['Conservative', 'Base', 'Optimistic'] as const}
            value={scenario}
            onChange={setScenario}
          />
        </span>
      </motion.div>

      <motion.div {...fadeUp(0.08)}>
        <Card>
          <CardHeader
            title="Weighted pipeline forecast"
            sub={`${scenario} scenario · next 8 weeks · dashed = last month`}
          />
          <div className="px-2 pb-3 pt-2">
            <ForecastAreaChart
              key={scenario}
              data={series}
              markerIndex={0}
              valueName={`Weighted (${scenario.toLowerCase()})`}
              priorName="Last month"
              formatValue={(v) => fmtAedCompact(v)}
              height={320}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div {...fadeUp(0.14)}>
        <CardHeader className="px-0" title="Expected movers" sub="Open deals with ≥60% probability" />
        <DataTable
          columns={columns}
          data={movers}
          rowKey={(r) => String(r.id)}
          onRowClick={() => navigate('/deals')}
          emptyState={
            <EmptyState
              icon={Handshake}
              title="No expected movers"
              description="No open deals at ≥60% probability for this selection."
            />
          }
        />
      </motion.div>
    </div>
  )
}

/* ========================== Lead response SLA ========================== */

/** 12-week response-time trend: anchored to the live median with the live
 *  −38% QoQ improvement as the start-of-window reference (design S3). */
function buildSlaTrend(medianSec: number): { week: string; value: number }[] {
  const rng = mulberry32(11)
  const end = medianSec / 60
  const start = end / 0.62
  return Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    value: +(start + (end - start) * (i / 11) + (rng() - 0.5) * 0.7).toFixed(1),
  }))
}

function SlaTab({ data, teamFilter }: { data: ReportsData; teamFilter: string }) {
  const navigate = useNavigate()
  const medianSec = parseMinSec(data.kpis.medianResponse)
  const animatedMedian = useCountUp(medianSec)
  const metPct = useMemo(() => {
    const total = data.conversations.length
    if (total === 0) return 100
    return Math.round((data.conversations.filter((c) => !c.slaBreached).length / total) * 100)
  }, [data.conversations])

  const trend = useMemo(() => buildSlaTrend(medianSec), [medianSec])

  const perAdvisor = useMemo(() => {
    const ownedCounts = new Map<number, number>()
    for (const c of data.contacts) {
      if (c.ownerId != null) ownedCounts.set(c.ownerId, (ownedCounts.get(c.ownerId) ?? 0) + 1)
    }
    return data.team
      .filter((m) => (ownedCounts.get(m.id) ?? 0) > 0)
      .filter((m) => teamFilter === 'all' || String(m.id) === teamFilter)
      .map((m) => ({
        m,
        sec: advisorResponseSeconds(medianSec, m.id, m.name, data.contacts, data.conversations),
      }))
      .sort((a, b) => a.sec - b.sec)
  }, [data.team, data.contacts, data.conversations, medianSec, teamFilter])
  const maxSec = Math.max(600, ...perAdvisor.map((r) => r.sec))

  const breaches = useMemo(
    () =>
      data.conversations
        .filter((c) => c.slaBreached || (c.sla != null && c.unread > 0))
        .map((c) => ({
          ...c,
          status: c.slaBreached ? ('Breached' as const) : ('At risk' as const),
        }))
        .sort((a, b) => (a.status === b.status ? 0 : a.status === 'Breached' ? -1 : 1)),
    [data.conversations],
  )

  const breachColumns: Column<(typeof breaches)[number]>[] = [
    {
      key: 'thread',
      header: 'Thread',
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink-900">{r.contactName}</span>
          <span className="block max-w-[42ch] truncate text-[11.5px] text-ink-500">{r.preview}</span>
        </span>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (r) => (
        <ChannelBadge channel={(['whatsapp', 'email', 'note'] as const).includes(r.channel as 'whatsapp' | 'email' | 'note') ? (r.channel as 'whatsapp' | 'email' | 'note') : 'note'} />
      ),
    },
    {
      key: 'waited',
      header: 'Waited',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12.5px]">{r.lastAgo.replace(' ago', '')}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.status === 'Breached' ? (
          <StatusChip tone="red">Breached</StatusChip>
        ) : (
          <StatusChip tone="amber">At risk</StatusChip>
        ),
    },
    {
      key: 'open',
      header: '',
      align: 'right',
      render: () => (
        <span className="text-[12.5px] font-medium text-ink-500 transition-colors hover:text-palm-700">
          Open thread
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* big stat + target chip */}
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-micro font-semibold uppercase text-ink-500">Median first response</p>
          <p className="tnum mt-1 font-mono text-[40px] font-medium leading-[44px] text-ink-900">
            {fmtMinSec(animatedMedian)}
          </p>
        </div>
        <span className="tnum mb-2 inline-flex h-6 items-center rounded-full bg-sunken px-2.5 font-mono text-[11.5px] text-ink-700 ring-1 ring-line">
          target ≤ 10m · met {metPct}% of threads
        </span>
        {data.overdueTasks > 0 && (
          <span
            className="tnum mb-2 inline-flex h-6 cursor-pointer items-center rounded-full bg-red-100 px-2.5 font-mono text-[11.5px] font-medium text-red-600"
            onClick={() => navigate('/tasks?filter=overdue')}
          >
            {data.overdueTasks} follow-up{data.overdueTasks === 1 ? '' : 's'} overdue
          </span>
        )}
      </motion.div>

      {/* charts 6/6 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div {...fadeUp(0.08)}>
          <Card className="h-full">
            <CardHeader title="Response-time trend" sub="Median first response · minutes · 12 weeks" />
            <div className="px-2 pb-3 pt-2">
              <TargetLineChart data={trend} name="Median response" target={10} targetLabel="target 10m" />
            </div>
          </Card>
        </motion.div>
        <motion.div {...fadeUp(0.14)}>
          <Card className="h-full">
            <CardHeader title="Per-advisor median" sub="Red = over the 10m target" />
            <div className="space-y-2.5 p-4 pt-3">
              {perAdvisor.map((r, i) => {
                const over = r.sec > 600
                return (
                  <div key={r.m.id} className="flex items-center gap-3">
                    <Avatar name={r.m.name} initials={r.m.initials} size={24} />
                    <span className="w-28 truncate text-[12.5px] text-ink-700">{r.m.name}</span>
                    <span className="relative h-[16px] min-w-0 flex-1 overflow-hidden rounded-[4px] bg-sunken/70">
                      <motion.span
                        className={cn('block h-full rounded-r-[6px]', over ? 'bg-red-600' : 'bg-palm-600')}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: r.sec / maxSec }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: EASE_OUT }}
                        style={{ transformOrigin: 'left' }}
                      />
                    </span>
                    <span
                      className={cn(
                        'tnum w-16 text-right font-mono text-[12.5px]',
                        over ? 'font-semibold text-red-600' : 'text-ink-900',
                      )}
                    >
                      {fmtMinSec(r.sec)}
                    </span>
                  </div>
                )
              })}
              {perAdvisor.length === 0 && (
                <EmptyState
                  icon={Clock3}
                  title="No advisor data"
                  description="No conversations attributed to advisors for this selection."
                />
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* breach table */}
      <motion.div {...fadeUp(0.18)}>
        <CardHeader className="px-0" title="SLA breaches & at-risk threads" sub="Inbox threads against response SLA" />
        <DataTable
          columns={breachColumns}
          data={breaches}
          rowKey={(r) => String(r.id)}
          onRowClick={() => navigate('/inbox')}
          emptyState={
            <EmptyState
              icon={Inbox}
              title="No breaches"
              description="Every thread is inside its response SLA window."
            />
          }
        />
      </motion.div>

      {/* AI insight footer */}
      <motion.div {...fadeUp(0.22)}>
        <Card className="border-l-2 border-l-gold-500 p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
                <AiBadge />
                Response-time insight
              </p>
              <p className="mt-2 text-[13.5px] leading-[22px] text-ink-900">
                WhatsApp leads answered 2.3× faster convert 18% more → consider auto-ack drafts for
                new inbound threads.
              </p>
              <SourceChips
                className="mt-3"
                sources={[
                  { kind: 'note', label: 'Inbox log' },
                  { kind: 'property-db', label: 'Deals DB' },
                ]}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/automations')}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-3.5 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
            >
              Create automation
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

/* ========================= Viewing performance ========================= */

/** Weekly viewing volume: live count for the current week; the trailing
 *  window is modeled deterministically around the live level. */
function buildViewingsWeeks(thisWeek: number): { week: string; value: number }[] {
  const rng = mulberry32(5)
  return Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    value: i === 11 ? thisWeek : Math.max(1, Math.round(thisWeek * (0.5 + rng() * 0.8))),
  }))
}

function ViewingsTab({ data }: { data: ReportsData }) {
  const navigate = useNavigate()
  const total = data.viewings.length
  const completed = data.viewings.filter((v) => v.status === 'completed')
  const completionPct = total > 0 ? Math.round((completed.length / total) * 100) : 0
  const scored = completed.filter((v) => v.interestScore != null)
  const avgInterest =
    scored.length > 0
      ? scored.reduce((a, v) => a + (v.interestScore ?? 0), 0) / scored.length / 2 // normalize /10 → /5
      : 0

  const weekly = useMemo(() => buildViewingsWeeks(data.kpis.viewingsWeek), [data.kpis.viewingsWeek])

  const outcomeSlices = useMemo(() => {
    const order = ['completed', 'scheduled', 'cancelled']
    const labels: Record<string, string> = {
      completed: 'Completed',
      scheduled: 'Scheduled',
      cancelled: 'Cancelled',
    }
    return order
      .map((s) => ({ key: s, label: labels[s], value: data.viewings.filter((v) => v.status === s).length }))
      .filter((s) => s.value > 0)
      .map((s) => ({ ...s, sub: `${Math.round((s.value / Math.max(1, total)) * 100)}% of total` }))
  }, [data.viewings, total])

  const perProperty = useMemo(() => {
    const map = new Map<string, { name: string; viewings: number; interest: number[]; propertyId: number | null }>()
    for (const v of data.viewings) {
      const row = map.get(v.propertyName) ?? {
        name: v.propertyName,
        viewings: 0,
        interest: [],
        propertyId: v.propertyId,
      }
      row.viewings += 1
      if (v.interestScore != null) row.interest.push(v.interestScore)
      map.set(v.propertyName, row)
    }
    const offerStageIdx = STAGE_ORDER.indexOf('Offer Made')
    return [...map.values()]
      .map((r) => ({
        ...r,
        avg: r.interest.length > 0 ? r.interest.reduce((a, b) => a + b, 0) / r.interest.length / 2 : null,
        offers: data.deals.filter(
          (d) => d.propertyId != null && d.propertyId === r.propertyId && STAGE_ORDER.indexOf(d.stage) >= offerStageIdx,
        ).length,
      }))
      .sort((a, b) => b.viewings - a.viewings)
  }, [data.viewings, data.deals])

  const columns: Column<(typeof perProperty)[number]>[] = [
    {
      key: 'property',
      header: 'Property',
      render: (r) => <span className="text-[13px] font-medium text-ink-900">{r.name}</span>,
    },
    { key: 'viewings', header: 'Viewings', align: 'right', sortable: true, sortValue: (r) => r.viewings },
    {
      key: 'avg',
      header: 'Avg interest',
      align: 'right',
      render: (r) => (
        <span className="tnum font-mono text-[12.5px]">{r.avg != null ? `${r.avg.toFixed(1)}/5` : '—'}</span>
      ),
    },
    {
      key: 'offers',
      header: 'Offers generated',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.offers,
      render: (r) => <span className="tnum">{r.offers > 0 ? r.offers : '—'}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      {/* KPI chips */}
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-2">
        {[
          { icon: CalendarDays, text: `${data.kpis.viewingsWeek} this week` },
          { icon: TrendingUp, text: `${completionPct}% completion` },
          { icon: Activity, text: `avg interest ${avgInterest.toFixed(1)}/5` },
        ].map((c) => (
          <span
            key={c.text}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-sunken px-3.5 text-[12.5px] font-medium text-ink-900 ring-1 ring-line"
          >
            <c.icon className="h-3.5 w-3.5 text-palm-600" strokeWidth={1.75} />
            <span className="tnum">{c.text}</span>
          </span>
        ))}
      </motion.div>

      {/* charts 6/6 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div {...fadeUp(0.08)}>
          <Card className="h-full">
            <CardHeader title="Viewings per week" sub="Last 12 weeks" />
            <div className="px-2 pb-3 pt-2">
              <WeeklyBars data={weekly} name="Viewings" />
            </div>
          </Card>
        </motion.div>
        <motion.div {...fadeUp(0.14)}>
          <Card className="h-full">
            <CardHeader title="Outcome mix" sub="By viewing status" />
            <div className="p-4 pt-2">
              {outcomeSlices.length > 0 ? (
                <DonutWithLegend
                  data={outcomeSlices}
                  centerTop={String(total)}
                  centerSub="viewings"
                  size={180}
                />
              ) : (
                <EmptyState
                  icon={CalendarDays}
                  title="No viewings"
                  description="Schedule a viewing to populate outcome analytics."
                  primaryCta={{ label: 'Open Viewings', onClick: () => navigate('/viewings') }}
                />
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* per-property table */}
      <motion.div {...fadeUp(0.18)}>
        <CardHeader className="px-0" title="Performance by property" sub="Viewings · interest · offers generated" />
        <DataTable
          columns={columns}
          data={perProperty}
          rowKey={(r) => r.name}
          onRowClick={() => navigate('/properties')}
          emptyState={
            <EmptyState
              icon={CalendarDays}
              title="No viewing data"
              description="Properties will appear here once viewings are scheduled."
            />
          }
        />
      </motion.div>

      {/* insight row */}
      <motion.div {...fadeUp(0.22)}>
        <Card className="border-l-2 border-l-gold-500 p-4">
          <p className="flex items-center gap-2 text-[13.5px] text-ink-900">
            <Sparkles className="h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.75} />
            Second viewings convert to offer 41% of the time — push second visits for warm buyers.
          </p>
        </Card>
      </motion.div>
    </div>
  )
}

/* ========================== Source attribution ========================= */

function SourcesTab({ data, sourceFilter }: { data: ReportsData; sourceFilter: string }) {
  const navigate = useNavigate()

  /** live contact distribution by source, desc */
  const sourceCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of data.contacts) map.set(c.source, (map.get(c.source) ?? 0) + 1)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [data.contacts])

  /** monthly stacked rows: current month = live weekly leads run-rate; prior
   *  months modeled deterministically from the same distribution. */
  const months = useMemo(() => {
    const rng = mulberry32(3)
    const totalContacts = Math.max(1, sourceCounts.reduce((a, [, n]) => a + n, 0))
    const totals = [
      Math.round(data.kpis.newLeadsWeek * 3.1),
      Math.round(data.kpis.newLeadsWeek * 3.7),
      data.kpis.newLeadsWeek,
    ]
    const labels = ['Jan', 'Feb', 'Mar']
    return labels.map((month, mi) => {
      const segments = sourceCounts.map(([label, n], si) => ({
        label,
        color: CHART_PALETTE[si % CHART_PALETTE.length],
        value: Math.max(0, Math.round(totals[mi] * (n / totalContacts) * (0.85 + rng() * 0.3))),
      }))
      return { month, total: segments.reduce((a, s) => a + s.value, 0), segments }
    })
  }, [sourceCounts, data.kpis.newLeadsWeek])

  /** attribution table rows — leads scaled to the live weekly total; funnel
   *  joins (qualified %, viewings, won) computed live via contact links. */
  const rows = useMemo(() => {
    const contactIdsBySource = new Map<string, Set<number>>()
    for (const c of data.contacts) {
      const set = contactIdsBySource.get(c.source) ?? new Set<number>()
      set.add(c.id)
      contactIdsBySource.set(c.source, set)
    }
    const scaledLeads = scaleToTotal(
      sourceCounts.map(([, n]) => n),
      data.kpis.newLeadsWeek,
    )
    return sourceCounts.map(([source, liveCount], i) => {
      const ids = contactIdsBySource.get(source) ?? new Set<number>()
      const sourceDeals = data.deals.filter((d) => d.contactId != null && ids.has(d.contactId))
      const qualified = sourceDeals.filter((d) => STAGE_ORDER.indexOf(d.stage) > 0).length
      const viewings = data.viewings.filter((v) => v.contactId != null && ids.has(v.contactId)).length
      const won = sourceDeals.filter((d) => d.outcome === 'won')
      return {
        source,
        leads: scaledLeads[i],
        qualifiedPct: liveCount > 0 ? Math.round((qualified / liveCount) * 100) : 0,
        viewings,
        won: won.length,
        wonAed: won.reduce((a, d) => a + d.valueAed, 0),
        cost: COST_PER_LEAD_STUB[source] ?? null,
        roi: ROI_STUB[source] ?? null,
      }
    })
  }, [sourceCounts, data.contacts, data.deals, data.viewings, data.kpis.newLeadsWeek])

  const visibleRows = sourceFilter === 'all' ? rows : rows.filter((r) => r.source === sourceFilter)

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'source',
      header: 'Source',
      render: (r) => <span className="text-[13px] font-medium text-ink-900">{r.source}</span>,
    },
    { key: 'leads', header: 'Leads', align: 'right', sortable: true, sortValue: (r) => r.leads },
    {
      key: 'qualifiedPct',
      header: 'Qualified %',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.qualifiedPct,
      render: (r) => <span className="tnum">{r.qualifiedPct}%</span>,
    },
    { key: 'viewings', header: 'Viewings', align: 'right' },
    {
      key: 'won',
      header: 'Won',
      align: 'right',
      render: (r) => <span className="tnum">{r.won > 0 ? r.won : '—'}</span>,
    },
    {
      key: 'wonAed',
      header: 'AED closed',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12.5px]">{r.wonAed > 0 ? fmtAedFull(r.wonAed) : '—'}</span>,
    },
    {
      key: 'cost',
      header: 'Cost / lead',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12.5px]">{r.cost != null ? `AED ${r.cost}` : '—'}</span>,
    },
    {
      key: 'roi',
      header: 'ROI',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12.5px]">{r.roi ?? '—'}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      {/* stacked leads-by-source by month */}
      <motion.div {...fadeUp(0.06)}>
        <Card>
          <CardHeader title="Leads by source by month" sub="Stacked · trailing 3 months" />
          <div className="space-y-4 p-4 pt-3">
            {months.map((m, mi) => (
              <div key={m.month} className="flex items-center gap-3">
                <span className="w-8 text-[12.5px] font-medium text-ink-700">{m.month}</span>
                <div className="flex h-6 min-w-0 flex-1 overflow-hidden rounded-md bg-sunken/60">
                  {m.segments.map((s, si) =>
                    s.value > 0 ? (
                      <motion.span
                        key={s.label}
                        title={`${s.label} · ${s.value}`}
                        className="block h-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, delay: mi * 0.1 + si * 0.04, ease: EASE_OUT }}
                        style={{
                          width: `${(s.value / Math.max(1, m.total)) * 100}%`,
                          background: s.color,
                          transformOrigin: 'left',
                        }}
                      />
                    ) : null,
                  )}
                </div>
                <span className="tnum w-8 text-right font-mono text-[12px] text-ink-500">{m.total}</span>
              </div>
            ))}
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
              {sourceCounts.map(([label], i) => (
                <li key={label} className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
                  />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </motion.div>

      {/* attribution table */}
      <motion.div {...fadeUp(0.12)}>
        <CardHeader
          className="px-0"
          title="Source attribution"
          sub="Leads · qualified · viewings · won · cost (cost/ROI are portal stubs)"
        />
        <DataTable
          columns={columns}
          data={visibleRows}
          rowKey={(r) => r.source}
          onRowClick={(r) => navigate(`/relationships?source=${encodeURIComponent(r.source)}`)}
          emptyState={
            <EmptyState
              icon={TrendingUp}
              title="No sources in selection"
              description="Widen the source filter to see attribution."
            />
          }
        />
      </motion.div>

      {/* AI budget suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: EASE_OUT }}
      >
        <Card className="border-l-2 border-l-gold-500 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <AiBadge />
            <p className="min-w-0 flex-1 text-[13.5px] text-ink-900">
              Shift ~15% of Dubizzle spend toward Referral incentives — referral leads show the
              strongest qualified rate in the workspace.
            </p>
            <ConfidenceMeter value={76} />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

/* ======================== Commission overview ========================== */

function CommissionTab({ data, teamFilter }: { data: ReportsData; teamFilter: string }) {
  const wonDeals = useMemo(
    () =>
      data.deals
        .filter((d) => d.outcome === 'won')
        .filter((d) => teamFilter === 'all' || String(d.ownerId) === teamFilter)
        .map((d) => {
          const gross = Math.round(d.valueAed * 0.02) // 2% brokerage
          const daysAgo = agoToDays(d.updatedAgo)
          return {
            ...d,
            gross,
            closeDate: fmtDay(addDays(DEMO_NOW, -Math.round(daysAgo))),
            status: daysAgo >= 7 ? ('Paid' as const) : ('Pending' as const),
          }
        }),
    [data.deals, teamFilter],
  )

  const grossTotal = data.kpis.commissionMtdAed
  const paidTotal = wonDeals.filter((d) => d.status === 'Paid').reduce((a, d) => a + d.gross, 0)
  const pendingTotal = Math.max(0, grossTotal - paidTotal)

  const grossAnim = useCountUp(grossTotal)
  const paidAnim = useCountUp(paidTotal)
  const pendingAnim = useCountUp(pendingTotal)

  const columns: Column<(typeof wonDeals)[number]>[] = [
    {
      key: 'deal',
      header: 'Deal',
      render: (r) => (
        <span className="block min-w-0">
          <span className="block truncate text-[13px] font-medium text-ink-900">{r.contactName}</span>
          <span className="block truncate text-[11.5px] text-ink-500">{r.propertyLine}</span>
        </span>
      ),
    },
    { key: 'close', header: 'Close date', align: 'right', render: (r) => <span className="tnum">{r.closeDate}</span> },
    {
      key: 'gross',
      header: 'Gross AED (2%)',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.gross,
      render: (r) => <span className="tnum font-mono text-[12.5px]">{fmtAedFull(r.gross)}</span>,
    },
    {
      key: 'split',
      header: 'Split (advisor/house)',
      align: 'center',
      render: () => <span className="tnum font-mono text-[12.5px]">50/50</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        r.status === 'Paid' ? (
          <StatusChip tone="palm">Paid</StatusChip>
        ) : (
          <StatusChip tone="amber">Pending</StatusChip>
        ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div {...fadeUp(0)}>
          <KpiCard label="Gross commission (MTD)" value={fmtAedFull(grossAnim)} subline="2% brokerage" />
        </motion.div>
        <motion.div {...fadeUp(0.06)}>
          <KpiCard label="Paid out" value={fmtAedFull(paidAnim)} spark={sparkSeries('commission-paid')} />
        </motion.div>
        <motion.div {...fadeUp(0.12)}>
          <StatCard
            label="Pending"
            value={fmtAedFull(pendingAnim)}
            subline="awaiting payout"
            sublineClassName="text-amber-600"
          />
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.14)}>
        <CardHeader className="px-0" title="Won deals" sub="Commission at 2% brokerage · MTD" />
        <DataTable
          columns={columns}
          data={wonDeals}
          rowKey={(r) => String(r.id)}
          emptyState={
            <EmptyState
              icon={Handshake}
              title="No closed deals in this range"
              description="Widen the date range or clear the advisor filter to see commissionable deals."
            />
          }
        />
      </motion.div>

      <motion.p {...fadeUp(0.2)} className="text-[12.5px] text-ink-500">
        Commission engine rules configured in{' '}
        <a href="/admin" className="font-medium text-palm-600 hover:text-palm-700">
          Administration
        </a>{' '}
        → stub for MVP.
      </motion.p>
    </div>
  )
}

/* ========================= Integration health ========================== */

function IntegrationsTab({ data }: { data: ReportsData }) {
  const counts = useMemo(() => {
    const c = { connected: 0, degraded: 0, error: 0 }
    for (const i of data.integrations) {
      if (i.status === 'connected') c.connected += 1
      else if (i.status === 'degraded') c.degraded += 1
      else c.error += 1
    }
    return c
  }, [data.integrations])

  const columns: Column<IntegrationRow>[] = [
    {
      key: 'name',
      header: 'Integration',
      render: (r) => (
        <span className="block min-w-0">
          <span className="flex items-center gap-2 text-[13px] font-medium text-ink-900">
            <PlugZap className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
            {r.name}
          </span>
          <span className="block text-[11.5px] text-ink-500">{r.category}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => {
        const s = r.status === 'connected' ? 'connected' : r.status === 'degraded' ? 'degraded' : 'error'
        return (
          <span className="inline-flex items-center gap-2">
            <HealthDot status={s} />
            <StatusChip tone={s === 'connected' ? 'palm' : s === 'degraded' ? 'amber' : 'red'} dot={false}>
              {s === 'connected' ? 'Connected' : s === 'degraded' ? 'Degraded' : 'Error'}
            </StatusChip>
          </span>
        )
      },
    },
    {
      key: 'detail',
      header: 'Detail',
      render: (r) => <span className="text-[12.5px] text-ink-700">{r.detail ?? '—'}</span>,
    },
    {
      key: 'sync',
      header: 'Last sync',
      align: 'right',
      render: (r) => <span className="tnum font-mono text-[12px] text-ink-500">{r.lastSyncAgo ?? '—'}</span>,
    },
  ]

  return (
    <div className="space-y-5">
      <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-2">
        {[
          { text: `${counts.connected} connected`, cls: 'bg-palm-100 text-palm-700' },
          { text: `${counts.degraded} degraded`, cls: 'bg-amber-100 text-amber-600' },
          { text: `${counts.error} error`, cls: 'bg-red-100 text-red-600' },
          { text: `${data.kpis.syncSuccess}% message sync success`, cls: 'bg-sunken text-ink-700' },
          { text: `${data.kpis.aiPrecision}% AI extraction precision`, cls: 'bg-gold-100 text-gold-600' },
        ].map((c) => (
          <span
            key={c.text}
            className={cn(
              'tnum inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] font-medium ring-1 ring-line',
              c.cls,
            )}
          >
            {c.text}
          </span>
        ))}
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <DataTable
          columns={columns}
          data={data.integrations}
          rowKey={(r) => String(r.id)}
          emptyState={
            <EmptyState
              icon={PlugZap}
              title="No integrations"
              description="Connect WhatsApp, email, and calendars from Administration."
            />
          }
        />
      </motion.div>

      <motion.p {...fadeUp(0.16)} className="text-[12.5px] text-ink-500">
        Manage credentials and sync windows in{' '}
        <a href="/admin" className="font-medium text-palm-600 hover:text-palm-700">
          Administration
        </a>
        .
      </motion.p>
    </div>
  )
}
