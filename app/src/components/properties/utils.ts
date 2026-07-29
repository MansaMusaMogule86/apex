/**
 * Formatting + scoring helpers for the properties pages.
 * Currency: `AED 2,950,000` full in records, compact `AED 2.95M` on cards/axes
 * (design.md §9).
 */
import type { PropertyDto, RequirementDto } from './types'

export function formatAed(n: number): string {
  return `AED ${Math.round(n).toLocaleString('en-US')}`
}

/** Compact card/axis form: AED 925K · AED 2.95M · AED 28M */
export function formatAedCompact(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `AED ${Number(m.toFixed(2))}M`
  }
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`
  return formatAed(n)
}

export function perSqft(priceAed: number, sizeSqft: number): number {
  return sizeSqft > 0 ? Math.round(priceAed / sizeSqft) : 0
}

export function formatPerSqft(priceAed: number, sizeSqft: number): string {
  return `AED ${perSqft(priceAed, sizeSqft).toLocaleString('en-US')}/sqft`
}

/** "AED 4–6M" budget band from numeric min/max */
export function formatBudgetBand(min: number, max: number): string {
  const band = (v: number) =>
    v >= 1_000_000 ? `${Number((v / 1_000_000).toFixed(2))}M` : `${Math.round(v / 1_000)}K`
  return `AED ${band(min)}–${band(max)}`
}

/**
 * Top matching segments for a buyer requirement × property pair, mirroring the
 * server-side PRD weights (budget .30 · location .20 · type .15 · beds .10 ·
 * size .10 · timeline .05 · features .10). Returns the strongest 3 fitting
 * factors, e.g. "Budget fit · Location fit · Beds" (matching.md S3).
 */
export function summarizeTopSegments(req: RequirementDto, p: PropertyDto): string {
  const feats = p.features ?? []
  const featHits = req.mustHaves.filter((m) =>
    feats.some((f) => f.toLowerCase().includes(m.toLowerCase())),
  ).length
  const segs: { label: string; weight: number; got: number }[] = [
    {
      label: 'Budget fit',
      weight: 0.3,
      got:
        p.priceAed >= req.budgetMin && p.priceAed <= req.budgetMax
          ? 1
          : p.priceAed < req.budgetMin
            ? 0.6
            : 0,
    },
    { label: 'Location fit', weight: 0.2, got: req.communities.includes(p.community) ? 1 : 0 },
    { label: 'Type fit', weight: 0.15, got: req.propertyTypes.includes(p.propertyType) ? 1 : 0 },
    { label: 'Beds', weight: 0.1, got: p.beds >= req.bedsMin && p.beds <= req.bedsMax ? 1 : 0 },
    {
      label: 'Size',
      weight: 0.1,
      got: req.sizeMin === 0 || p.sizeSqft >= req.sizeMin ? 1 : 0,
    },
    {
      label: 'Features',
      weight: 0.1,
      got: req.mustHaves.length === 0 ? 1 : featHits / req.mustHaves.length,
    },
    {
      label: 'Timeline',
      weight: 0.05,
      got: req.completion === 'any' ? 1 : (req.completion === 'off-plan') === p.offPlan ? 1 : 0,
    },
  ]
  const top = segs
    .filter((s) => s.got >= 0.6)
    .sort((a, b) => b.weight * b.got - a.weight * a.got)
    .slice(0, 3)
    .map((s) => s.label)
  return top.length > 0 ? top.join(' · ') : 'Partial fit'
}
