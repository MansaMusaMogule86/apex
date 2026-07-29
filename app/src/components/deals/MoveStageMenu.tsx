/**
 * MoveStageMenu — "Move to stage" dropdown; the keyboard alternative to
 * kanban drag (deals.md §Interactions — card focus → `m` opens the menu).
 */
import type { ReactNode } from 'react'
import { Check, Trophy, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { LOST_STAGE, WON_STAGE, isTerminalStage } from './utils'

export function MoveStageMenu({
  stages,
  current,
  onSelect,
  open,
  onOpenChange,
  trigger,
  align = 'end',
}: {
  stages: string[]
  current: string
  onSelect: (stage: string) => void
  /** controlled open state so keyboard (`m`) can open it */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: ReactNode
  align?: 'start' | 'center' | 'end'
}) {
  const openStages = stages.filter((s) => !isTerminalStage(s))
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {openStages.map((s) => (
          <DropdownMenuItem key={s} disabled={s === current} onSelect={() => onSelect(s)}>
            <Check
              className={cn(
                'mr-2 h-3.5 w-3.5 text-palm-600',
                s === current ? 'opacity-100' : 'opacity-0',
              )}
              strokeWidth={2}
            />
            {s}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={current === WON_STAGE} onSelect={() => onSelect(WON_STAGE)}>
          <Trophy className="mr-2 h-3.5 w-3.5 text-palm-600" strokeWidth={1.75} />
          Won
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={current === LOST_STAGE}
          onSelect={() => onSelect(LOST_STAGE)}
          className="text-red-600 focus:text-red-600"
        >
          <XCircle className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />
          Lost
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MoveStageMenu
