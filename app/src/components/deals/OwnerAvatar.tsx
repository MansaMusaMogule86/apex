/**
 * Owner avatar — initials on deterministic pastel-ink background
 * (design.md §6; same pattern as the scaffold AppShell Avatar).
 */
import { cn } from '@/lib/utils'
import { avatarTone, initials as initialsOf } from './utils'

export function OwnerAvatar({
  name,
  initials,
  size = 20,
  className,
}: {
  name: string
  /** precomputed initials (e.g. from the team API); derived from name when omitted */
  initials?: string
  size?: number
  className?: string
}) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      title={name}
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}
    >
      {initials ?? initialsOf(name)}
    </span>
  )
}

export default OwnerAvatar
