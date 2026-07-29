/**
 * Page-local toast system — design.md §8.11.
 * Bottom-right 360px ink cards, icon + message + optional action, 300ms
 * slide-up, auto-dismiss. Shared by the Inbox and Command pages (both owned
 * by this agent) so approval feedback is consistent across surfaces.
 */
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ListChecks, Send, Sparkles, X, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { ToastIcon, ToastItem } from './toasts.types'

const iconMeta: Record<ToastIcon, { icon: LucideIcon; className: string }> = {
  check: { icon: Check, className: 'text-palm-400' },
  send: { icon: Send, className: 'text-palm-400' },
  x: { icon: X, className: 'text-terracotta' },
  sparkles: { icon: Sparkles, className: 'text-gold-400' },
  queue: { icon: ListChecks, className: 'text-gold-400' },
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: number) => void
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[90] flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = iconMeta[t.icon]
          const Icon = meta.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-[10px] bg-ink-bg px-4 py-3 text-ink-text shadow-e3 ring-1 ring-ink-line"
            >
              <Icon className={cn('h-4 w-4 shrink-0', meta.className)} strokeWidth={1.75} />
              <p className="min-w-0 flex-1 text-[13px] font-medium leading-5">{t.title}</p>
              {t.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    t.onAction?.()
                    onDismiss(t.id)
                  }}
                  className="shrink-0 text-[12.5px] font-semibold text-palm-400 transition-colors hover:text-palm-400/80"
                >
                  {t.actionLabel}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(t.id)}
                className="shrink-0 rounded p-0.5 text-ink-muted transition-colors hover:text-ink-text"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
