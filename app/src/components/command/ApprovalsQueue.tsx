/**
 * Command S4 — Approvals tab (queue view).
 * Single column of full-width approval cards sorted by confidence desc,
 * each with kind icon, title, summary, confidence, sources, and
 * Approve/Reject wired to trpc.apex.ai.approve/reject + invalidate.
 * Sticky batch bar: "Approve all high-confidence (≥90%)" (outline only).
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check, Crosshair, FileSearch, MessageCircle, Sparkles, Users, Zap, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { ApprovalCard } from '@/components/app/AiKit'
import { EmptyState } from '@/components/app/EmptyState'
import type { PushToast } from './toasts.types'
import type { AiActionVM } from '@/components/inbox/helpers'
import { sourceChips } from '@/components/inbox/helpers'

const kindMeta: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  follow_up: { icon: MessageCircle, label: 'Follow-up', className: 'text-wa-green' },
  extraction: { icon: FileSearch, label: 'Extraction', className: 'text-gold-600' },
  automation: { icon: Zap, label: 'Automation', className: 'text-gold-600' },
  reassignment: { icon: Users, label: 'Reassignment', className: 'text-mail-slate' },
  matching: { icon: Crosshair, label: 'Matching', className: 'text-palm-600' },
}

function kindInfo(kind: string) {
  return kindMeta[kind] ?? { icon: Sparkles, label: 'AI action', className: 'text-gold-600' }
}

export function ApprovalsQueue({ onToast }: { onToast: PushToast }) {
  const utils = trpc.useUtils()
  const approvalsQ = trpc.apex.ai.approvals.useQuery()
  const [batchBusy, setBatchBusy] = useState(false)

  const invalidate = () => {
    void utils.apex.ai.approvals.invalidate()
    void utils.apex.ai.all.invalidate()
  }
  const approve = trpc.apex.ai.approve.useMutation({ onSuccess: invalidate })
  const reject = trpc.apex.ai.reject.useMutation({ onSuccess: invalidate })

  const items: AiActionVM[] = [...(approvalsQ.data ?? [])].sort((a, b) => b.confidence - a.confidence)
  const highConfidence = items.filter((a) => a.confidence >= 90)

  const approveAll = async () => {
    if (batchBusy || highConfidence.length === 0) return
    setBatchBusy(true)
    try {
      for (const a of highConfidence) {
        await approve.mutateAsync({ id: a.id })
      }
      onToast({ icon: 'check', title: `Approved ${highConfidence.length} high-confidence action${highConfidence.length === 1 ? '' : 's'}` })
    } catch {
      onToast({ icon: 'x', title: 'Batch approve failed — some actions remain' })
    } finally {
      setBatchBusy(false)
    }
  }

  if (approvalsQ.isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[148px] animate-pulse rounded-[10px] border border-line bg-sunken/60" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Queue clear."
        description="AI routes drafts, extractions, and proposed automations here as it works — nothing sends without your approval."
      />
    )
  }

  return (
    <div className="pb-2">
      <div className="space-y-3">
        {items.map((a, i) => {
          const meta = kindInfo(a.kind)
          const Icon = meta.icon
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(i, 7) * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <ApprovalCard
                title={a.title}
                confidence={a.confidence}
                sources={sourceChips(a.sources)}
                onApprove={() =>
                  void approve.mutateAsync({ id: a.id }).then(() => onToast({ icon: 'check', title: `Approved · ${a.title}` }))
                }
                onReject={() =>
                  void reject.mutateAsync({ id: a.id }).then(() => onToast({ icon: 'x', title: `Rejected · ${a.title}` }))
                }
                onEdit={() => onToast({ icon: 'sparkles', title: 'Message drafts open for edit in the Inbox' })}
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-semibold text-ink-700 ring-1 ring-line">
                    <Icon className={`h-3 w-3 ${meta.className}`} strokeWidth={1.75} />
                    {meta.label}
                  </span>
                  <p className="mt-1.5">{a.summary}</p>
                  <p className="mt-1 text-[11.5px] text-ink-400">Queued {a.createdAgo}</p>
                </div>
              </ApprovalCard>
            </motion.div>
          )
        })}
      </div>

      {/* batch bar */}
      <div className="sticky bottom-0 z-10 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-line bg-surface/95 px-4 py-3 shadow-e1 backdrop-blur">
        <p className="text-[12.5px] text-ink-500">
          {items.length} pending · {highConfidence.length} at ≥90% confidence
        </p>
        <button
          type="button"
          disabled={highConfidence.length === 0 || batchBusy}
          onClick={() => void approveAll()}
          className="inline-flex items-center gap-1.5 rounded-md border border-palm-600 px-3.5 py-2 text-[13px] font-semibold text-palm-700 transition-all duration-120 hover:bg-palm-50 active:scale-[0.98] disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" strokeWidth={2} />
          {batchBusy ? 'Approving…' : 'Approve all high-confidence (≥90%)'}
        </button>
      </div>
    </div>
  )
}
