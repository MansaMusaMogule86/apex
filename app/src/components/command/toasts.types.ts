import type { LucideIcon } from 'lucide-react'

export type ToastIcon = 'check' | 'send' | 'x' | 'sparkles' | 'queue'

export interface ToastItem {
  id: number
  title: string
  icon: ToastIcon
  actionLabel?: string
  onAction?: () => void
}

export type ToastInput = Omit<ToastItem, 'id'>
export type PushToast = (t: ToastInput) => void

export type ToastMeta = Record<ToastIcon, { icon: LucideIcon; className: string }>