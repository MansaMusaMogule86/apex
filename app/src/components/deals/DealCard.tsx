/**
 * Deal kanban card (design.md §8.5, deals.md §S2).
 * White e0 card → e1 on hover: contact name 600, property line (icon +
 * truncate), AED value mono, footer with owner avatar 20px + days-in-stage
 * pill (§3.3 thresholds), next-action line. At-risk variant: 2px red left
 * border + warning microcopy. Wrapped in @dnd-kit/sortable; keyboard `m`
 * opens the "Move to stage" menu (accessibility alternative to drag).
 */
import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Building2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DaysInStagePill } from '@/components/app/Chips'
import OwnerAvatar from './OwnerAvatar'
import MoveStageMenu from './MoveStageMenu'
import { dealDragId } from './drag'
import { aedCompact, type DealRow, type OwnerInfo } from './utils'

interface ViewProps {
  deal: DealRow
  owner: OwnerInfo | null
  stages: string[]
  onMoveSelect: (stage: string) => void
  /** rendered inside the DragOverlay — lift + rotate 1.2° + scale 1.02 */
  overlay?: boolean
  dragging?: boolean
  /** red pulse entrance when the at-risk filter engages (deals.md §Interactions) */
  pulse?: boolean
  menuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

export function DealCardView({
  deal,
  owner,
  stages,
  onMoveSelect,
  overlay = false,
  dragging = false,
  pulse = false,
  menuOpen,
  onMenuOpenChange,
}: ViewProps) {
  const wonLost = deal.outcome !== 'open'
  return (
    <div
      className={cn(
        'group relative rounded-[10px] border border-line bg-surface p-3 transition-[box-shadow,transform,opacity] duration-180',
        deal.atRisk && !wonLost && 'border-l-2 border-l-red-600',
        overlay ? 'rotate-[1.2deg] scale-[1.02] shadow-e2' : 'hover:shadow-e1',
        dragging && 'opacity-40',
      )}
    >
      {pulse && deal.atRisk && !wonLost && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[10px] ring-2 ring-red-600/60"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-[13.5px] font-semibold leading-5 text-ink-900">
          {deal.contactName}
        </p>
        <MoveStageMenu
          stages={stages}
          current={deal.stage}
          onSelect={onMoveSelect}
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
          trigger={
            <button
              type="button"
              aria-label={`Move ${deal.contactName} to stage (m)`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                '-mr-1 -mt-1 rounded-md p-1 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-900',
                menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
              )}
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </button>
          }
        />
      </div>

      <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] leading-4 text-ink-500">
        <Building2 className="h-3 w-3 shrink-0 text-ink-400" strokeWidth={1.75} />
        <span className="truncate">{deal.propertyLine}</span>
      </p>

      <p className="tnum mt-2 font-mono text-[13px] font-medium leading-[18px] text-ink-900">
        {aedCompact(deal.valueAed)}
      </p>

      {deal.atRisk && !wonLost && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] font-medium leading-4 text-red-600">
          <AlertTriangle className="h-3 w-3 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{deal.riskNote ?? 'At risk — needs attention'}</span>
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        {owner ? (
          <OwnerAvatar name={owner.name} initials={owner.initials} size={20} />
        ) : (
          <span className="text-[11px] text-ink-400">Unassigned</span>
        )}
        <DaysInStagePill days={deal.daysInStage} />
      </div>

      {deal.nextAction && !wonLost ? (
        <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12px] leading-4 text-ink-500">
          <ArrowRight className="h-3 w-3 shrink-0 text-palm-600" strokeWidth={1.75} />
          <span className="truncate">{deal.nextAction}</span>
        </p>
      ) : deal.outcome === 'lost' && deal.lossReason ? (
        <p className="mt-2 flex items-center gap-1.5 border-t border-line pt-2 text-[12px] leading-4 text-red-600">
          <span className="truncate">Lost — {deal.lossReason}</span>
        </p>
      ) : null}
    </div>
  )
}

export function SortableDealCard({
  deal,
  owner,
  stages,
  onOpen,
  onMoveSelect,
  pulse = false,
}: {
  deal: DealRow
  owner: OwnerInfo | null
  stages: string[]
  onOpen: () => void
  onMoveSelect: (stage: string) => void
  pulse?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: dealDragId(deal.id),
    data: { deal },
  })
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      aria-label={`Deal ${deal.contactName}, ${deal.stage}. Press m to move to another stage.`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'm' && !menuOpen) {
          e.preventDefault()
          e.stopPropagation()
          setMenuOpen(true)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="cursor-grab rounded-[10px] outline-offset-2 active:cursor-grabbing"
    >
      <DealCardView
        deal={deal}
        owner={owner}
        stages={stages}
        onMoveSelect={onMoveSelect}
        dragging={isDragging}
        pulse={pulse}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
      />
    </div>
  )
}

export default SortableDealCard
