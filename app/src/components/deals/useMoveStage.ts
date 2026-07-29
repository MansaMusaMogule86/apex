/**
 * Drag-and-drop stage move with optimistic update and undo toast.
 * Optimistic update of the cached deal list + deal detail, rollback toast on
 * failure, success toast with 5s Undo, and a once-per-session gold confetti
 * burst when a deal is Won (deals.md §S2/§S5).
 */
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { trpc } from '@/providers/trpc'
import { pipelineStages } from '@/lib/demo-data'
import {
  type DealMutationError,
  type DealRow,
  type MoveStageRequest,
  type MoveStageResponse,
  type DealStatus,
} from './types'
import { LOST_STAGE, WON_STAGE } from './utils'

const ALLOWED_STAGES = new Set<string>([...pipelineStages, LOST_STAGE, WON_STAGE])

interface MoveStageContext {
  previousList: DealRow[] | undefined
  previousGet: DealRow | null | undefined
}

type MoveStageMutationOptions = {
  onMutate: (input: MoveStageRequest) => Promise<MoveStageContext>
  onError: (error: unknown, input: MoveStageRequest, context: MoveStageContext | undefined) => void
  onSuccess: (data: MoveStageResponse, input: MoveStageRequest, context: MoveStageContext | undefined) => void
  onSettled: (
    data: MoveStageResponse | undefined,
    error: unknown,
    input: MoveStageRequest,
    context: MoveStageContext | undefined,
  ) => void
}

function normalizeMoveStageError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return 'Could not move deal.'
}

function toDealStatus(stage: string): DealStatus {
  if (stage === WON_STAGE) return 'won'
  if (stage === LOST_STAGE) return 'lost'
  return 'open'
}

function isAllowedStage(stage: string): boolean {
  return ALLOWED_STAGES.has(stage)
}

function buildMoveStageError(code: DealMutationError['code'], message: string): DealMutationError {
  return { code, message }
}

export function useMoveStage() {
  const utils = trpc.useUtils()
  const [confettiKey, setConfettiKey] = useState(0)
  const confettiFiredThisSession = useRef(false)
  const activeDealIdRef = useRef<number | null>(null)

  const mutation = trpc.apex.deals.moveStage.useMutation({
    onMutate: async ({ dealId, stage: toStage }: MoveStageRequest) => {
      if (!Number.isInteger(dealId) || dealId <= 0) {
        throw buildMoveStageError('invalid_stage', 'Deal id is invalid.')
      }
      if (!isAllowedStage(toStage)) {
        throw buildMoveStageError('invalid_stage', `Stage "${toStage}" is not available.`)
      }
      if (activeDealIdRef.current === dealId) {
        throw buildMoveStageError('conflict', 'A move is already in progress for this deal.')
      }
      activeDealIdRef.current = dealId
      await Promise.all([
        utils.apex.deals.list.cancel(),
        utils.apex.deals.get.cancel(),
      ])
      const previousList: DealRow[] | undefined = utils.apex.deals.list.getData()
      const previousGet: DealRow | null | undefined = utils.apex.deals.get.getData({ id: dealId })
      const patch = (d: DealRow): DealRow => ({
        ...d,
        stage: toStage,
        outcome: toDealStatus(toStage),
        daysInStage: 0,
        updatedAgo: 'just now',
      })
      const nextList = previousList?.map((d) => (d.id === dealId ? patch(d) : d))
      const nextDeal = previousGet ? patch(previousGet) : previousGet
      utils.apex.deals.list.setData(undefined, nextList ?? [])
      utils.apex.deals.get.setData({ id: dealId }, nextDeal ?? null)
      return { previousList, previousGet }
    },
    onError: (error: unknown, { dealId }, context: unknown) => {
      const ctx = context as MoveStageContext | undefined
      utils.apex.deals.list.setData(undefined, ctx?.previousList ?? [])
      utils.apex.deals.get.setData({ id: dealId }, ctx?.previousGet ?? null)
      toast.error(`${normalizeMoveStageError(error)} — restored previous stage.`)
    },
    onSuccess: (result, { dealId, stage: toStage }, context: unknown) => {
      const ctx = context as MoveStageContext | undefined
      const fromStage = ctx?.previousList?.find((d) => d.id === dealId)?.stage
      if (toStage === WON_STAGE && !confettiFiredThisSession.current) {
        confettiFiredThisSession.current = true
        setConfettiKey((k) => k + 1)
      }
      const contactName = result?.deal.contactName ?? 'deal'
      toast.success(
        toStage === WON_STAGE
          ? `Deal won · ${contactName} — congratulations`
          : toStage === LOST_STAGE
            ? `Marked as lost · ${contactName}`
            : `Moved to ${toStage} · ${contactName}`,
        {
          duration: 5000,
          action: fromStage
            ? { label: 'Undo', onClick: () => mutation.mutate({ dealId, stage: fromStage }) }
            : undefined,
        },
      )
    },
    onSettled: (_data, _error, { dealId }, context: unknown) => {
      const ctx = context as MoveStageContext | undefined
      if (activeDealIdRef.current === dealId) activeDealIdRef.current = null
      void utils.apex.deals.list.invalidate()
      void utils.apex.deals.get.invalidate()
      void utils.apex.deals.stageHistory.invalidate()
      void utils.apex.dashboard.bundle.invalidate()
      if (ctx?.previousList?.some((deal) => deal.id === dealId)) {
        void utils.apex.deals.list.invalidate()
      }
    },
  } satisfies MoveStageMutationOptions)

  /** Fire a stage change (Lost interception happens in the caller via dialog). */
  const move = useCallback(
    (deal: DealRow, toStage: string) => {
      if (activeDealIdRef.current != null) return
      if (!Number.isInteger(deal.id) || deal.id <= 0) return
      if (!isAllowedStage(deal.stage) || !isAllowedStage(toStage)) {
        toast.error('That stage is not available in the current pipeline.')
        return
      }
      if (deal.stage === toStage) return
      mutation.mutate({ dealId: deal.id, stage: toStage })
    },
    [mutation],
  )

  return { move, isMoving: mutation.isPending, confettiKey }
}

export type MoveStageApi = ReturnType<typeof useMoveStage>
