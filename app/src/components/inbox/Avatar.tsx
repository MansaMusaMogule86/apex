/**
 * Initials avatar — design.md §6: initials on deterministic pastel-ink
 * backgrounds (hash of name → muted pairs). Page-local so pages stay
 * independent of demo data.
 */
import { avatarTone, nameInitials } from './avatar.utils'

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      className="flex shrink-0 select-none items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.max(9, size * 0.36) }}
    >
      {nameInitials(name)}
    </span>
  )
}
