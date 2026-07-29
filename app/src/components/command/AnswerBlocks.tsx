/**
 * Command S2/S3 — AI answer rendering.
 * Normalizes the trpc.apex.ai.ask union response into a view model, then
 * renders per kind: "risk" → at-risk deals table · "properties" → property
 * cards row · "contacts" → contacts table · "generic" → prose. Every answer
 * carries AiBadge + ConfidenceMeter + SourceChips + meta row + feedback, and
 * an ApprovalCard when the AI proposes an action (approve → "Action queued").
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ThumbsDown, ThumbsUp, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiBadge, ApprovalCard, ConfidenceMeter, SourceChips } from '@/components/app/AiKit'
import { OverdueBadge, PropertyStatusChip } from '@/components/app/Chips'
import type { PushToast } from './toasts.types'
import type { ContactVM, DealVM, PropertyVM } from '@/components/inbox/helpers'
import { aed, aedCompact, sourceChips } from '@/components/inbox/helpers'

/* ------------------------------- view model ------------------------------ */

export type AskKind = 'risk' | 'properties' | 'contacts' | 'generic'

export interface AskResultVM {
  kind: AskKind
  answer: string
  confidence: number
  sources: string[]
  proposedAction: string | null
  deals?: DealVM[]
  properties?: PropertyVM[]
  contacts?: ContactVM[]
}

export interface Exchange {
  id: number
  q: string
  status: 'thinking' | 'done' | 'error'
  result?: AskResultVM
  elapsed?: string
}

/* ------------------------------- feedback -------------------------------- */

function Feedback() {
  const [vote, setVote] = useState<0 | 1 | -1>(0)
  return (
    <span className="ml-auto inline-flex items-center gap-0.5">
      <button
        type="button"
        aria-label="Helpful answer"
        onClick={() => setVote((v) => (v === 1 ? 0 : 1))}
        className={cn(
          'rounded p-1 transition-colors duration-120',
          vote === 1 ? 'bg-palm-100 text-palm-600' : 'text-ink-400 hover:bg-sunken hover:text-ink-700',
        )}
      >
        <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Not helpful"
        onClick={() => setVote((v) => (v === -1 ? 0 : -1))}
        className={cn(
          'rounded p-1 transition-colors duration-120',
          vote === -1 ? 'bg-red-100 text-red-600' : 'text-ink-400 hover:bg-sunken hover:text-ink-700',
        )}
      >
        <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
      </button>
    </span>
  )
}

/* ----------------------------- result blocks ----------------------------- */

