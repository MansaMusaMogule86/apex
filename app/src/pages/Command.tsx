/**
 * AI Command Center — /command (command.md).
 * Centered 880px chat canvas over bg-base: suggested prompts, mono input
 * dock with gold sparkle (pre-fills + auto-runs from ?q=), ask→answer
 * thread rendered per response kind (risk table / property cards / contacts
 * table / prose), full AI governance kit on every answer, plus the
 * Approvals queue tab and a ≥1280px context/history rail.
 */
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3, Building2, CalendarDays, ChevronDown, Crosshair, Kanban,
  ListChecks, MessageCircle, Mic, Search, Send, Sparkles, Users,
  AlertTriangle, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/providers/trpc'
import { CountBadge } from '@/components/app/Chips'
import { ToastStack } from '@/components/command/toasts'
import { useToasts } from '@/components/command/toasts.hook'
import { ApprovalsQueue } from '@/components/command/ApprovalsQueue'
import { AskAnswer, type Exchange } from '@/components/command/AnswerBlocks'
import { normalizeAsk } from '@/components/command/answer-model'

/* --------------------------- suggested prompts --------------------------- */

const suggestions: { label: string; icon: LucideIcon; iconClass: string }[] = [
  { label: 'Which deals are at risk this month and why?', icon: AlertTriangle, iconClass: 'text-red-600' },
  { label: 'Find three available 2BR in Downtown Dubai under AED 3M', icon: Building2, iconClass: 'text-palm-600' },
  { label: 'Show all buyers with budgets above AED 5M not contacted in 3 days', icon: Users, iconClass: 'text-mail-slate' },
  { label: 'Draft a WhatsApp follow-up for Arjun Mehta about Beach Isle', icon: MessageCircle, iconClass: 'text-wa-green' },
  { label: "Summarize this week's viewings and outcomes", icon: CalendarDays, iconClass: 'text-teal-600' },
  { label: 'Which lead source converts best to MOU?', icon: BarChart3, iconClass: 'text-gold-600' },
]

/* --------------------------- thinking indicator -------------------------- */

const thinkingVerbs = [
  'Scanning 1,284 records…',
  'Reading WhatsApp threads…',
  'Cross-checking Deal Flow…',
  'Citing sources…',
]

const ThinkingRow = memo(function ThinkingRow() {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % thinkingVerbs.length), 900)
    return () => window.clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-ink-500">
      <span className="flex items-center gap-1">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-gold-500"
            style={{ animationDelay: `${d * 0.18}s` }}
          />
        ))}
      </span>
      <span className="font-mono text-[12px]">{thinkingVerbs[i]}</span>
    </div>
  )
})

/* ------------------------------ capabilities ----------------------------- */

const capabilities: { icon: LucideIcon; label: string }[] = [
  { icon: Search, label: 'Search records' },
  { icon: BarChart3, label: 'Analyze pipeline' },
  { icon: MessageCircle, label: 'Draft messages' },
  { icon: Kanban, label: 'Move stages' },
  { icon: ListChecks, label: 'Create tasks' },
  { icon: Crosshair, label: 'Log outcomes' },
]

/* --------------------------------- page ---------------------------------- */

