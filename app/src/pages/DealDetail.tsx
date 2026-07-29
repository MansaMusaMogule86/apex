/**
 * Deal detail — `/deals/:id` (deals.md §S4 as full page).
 * Header (title, stage chip, value, owner, at-risk banner), 13-stage stepper
 * with click-to-move confirm, AI health block (aiHealth + AiBadge gold
 * styling), stage history timeline, associated contact/property cards,
 * next action + advance / Win / Lose actions via apex.deals.moveStage.
 */
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  Handshake,
  History,
  Trophy,
  XCircle,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { StatusChip, DaysInStagePill } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import { Toaster } from '@/components/ui/sonner'
import OwnerAvatar from '@/components/deals/OwnerAvatar'
import StageStepper from '@/components/deals/StageStepper'
import MoveStageMenu from '@/components/deals/MoveStageMenu'
import LostReasonDialog from '@/components/deals/LostReasonDialog'
import ConfirmMoveDialog from '@/components/deals/ConfirmMoveDialog'
import WonConfetti from '@/components/deals/WonConfetti'
import { AiHealthBlock, StageHistoryTimeline } from '@/components/deals/DealDrawer'
import { useMoveStage } from '@/components/deals/useMoveStage'
import {
  LOST_STAGE,
  WON_STAGE,
  aedFull,
  nextStage,
  ownerOf,
  stageChipTone,
} from '@/components/deals/utils'

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—'
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
      <div className="mt-1 text-[13px] leading-5 text-ink-900">{children}</div>
    </div>
  )
}

