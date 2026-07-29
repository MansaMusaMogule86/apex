import { cn } from '@/lib/utils'

/**
 * APEX logo lockup — inline SVG mark (currentColor) + wordmark.
 * Used on dark surfaces (landing nav/footer, app sidebar) with palm-400 mark.
 * The flat palm-600 lockup for light contexts lives at /logo.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn('h-6 w-6', className)} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M16 52 L32 12 L48 52" />
        <path d="M24.5 36 H39.5" />
      </g>
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** mark + "APEX" color; wordmark sub-label stays muted */
  markClassName?: string
  compact?: boolean
}

export default function Logo({ className, markClassName, compact }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <LogoMark className={cn('text-palm-400', markClassName)} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[0.34em] text-inherit">APEX</span>
          <span className="mt-1 text-[8px] font-semibold tracking-[0.3em] text-ink-muted">REVENUE OS</span>
        </span>
      )}
    </span>
  )
}
