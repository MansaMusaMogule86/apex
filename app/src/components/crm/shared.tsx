/**
 * CRM page-local shared components — Relationships + Contact detail.
 * Visual primitives live here; types, utils, and hooks are separated out.
 */
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { StatusChip } from '@/components/app/Chips'
import type { ToastItem } from '@/components/command/toasts.types'

import { avatarTone, contactTypeParts, initials } from './shared.utils'

type ChipTone = 'palm' | 'amber' | 'red' | 'neutral' | 'teal' | 'gold' | 'slate'

function typeTone(part: string): ChipTone {
  const p = part.toLowerCase()
  if (p.includes('buyer') || p.includes('first-time') || p.includes('end-user')) return 'palm'
  if (p.includes('seller')) return 'teal'
  if (p.includes('landlord')) return 'amber'
  if (p.includes('investor')) return 'slate'
  if (p.includes('tenant')) return 'neutral'
  return 'neutral'
}

export function Avatar({
  name,
  size = 28,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const [bg, fg] = avatarTone(name)
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.max(9, size * 0.36) }}
    >
      {initials(name)}
    </span>
  )
}

export function ContactTypeChips({ contactType, className }: { contactType: string; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {contactTypeParts(contactType).map((part) => (
        <StatusChip key={part} tone={typeTone(part)} dot={false}>
          {part}
        </StatusChip>
      ))}
    </span>
  )
}

export function ToastHost({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-[10px] bg-ink-bg px-4 py-3 text-[13px] font-medium text-ink-text shadow-e3"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-palm-600">
              <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
            </span>
            {t.title}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function SkeletonRows({ rows = 8, height = 44 }: { rows?: number; height?: number }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface">
      <div className="h-10 border-b border-line bg-sunken" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line px-4 last:border-0" style={{ height }}>
          <span className="h-7 w-7 animate-pulse rounded-full bg-sunken" />
          <span className="h-3 w-40 animate-pulse rounded bg-sunken" />
          <span className="h-3 w-20 animate-pulse rounded bg-sunken" />
          <span className="ml-auto h-3 w-24 animate-pulse rounded bg-sunken" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[10px] bg-sunken', className)} />
}

export function PanelCard({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-[10px] border border-line bg-surface', className)}>
      {title && (
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <h2 className="text-[16px] font-semibold leading-6 text-ink-900">{title}</h2>
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
