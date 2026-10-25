import { cn } from '@/lib/utils'

/**
 * Nexus logo lockup — inline SVG mark (currentColor) + wordmark.
 * Used on dark surfaces (landing nav/footer, app sidebar) with primary color mark.
 * The flat primary color lockup for light contexts lives at /logo.svg.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn('h-6 w-6', className)} aria-hidden="true">
      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3" />
      <path d="M20 32 L32 20 L44 32 L32 44 Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M32 20 V44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 32 H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** mark + "NEXUS" color; wordmark sub-label stays muted */
  markClassName?: string
  compact?: boolean
}

export default function Logo({ className, markClassName, compact }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <LogoMark className={cn('text-primary', markClassName)} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[0.34em] text-inherit">NEXUS</span>
          <span className="mt-1 text-[8px] font-semibold tracking-[0.3em] text-muted-foreground">AI BUSINESS OS</span>
        </span>
      )}
    </span>
  )
}
