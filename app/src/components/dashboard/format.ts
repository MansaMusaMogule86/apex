/**
 * Dashboard/Reports helpers — AED formatting, demo-clock anchor, count-up
 * numerals (design.md §7: 700ms on first paint), deterministic derivations.
 *
 * Data rule: every number rendered on the pages traces back to live tRPC
 * data. Where the API does not expose a time series (weekly revenue, SLA
 * trend, heatmap), series are derived deterministically from live anchors
 * (KPI totals, won deals, viewings) with a seeded PRNG — no randomness at
 * render time, no demo-data imports.
 */
import { useEffect, useRef, useState } from 'react'

/** Demo clock anchor — the seeded workspace world is 12 Mar 2025 (design.md §9). */
export const DEMO_NOW = new Date(2025, 2, 12, 10, 0, 0)

/* ------------------------------- AED ---------------------------------- */

/** Full currency for records/reports: AED 2,950,000 */
export function fmtAedFull(n: number): string {
  return `AED ${Math.round(n).toLocaleString('en-US')}`
}

/** Compact currency for cards/axes: AED 67.0M · AED 925K */
export function fmtAedCompact(n: number, digits = 1): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(digits)}M`
  if (abs >= 1_000) return `AED ${Math.round(n / 1_000)}K`
  return `AED ${Math.round(n)}`
}

/** Compact magnitude without prefix (chart axes): 67.0M · 925K */
export function fmtM(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`
  return `${Math.round(n)}`
}

/* ------------------------------- dates -------------------------------- */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function addDays(d: Date, days: number): Date {
  const c = new Date(d)
  c.setDate(c.getDate() + days)
  return c
}

/** "28 Mar" (design.md date style) */
export function fmtDay(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

/** "Wednesday, 12 Mar 2025" */
export function fmtLongDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Parse relative labels "12d ago" / "5h ago" / "40m ago" → days (float). */
export function agoToDays(label: string | null | undefined): number {
  if (!label) return 0
  const n = parseFloat(label)
  if (Number.isNaN(n)) return 0
  if (label.includes('d')) return n
  if (label.includes('h')) return n / 24
  if (label.includes('m')) return n / 1440
  return 0
}

/* ----------------------------- durations ------------------------------ */

/** "8m 12s" → 492 */
export function parseMinSec(label: string): number {
  const m = /(\d+)\s*m/.exec(label)
  const s = /(\d+)\s*s/.exec(label)
  return (m ? Number(m[1]) : 0) * 60 + (s ? Number(s[1]) : 0)
}

/** 492 → "8m 12s" */
export function fmtMinSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}m ${String(s).padStart(2, '0')}s`
}

/* --------------------------- deterministic rng ------------------------- */

export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32 — seeded PRNG for derived visual series (stable across renders). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Sparkline points: gentle deterministic uptrend (KPI cards, design §8.6). */
export function sparkSeries(seed: string, points = 8, volatility = 0.35): number[] {
  const rng = mulberry32(hashString(seed))
  const out: number[] = []
  let v = 1
  for (let i = 0; i < points; i++) {
    v = Math.max(0.2, v + 0.32 + (rng() - 0.5) * volatility)
    out.push(v)
  }
  return out
}

/** Scale live integer counts to a live total, preserving distribution (largest remainder). */
export function scaleToTotal(counts: number[], total: number): number[] {
  const sum = counts.reduce((a, b) => a + b, 0)
  if (sum === 0 || total === 0) return counts.map(() => 0)
  const raw = counts.map((c) => (c / sum) * total)
  const out = raw.map(Math.floor)
  let rem = total - out.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
  for (let k = 0; rem > 0 && order.length > 0; k = (k + 1) % order.length) {
    out[order[k].i] += 1
    rem -= 1
  }
  return out
}

/* ------------------------------- avatars ------------------------------- */

/* Initials on deterministic pastel-ink backgrounds (design.md §6). */
const AVATAR_PAIRS: [string, string][] = [
  ['#E7F1ED', '#0B5D4A'],
  ['#F7EFDD', '#A97B1F'],
  ['#E9EDF1', '#5B6B7A'],
  ['#F9E9E6', '#B4372A'],
  ['#EFF3E4', '#7A8C3F'],
  ['#F1EAE4', '#8C6D4F'],
]

export function avatarTone(name: string): [string, string] {
  return AVATAR_PAIRS[hashString(name) % AVATAR_PAIRS.length]
}

export function nameInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/* ------------------------------ count-up ------------------------------- */

/**
 * Count-up numeral — 700ms ease-out on first value arrival (design.md §7).
 * Pass `null` while loading; the animation starts once when data lands.
 * Honors prefers-reduced-motion by jumping straight to the target.
 */
export function useCountUp(target: number | null | undefined, duration = 700): number {
  const [value, setValue] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    if (target == null || started.current) return
    started.current = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = window.requestAnimationFrame(() => setValue(target))
      return () => window.cancelAnimationFrame(id)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* -------------------- derived series (live-anchored) ------------------- */

export interface OpenDealShape {
  valueAed: number
  probability: number
  stage: string
}

export interface ForecastPoint {
  week: string
  value: number
  prior: number
}

/**
 * Weighted-forecast curve (dashboard S4 / reports S2): each open deal's
 * (scenario-adjusted) contribution lands in the week implied by its
 * probability — high-probability deals land sooner. Cumulative over the
 * next 8 weeks from DEMO_NOW; prior-period overlay scaled by the live
 * MoM delta. Deterministic: pure function of live deal rows.
 */
export function buildForecastSeries(
  openDeals: OpenDealShape[],
  opts: { mode: 'weighted' | 'total'; scenarioMult?: number; priorFactor?: number },
): ForecastPoint[] {
  const { mode, scenarioMult = 1, priorFactor = 0.887 } = opts
  const contributions = openDeals.map((d) => {
    const adjProb = Math.min(100, d.probability * scenarioMult)
    const amount = mode === 'weighted' ? (d.valueAed * adjProb) / 100 : d.valueAed
    const landingWeek = Math.max(1, Math.min(8, Math.ceil((1 - adjProb / 100) * 8)))
    return { amount, landingWeek }
  })
  const points: ForecastPoint[] = []
  for (let w = 1; w <= 8; w++) {
    const value = contributions
      .filter((c) => c.landingWeek <= w)
      .reduce((a, c) => a + c.amount, 0)
    points.push({
      week: `W${w} ${fmtDay(addDays(DEMO_NOW, 6 + (w - 1) * 7))}`,
      value: Math.round(value),
      prior: Math.round(value * priorFactor),
    })
  }
  return points
}

/** Per-advisor first-response model: anchored to the live team median, adjusted
 *  by each advisor's live SLA breach share (inbox conversations via owned contacts). */
export function advisorResponseSeconds(
  medianSec: number,
  memberId: number,
  memberName: string,
  contacts: { id: number; ownerId: number | null }[],
  conversations: { contactId: number | null; slaBreached: boolean | null }[],
): number {
  const owned = new Set(contacts.filter((c) => c.ownerId === memberId).map((c) => c.id))
  const convos = conversations.filter((c) => c.contactId != null && owned.has(c.contactId))
  const breachShare = convos.length > 0 ? convos.filter((c) => c.slaBreached).length / convos.length : 0
  const jitter = (hashString(memberName) % 41) - 20 // ±20s deterministic per advisor
  return Math.round((medianSec * (0.82 + 0.5 * breachShare) + jitter) / 5) * 5
}
