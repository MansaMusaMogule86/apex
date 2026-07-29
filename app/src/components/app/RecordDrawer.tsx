/**
 * Record Drawer (side panel) — design.md §8.3.
 * Right drawer 480px (expandable to 720px), header with avatar/title/chips,
 * tab strip + scrollable body, footer action row. Slide 280ms, dim overlay.
 */
import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RecordDrawerTab {
  id: string
  label: string
}

export interface RecordDrawerProps {
  open: boolean
  onClose: () => void
  /** record name / headline */
  title: ReactNode
  subtitle?: ReactNode
  /** status chips row (use Chips.tsx) */
  chips?: ReactNode
  /** avatar or photo thumb (28–36px) */
  avatar?: ReactNode
  tabs?: RecordDrawerTab[]
  activeTab?: string
  onTabChange?: (id: string) => void
  /** "Open full page ↗" handler */
  onOpenFullPage?: () => void
  /** footer slot — primary + secondary actions */
  footer?: ReactNode
  children: ReactNode
}

export function RecordDrawer({
  open,
  onClose,
  title,
  subtitle,
  chips,
  avatar,
  tabs,
  activeTab,
  onTabChange,
  onOpenFullPage,
  footer,
  children,
}: RecordDrawerProps) {
  const [expanded, setExpanded] = useState(false)

  // reset expansion when the drawer closes (render-time adjustment)
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (!open) setExpanded(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-ink-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.24 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className={cn(
              'absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-e3',
              expanded ? 'max-w-[720px]' : 'max-w-[480px]',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* header */}
            <div className="flex items-start gap-3 border-b border-line p-4">
              {avatar}
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[16px] font-semibold leading-6 text-ink-900">{title}</h2>
                {subtitle && <p className="truncate text-[12.5px] text-ink-500">{subtitle}</p>}
                {chips && <div className="mt-1.5 flex flex-wrap items-center gap-1.5">{chips}</div>}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  aria-label={expanded ? 'Collapse drawer' : 'Expand drawer'}
                  className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
                >
                  {expanded ? (
                    <Minimize2 className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
                {onOpenFullPage && (
                  <button
                    type="button"
                    onClick={onOpenFullPage}
                    aria-label="Open full page"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[12px] font-medium text-palm-600 transition-colors hover:bg-palm-50"
                  >
                    Open full page
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            {/* tab strip */}
            {tabs && tabs.length > 0 && (
              <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onTabChange?.(t.id)}
                    className={cn(
                      'whitespace-nowrap rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-120',
                      activeTab === t.id
                        ? 'bg-palm-100 text-palm-700'
                        : 'text-ink-500 hover:bg-sunken hover:text-ink-900',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {/* body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>

            {/* footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-line p-4">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default RecordDrawer
