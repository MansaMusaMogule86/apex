import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { EASE_OUT } from './widgets.constants'

/** Minimal bottom-right ink toast (design.md §8.11) for page-local feedback. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | null>(null)
  const toast = useCallback((msg: string) => {
    setMessage(msg)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2600)
  }, [])
  const node = (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="fixed bottom-6 right-6 z-[80] flex w-[360px] items-center gap-2.5 rounded-[10px] bg-ink-900 px-4 py-3 text-[13px] text-white shadow-e3"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-palm-400" strokeWidth={1.75} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
  return { toast, node }
}