import { useCallback, useRef, useState } from 'react'

import type { PushToast, ToastItem } from './toasts.types'

export function useToasts(autoDismissMs = 4500) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const push = useCallback<PushToast>(
    (t) => {
      const id = nextId.current++
      setToasts((ts) => [...ts.slice(-2), { ...t, id }])
      window.setTimeout(() => dismiss(id), autoDismissMs)
    },
    [autoDismissMs, dismiss],
  )

  return { toasts, push, dismiss }
}