export default function DealDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dealId = Number(id)
  const validId = Number.isFinite(dealId) && dealId > 0

  const dealQ = trpc.apex.deals.get.useQuery({ id: dealId }, { enabled: validId })
  const stagesQ = trpc.apex.deals.stages.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const historyQ = trpc.apex.deals.stageHistory.useQuery({ dealId }, { enabled: validId })
  const deal = dealQ.data ?? null
  const propertyQ = trpc.apex.properties.get.useQuery(
    { id: deal?.propertyId ?? 0 },
    { enabled: deal?.propertyId != null },
  )

  const [lostOpen, setLostOpen] = useState(false)
  const [confirmStage, setConfirmStage] = useState<string | null>(null)
  const { move, confettiKey } = useMoveStage()

  /* ------------------------- loading / not found ------------------------- */
  if (dealQ.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-28 animate-pulse rounded bg-sunken" />
        <div className="rounded-[10px] border border-line bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-sunken" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-64 animate-pulse rounded bg-sunken" />
              <div className="h-3.5 w-40 animate-pulse rounded bg-sunken" />
            </div>
            <div className="h-7 w-32 animate-pulse rounded bg-sunken" />
          </div>
        </div>
        <div className="h-24 animate-pulse rounded-[10px] bg-sunken" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-[10px] bg-sunken lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-[10px] bg-sunken" />
        </div>
      </div>
    )
  }

  if (!validId || !deal) {
    return (
      <div className="rounded-[10px] border border-line bg-surface">
        <EmptyState
          icon={Handshake}
          title="Deal not found"
          description="This deal may have been removed, or the link is wrong. Head back to the board to pick another deal."
          primaryCta={{ label: 'Back to Deal Flow', onClick: () => navigate('/deals') }}
        />
      </div>
    )
  }

  const stages = stagesQ.data ?? []
  const owner = ownerOf(teamQ.data, deal.ownerId)
  const next = nextStage(stages, deal.stage)
  const terminal = deal.outcome !== 'open'
  const property = propertyQ.data ?? null

  const requestStage = (stage: string) => {
    if (stage === LOST_STAGE) setLostOpen(true)
    else setConfirmStage(stage)
  }

  return (
    <div className="space-y-4">
      {/* breadcrumb back */}
      <Link
        to="/deals"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 transition-colors hover:text-palm-600"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Deal Flow
      </Link>

      {/* header */}
      <div className="rounded-[10px] border border-line bg-surface p-5">
        <div className="flex flex-wrap items-start gap-4">
          {owner ? (
            <OwnerAvatar name={owner.name} initials={owner.initials} size={36} />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sunken">
              <Handshake className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink-900">
              {deal.title}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-ink-500">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
              {deal.propertyLine}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusChip tone={stageChipTone(deal.stage)}>{deal.stage}</StatusChip>
              <span className="tnum font-mono text-[12.5px] text-ink-500">
                {deal.probability}% probability
              </span>
              {owner && <span className="text-[12.5px] text-ink-500">· {owner.name}</span>}
              {deal.atRisk && !terminal && (
                <StatusChip tone="red">
                  <AlertTriangle className="h-3 w-3" strokeWidth={1.75} />
                  At risk
                </StatusChip>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            <p className="tnum font-mono text-[24px] font-semibold leading-7 text-ink-900">
              {aedFull(deal.valueAed)}
            </p>
            {!terminal ? (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLostOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-red-600 transition-colors duration-120 hover:bg-red-100 active:scale-[0.98]"
                >
                  <XCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Lose
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmStage(WON_STAGE)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-palm-600 px-3 py-2 text-[13px] font-semibold text-palm-700 transition-colors duration-120 hover:bg-palm-50 active:scale-[0.98]"
                >
                  <Trophy className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Win
                </button>
                <MoveStageMenu
                  stages={stages}
                  current={deal.stage}
                  onSelect={requestStage}
                  trigger={
                    <button
                      type="button"
                      className="rounded-md border border-line-strong px-3 py-2 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
                    >
                      Move…
                    </button>
                  }
                />
                {next && (
                  <button
                    type="button"
                    onClick={() => setConfirmStage(next)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-palm-600 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
                  >
                    Advance to {next}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            ) : (
              <StatusChip tone={deal.outcome === 'won' ? 'palm' : 'red'} className="h-7 px-3 text-[12.5px]">
                {deal.outcome === 'won' ? 'Won' : `Lost${deal.lossReason ? ` — ${deal.lossReason}` : ''}`}
              </StatusChip>
            )}
          </div>
        </div>

        {/* at-risk banner */}
        {deal.atRisk && deal.riskNote && !terminal && (
          <div className="mt-4 flex items-start gap-2.5 rounded-[10px] bg-red-100 p-3.5 text-[13px] leading-5 text-red-600">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>
              <span className="font-semibold">At risk — </span>
              {deal.riskNote}
            </span>
          </div>
        )}
      </div>

      {/* stage stepper */}
      {stages.length > 0 && (
        <div className="rounded-[10px] border border-line bg-surface p-4">
          <p className="mb-3 text-micro font-semibold uppercase text-ink-500">Pipeline stage</p>
          <StageStepper stages={stages} current={deal.stage} onSelect={requestStage} />
          <p className="mt-2.5 text-[11.5px] text-ink-400">
            Click a future stage to move the deal forward — you will be asked to confirm.
          </p>
        </div>
      )}

      {/* main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* AI health */}
          <div className="rounded-[10px] border border-line bg-surface p-4">
            <AiHealthBlock deal={deal} />
          </div>

          {/* stage history */}
          <div className="rounded-[10px] border border-line bg-surface p-4">
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
        </div>

        <div className="space-y-4">
          {/* next action */}
          <div
            className={cn(
              'rounded-[10px] border border-line bg-surface p-4',
              !terminal && deal.nextAction && 'border-l-2 border-l-palm-600',
            )}
          >
            <p className="text-micro font-semibold uppercase text-ink-500">Next action</p>
            {deal.nextAction && !terminal ? (
              <p className="mt-2 flex items-start gap-2 text-[13.5px] font-medium leading-5 text-ink-900">
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-palm-600" strokeWidth={1.75} />
                {deal.nextAction}
              </p>
            ) : (
              <p className="mt-2 text-[13px] text-ink-400">
                {terminal ? 'Deal is closed — no further action.' : 'No next action set.'}
              </p>
            )}
          </div>

          {/* associated contact */}
          <div className="rounded-[10px] border border-line bg-surface p-4">
            <p className="text-micro font-semibold uppercase text-ink-500">Contact</p>
            {deal.contactId != null ? (
              <Link
                to={`/relationships/${deal.contactId}`}
                className="mt-2 flex items-center gap-2.5 rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-palm-50"
              >
                <OwnerAvatar name={deal.contactName} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink-900">
                    {deal.contactName}
                  </span>
                  <span className="block text-[11.5px] text-palm-600">Open contact ↗</span>
                </span>
              </Link>
            ) : (
              <span className="mt-2 flex items-center gap-2.5 p-1.5">
                <OwnerAvatar name={deal.contactName} size={28} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-ink-900">
                    {deal.contactName}
                  </span>
                  <span className="block text-[11.5px] text-ink-400">Not linked to a CRM contact</span>
                </span>
              </span>
            )}
          </div>

          {/* associated property */}
          {deal.propertyId != null && (
            <div className="rounded-[10px] border border-line bg-surface p-4">
              <p className="text-micro font-semibold uppercase text-ink-500">Property</p>
              <Link
                to={`/properties/${deal.propertyId}`}
                className="mt-2 block rounded-lg transition-shadow duration-180 hover:shadow-e1"
              >
                {property?.image ? (
                  <img
                    src={property.image}
                    alt={property.name}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-lg bg-sunken object-cover"
                  />
                ) : (
                  <span className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-sunken">
                    <Building2 className="h-8 w-8 text-ink-400" strokeWidth={1.5} />
                  </span>
                )}
                <span className="block p-2">
                  <span className="block truncate text-[13.5px] font-semibold text-ink-900">
                    {property?.name ?? deal.propertyLine}
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-ink-500">
                    {property
                      ? `${property.community} · ${property.beds}BR · ${property.sizeSqft.toLocaleString('en-US')} sqft · ${property.status}`
                      : 'Loading property…'}
                  </span>
                  {property && (
                    <span className="tnum mt-1 block font-mono text-[12.5px] font-medium text-ink-900">
                      {aedFull(property.priceAed)}
                    </span>
                  )}
                </span>
              </Link>
            </div>
          )}

          {/* key facts */}
          <div className="rounded-[10px] border border-line bg-surface p-4">
            <p className="text-micro font-semibold uppercase text-ink-500">Key facts</p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
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
              <Fact label="Created">{fmtDate(deal.createdAt)}</Fact>
              <Fact label="Updated">
                <span className="inline-flex items-center gap-1.5 text-ink-700">
                  <CalendarClock className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                  {deal.updatedAgo ?? '—'}
                </span>
              </Fact>
            </div>
          </div>
        </div>
      </div>

      {/* dialogs + effects */}
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
      <WonConfetti burstKey={confettiKey} />
      <Toaster position="bottom-right" />
    </div>
  )
}
