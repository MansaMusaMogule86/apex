/**
 * Page-local primitives for Dashboard & Reports — cards, segmented controls,
 * skeletons, avatars, a toast, and StatCard.
 *
 * StatCard mirrors the shared KpiCard (design.md §8.6) pixel-for-pixel but adds
 * three things the shared API cannot express and the page designs require:
 * an inverted-goodness delta (palm ↓ for response time), a red numeral tone
 * (overdue follow-ups), and a tinted sub-line (amber north-star target).
 * The shared KpiCard itself is used wherever its API suffices.
 */
import { useId, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { avatarTone, nameInitials } from './format'
import { EASE_OUT } from './widgets.constants'

/* -------------------------------- card --------------------------------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-[10px] border border-line bg-surface', className)}>
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  sub,
  action,
  className,
}: {
  title: string
  sub?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-5', className)}>
      <div className="min-w-0">
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">{title}</h2>
        {sub && <p className="mt-0.5 text-[12.5px] text-ink-500">{sub}</p>}
      </div>
      {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
    </div>
  )
}

/* ------------------------------ skeletons ------------------------------ */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[10px] bg-sunken', className)} />
}

export function ChartSkeleton({ height = 260, className }: { height?: number; className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-[10px] border border-line bg-sunken', className)}
      style={{ height }}
    />
  )
}

/* ------------------------------- avatar -------------------------------- */

export function Avatar({
  name,
  initials,
  size = 28,
  className,
}: {
  name: string
  /** override initials (team table provides them) */
  initials?: string
  size?: number
  className?: string
}) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials ?? nameInitials(name)}
    </span>
  )
}

/* -------------------------- segmented control -------------------------- */

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  className?: string
}) {
  const id = useId()
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg bg-sunken p-0.5 ring-1 ring-line',
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className={cn(
              'relative rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-140',
              active ? 'text-ink-900' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {active && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-md bg-surface shadow-xs ring-1 ring-line"
                transition={{ duration: 0.16, ease: EASE_OUT }}
              />
            )}
            <span className="relative whitespace-nowrap">{opt}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------- stat card (§8.6 ext) ------------------------ */

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null
  const w = 56
  const h = 24
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = max - min || 1
  const step = w / (points.length - 1)
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - 2 - ((p - min) / span) * (h - 4)).toFixed(1)}`)
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <path d={d} fill="none" stroke="#0B5D4A" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: 'up' | 'down' | 'flat'
  /** true when a downward delta is good news (response time) → palm */
  downIsGood?: boolean
  deltaSuffix?: string
  spark?: number[]
  subline?: string
  sublineClassName?: string
  /** extra classes on the numeral (e.g. text-red-600 for overdue) */
  valueClassName?: string
  className?: string
  onClick?: () => void
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone,
  downIsGood = false,
  deltaSuffix = 'vs last month',
  spark,
  subline,
  sublineClassName,
  valueClassName,
  className,
  onClick,
}: StatCardProps) {
  const tone =
    deltaTone ?? (delta?.startsWith('+') ? 'up' : delta?.startsWith('−') || delta?.startsWith('-') ? 'down' : 'flat')
  const ToneIcon = tone === 'up' ? TrendingUp : tone === 'down' ? TrendingDown : Minus
  const good = tone === 'flat' ? undefined : downIsGood ? tone === 'down' : tone === 'up'
  const toneClass = good === undefined ? 'text-ink-500' : good ? 'text-palm-600' : 'text-red-600'

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-[10px] border border-line bg-surface p-4',
        onClick &&
          'cursor-pointer transition-all duration-140 hover:-translate-y-0.5 hover:shadow-e1',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
          <p
            className={cn(
              'tnum mt-1.5 text-[28px] font-semibold leading-8 tracking-[-0.01em] text-ink-900',
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
        {spark && <Sparkline points={spark} />}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[12.5px]">
        {delta && (
          <span className={cn('inline-flex items-center gap-1 font-medium', toneClass)}>
            <ToneIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="tnum">{delta}</span>
          </span>
        )}
        {delta && <span className="text-ink-400">{deltaSuffix}</span>}
        {subline && (
          <span className={cn('ml-auto font-mono text-[11.5px] text-ink-500', sublineClassName)}>
            {subline}
          </span>
        )}
      </div>
    </div>
  )
}

