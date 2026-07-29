import { useState } from 'react'

import type { PushToast, ToastItem } from '@/components/command/toasts.types'

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const push: PushToast = (toast) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...toast, id }])
    window.setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), 3200)
  }
  return { toasts, push }
}