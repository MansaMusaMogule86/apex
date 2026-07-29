/**
 * ConfirmMoveDialog — "Move deal forward?" confirm shown when a stepper
 * node is clicked (deals.md §S4). Destructive-free stage moves still offer
 * Undo via the success toast.
 */
import { ArrowRight } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { WON_STAGE, type DealRow } from './utils'

export function ConfirmMoveDialog({
  deal,
  toStage,
  onOpenChange,
  onConfirm,
}: {
  deal: DealRow | null
  /** null = closed */
  toStage: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: (stage: string) => void
}) {
  const close = () => onOpenChange(false)
  return (
    <AlertDialog open={toStage != null} onOpenChange={(v) => !v && close()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {toStage === WON_STAGE ? 'Close deal as Won?' : 'Move deal forward?'}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {deal && toStage && (
                <span className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-medium text-ink-900">{deal.contactName}</span>
                  <span className="rounded-full bg-sunken px-2 py-0.5 text-[11.5px] font-medium text-ink-500">
                    {deal.stage}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                  <span
                    className={
                      toStage === WON_STAGE
                        ? 'rounded-full bg-palm-100 px-2 py-0.5 text-[11.5px] font-semibold text-palm-700'
                        : 'rounded-full bg-palm-100 px-2 py-0.5 text-[11.5px] font-semibold text-palm-700'
                    }
                  >
                    {toStage}
                  </span>
                </span>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
          <button
            type="button"
            onClick={() => {
              if (toStage) onConfirm(toStage)
              close()
            }}
            className="inline-flex items-center justify-center rounded-md bg-palm-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
          >
            {toStage === WON_STAGE ? 'Close as Won' : `Move to ${toStage}`}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmMoveDialog
