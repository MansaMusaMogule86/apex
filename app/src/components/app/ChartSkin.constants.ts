/** Categorical data-viz palette (flat): palm, gold, slate, terracotta, olive, bronze */
export const CHART_PALETTE = ['#0B5D4A', '#C08A2D', '#5B6B7A', '#C0563B', '#7A8C3F', '#8C6D4F'] as const

export const CHART_GRID = '#ECECE6'
export const CHART_AXIS = '#6E6F68'

/** Spread onto <CartesianGrid {...chartGridProps} /> */
export const chartGridProps = {
  vertical: false,
  stroke: CHART_GRID,
  strokeDasharray: undefined,
} as const

/** Spread onto <XAxis {...chartAxisProps} /> / <YAxis ... /> */
export const chartAxisProps = {
  tick: { fontSize: 11, fill: CHART_AXIS },
  axisLine: { stroke: CHART_GRID },
  tickLine: false,
} as const

/** Area chart defaults: palm stroke 2px, flat 8% fill */
export const areaDefaults = {
  stroke: '#0B5D4A',
  strokeWidth: 2,
  fill: 'rgba(11, 93, 74, 0.08)',
} as const

/** Donut defaults: 14px stroke ring */
export const donutDefaults = {
  innerRadius: '72%',
  outerRadius: '100%',
  strokeWidth: 0,
} as const