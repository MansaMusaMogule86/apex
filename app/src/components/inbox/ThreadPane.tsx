/**
 * Inbox S2 — message thread pane (center, fluid).
 * Header with contact + status chips, SLA breach banner, channel ribbon,
 * WhatsApp-style bubbles (inbound white left / outbound palm right with
 * read ticks, RTL-aware), AI draft docked above the composer, and a
 * composer stub with the channel lock + template hint bar.
 */
import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Bell, CheckCheck, Link2, MoreHorizontal, Paperclip, Phone,
  Send, Smile, Sparkles, UserRound, PanelRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChannelBadge, StatusChip } from '@/components/app/Chips'
import { AiBadge } from '@/components/app/AiKit'
import type { Channel } from '@/components/app/Chips'
import type { PushToast } from '@/components/command/toasts.types'
import type { ContactVM, ConversationVM, DraftVM, MessageVM } from './helpers'
import { channelLabel, channelRibbon, firstName, splitEmbeddedTranslation, textDir } from './helpers'
import { DraftCard, type DraftActions } from './DraftCard'

interface SentLocal {
  id: string
  body: string
}

function Bubble({ message, index }: { message: MessageVM; index: number }) {
  const out = message.direction === 'out'
  const [showTranslation, setShowTranslation] = useState(false)
  const embedded = splitEmbeddedTranslation(message.body)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.14, delay: Math.min(index, 10) * 0.025, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn('flex', out ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[68%] rounded-[14px] px-3.5 py-2.5',
          out ? 'rounded-br-[4px] bg-palm-100' : 'rounded-bl-[4px] border border-line bg-surface',
        )}
      >
        <p dir={textDir(message.body)} className="whitespace-pre-wrap text-[13.5px] leading-[21px] text-ink-900">
          {embedded ? embedded.main : message.body}
        </p>
        {embedded && (
          <div className="mt-1">
            {showTranslation ? (
              <p className="rounded-md bg-gold-100/50 px-2 py-1.5 text-[12.5px] italic leading-5 text-ink-700">
                <AiBadge className="mr-1.5 align-[-2px]" />
                {embedded.translation}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowTranslation(true)}
                className="inline-flex items-center gap-1 text-[11.5px] font-medium text-ink-400 transition-colors hover:text-gold-600"
              >
                <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
                Show translation
              </button>
            )}
          </div>
        )}
        <div className={cn('mt-1 flex items-center gap-1 text-[10.5px] text-ink-400', out ? 'justify-end' : 'justify-start')}>
          <span>
            {message.senderName} · {message.ago}
          </span>
          {out && <CheckCheck className="h-3 w-3 text-palm-600" strokeWidth={2} aria-label="Read" />}
        </div>
      </div>
    </motion.div>
  )
}

export interface ThreadPaneProps {
  conversation: ConversationVM
  contact: ContactVM | null | undefined
  messages: MessageVM[] | undefined
  messagesLoading: boolean
  draft: DraftVM | null | undefined
  onBack: () => void
  onToggleContext: () => void
  onToast: PushToast
  draftActionsRef: MutableRefObject<DraftActions | null>
}

