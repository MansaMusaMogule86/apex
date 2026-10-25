/**
 * Command Bar (⌘K overlay) — design.md §8.2.
 * 680px modal at 18vh, tabs All/Records/Actions/AI, grouped results with
 * keyboard nav, "Ask AI →" footer routing into /command?q=…
 */
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles, User, Building2, ArrowRight, Clock3, UserPlus, CalendarPlus,
  ListPlus, FilePlus2, Handshake, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { contacts, properties, deals } from '@/lib/demo-data'

type Tab = 'all' | 'records' | 'actions' | 'ai'

const tabs: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'records', label: 'Records' },
  { id: 'actions', label: 'Actions' },
  { id: 'ai', label: 'AI' },
]

interface ResultItem {
  id: string
  group: 'Contacts' | 'Deals' | 'Properties' | 'Actions' | 'AI'
  icon: LucideIcon
  title: string
  meta?: string
  to?: string
  askAi?: boolean
}

const actions: ResultItem[] = [
  { id: 'a-contact', group: 'Actions', icon: UserPlus, title: 'New contact', to: '/relationships?new=contact' },
  { id: 'a-deal', group: 'Actions', icon: Handshake, title: 'New deal', to: '/deals?new=deal' },
  { id: 'a-property', group: 'Actions', icon: Building2, title: 'New property', to: '/properties?new=property' },
  { id: 'a-viewing', group: 'Actions', icon: CalendarPlus, title: 'Schedule viewing', to: '/viewings?new=viewing' },
  { id: 'a-task', group: 'Actions', icon: ListPlus, title: 'New task', to: '/tasks?new=task' },
  { id: 'a-doc', group: 'Actions', icon: FilePlus2, title: 'Upload document', to: '/documents?new=upload' },
]

const recents = ['buyers above AED 5M not contacted in 3 days', 'MOU signed this month', 'Arjun Mehta']

