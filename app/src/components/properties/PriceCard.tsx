/**
 * Price card — properties.md S4 "Price history".
 * AED price block + community-average comparison + Recharts mini area chart
 * (ChartSkin §8.10: palm 2px stroke, 8% flat fill, hairline grid, ink tooltip)
 * fed by apex.properties.priceHistory, plus the event rows beneath.
 */
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChartTooltipContent } from '@/components/app/ChartSkin'
import { areaDefaults, chartAxisProps, chartGridProps } from '@/components/app/ChartSkin.constants'
import type { PricePointDto, PropertyDto } from './types'
import { formatAed, formatPerSqft, perSqft } from './utils'

export default function PriceCard({
  property,
  history,
  isLoading,
  communityAvgPsf,
}: {
  property: PropertyDto
  history: PricePointDto[] | undefined
  isLoading: boolean
  /** average AED/sqft of sibling units in the same community (null if none) */
  communityAvgPsf: number | null
}) {
  const psf = perSqft(property.priceAed, property.sizeSqft)
  const deltaPct =
    communityAvgPsf && communityAvgPsf > 0 ? ((psf - communityAvgPsf) / communityAvgPsf) * 100 : null

  const chartData = (history ?? []).map((h) => ({ label: h.label, price: h.priceAed }))

  return (
    <section className="rounded-[10px] border border-line bg-surface" aria-label="Price">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Price</h2>
      </div>

      <div className="p-4">
        <p className="tnum text-[24px] font-semibold leading-8 text-ink-900">
          {formatAed(property.priceAed)}
        </p>
        <p className="mt-1 text-[12.5px] text-ink-500">
          <span className="tnum">{formatPerSqft(property.priceAed, property.sizeSqft)}</span>
          {communityAvgPsf !== null && deltaPct !== null && (
            <>
              {' · community avg '}
              <span className="tnum">AED {communityAvgPsf.toLocaleString('en-US')}</span>{' '}
              <span
                className={cn(
                  'tnum font-medium',
                  deltaPct >= 0 ? 'text-palm-600' : 'text-red-600',
                )}
              >
                ({deltaPct >= 0 ? '+' : ''}
                {deltaPct.toFixed(1)}%)
              </span>
            </>
          )}
        </p>

        {/* mini chart — price over time */}
        {isLoading ? (
          <div className="mt-4 h-[140px] animate-pulse rounded-lg bg-sunken" />
        ) : chartData.length > 0 ? (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <CartesianGrid {...chartGridProps} />
                <XAxis dataKey="label" {...chartAxisProps} />
                <YAxis
                  {...chartAxisProps}
                  width={44}
                  domain={['dataMin - 60000', 'dataMax + 60000']}
                  tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => (typeof v === 'number' ? formatAed(v) : String(v))}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  name="Asking price"
                  {...areaDefaults}
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-sunken px-3.5 py-3 text-[12.5px] text-ink-500">
            No price changes since listing — still at the original ask.
          </p>
        )}

        {/* event rows */}
        {chartData.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-line pt-3">
            {(history ?? []).map((h, i, arr) => {
              const prev = i > 0 ? arr[i - 1]!.priceAed : null
              const delta = prev !== null ? h.priceAed - prev : null
              return (
                <li key={h.id} className="flex items-center gap-2 text-[12.5px]">
                  {delta === null ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
                  ) : delta >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-palm-600" strokeWidth={1.75} />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600" strokeWidth={1.75} />
                  )}
                  <span className="text-ink-700">{h.label}</span>
                  <span className="tnum ml-auto font-mono text-[12px] text-ink-900">
                    {formatAed(h.priceAed)}
                  </span>
                  {delta !== null && (
                    <span
                      className={cn(
                        'tnum font-mono text-[11px]',
                        delta >= 0 ? 'text-palm-600' : 'text-red-600',
                      )}
                    >
                      {delta >= 0 ? '+' : '−'}AED {Math.abs(delta).toLocaleString('en-US')}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
