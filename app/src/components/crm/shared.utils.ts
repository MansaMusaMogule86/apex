import { avatarTone, initials } from '@/lib/demo-data'

export function formatAed(n: number): string {
  return `AED ${n.toLocaleString('en-US')}`
}

export function formatAedCompact(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `AED ${Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}M`
  }
  if (n >= 1_000) return `AED ${Math.round(n / 1_000)}K`
  return `AED ${n}`
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '—'
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Parse relative labels like "3d ago" / "New · 40m ago" → minutes (for sorting/color). */
export function agoToMinutes(ago: string | null | undefined): number {
  if (!ago) return Number.POSITIVE_INFINITY
  const m = ago.match(/(\d+)\s*([mhdw])/i)
  if (!m) return 0
  const n = Number(m[1])
  const unit = m[2]!.toLowerCase()
  if (unit === 'm') return n
  if (unit === 'h') return n * 60
  if (unit === 'd') return n * 60 * 24
  return n * 60 * 24 * 7
}

/** Last-contact color: >3d amber, >7d red (relationships.md S1). */
export function lastContactClass(ago: string | null | undefined): string {
  const mins = agoToMinutes(ago)
  if (mins > 7 * 24 * 60) return 'text-red-600'
  if (mins > 3 * 24 * 60) return 'text-amber-600'
  return 'text-ink-700'
}

export function contactTypeParts(contactType: string): string[] {
  return contactType
    .split('·')
    .map((p) => p.trim())
    .filter(Boolean)
}

export { avatarTone, initials }