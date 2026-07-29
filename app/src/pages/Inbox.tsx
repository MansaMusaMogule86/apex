/**
 * Unified Inbox — /inbox (inbox.md).
 * 3-pane workspace taking the full content height (no page scroll):
 * conversation list (340px) · thread (fluid) · context panel (360px,
 * collapsible; overlay below 1100px). All data live via trpc.apex.inbox.*,
 * contacts/deals/tasks/properties for the context rail.
 * Keyboard: j/k move selection · a approve draft · r reject draft.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Inbox as InboxIcon } from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { EmptyState } from '@/components/app/EmptyState'
import { cn } from '@/lib/utils'
import { ToastStack } from '@/components/command/toasts'
import { useToasts } from '@/components/command/toasts.hook'
import { ConversationList } from '@/components/inbox/ConversationList'
import { ThreadPane } from '@/components/inbox/ThreadPane'
import { ContextRail } from '@/components/inbox/ContextRail'
import type { DraftActions } from '@/components/inbox/DraftCard'
import type { ConversationVM, DealVM, DraftVM, MessageVM, PropertyVM, TaskVM } from '@/components/inbox/helpers'

export default function InboxPage() {
  const { toasts, push, dismiss } = useToasts()

  /* ------------------------------- data --------------------------------- */
  const convosQ = trpc.apex.inbox.conversations.useQuery()
  const dealsQ = trpc.apex.deals.list.useQuery()
  const stagesQ = trpc.apex.deals.stages.useQuery()
  const tasksQ = trpc.apex.tasks.list.useQuery()
  const propertiesQ = trpc.apex.properties.list.useQuery()

  const conversations = useMemo(() => (convosQ.data ?? []) as ConversationVM[], [convosQ.data])
  const deals = useMemo(() => (dealsQ.data ?? []) as DealVM[], [dealsQ.data])
  const stages = useMemo(() => (stagesQ.data ?? []) as string[], [stagesQ.data])
  const tasks = useMemo(() => (tasksQ.data ?? []) as TaskVM[], [tasksQ.data])
  const properties = useMemo(() => (propertiesQ.data ?? []) as PropertyVM[], [propertiesQ.data])

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [contextOpen, setContextOpen] = useState(true)
  const [mobileThread, setMobileThread] = useState(false)
  const draftActionsRef = useRef<DraftActions | null>(null)

  // default selection: the breached AI-draft thread (Arjun) → any draft → first
  useEffect(() => {
    if (selectedId == null && conversations.length) {
      const preferred =
        conversations.find((c) => c.aiDraftPending && c.slaBreached) ??
        conversations.find((c) => c.aiDraftPending) ??
        conversations[0]
      const frame = window.requestAnimationFrame(() => setSelectedId(preferred.id))
      return () => window.cancelAnimationFrame(frame)
    }
  }, [conversations, selectedId])

  const selected = conversations.find((c) => c.id === selectedId) ?? null

  const messagesQ = trpc.apex.inbox.messages.useQuery(
    { conversationId: selectedId ?? -1 },
    { enabled: selectedId != null },
  )
  const draftQ = trpc.apex.inbox.draft.useQuery(
    { conversationId: selectedId ?? -1 },
    { enabled: selectedId != null },
  )
  const messages = useMemo(() => ((messagesQ.data ?? []).map((m) => ({ ...m, conversationId: selectedId ?? -1 })) as MessageVM[]), [messagesQ.data, selectedId])
  const draft = useMemo(() => (draftQ.data ? ({ ...draftQ.data, conversationId: selectedId ?? -1 } as DraftVM) : null), [draftQ.data, selectedId])
  const contactId = selected?.contactId ?? null
  const contactQ = trpc.apex.contacts.get.useQuery(
    { id: contactId ?? -1 },
    { enabled: contactId != null },
  )
  const requirementQ = trpc.apex.contacts.requirement.useQuery(
    { contactId: contactId ?? -1 },
    { enabled: contactId != null },
  )

  const dealsById = useMemo(() => new Map<number, DealVM>(deals.map((d) => [d.id, d])), [deals])
  const linkedDeal = selected?.linkedDealId != null ? dealsById.get(selected.linkedDealId) : undefined
  const linkedProperty = properties.find((p) => p.id === linkedDeal?.propertyId)

  /* --------------------------- keyboard nav ------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      )
        return
      const list = conversations
      if (list.length === 0) return
      const idx = list.findIndex((c) => c.id === selectedId)
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const next =
          e.key === 'j' ? list[Math.min(list.length - 1, idx + 1)] : list[Math.max(0, idx - 1)]
        if (next && next.id !== selectedId) {
          setSelectedId(next.id)
          setMobileThread(true)
        }
      } else if (e.key === 'o' && idx >= 0) {
        setMobileThread(true)
      } else if (e.key === 'a') {
        draftActionsRef.current?.approve()
      } else if (e.key === 'r') {
        draftActionsRef.current?.reject()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [conversations, selectedId])

  /* ------------------------------- render -------------------------------- */
  return (
    <>
      <div className="relative flex h-[calc(100dvh-104px)] overflow-hidden rounded-[12px] border border-line bg-surface">
        {/* left — conversation list (340px) */}
        <div
          className={cn(
            'h-full w-full shrink-0 border-r border-line md:w-[340px]',
            mobileThread ? 'hidden md:block' : 'block',
          )}
        >
          <ConversationList
            conversations={conversations}
            isLoading={convosQ.isLoading}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id)
              setMobileThread(true)
            }}
            dealsById={dealsById}
          />
        </div>

        {/* center — thread (fluid) */}
        <div className={cn('h-full min-w-0 flex-1', mobileThread ? 'block' : 'hidden md:block')}>
          {selected ? (
            <ThreadPane
              conversation={selected}
              contact={contactQ.data}
              messages={messages}
              messagesLoading={messagesQ.isLoading}
              draft={draft}
              onBack={() => setMobileThread(false)}
              onToggleContext={() => setContextOpen((v) => !v)}
              onToast={push}
              draftActionsRef={draftActionsRef}
            />
          ) : (
            !convosQ.isLoading && (
              <div className="flex h-full items-center justify-center">
                <EmptyState
                  icon={InboxIcon}
                  title="All clear."
                  description="New messages appear here in real time — WhatsApp, email, and internal notes in one queue."
                />
              </div>
            )
          )}
        </div>

        {/* right — context panel (360px, collapsible; overlay below 1100px) */}
        {contextOpen && selected && (
          <div className="absolute inset-y-0 right-0 z-20 w-[340px] shrink-0 border-l border-line shadow-e3 min-[1100px]:static min-[1100px]:z-auto min-[1100px]:w-[360px] min-[1100px]:shadow-none">
            <ContextRail
              conversation={selected}
              contact={contactQ.data}
              contactLoading={contactQ.isLoading && contactId != null}
              requirement={requirementQ.data}
              deal={linkedDeal}
              stages={stages}
              property={linkedProperty}
              tasks={tasks}
              onClose={() => setContextOpen(false)}
            />
          </div>
        )}
      </div>

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
