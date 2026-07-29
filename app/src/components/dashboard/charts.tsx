/**
 * Recharts visualizations for Dashboard & Reports, skinned per design.md §8.10
 * via the shared ChartSkin helpers (palette, grid, axis, ink tooltip).
 * Entrances per §7: area draws 800ms, bars grow 500ms (stagger 35ms on the
 * custom stage bars), donut sweeps 700ms.
 */
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from '@/components/app/ChartSkin'
import { CHART_PALETTE, areaDefaults, chartAxisProps, chartGridProps } from '@/components/app/ChartSkin.constants'
import { EASE_OUT } from './widgets.constants'
import { fmtM } from './format'

/* ------------------------- forecast area chart ------------------------- */

export interface ForecastChartProps {
  data: { week: string; value: number; prior: number }[]
  height?: number
  /** index of the "this week" marker dot */
  markerIndex?: number
  valueName?: string
  priorName?: string
  formatValue?: (v: number) => string
}

export function ForecastAreaChart({
  data,
  height = 260,
  markerIndex,
  valueName = 'Weighted',
  priorName = 'Last month',
  formatValue = (v) => fmtM(v),
}: ForecastChartProps) {
  const marker = markerIndex !== undefined ? data[markerIndex] : undefined
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid {...chartGridProps} />
        <XAxis dataKey="week" {...chartAxisProps} tickMargin={8} interval="preserveStartEnd" />
        <YAxis {...chartAxisProps} tickFormatter={fmtM} width={44} />
        <Tooltip
          content={<ChartTooltipContent formatter={(v) => formatValue(Number(v))} />}
          cursor={{ stroke: '#D8D8CF', strokeDasharray: '3 3' }}
        />
        <Area
          type="monotone"
          dataKey="prior"
          name={priorName}
          stroke="#5B6B7A"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          fill="transparent"
          animationDuration={800}
          animationEasing="ease-out"
        />
        <Area
          type="monotone"
          dataKey="value"
          name={valueName}
          {...areaDefaults}
          animationDuration={800}
          animationEasing="ease-out"
        />
        {marker && (
          <ReferenceDot
            x={marker.week}
            y={marker.value}
            r={4.5}
            fill="#0B5D4A"
            stroke="#FFFFFF"
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* --------------------- deals-by-stage bars (custom) -------------------- */

export interface StageBarRow {
  key: string
  label: string
  count: number
  value: number
  /** late stages (MOU+) render in deeper palm-700 */
  deep?: boolean
}

export function StageBars({
  rows,
  onSelect,
  className,
}: {
  rows: StageBarRow[]
  onSelect?: (row: StageBarRow) => void
  className?: string
}) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <ul className={cn('space-y-2', className)}>
      {rows.map((r, i) => (
        <li key={r.key}>
          <button
            type="button"
            onClick={() => onSelect?.(r)}
            className="group flex w-full items-center gap-2.5 rounded-md px-1 py-0.5 text-left transition-colors duration-120 hover:bg-palm-50"
          >
            <span className="w-[104px] shrink-0 truncate text-[12.5px] text-ink-700 group-hover:text-ink-900">
              {r.label}
            </span>
            <span className="tnum w-4 shrink-0 text-right text-[12px] text-ink-500">{r.count}</span>
            <span className="relative h-[16px] min-w-0 flex-1 overflow-hidden rounded-[4px] bg-sunken/70">
              <motion.span
                className={cn('block h-full rounded-r-[6px]', r.deep ? 'bg-palm-700' : 'bg-palm-600')}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(r.count > 0 ? 0.03 : 0, r.value / max) }}
                transition={{ duration: 0.5, delay: i * 0.035, ease: EASE_OUT }}
                style={{ transformOrigin: 'left' }}
              />
            </span>
            <span className="tnum w-[52px] shrink-0 text-right font-mono text-[11.5px] text-ink-700">
              {fmtM(r.value)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------ donut + legend ------------------------- */

export interface DonutSlice {
  key: string
  label: string
  value: number
  /** right-aligned muted sub-line in the legend row */
  sub?: string
}

export function DonutWithLegend({
  data,
  centerTop,
  centerSub,
  onSelect,
  size = 200,
  className,
}: {
  data: DonutSlice[]
  centerTop: string
  centerSub: string
  onSelect?: (slice: DonutSlice) => void
  size?: number
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-5 sm:flex-row', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="72%"
              outerRadius="100%"
              strokeWidth={0}
              paddingAngle={2}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((d, i) => (
                <Cell key={d.key} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent formatter={(v) => String(v)} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="tnum text-[24px] font-semibold leading-7 text-ink-900">{centerTop}</span>
          <span className="text-[11.5px] text-ink-500">{centerSub}</span>
        </div>
      </div>
      <ul className="min-w-0 w-full flex-1 space-y-0.5">
        {data.map((d, i) => (
          <li key={d.key}>
            <button
              type="button"
              onClick={() => onSelect?.(d)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-[7px] text-left transition-colors duration-120 hover:bg-palm-50"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }}
              />
              <span className="truncate text-[12.5px] text-ink-900">{d.label}</span>
              <span className="tnum ml-auto shrink-0 text-[12px] font-medium text-ink-700">
                {d.value}
              </span>
              {d.sub && (
                <span className="w-[86px] shrink-0 text-right text-[11px] text-ink-400">{d.sub}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------ weekly bars ---------------------------- */

export function WeeklyBars({
  data,
  height = 230,
  name,
  color = '#0B5D4A',
  formatValue = (v: number) => String(v),
  className,
}: {
  data: { week: string; value: number }[]
  height?: number
  name: string
  color?: string
  formatValue?: (v: number) => string
  className?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid {...chartGridProps} />
        <XAxis dataKey="week" {...chartAxisProps} tickMargin={8} interval="preserveStartEnd" />
        <YAxis {...chartAxisProps} width={36} allowDecimals={false} />
        <Tooltip
          content={<ChartTooltipContent formatter={(v) => formatValue(Number(v))} />}
          cursor={{ fill: 'rgba(11, 93, 74, 0.05)' }}
        />
        <Bar
          dataKey="value"
          name={name}
          fill={color}
          radius={[6, 6, 0, 0]}
          maxBarSize={26}
          animationDuration={500}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/* --------------------- trend line with target marker ------------------- */

export function TargetLineChart({
  data,
  height = 230,
  name,
  target,
  targetLabel,
  formatValue = (v: number) => `${v}m`,
  className,
}: {
  data: { week: string; value: number }[]
  height?: number
  name: string
  target?: number
  targetLabel?: string
  formatValue?: (v: number) => string
  className?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid {...chartGridProps} />
        <XAxis dataKey="week" {...chartAxisProps} tickMargin={8} interval="preserveStartEnd" />
        <YAxis
          {...chartAxisProps}
          width={40}
          domain={['auto', 'auto']}
          tickFormatter={(v: number) => `${Math.round(v)}m`}
        />
        <Tooltip
          content={<ChartTooltipContent formatter={(v) => formatValue(Number(v))} />}
          cursor={{ stroke: '#D8D8CF', strokeDasharray: '3 3' }}
        />
        {target !== undefined && (
          <ReferenceLine
            y={target}
            stroke="#B4372A"
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: targetLabel ?? `target ${target}m`,
              position: 'insideTopRight',
              fontSize: 10.5,
              fill: '#B4372A',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="value"
          name={name}
          stroke="#0B5D4A"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#0B5D4A', stroke: '#FFFFFF', strokeWidth: 2 }}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
