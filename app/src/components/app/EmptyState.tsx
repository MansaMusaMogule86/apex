/**
 * Empty state — design.md §8.9.
 * 56px line-art icon in bg-sunken circle, H3 title, 13px muted description
 * (max 40ch), primary CTA + ghost secondary. No dead ends.
 */
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  primaryCta?: { label: string; onClick: () => void }
  secondaryCta?: { label: string; onClick: () => void }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sunken">
        <Icon className="h-7 w-7 text-ink-500" strokeWidth={1.5} />
      </span>
      <h3 className="mt-4 text-[14px] font-semibold leading-5 text-ink-900">{title}</h3>
      <p className="mt-1.5 max-w-[40ch] text-[13px] leading-5 text-ink-500">{description}</p>
      {(primaryCta || secondaryCta) && (
        <div className="mt-5 flex items-center gap-2.5">
          {primaryCta && (
            <button
              type="button"
              onClick={primaryCta.onClick}
              className="rounded-md bg-palm-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
            >
              {primaryCta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              type="button"
              onClick={secondaryCta.onClick}
              className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken"
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default EmptyState