export default function CommandPage() {
  const { toasts, push, dismiss } = useToasts()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<'ask' | 'approvals'>('ask')
  const [input, setInput] = useState('')
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const nextId = useRef(1)
  const ask = trpc.apex.ai.ask.useMutation()
  const approvalsQ = trpc.apex.ai.approvals.useQuery()
  const pendingCount = approvalsQ.data?.length ?? 0

  // keep a stable ref to the mutation for callbacks/effects
  const askRef = useRef(ask)
  useEffect(() => {
    askRef.current = ask
  }, [ask])

  const submit = useCallback(
    (raw: string) => {
      const q = raw.trim()
      if (!q) return
      const id = nextId.current++
      const started = performance.now()
      setExchanges((xs) => [...xs, { id, q, status: 'thinking' }])
      setInput('')
      setTab('ask')
      askRef.current
        .mutateAsync({ q })
        .then((res: unknown) => {
          const secs = (performance.now() - started) / 1000
          setExchanges((xs) =>
            xs.map((x) =>
              x.id === id
                ? { ...x, status: 'done', result: normalizeAsk(res as Parameters<typeof normalizeAsk>[0]), elapsed: `Answered in ${secs.toFixed(1)}s` }
                : x,
            ),
          )
        })
        .catch(() => {
          setExchanges((xs) => xs.map((x) => (x.id === id ? { ...x, status: 'error' } : x)))
        })
    },
    [],
  )

  // pre-fill + auto-run from ?q=
  const bootedRef = useRef(false)
  useEffect(() => {
    if (bootedRef.current) return
    const q = searchParams.get('q')
    if (q && q.trim()) {
      bootedRef.current = true
      const frame = window.requestAnimationFrame(() => {
        setInput(q)
        submit(q)
        setSearchParams({}, { replace: true })
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [searchParams, setSearchParams, submit])

  // auto-scroll: keep the latest exchange in view (page scrolls in the shell)
  useEffect(() => {
    if (tab === 'ask' && exchanges.length > 0) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
    }
  }, [exchanges, tab])

  const lastQuery = exchanges.length > 0 ? exchanges[exchanges.length - 1].q : null
  const recentQueries = [...new Set(exchanges.map((x) => x.q))].slice(-6).reverse()

  const inputDock = (
    <div className="sticky bottom-6 z-10 mt-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
        className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-4 py-3 shadow-e2"
      >
        <Sparkles className="h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.75} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && !input && lastQuery) {
              e.preventDefault()
              setInput(lastQuery)
            } else if (e.key === 'Escape') {
              setInput('')
            }
          }}
          placeholder="Ask, search, or command… (⌘K anywhere)"
          aria-label="Ask APEX"
          className="h-9 min-w-0 flex-1 bg-transparent font-mono text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400"
        />
        <button
          type="button"
          className="hidden h-8 shrink-0 items-center gap-1.5 rounded-md border border-line px-2.5 text-[12px] text-ink-500 transition-colors hover:bg-sunken sm:inline-flex"
        >
          All records
          <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
        </button>
        <button
          type="button"
          aria-label="Voice input (stub)"
          onClick={() => push({ icon: 'sparkles', title: 'Voice input — coming in the next build' })}
          className="hidden shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700 sm:block"
        >
          <Mic className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button
          type="submit"
          aria-label="Send"
          disabled={!input.trim()}
          className="shrink-0 rounded-md bg-palm-600 p-2 text-white transition-all duration-120 hover:bg-palm-700 active:scale-[0.98] disabled:opacity-40"
        >
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>
      <p className="mt-2 text-center text-[11.5px] text-ink-400">
        AI drafts actions — nothing sends without approval.
      </p>
    </div>
  )

  return (
    <>
      {/* tab toggle */}
      <div className="mb-5 flex justify-center">
        <div className="flex rounded-lg bg-sunken p-1">
          <button
            type="button"
            onClick={() => setTab('ask')}
            className={cn(
              'rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors duration-120',
              tab === 'ask' ? 'bg-surface text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            Ask
          </button>
          <button
            type="button"
            onClick={() => setTab('approvals')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-4 py-1.5 text-[13px] font-medium transition-colors duration-120',
              tab === 'approvals' ? 'bg-surface text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-900',
            )}
          >
            Approvals
            {pendingCount > 0 && <CountBadge count={pendingCount} tone="gold" />}
          </button>
        </div>
      </div>

      {tab === 'approvals' ? (
        <div className="mx-auto w-full max-w-[880px]">
          <ApprovalsQueue onToast={push} />
        </div>
      ) : (
        <div className="flex items-start justify-center gap-8">
          {/* chat canvas */}
          <div className="w-full max-w-[880px]">
            {exchanges.length === 0 ? (
              /* S1 — empty / home state */
              <div className="flex min-h-[calc(100dvh-340px)] flex-col items-center justify-center text-center">
                <motion.span
                  initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-100"
                >
                  <Sparkles className="h-7 w-7 text-gold-600" strokeWidth={1.75} />
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 text-[24px] font-semibold tracking-[-0.01em] text-ink-900"
                >
                  Ask APEX anything.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-2 max-w-[52ch] text-[14px] leading-[22px] text-ink-500"
                >
                  Search records, analyze your pipeline, or draft actions — with sources and
                  approvals built in.
                </motion.p>
                <div className="mt-6 flex max-w-[720px] flex-wrap items-center justify-center gap-2">
                  {suggestions.map((s, i) => (
                    <motion.button
                      key={s.label}
                      type="button"
                      onClick={() => submit(s.label)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.22 + i * 0.045, ease: [0.2, 0.8, 0.2, 1] }}
                      whileHover={{ y: -2 }}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] text-ink-700 transition-colors duration-120 hover:border-palm-600/40 hover:bg-palm-50"
                    >
                      <s.icon className={cn('h-3.5 w-3.5 shrink-0', s.iconClass)} strokeWidth={1.75} />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* S2 — conversation thread */
              <div className="flex flex-col gap-7 pb-2">
                <AnimatePresence initial={false}>
                  {exchanges.map((x) => (
                    <div key={x.id} className="flex flex-col gap-3.5">
                      {/* user bubble */}
                      <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                        className="flex justify-end"
                      >
                        <p
                          dir="auto"
                          className="max-w-[70%] rounded-[12px] bg-sunken px-4 py-2.5 text-[14px] leading-[22px] text-ink-900"
                        >
                          {x.q}
                        </p>
                      </motion.div>
                      {/* ai answer */}
                      {x.status === 'thinking' && <ThinkingRow />}
                      {x.status === 'error' && (
                        <div className="rounded-[10px] border border-red-600/30 bg-red-100 px-4 py-3 text-[13px] text-red-600">
                          Something went wrong —{' '}
                          <button
                            type="button"
                            onClick={() => submit(x.q)}
                            className="font-semibold underline underline-offset-2"
                          >
                            retry
                          </button>
                          . Your query is preserved above.
                        </div>
                      )}
                      {x.status === 'done' && <AskAnswer exchange={x} onToast={push} />}
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {inputDock}
          </div>

          {/* S5 — right rail (≥1280px, after first answer) */}
          <AnimatePresence>
            {exchanges.length > 0 && (
              <motion.aside
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-6 hidden w-[280px] shrink-0 flex-col gap-4 xl:flex"
              >
                <div className="rounded-[10px] border border-line bg-surface p-4">
                  <p className="text-micro font-semibold uppercase text-ink-400">Recent queries</p>
                  <ul className="mt-2.5 space-y-0.5">
                    {recentQueries.map((q) => (
                      <li key={q}>
                        <button
                          type="button"
                          onClick={() => submit(q)}
                          className="w-full truncate rounded-md px-2 py-1.5 text-left font-mono text-[12px] text-ink-700 transition-colors hover:bg-sunken"
                          title={q}
                        >
                          {q}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[10px] border border-line bg-surface p-4">
                  <p className="text-micro font-semibold uppercase text-ink-400">What APEX can do</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {capabilities.map((c) => (
                      <li key={c.label} className="flex items-center gap-2.5 text-[13px] text-ink-700">
                        <c.icon className="h-3.5 w-3.5 text-palm-600" strokeWidth={1.75} />
                        {c.label}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-4 text-ink-400">
                    Draft autonomy — external actions need your approval.
                  </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
