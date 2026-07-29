/**
 * Matched Buyers panel — matching.md S3 (reverse matching on property detail).
 * Ranked buyer cards: avatar, name/type/budget, mono score + animated score
 * bar (fill 500ms, stagger 80ms), top matching segments summarized, ghost
 * "Send listing". Header count + palm "Share shortlist" CTA (local state).
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Send, Check, Share2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiBadge, ConfidenceMeter } from '@/components/app/AiKit'
import { StatusChip } from '@/components/app/Chips'
import EmptyState from '@/components/app/EmptyState'
import type { MatchedBuyerDto, PropertyDto } from './types'
import { formatBudgetBand, summarizeTopSegments } from './utils'
import { AgentAvatar } from './bits'

export default function MatchedBuyersPanel({
  property,
  buyers,
  isLoading,
}: {
  property: PropertyDto
  buyers: MatchedBuyerDto[] | undefined
  isLoading: boolean
}) {
  const [shared, setShared] = useState(false)
  const [sent, setSent] = useState<Set<number>>(new Set())

  const markSent = (contactId: number) =>
    setSent((prev) => {
      const next = new Set(prev)
      next.add(contactId)
      return next
    })

  return (
    <section
      className="rounded-[10px] border border-line bg-surface"
      aria-label="Matched buyers"
    >
      {/* header */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3">
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Matched buyers</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5">
          <Sparkles className="h-3 w-3 text-gold-600" strokeWidth={1.75} />
          <span className="text-[11px] font-bold leading-none text-gold-600">AI-ranked</span>
        </span>
        {buyers && buyers.length > 0 && (
          <StatusChip tone="palm" dot={false}>
            {buyers.length} matching buyer{buyers.length === 1 ? '' : 's'}
          </StatusChip>
        )}
        <div className="ml-auto">
          {shared ? (
            <StatusChip tone="palm">
              <Check className="h-3 w-3" strokeWidth={2} />
              Shortlist shared with team
            </StatusChip>
          ) : (
            <button
              type="button"
              onClick={() => setShared(true)}
              disabled={!buyers || buyers.length === 0}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-palm-600 px-3 text-[12.5px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98] disabled:opacity-40"
            >
              <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Share shortlist
            </button>
          )}
        </div>
      </div>

      {/* body */}
      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[10px] border border-line p-3.5">
              <div className="h-9 w-9 animate-pulse rounded-full bg-sunken" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 animate-pulse rounded bg-sunken" />
                <div className="h-3 w-56 animate-pulse rounded bg-sunken" />
              </div>
              <div className="h-8 w-24 animate-pulse rounded bg-sunken" />
            </div>
          ))}
        </div>
      ) : !buyers || buyers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching buyers yet"
          description="No buyer requirements overlap this unit yet. Matching re-ranks automatically as requirements are captured from conversations."
        />
      ) : (
        <ul className="space-y-3 p-4">
          {buyers.map((m, i) => {
            const contact = m.contact
            const name = contact?.name ?? 'Unknown buyer'
            const budget = contact?.budgetLabel ?? formatBudgetBand(m.requirement.budgetMin, m.requirement.budgetMax)
            const segments = summarizeTopSegments(m.requirement, property)
            const isSent = contact ? sent.has(contact.id) : false
            return (
              <motion.li
                key={`${m.requirement.id}-${contact?.id ?? 'x'}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
                className="rounded-[10px] border border-line bg-surface p-3.5 transition-shadow duration-140 hover:shadow-e1"
              >
                <div className="flex items-start gap-3">
                  <AgentAvatar name={name} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[13.5px] font-semibold leading-5 text-ink-900">{name}</p>
                      {contact?.aiDraftPending && <AiBadge />}
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
                      {contact?.contactType ?? 'Buyer'} · <span className="tnum">{budget}</span>
                    </p>
                    <p className="mt-1 text-[11.5px] font-medium text-palm-700">{segments}</p>
                  </div>
                  <div className="w-[132px] shrink-0 text-right">
                    <span className="tnum font-mono text-[18px] font-medium leading-6 text-ink-900">
                      {m.score}
                    </span>
                    <span className="font-mono text-[11px] text-ink-400">/100</span>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-sunken">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                        className={cn(
                          'block h-full rounded-full',
                          m.score >= 80 ? 'bg-palm-600' : m.score >= 60 ? 'bg-gold-500' : 'bg-ink-400',
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-line pt-2.5">
                  <p className="truncate text-[11.5px] text-ink-500">
                    {m.requirement.bedsMin}–{m.requirement.bedsMax}BR ·{' '}
                    {m.requirement.communities.slice(0, 2).join(', ')}
                    {m.requirement.communities.length > 2 &&
                      ` +${m.requirement.communities.length - 2}`}{' '}
                    · {m.requirement.timeline} · {m.requirement.financing}
                  </p>
                  {contact &&
                    (isSent ? (
                      <StatusChip tone="palm" className="shrink-0">
                        <Check className="h-3 w-3" strokeWidth={2} />
                        Sent · pending approval
                      </StatusChip>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markSent(contact.id)}
                        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
                      >
                        <Send className="h-3 w-3" strokeWidth={1.75} />
                        Send listing
                      </button>
                    ))}
                </div>
              </motion.li>
            )
          })}
        </ul>
      )}

      {/* footer: draft-autonomy note (matching.md interactions) */}
      {buyers && buyers.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
          <p className="text-[11.5px] text-ink-400">
            Matching learns from your dismissals · sends require approval (draft autonomy)
          </p>
          <ConfidenceMeter value={buyers[0]?.requirement.confidence ?? 0} />
        </div>
      )}
    </section>
  )
}