function RiskDealsTable({ deals }: { deals: DealVM[] }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="bg-sunken text-micro font-semibold uppercase text-ink-500">
            <th className="px-3.5 py-2.5 font-semibold">Deal</th>
            <th className="px-3.5 py-2.5 font-semibold">Stage</th>
            <th className="px-3.5 py-2.5 font-semibold">Days idle</th>
            <th className="px-3.5 py-2.5 font-semibold">Value</th>
            <th className="px-3.5 py-2.5 font-semibold">Signal</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id} className="border-t border-line transition-colors hover:bg-palm-50">
              <td className="px-3.5 py-2.5">
                <p className="font-medium text-ink-900">{d.contactName}</p>
                <p className="max-w-[220px] truncate text-[12px] text-ink-500">{d.title}</p>
              </td>
              <td className="whitespace-nowrap px-3.5 py-2.5 text-ink-700">{d.stage}</td>
              <td className="tnum whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-red-600">
                {d.daysInStage}d
              </td>
              <td className="tnum whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-ink-900">
                {aedCompact(d.valueAed)}
              </td>
              <td className="max-w-[260px] px-3.5 py-2.5">
                <p className="truncate text-[12.5px] text-ink-500" title={d.riskNote ?? undefined}>
                  {d.riskNote ?? 'No recent client touch'}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PropertyCardsRow({ properties }: { properties: PropertyVM[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {properties.map((p) => (
        <div
          key={p.id}
          className="w-[248px] shrink-0 overflow-hidden rounded-[10px] border border-line bg-surface transition-shadow duration-180 hover:shadow-e1"
        >
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            className="h-[124px] w-full bg-sunken object-cover"
          />
          <div className="p-3">
            <p className="truncate text-[13px] font-semibold text-ink-900">{p.name}</p>
            <p className="mt-0.5 truncate text-[12px] text-ink-500">
              {p.community} · {p.beds}BR · {p.sizeSqft.toLocaleString('en-US')} sqft
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="tnum font-mono text-[12.5px] font-medium text-ink-900">{aed(p.priceAed)}</span>
              <PropertyStatusChip status={p.status} />
            </div>
            <p className="mt-1.5 text-[11px] text-ink-400">
              {p.ref} · {p.developer} · {p.completion}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ContactsTable({ contacts }: { contacts: ContactVM[] }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="bg-sunken text-micro font-semibold uppercase text-ink-500">
            <th className="px-3.5 py-2.5 font-semibold">Contact</th>
            <th className="px-3.5 py-2.5 font-semibold">Budget</th>
            <th className="px-3.5 py-2.5 font-semibold">Last contact</th>
            <th className="px-3.5 py-2.5 font-semibold">Flag</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="border-t border-line transition-colors hover:bg-palm-50">
              <td className="px-3.5 py-2.5">
                <p className="font-medium text-ink-900">{c.name}</p>
                <p className="text-[12px] text-ink-500">
                  {c.contactType} · {c.languages}
                </p>
              </td>
              <td className="tnum whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-ink-900">
                {c.budgetLabel ?? '—'}
              </td>
              <td className="whitespace-nowrap px-3.5 py-2.5 text-ink-700">{c.lastContactAgo ?? '—'}</td>
              <td className="px-3.5 py-2.5">
                <span className="flex items-center gap-1.5">
                  {c.aiDraftPending && <AiBadge />}
                  {c.overdue && <OverdueBadge />}
                  {!c.aiDraftPending && !c.overdue && <span className="text-[12px] text-ink-400">✓ ok</span>}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------- the answer ------------------------------ */

export function AskAnswer({ exchange, onToast }: { exchange: Exchange; onToast: PushToast }) {
  const res = exchange.result
  if (!res) return null
  const lowConfidence = res.confidence < 60

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3.5"
    >
      <div className="flex items-start gap-2.5">
        <AiBadge className="mt-0.5 shrink-0" />
        <p dir="auto" className="text-[14px] leading-[22px] text-ink-900">
          {res.answer}
        </p>
      </div>

      {lowConfidence && (
        <div className="flex items-center gap-2 rounded-[10px] border border-amber-600/30 bg-amber-100 px-3.5 py-2.5 text-[12.5px] font-medium text-amber-600">
          <TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Low confidence — verify before acting. Actions are disabled.
        </div>
      )}

      {res.kind === 'risk' && res.deals && res.deals.length > 0 && <RiskDealsTable deals={res.deals} />}
      {res.kind === 'properties' && res.properties && res.properties.length > 0 && (
        <PropertyCardsRow properties={res.properties} />
      )}
      {res.kind === 'contacts' && res.contacts && res.contacts.length > 0 && (
        <ContactsTable contacts={res.contacts} />
      )}

      {/* sources */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] text-ink-400">Sources:</span>
        <SourceChips sources={sourceChips(res.sources)} />
      </div>

      {/* confidence + meta */}
      <div className="flex flex-wrap items-center gap-3">
        <ConfidenceMeter value={res.confidence} />
        {exchange.elapsed && (
          <span className="tnum font-mono text-[11.5px] text-ink-400">{exchange.elapsed}</span>
        )}
        <span className="rounded bg-sunken px-1.5 py-0.5 font-mono text-[10.5px] text-ink-500 ring-1 ring-line">
          kimi-latest
        </span>
        <Feedback />
      </div>

      {/* proposed action */}
      {res.proposedAction &&
        (lowConfidence ? (
          <div
            title="Disabled — low confidence"
            className="rounded-[10px] border border-line border-l-2 border-l-amber-600 bg-surface p-4 opacity-70"
          >
            <p className="text-[13.5px] font-semibold text-ink-900">{res.proposedAction}</p>
            <p className="mt-1 text-[12.5px] text-ink-500">
              Action unavailable at {res.confidence}% confidence — ask a follow-up to raise confidence.
            </p>
          </div>
        ) : (
          <ApprovalCard
            title={res.proposedAction}
            confidence={res.confidence}
            sources={sourceChips(res.sources)}
            onApprove={() => onToast({ icon: 'queue', title: 'Action queued' })}
            onReject={() => onToast({ icon: 'x', title: 'Proposed action dismissed' })}
            onEdit={() => onToast({ icon: 'sparkles', title: 'Edits open in the Inbox composer for message drafts' })}
          >
            <p>
              APEX will stage this action in draft autonomy: tasks and drafts are created for the
              assigned advisors, and anything leaving the workspace still requires a human send.
            </p>
          </ApprovalCard>
        ))}
    </motion.div>
  )
}
