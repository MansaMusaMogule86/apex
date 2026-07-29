/**
 * Small shared building blocks for the properties pages — initials avatars,
 * spec rows, photo status chips, filter dropdowns, skeletons. Reuses the
 * design system (Chips §8.7, avatar hash §6); no restyling.
 */
import { BedDouble, Bath, Ruler, ChevronDown, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { avatarTone, initials } from '@/lib/demo-data'
import { PropertyStatusChip, StatusChip } from '@/components/app/Chips'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PropertyDto } from './types'

/* ---------- initials avatar (deterministic pastel-ink pair, design.md §6) ---------- */

export function AgentAvatar({
  name,
  size = 20,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  )
}

/* ---------- spec row: bed · bath · sqft with icons (properties.md S2) ---------- */

export function SpecRow({
  beds,
  baths,
  sizeSqft,
  className,
}: {
  beds: number
  baths: number
  sizeSqft: number
  className?: string
}) {
  return (
    <span className={cn('flex items-center gap-3 text-[12.5px] text-ink-500', className)}>
      <span className="inline-flex items-center gap-1">
        <BedDouble className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
        <span className="tnum">{beds}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Bath className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
        <span className="tnum">{baths}</span>
      </span>
      <span className="inline-flex items-center gap-1">
        <Ruler className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
        <span className="tnum">{sizeSqft.toLocaleString('en-US')} sqft</span>
      </span>
    </span>
  )
}

/* ---------- photo status chip (§3.3; teal outline on white scrim for off-plan) ---------- */

export function PhotoStatusChip({ property }: { property: PropertyDto }) {
  if (property.offPlan) {
    return (
      <StatusChip tone="teal" className="bg-white/85 shadow-sm backdrop-blur-[2px]">
        Off-plan
      </StatusChip>
    )
  }
  return <PropertyStatusChip status={property.status} className="shadow-sm" />
}

/* ---------- filter chip dropdown (properties.md toolbar) ---------- */

export function FilterDropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string
  value: string | null
  options: string[]
  onSelect: (value: string | null) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-120',
            value
              ? 'border-palm-600/25 bg-palm-100 text-palm-700'
              : 'border-line bg-surface text-ink-700 hover:bg-sunken',
          )}
        >
          {value ? `${label}: ${value}` : label}
          {value ? (
            <span
              role="button"
              aria-label={`Clear ${label} filter`}
              className="ml-0.5 rounded-full p-0.5 hover:bg-palm-600/10"
              onClick={(e) => {
                e.stopPropagation()
                onSelect(null)
              }}
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </span>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onSelect={() => onSelect(null)}>
          All {label.toLowerCase()}
          {!value && <Check className="ml-auto h-3.5 w-3.5 text-palm-600" />}
        </DropdownMenuItem>
        {options.map((o) => (
          <DropdownMenuItem key={o} onSelect={() => onSelect(o)}>
            {o}
            {o === value && <Check className="ml-auto h-3.5 w-3.5 text-palm-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ---------- skeletons (api-contract loading conventions) ---------- */

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="aspect-[4/3] animate-pulse bg-sunken" />
      <div className="space-y-2.5 p-3.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-sunken" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-sunken" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-sunken" />
        <div className="flex items-center justify-between border-t border-line pt-3">
          <div className="h-5 w-5 animate-pulse rounded-full bg-sunken" />
          <div className="h-3 w-24 animate-pulse rounded bg-sunken" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="h-10 border-b border-line bg-sunken" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
          <div className="h-9 w-12 animate-pulse rounded bg-sunken" />
          <div className="h-3.5 w-48 animate-pulse rounded bg-sunken" />
          <div className="h-3.5 w-28 animate-pulse rounded bg-sunken" />
          <div className="ml-auto h-3.5 w-24 animate-pulse rounded bg-sunken" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-sunken" />
        </div>
      ))}
    </div>
  )
}
