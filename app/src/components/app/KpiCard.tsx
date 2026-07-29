/**
 * KPI stat card — design.md §8.6.
 * White card, 16px pad: micro label, 28px tnum numeral, delta row
 * (↑ palm / ↓ red + "vs last month"), right-aligned 56×24 sparkline,
 * optional mono sub-line.
 */
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KpiCardProps {
  label: string
  value: string
  /** e.g. "+12.3%" */
  delta?: string
  /** defaults to inferring from delta sign */
  deltaTone?: 'up' | 'down' | 'flat'
  deltaSuffix?: string
  /** sparkline data points */
  spark?: number[]
  /** optional mono sub-line, e.g. "target ≤ 10m" */
  subline?: string
  className?: string
}

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

export function KpiCard({
  label,
  value,
  delta,
  deltaTone,
  deltaSuffix = 'vs last month',
  spark,
  subline,
  className,
}: KpiCardProps) {
  const tone =
    deltaTone ?? (delta?.startsWith('+') ? 'up' : delta?.startsWith('−') || delta?.startsWith('-') ? 'down' : 'flat')
  const ToneIcon = tone === 'up' ? TrendingUp : tone === 'down' ? TrendingDown : Minus
  // "up" is good (palm) by default; for inverse metrics pass deltaTone explicitly
  const toneClass = tone === 'up' ? 'text-palm-600' : tone === 'down' ? 'text-red-600' : 'text-ink-500'

  return (
    <div className={cn('rounded-[10px] border border-line bg-surface p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
          <p className="tnum mt-1.5 text-[28px] font-semibold leading-8 tracking-[-0.01em] text-ink-900">
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
        {subline && <span className="ml-auto font-mono text-[11.5px] text-ink-500">{subline}</span>}
      </div>
    </div>
  )
}

export default KpiCard
