/**
 * Inbox S2 — AI draft approval card docked above the composer.
 * Full design.md §8.8 anatomy via AiKit ApprovalCard: gold left border,
 * confidence meter, source chips, Approve & send / Edit / Reject, plus a
 * ghost Regenerate. Approve/reject hit the tRPC mutations, invalidate, and
 * the card collapses (240ms, handled inside ApprovalCard) into a toast.
 */
import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { Sparkles } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { ApprovalCard } from '@/components/app/AiKit'
import type { PushToast } from '@/components/command/toasts.types'
import type { DraftVM } from './helpers'
import { channelLabel, firstName, sourceChips, textDir } from './helpers'

/** Imperative handle so the page can bind `a` / `r` keyboard shortcuts. */
export interface DraftActions {
  approve: () => void
  reject: () => void
}

export interface DraftCardProps {
  draft: DraftVM
  contactName: string
  channel: string
  onToast: PushToast
  /** called after a successful approve so the thread can append the sent bubble */
  onSent: (body: string) => void
  actionsRef?: MutableRefObject<DraftActions | null>
}

export function DraftCard({ draft, contactName, channel, onToast, onSent, actionsRef }: DraftCardProps) {
  const utils = trpc.useUtils()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(draft.body)

  const invalidate = () => {
    void utils.apex.inbox.draft.invalidate()
    void utils.apex.inbox.conversations.invalidate()
    void utils.apex.inbox.messages.invalidate()
  }

  const approve = trpc.apex.inbox.approveDraft.useMutation({
    onSuccess: () => {
      invalidate()
      onSent(text)
      onToast({ icon: 'send', title: `Sent on ${channelLabel(channel)} · ${contactName}` })
    },
    onError: () => onToast({ icon: 'x', title: 'Could not send — try again' }),
  })
  const reject = trpc.apex.inbox.rejectDraft.useMutation({
    onSuccess: () => {
      invalidate()
      onToast({ icon: 'x', title: `Draft for ${firstName(contactName)} rejected` })
    },
    onError: () => onToast({ icon: 'x', title: 'Could not reject — try again' }),
  })

  // expose stable imperative actions (a / r shortcuts) without re-binding
  const latest = useRef({ draftId: draft.id, approve, reject })
  useEffect(() => {
    latest.current = { draftId: draft.id, approve, reject }
    if (!actionsRef) return
    actionsRef.current = {
      approve: () => {
        const l = latest.current
        if (!l.approve.isPending) l.approve.mutate({ id: l.draftId })
      },
      reject: () => {
        const l = latest.current
        if (!l.reject.isPending) l.reject.mutate({ id: l.draftId })
      },
    }
    return () => {
      if (actionsRef) actionsRef.current = null
    }
  }, [actionsRef, approve, draft.id, reject])

  return (
    <div>
      <ApprovalCard
        title={`Draft reply to ${firstName(contactName)} — pending approval`}
        confidence={draft.confidence}
        sources={sourceChips(draft.sources)}
        onApprove={() => approve.mutate({ id: draft.id })}
        onReject={() => reject.mutate({ id: draft.id })}
        onEdit={() => setEditing((v) => !v)}
      >
        {editing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir={textDir(text)}
            rows={Math.min(10, Math.max(4, text.split('\n').length + 2))}
            autoFocus
            className="w-full resize-y rounded-md border border-line-strong bg-surface p-2.5 text-[13.5px] leading-[22px] text-ink-900 outline-none transition-colors focus:border-palm-600"
          />
        ) : (
          <p dir={textDir(text)} className="whitespace-pre-wrap">
            {text}
          </p>
        )}
      </ApprovalCard>
      <div className="mt-1.5 flex items-center justify-between px-1">
        <p className="text-[11.5px] text-ink-400">
          Drafted {draft.createdAgo} · nothing sends without approval
        </p>
        <button
          type="button"
          onClick={() => {
            setEditing(false)
            setText(draft.body)
            void utils.apex.inbox.draft.invalidate()
            onToast({ icon: 'sparkles', title: 'Regenerating draft…' })
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-500 transition-colors duration-120 hover:bg-sunken hover:text-gold-600"
        >
          <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
          Regenerate
        </button>
      </div>
    </div>
  )
}
