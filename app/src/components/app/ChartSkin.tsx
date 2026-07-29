/**
 * Recharts skin — design.md §8.10.
 * Hairline cartesian grid (vertical hidden), 11px ink-500 axes, ink tooltip
 * card with mono values, categorical flat palette.
 */
import { cn } from '@/lib/utils'
import { CHART_PALETTE } from './ChartSkin.constants'

interface ChartTooltipPayloadEntry {
  name?: string
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

/** Spread onto <Tooltip content={...} /> — ink card, white text, mono values */
export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  className,
}: {
  active?: boolean
  payload?: ChartTooltipPayloadEntry[]
  label?: string | number
  /** format a value for display; default String(v) */
  formatter?: (value: number | string, name?: string) => string
  className?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className={cn('rounded-lg bg-ink-900 px-3 py-2 shadow-e2', className)}
      style={{ borderRadius: 8 }}
    >
      {label !== undefined && (
        <p className="mb-1 text-[11px] font-medium text-white/70">{label}</p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center gap-2 text-[12px] text-white">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color ?? CHART_PALETTE[i % CHART_PALETTE.length] }}
            />
            <span className="text-white/80">{entry.name}</span>
            <span className="tnum ml-auto pl-3 font-mono text-[12px] font-medium">
              {formatter ? formatter(entry.value ?? '', entry.name) : String(entry.value ?? '')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}


export default ChartTooltipContent