export function ThreadPane({
  conversation,
  contact,
  messages,
  messagesLoading,
  draft,
  onBack,
  onToggleContext,
  onToast,
  draftActionsRef,
}: ThreadPaneProps) {
  const [composer, setComposer] = useState('')
  const [sentLocal, setSentLocal] = useState<SentLocal[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevConvRef = useRef(conversation.id)

  useEffect(() => {
    if (prevConvRef.current === conversation.id) return
    prevConvRef.current = conversation.id
    const frame = window.requestAnimationFrame(() => {
      setComposer('')
      setSentLocal([])
    })
    return () => window.cancelAnimationFrame(frame)
  }, [conversation.id])

  // keep latest message in view
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages?.length, sentLocal.length, draft?.id, conversation.id])

  const pendingDraft = draft && draft.status === 'pending' ? draft : null

  const sendComposer = () => {
    const body = composer.trim()
    if (!body) return
    setSentLocal((s) => [...s, { id: `local-${Date.now()}`, body }])
    setComposer('')
    onToast({ icon: 'send', title: `Message queued — syncs to ${channelLabel(conversation.channel)}` })
  }

  const channel: Channel = ['whatsapp', 'email', 'note', 'phone', 'viewing'].includes(conversation.channel)
    ? (conversation.channel as Channel)
    : 'note'

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      {/* header */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <button
          type="button"
          aria-label="Back to conversations"
          onClick={onBack}
          className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken md:hidden"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[14.5px] font-semibold text-ink-900">{conversation.contactName}</h2>
            {contact?.budgetLabel && (
              <StatusChip tone="palm" dot={false} className="hidden sm:inline-flex">
                {contact.contactType} · {contact.budgetLabel}
              </StatusChip>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-ink-500">
          {[
            { icon: Phone, label: 'Call (stub)' },
            { icon: Link2, label: 'Link deal' },
            { icon: Bell, label: 'Snooze' },
            { icon: UserRound, label: 'Assign' },
            { icon: MoreHorizontal, label: 'More' },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              title={b.label}
              onClick={() => onToast({ icon: 'sparkles', title: `${b.label} — coming in the next build` })}
              className="rounded-md p-1.5 transition-colors hover:bg-sunken hover:text-ink-900"
            >
              <b.icon className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ))}
          <button
            type="button"
            title="Toggle context panel"
            onClick={onToggleContext}
            className="rounded-md p-1.5 transition-colors hover:bg-sunken hover:text-ink-900"
          >
            <PanelRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* SLA breach banner */}
      {conversation.slaBreached && (
        <div className="shrink-0 border-b border-red-600/20 bg-red-100/60 px-4 py-1.5 text-center text-[12px] font-medium text-red-600">
          First response overdue ({conversation.sla ?? 'SLA'}) — respond or reassign.
        </div>
      )}

      {/* channel ribbon */}
      <div className="flex shrink-0 items-center gap-2 border-b border-line bg-sunken/50 px-4 py-1.5 text-[11.5px] text-ink-500">
        <span className={cn('h-1.5 w-1.5 rounded-full', conversation.channel === 'whatsapp' ? 'bg-wa-green' : conversation.channel === 'email' ? 'bg-mail-slate' : 'bg-ink-400')} />
        {channelRibbon(conversation.channel)}
      </div>

      {/* messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messagesLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn('flex', i % 2 ? 'justify-end' : 'justify-start')}>
                <div className="h-14 w-[55%] animate-pulse rounded-[14px] bg-sunken" />
              </div>
            ))}
          </div>
        )}
        {!messagesLoading && (messages ?? []).map((m, i) => <Bubble key={m.id} message={m} index={i} />)}
        {!messagesLoading && (messages ?? []).length === 0 && (
          <p className="py-10 text-center text-[12.5px] text-ink-400">No messages in this thread yet.</p>
        )}
        <AnimatePresence>
          {sentLocal.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex justify-end"
            >
              <div className="max-w-[68%] rounded-[14px] rounded-br-[4px] bg-palm-100 px-3.5 py-2.5">
                <p dir={textDir(s.body)} className="whitespace-pre-wrap text-[13.5px] leading-[21px] text-ink-900">
                  {s.body}
                </p>
                <div className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-ink-400">
                  <span>You · now</span>
                  <CheckCheck className="h-3 w-3 text-palm-600" strokeWidth={2} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI draft dock */}
      <AnimatePresence>
        {pendingDraft && (
          <motion.div
            key={`draft-${pendingDraft.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 border-t border-line bg-gold-100/20 px-4 pb-1 pt-3"
          >
            <DraftCard
              key={pendingDraft.id}
              draft={pendingDraft}
              contactName={conversation.contactName}
              channel={conversation.channel}
              onToast={onToast}
              onSent={(body) => setSentLocal((s) => [...s, { id: `sent-${pendingDraft.id}`, body }])}
              actionsRef={draftActionsRef}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* composer */}
      <div className="shrink-0 border-t border-line px-4 pb-2.5 pt-2.5">
        <div className="flex items-end gap-1.5 rounded-[14px] border border-line-strong bg-surface px-2.5 py-2 transition-colors focus-within:border-palm-600">
          <button
            type="button"
            title="Attach (stub)"
            onClick={() => onToast({ icon: 'sparkles', title: 'Attachments — coming in the next build' })}
            className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            title="Emoji (stub)"
            onClick={() => onToast({ icon: 'sparkles', title: 'Emoji picker — coming in the next build' })}
            className="rounded-md p-1.5 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700"
          >
            <Smile className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <textarea
            value={composer}
            onChange={(e) => setComposer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendComposer()
              }
            }}
            rows={1}
            placeholder={`Message ${firstName(conversation.contactName)}…`}
            className="max-h-28 flex-1 resize-none bg-transparent px-1 py-1 text-[14px] leading-[20px] text-ink-900 outline-none placeholder:text-ink-400"
          />
          <span title={`Locked to ${channelLabel(conversation.channel)}`} className="self-center">
            <ChannelBadge channel={channel} />
          </span>
          <button
            type="button"
            aria-label="Send message"
            disabled={!composer.trim()}
            onClick={sendComposer}
            className="rounded-md bg-palm-600 p-2 text-white transition-all duration-120 hover:bg-palm-700 active:scale-[0.98] disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11.5px] text-ink-400">
          ⏎ send · shift+⏎ newline · replies sync to {channelLabel(conversation.channel)}
          {conversation.channel === 'whatsapp' && ' · approved AI drafts use the pre-formatted WhatsApp template'}
        </p>
      </div>
    </div>
  )
}
