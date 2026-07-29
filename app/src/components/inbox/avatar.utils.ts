const pairs: [string, string][] = [
  ['#E7F1ED', '#0B5D4A'],
  ['#F7EFDD', '#A97B1F'],
  ['#E9EEF2', '#5B6B7A'],
  ['#F9E9E6', '#B4372A'],
  ['#EFF0E2', '#7A8C3F'],
  ['#F1EAE3', '#8C6D4F'],
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function nameInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => (w[0] ?? '').toUpperCase())
      .join('') || '·'
  )
}

export function avatarTone(name: string): [string, string] {
  return pairs[hashName(name) % pairs.length]
}