export function CommandBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [cursor, setCursor] = useState(0)

  // reset transient state when the palette opens (render-time adjustment)
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery('')
      setTab('all')
      setCursor(0)
    }
  }

  useEffect(() => {
    if (open) {
      // focus after mount
      const t = window.setTimeout(() => inputRef.current?.focus(), 30)
      return () => window.clearTimeout(t)
    }
  }, [open])

  const results = useMemo<ResultItem[]>(() => {
    const q = query.trim().toLowerCase()
    const items: ResultItem[] = []
    if (tab === 'all' || tab === 'records') {
      contacts
        .filter((c) => !q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
        .slice(0, q ? 5 : 3)
        .forEach((c) =>
          items.push({
            id: `c-${c.id}`, group: 'Contacts', icon: User, title: c.name,
            meta: `${c.type} · ${c.budget}`, to: `/relationships/${c.id}`,
          }),
        )
      deals
        .filter((d) => !q || d.contact.toLowerCase().includes(q) || d.stage.toLowerCase().includes(q))
        .slice(0, q ? 4 : 2)
        .forEach((d) =>
          items.push({
            id: `d-${d.id}`, group: 'Deals', icon: Handshake, title: `${d.contact} — ${d.value}`,
            meta: d.stage, to: `/deals/${d.id}`,
          }),
        )
      properties
        .filter(
          (p) =>
            !q ||
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q),
        )
        .slice(0, q ? 5 : 3)
        .forEach((p) =>
          items.push({
            id: `p-${p.id}`, group: 'Properties', icon: Building2, title: p.name,
            meta: `${p.category} · ${p.price}`, to: `/properties/${p.id}`,
          }),
        )
    }
    if (tab === 'all' || tab === 'actions') {
      actions
        .filter((a) => !q || a.title.toLowerCase().includes(q))
        .slice(0, tab === 'actions' ? 6 : 3)
        .forEach((a) => items.push(a))
    }
    if (q && (tab === 'all' || tab === 'ai')) {
      items.push({
        id: 'ai-answer', group: 'AI', icon: Sparkles,
        title: `Ask AI: “${query.trim()}”`,
        meta: 'Conversational answer with cited sources',
        askAi: true,
      })
    }
    return items
  }, [query, tab])

  const pick = (item: ResultItem) => {
    onClose()
    if (item.askAi) {
      navigate(`/command?q=${encodeURIComponent(query.trim())}`)
    } else if (item.to) {
      navigate(item.to)
    }
  }

  const askAi = () => {
    if (!query.trim()) return
    onClose()
    navigate(`/command?q=${encodeURIComponent(query.trim())}`)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(results.length - 1, c + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(0, c - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[cursor]) pick(results[cursor])
      else askAi()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          {/* backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(10,12,11,.4)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command bar"
            className="relative w-[680px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[14px] bg-surface shadow-e3 ring-1 ring-line"
            initial={{ opacity: 0, scale: 0.98, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* input row */}
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Sparkles className="h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.75} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setCursor(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Ask anything — 'buyers above AED 5M not contacted in 3 days'…"
                className="h-14 w-full bg-transparent font-mono text-[13.5px] text-ink-900 outline-none placeholder:text-ink-400"
              />
              <kbd className="shrink-0 rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px] text-ink-500 ring-1 ring-line">
                esc
              </kbd>
            </div>

            {/* tabs */}
            <div className="flex items-center gap-1 border-b border-line px-3 py-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTab(t.id)
                    setCursor(0)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-120',
                    tab === t.id ? 'bg-palm-100 text-palm-700' : 'text-ink-500 hover:bg-sunken hover:text-ink-900',
                  )}
                >
                  {t.label}
                </button>
              ))}
              <span className="ml-auto hidden items-center gap-1 pr-2 font-mono text-[11px] text-ink-400 sm:flex">
                <kbd className="rounded bg-sunken px-1 ring-1 ring-line">↑↓</kbd> navigate
                <kbd className="ml-2 rounded bg-sunken px-1 ring-1 ring-line">⏎</kbd> open
              </span>
            </div>

            {/* results */}
            <div className="max-h-[46vh] overflow-y-auto p-2">
              {results.length === 0 && !query && (
                <div className="p-3">
                  <p className="px-2 text-micro font-semibold uppercase text-ink-400">Recent searches</p>
                  <ul className="mt-2">
                    {recents.map((r) => (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => setQuery(r)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-ink-700 transition-colors hover:bg-palm-50"
                        >
                          <Clock3 className="h-3.5 w-3.5 text-ink-400" strokeWidth={1.75} />
                          {r}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.length === 0 && query && (
                <p className="px-4 py-6 text-center text-[13px] text-ink-500">
                  No records match “{query}” — press ⏎ to ask AI.
                </p>
              )}

              {(['Contacts', 'Deals', 'Properties', 'Actions', 'AI'] as const).map((group) => {
                const groupItems = results.filter((r) => r.group === group)
                if (groupItems.length === 0) return null
                return (
                  <div key={group} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-micro font-semibold uppercase text-ink-400">{group}</p>
                    {groupItems.map((item) => {
                      flatIndex += 1
                      const idx = flatIndex
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setCursor(idx)}
                          onClick={() => pick(item)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-100',
                            idx === cursor ? 'bg-palm-50' : '',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1',
                              item.group === 'AI'
                                ? 'bg-gold-100 text-gold-600 ring-gold-500/30'
                                : 'bg-sunken text-ink-500 ring-line',
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-medium text-ink-900">
                              {item.title}
                            </span>
                            {item.meta && (
                              <span className="block truncate text-[12px] text-ink-500">{item.meta}</span>
                            )}
                          </span>
                          {idx === cursor && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* Ask AI footer */}
            <button
              type="button"
              onClick={askAi}
              disabled={!query.trim()}
              className="flex w-full items-center gap-2.5 border-t border-line bg-gold-100/40 px-5 py-3 text-left transition-colors enabled:hover:bg-gold-100/70 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-gold-600" strokeWidth={1.75} />
              <span className="text-[13px] font-semibold text-gold-600">Ask AI</span>
              <span className="truncate text-[12.5px] text-ink-500">
                {query.trim() ? `“${query.trim()}”` : 'type a question first'}
              </span>
              <ArrowRight className="ml-auto h-4 w-4 text-gold-600" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandBar
