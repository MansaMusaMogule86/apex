/**
 * Deal Drawer — full-width side panel (design.md §8.6 / deals.md S4).
 * (deals.md §S4; expandable to 720px via the drawer's built-in control).
 * Opens from kanban card / table row click. Stage stepper mini, key facts,
 * AI health, stage history, advance-stage + move-stage actions.
 * "Open full page ↗" navigates to /deals/:id.
 */
import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  Handshake,
  History,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import RecordDrawer from '@/components/app/RecordDrawer'
import { StatusChip, DaysInStagePill } from '@/components/app/Chips'
import { AiBadge } from '@/components/app/AiKit'
import OwnerAvatar from './OwnerAvatar'
import StageStepper from './StageStepper'
import MoveStageMenu from './MoveStageMenu'
import LostReasonDialog from './LostReasonDialog'
import ConfirmMoveDialog from './ConfirmMoveDialog'
import { useMoveStage } from './useMoveStage'
import {
  LOST_STAGE,
  aedFull,
  nextStage,
  ownerOf,
  stageChipTone,
  type DealRow,
  type StageHistoryEntry,
} from './utils'

/* ------------------------------ AI health ------------------------------ */

export function AiHealthBlock({ deal, className }: { deal: DealRow; className?: string }) {
  const sentences = (deal.aiHealth ?? '')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return (
    <div
      className={cn('rounded-[10px] p-4', className)}
      style={{ background: 'color-mix(in srgb, var(--gold-100) 40%, transparent)' }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-gold-600" strokeWidth={1.75} />
        <p className="text-[13px] font-semibold text-ink-900">AI deal health</p>
        <AiBadge className="ml-auto" />
      </div>
      {sentences.length > 0 ? (
        <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-ink-700">
          {sentences.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-[13px] leading-5 text-ink-500">
          No AI health note yet — APEX analyzes this deal as activity accrues.
        </p>
      )}
    </div>
  )
}

/* ------------------------------ timeline ------------------------------- */

export function StageHistoryTimeline({ history }: { history: StageHistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-[13px] text-ink-500">
        No stage changes recorded yet.
      </p>
    )
  }
  return (
    <ol className="relative space-y-4 border-l border-line pl-5">
      {history.map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-palm-600 bg-surface" />
          <div className="flex flex-wrap items-center gap-1.5">
            {h.fromStage && (
              <>
                <span className="rounded-full bg-sunken px-2 py-0.5 text-[11.5px] font-medium text-ink-500">
                  {h.fromStage}
                </span>
                <ArrowRight className="h-3 w-3 text-ink-400" strokeWidth={1.75} />
              </>
            )}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11.5px] font-semibold',
                h.toStage === 'Won'
                  ? 'bg-palm-100 text-palm-700'
                  : h.toStage === 'Lost'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-palm-100 text-palm-700',
              )}
            >
              {h.toStage}
            </span>
          </div>
          <p className="mt-1 text-[12px] text-ink-500">
            {h.changedBy} · <span className="text-ink-400">{h.ago}</span>
          </p>
        </li>
      ))}
    </ol>
  )
}

/* -------------------------------- drawer -------------------------------- */

const drawerTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'ai', label: 'AI' },
]

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
      <div className="mt-1 text-[13px] leading-5 text-ink-900">{children}</div>
    </div>
  )
}

function DrawerBody({ deal, onClose }: { deal: DealRow; onClose: () => void }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [lostOpen, setLostOpen] = useState(false)
  const [confirmStage, setConfirmStage] = useState<string | null>(null)
  const { move } = useMoveStage()

  const stagesQ = trpc.apex.deals.stages.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const historyQ = trpc.apex.deals.stageHistory.useQuery({ dealId: deal.id })
  const propertyQ = trpc.apex.properties.get.useQuery(
    { id: deal.propertyId ?? 0 },
    { enabled: deal.propertyId != null },
  )

  const stages = stagesQ.data ?? []
  const owner = ownerOf(teamQ.data, deal.ownerId)
  const next = nextStage(stages, deal.stage)
  const terminal = deal.outcome !== 'open'

  const requestStage = (stage: string) => {
    if (stage === LOST_STAGE) setLostOpen(true)
    else setConfirmStage(stage)
  }

  const property = propertyQ.data ?? null

  return (
    <>
      <RecordDrawer
        open
        onClose={onClose}
        title={deal.title}
        subtitle={deal.propertyLine}
        avatar={
          owner ? (
            <OwnerAvatar name={owner.name} initials={owner.initials} size={36} />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunken">
              <Handshake className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
            </span>
          )
        }
        chips={
          <>
            <StatusChip tone={stageChipTone(deal.stage)}>{deal.stage}</StatusChip>
            <span className="tnum font-mono text-[12.5px] font-medium text-ink-900">
              {aedFull(deal.valueAed)}
            </span>
            {deal.atRisk && !terminal && (
              <StatusChip tone="red">
                <AlertTriangle className="h-3 w-3" strokeWidth={1.75} />
                At risk
              </StatusChip>
            )}
          </>
        }
        tabs={drawerTabs}
        activeTab={tab}
        onTabChange={setTab}
        onOpenFullPage={() => navigate(`/deals/${deal.id}`)}
        footer={
          terminal ? (
            <StatusChip tone={deal.outcome === 'won' ? 'palm' : 'red'}>
              {deal.outcome === 'won' ? 'Won' : `Lost${deal.lossReason ? ` — ${deal.lossReason}` : ''}`}
            </StatusChip>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLostOpen(true)}
                className="mr-auto rounded-md px-3.5 py-2 text-[13px] font-medium text-red-600 transition-colors duration-120 hover:bg-red-100 active:scale-[0.98]"
              >
                Mark lost
              </button>
              <MoveStageMenu
                stages={stages}
                current={deal.stage}
                onSelect={requestStage}
                trigger={
                  <button
                    type="button"
                    className="rounded-md border border-line-strong px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
                  >
                    Move…
                  </button>
                }
              />
              {next && (
                <button
                  type="button"
                  onClick={() => requestStage(next)}
                  className="rounded-md bg-palm-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
                >
                  Advance to {next}
                </button>
              )}
            </>
          )
        }
      >
        {/* stage stepper mini — sticky under the header */}
        {stages.length > 0 && (
          <div className="sticky -top-4 z-10 -mx-4 border-b border-line bg-surface px-4 pb-3 pt-1">
            <StageStepper stages={stages} current={deal.stage} compact onSelect={requestStage} />
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-4 pt-4">
            {deal.atRisk && deal.riskNote && !terminal && (
              <div className="flex items-start gap-2.5 rounded-[10px] bg-red-100 p-3.5 text-[13px] leading-5 text-red-600">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>{deal.riskNote}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-[10px] border border-line bg-surface p-4">
              <Fact label="Contact">
                {deal.contactId != null ? (
                  <Link
                    to={`/relationships/${deal.contactId}`}
                    className="inline-flex items-center gap-1.5 font-medium text-palm-600 hover:underline"
                  >
                    <UserRound className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {deal.contactName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <UserRound className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                    {deal.contactName}
                  </span>
                )}
              </Fact>
              <Fact label="Owner">
                {owner ? (
                  <span className="inline-flex items-center gap-2">
                    <OwnerAvatar name={owner.name} initials={owner.initials} size={20} />
                    {owner.name}
                  </span>
                ) : (
                  'Unassigned'
                )}
              </Fact>
              <Fact label="Value">
                <span className="tnum font-mono font-medium">{aedFull(deal.valueAed)}</span>
              </Fact>
              <Fact label="Commission est. · 2%">
                <span className="tnum font-mono font-medium">
                  {aedFull(Math.round(deal.valueAed * 0.02))}
                </span>
              </Fact>
              <Fact label="Probability">
                <span className="tnum font-mono font-medium">{deal.probability}%</span>
              </Fact>
              <Fact label="Days in stage">
                <DaysInStagePill days={deal.daysInStage} />
              </Fact>
              <Fact label="Updated">
                <span className="inline-flex items-center gap-1.5 text-ink-700">
                  <CalendarClock className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                  {deal.updatedAgo ?? '—'}
                </span>
              </Fact>
              <Fact label="Next action">
                {deal.nextAction ? (
                  <span className="inline-flex items-center gap-1.5 text-ink-700">
                    <ArrowRight className="h-3.5 w-3.5 text-palm-600" strokeWidth={1.75} />
                    {deal.nextAction}
                  </span>
                ) : (
                  <span className="text-ink-400">—</span>
                )}
              </Fact>
            </div>

            {/* linked property card */}
            {deal.propertyId != null && (
              <Link
                to={`/properties/${deal.propertyId}`}
                className="flex items-center gap-3 rounded-[10px] border border-line bg-surface p-3 transition-shadow duration-180 hover:shadow-e1"
              >
                {property?.image ? (
                  <img
                    src={property.image}
                    alt={deal.propertyLine ?? ''}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-lg bg-sunken object-cover"
                  />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-sunken">
                    <Building2 className="h-6 w-6 text-ink-400" strokeWidth={1.5} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink-900">
                    {property?.name ?? deal.propertyLine}
                  </span>
                  <span className="block truncate text-[12px] text-ink-500">
                    {property
                      ? `${property.community} · ${property.beds}BR · ${property.sizeSqft.toLocaleString('en-US')} sqft`
                      : 'Loading property…'}
                  </span>
                  {property && (
                    <span className="tnum mt-0.5 block font-mono text-[12px] font-medium text-ink-900">
                      {aedFull(property.priceAed)}
                    </span>
                  )}
                </span>
              </Link>
            )}

            <AiHealthBlock deal={deal} />
          </div>
        )}

        {tab === 'timeline' && (
          <div className="pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-micro font-semibold uppercase text-ink-500">
              <History className="h-3.5 w-3.5" strokeWidth={1.75} />
              Stage history
            </p>
            {historyQ.isLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-sunken" />
                ))}
              </div>
            ) : (
              <StageHistoryTimeline history={historyQ.data ?? []} />
            )}
          </div>
        )}

        {tab === 'ai' && (
          <div className="pt-4">
            <AiHealthBlock deal={deal} />
          </div>
        )}
      </RecordDrawer>

      <LostReasonDialog
        deal={deal}
        open={lostOpen}
        onOpenChange={setLostOpen}
        onConfirm={() => move(deal, LOST_STAGE)}
      />
      <ConfirmMoveDialog
        deal={deal}
        toStage={confirmStage}
        onOpenChange={(v) => !v && setConfirmStage(null)}
        onConfirm={(stage) => move(deal, stage)}
      />
    </>
  )
}

export function DealDrawer({
  dealId,
  onClose,
}: {
  dealId: number | null
  onClose: () => void
}) {
  const dealQ = trpc.apex.deals.get.useQuery(
    { id: dealId ?? 0 },
    { enabled: dealId != null },
  )
  const deal = dealQ.data ?? null

  if (dealId == null) return null

  if (dealQ.isLoading) {
    return (
      <RecordDrawer open onClose={onClose} title="Loading deal…" subtitle=" ">
        <div className="space-y-3 pt-2">
          <div className="h-8 animate-pulse rounded-lg bg-sunken" />
          <div className="h-40 animate-pulse rounded-[10px] bg-sunken" />
          <div className="h-24 animate-pulse rounded-[10px] bg-sunken" />
        </div>
      </RecordDrawer>
    )
  }

  if (!deal) {
    return (
      <RecordDrawer open onClose={onClose} title="Deal unavailable" subtitle=" ">
        <p className="pt-4 text-[13px] leading-5 text-ink-500">
          This deal could not be loaded — it may have been removed. Close the drawer and refresh
          the board.
        </p>
      </RecordDrawer>
    )
  }

  return <DrawerBody key={deal.id} deal={deal} onClose={onClose} />
}

export default DealDrawer
