/**
 * StageStepper — 13-node horizontal pipeline stepper (deals.md §S4).
 * Completed = palm filled · current = palm ring pulse · future = line.
 * Won/Lost terminal nodes colored. Clicking a future node asks the parent
 * to confirm "Move deal forward?".
 */
import { Check, Trophy, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LOST_STAGE, WON_STAGE } from './utils'

export function StageStepper({
  stages,
  current,
  compact = false,
  onSelect,
  className,
}: {
  stages: string[]
  current: string
  /** mini variant for the drawer (dots + tooltips) */
  compact?: boolean
  /** clicking a future stage (parent shows the confirm) */
  onSelect?: (stage: string) => void
  className?: string
}) {
  const currentIdx = stages.indexOf(current)
  const lost = current === LOST_STAGE

  return (
    <div className={cn('overflow-x-auto', className)}>
      <ol className={cn('flex items-center', compact ? 'gap-0' : 'min-w-max gap-0 pb-1')}>
        {stages.map((stage, i) => {
          const isCurrent = i === currentIdx
          const isCompleted = !lost && currentIdx > -1 && i < currentIdx
          const isFuture = lost ? stage !== LOST_STAGE : i > currentIdx
          const clickable = isFuture && !!onSelect
          const terminalWon = stage === WON_STAGE
          const terminalLost = stage === LOST_STAGE

          const node = (
            <span
              className={cn(
                'relative flex shrink-0 items-center justify-center rounded-full border transition-colors duration-180',
                compact ? 'h-3 w-3' : 'h-[18px] w-[18px]',
                isCompleted && 'border-palm-600 bg-palm-600 text-white',
                isCurrent &&
                  (terminalLost
                    ? 'border-red-600 bg-red-600 text-white'
                    : terminalWon
                      ? 'border-palm-600 bg-palm-600 text-white'
                      : 'border-palm-600 bg-surface'),
                isFuture && 'border-line-strong bg-surface text-ink-400',
                clickable && 'cursor-pointer hover:border-palm-600 hover:bg-palm-50',
              )}
            >
              {isCurrent && !terminalWon && !terminalLost && (
                <>
                  <span className="absolute inset-0 animate-ping rounded-full border border-palm-600 opacity-60" />
                  <span className={cn('rounded-full bg-palm-600', compact ? 'h-1 w-1' : 'h-1.5 w-1.5')} />
                </>
              )}
              {(isCompleted || (isCurrent && terminalWon)) &&
                (compact ? null : terminalWon && isCurrent ? (
                  <Trophy className="h-2.5 w-2.5" strokeWidth={2} />
                ) : (
                  <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                ))}
              {isCurrent && terminalLost && !compact && <XCircle className="h-2.5 w-2.5" strokeWidth={2} />}
            </span>
          )

          return (
            <li key={stage} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    compact ? 'h-px w-2' : 'h-px w-4',
                    isCompleted || isCurrent ? 'bg-palm-600' : 'bg-line-strong',
                  )}
                />
              )}
              {clickable ? (
                <button
                  type="button"
                  title={`Move to ${stage}`}
                  aria-label={`Move deal to ${stage}`}
                  onClick={() => onSelect(stage)}
                  className="rounded-full"
                >
                  {node}
                </button>
              ) : (
                <span title={stage}>{node}</span>
              )}
              {!compact && (
                <span
                  className={cn(
                    'ml-1.5 mr-1 whitespace-nowrap text-[10.5px] leading-3',
                    isCurrent
                      ? terminalLost
                        ? 'font-semibold text-red-600'
                        : 'font-semibold text-palm-700'
                      : isCompleted
                        ? 'font-medium text-ink-700'
                        : 'text-ink-400',
                  )}
                >
                  {stage}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default StageStepper
