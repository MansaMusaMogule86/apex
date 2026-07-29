/**
 * LostReasonDialog — destructive confirm for moving a deal to Lost
 * (deals.md §S5; design.md §8.11 — destructive confirms use AlertDialog).
 * Collects a loss reason + optional note, then confirms the stage move.
 */
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DealRow } from './utils'

export const LOSS_REASONS = [
  'Price',
  'Chose competitor',
  'Timing',
  'Financing fell through',
  'Other',
] as const

export function LostReasonDialog({
  deal,
  open,
  onOpenChange,
  onConfirm,
}: {
  deal: DealRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** reason + optional note chosen by the user */
  onConfirm: (reason: string, note: string) => void
}) {
  const [reason, setReason] = useState<string>('')
  const [note, setNote] = useState('')

  const close = () => {
    onOpenChange(false)
    setReason('')
    setNote('')
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) close()
        else onOpenChange(true)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark deal as lost</AlertDialogTitle>
          <AlertDialogDescription>
            {deal ? (
              <>
                <span className="font-medium text-ink-900">{deal.contactName}</span>
                {' — '}
                {deal.propertyLine}. The card moves to the Lost column; you can undo for 5s.
              </>
            ) : (
              'The card moves to the Lost column.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-1">
          <div>
            <label
              htmlFor="loss-reason"
              className="mb-1.5 block text-micro font-semibold uppercase text-ink-500"
            >
              Loss reason
            </label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="loss-reason" className="w-full">
                <SelectValue placeholder="Choose a reason…" />
              </SelectTrigger>
              <SelectContent>
                {LOSS_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="loss-note"
              className="mb-1.5 block text-micro font-semibold uppercase text-ink-500"
            >
              Note <span className="font-normal normal-case text-ink-400">(optional)</span>
            </label>
            <textarea
              id="loss-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Buyer went with another brokerage on fee…"
              className="w-full resize-none rounded-md border border-line-strong bg-surface px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-palm-600"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={close}>Cancel</AlertDialogCancel>
          <button
            type="button"
            disabled={!reason}
            onClick={() => {
              onConfirm(reason, note.trim())
              close()
            }}
            className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-120 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark as lost
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LostReasonDialog
