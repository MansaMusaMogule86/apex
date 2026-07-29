export function dealDragId(id: number): string {
  return `deal:${id}`
}

export function parseDealDragId(id: string | number): number | null {
  const s = String(id)
  if (!s.startsWith('deal:')) return null
  const n = Number(s.slice(5))
  return Number.isFinite(n) ? n : null
}