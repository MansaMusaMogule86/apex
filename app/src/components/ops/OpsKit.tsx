/**
 * Ops pages kit — page-local shared primitives for the operations pages
 * (Viewings, Tasks, Documents, Automations, Admin). Built strictly on the
 * APEX design tokens (design.md §3/§5/§8) — no new styling language.
 */
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { avatarTone, initials } from '@/lib/demo-data'

/* ---------- initials avatar (deterministic pastel-ink, design.md §6) ---------- */

export function PersonAvatar({
  name,
  initialsOverride,
  size = 28,
  className,
}: {
  name: string
  /** seeded data carries canonical initials (e.g. "OF") — prefer when present */
  initialsOverride?: string
  size?: number
  className?: string
}) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      title={name}
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.max(8, size * 0.36) }}
    >
      {initialsOverride ?? initials(name)}
    </span>
  )
}

/* ---------- buttons (design.md §5/§7: radius 6px, 120ms, press scale .98) ---------- */

export function PrimaryButton({
  icon: Icon,
  children,
  onClick,
  disabled,
  className,
}: {
  icon?: LucideIcon
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md bg-palm-600 px-3.5 text-[13px] font-semibold text-white transition-all duration-120 hover:bg-palm-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
      {children}
    </button>
  )
}

export function OutlineButton({
  icon: Icon,
  children,
  onClick,
  disabled,
  className,
}: {
  icon?: LucideIcon
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink-700 transition-all duration-120 hover:bg-sunken active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 text-ink-500" strokeWidth={1.75} />}
      {children}
    </button>
  )
}

/* ---------- segmented view toggle (Week | List etc.) ---------- */

export function ViewToggle<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string; icon?: LucideIcon }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center rounded-lg bg-sunken p-0.5 ring-1 ring-line', className)}>
      {options.map((opt) => {
        const active = opt.value === value
        const Icon = opt.icon
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[12.5px] font-medium transition-all duration-120',
              active ? 'bg-surface text-ink-900 shadow-e1' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------- filter chip (selectable pill) ---------- */

export function FilterChip({
  active,
  onClick,
  count,
  tone = 'neutral',
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  count?: number
  tone?: 'neutral' | 'red' | 'gold'
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium ring-1 transition-all duration-120 active:scale-[0.98]',
        active
          ? tone === 'red'
            ? 'bg-red-100 text-red-600 ring-red-600/30'
            : tone === 'gold'
              ? 'bg-gold-100 text-gold-600 ring-gold-500/40'
              : 'bg-palm-100 text-palm-700 ring-palm-600/30'
          : 'bg-surface text-ink-500 ring-line hover:bg-sunken hover:text-ink-900',
        className,
      )}
    >
      {children}
      {count !== undefined && (
        <span className={cn('tnum font-mono text-[10.5px]', active ? 'opacity-80' : 'text-ink-400')}>
          {count}
        </span>
      )}
    </button>
  )
}

/* ---------- skeleton shimmer blocks (api-contract loading convention) ---------- */

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-sunken', className)} />
}

export function TableSkeleton({ rows = 8, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-[10px] border border-line bg-surface', className)}>
      <div className="h-10 bg-sunken" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-t border-line px-4 py-3">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <SkeletonBlock className="h-3.5 w-1/3" />
          <SkeletonBlock className="h-5 w-16 rounded-full" />
          <SkeletonBlock className="ml-auto h-3.5 w-20" />
        </div>
      ))}
    </div>
  )
}

/* ---------- staggered row/card wrapper (design.md §7: 25–50ms, max 8) ---------- */

export function StaggerItem({
  index,
  children,
  className,
}: {
  index: number
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: Math.min(index, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
