/**
 * Inbox S3 — context panel (right, 360px, collapsible).
 * Stacked cards: contact summary, AI summary (gold wash), linked deal with
 * stage progress dots, requirements snapshot, and up-next tasks. Live data
 * from contacts / deals / requirements / tasks / properties queries.
 */
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  ArrowUpRight, Building2, CalendarDays, Mail, Phone, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiSummaryBlock } from '@/components/app/AiKit'
import { DaysInStagePill, OverdueBadge } from '@/components/app/Chips'
import { AiBadge } from '@/components/app/AiKit'
import type { SourceChipItem } from '@/components/app/AiKit'
import type { ContactVM, ConversationVM, DealVM, PropertyVM, RequirementVM, TaskVM } from './helpers'
import { aedCompact, channelLabel, splitSummary } from './helpers'
import { Avatar } from './Avatar'

function Card({
  title,
  index,
  children,
  onClose,
}: {
  title?: string
  index: number
  children: React.ReactNode
  onClose?: () => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      className="rounded-[10px] border border-line bg-surface p-4"
    >
      {title && (
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-micro font-semibold uppercase text-ink-400">{title}</p>
          {onClose && (
            <button
              type="button"
              aria-label="Close context panel"
              onClick={onClose}
              className="rounded p-0.5 text-ink-400 transition-colors hover:bg-sunken hover:text-ink-700"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      )}
      {children}
    </motion.section>
  )
}

export interface ContextRailProps {
  conversation: ConversationVM
  contact: ContactVM | null | undefined
  contactLoading: boolean
  requirement: RequirementVM | null | undefined
  deal: DealVM | undefined
  stages: string[] | undefined
  property: PropertyVM | undefined
  tasks: TaskVM[] | undefined
  onClose: () => void
}

export function ContextRail({
  conversation,
  contact,
  contactLoading,
  requirement,
  deal,
  stages,
  property,
  tasks,
  onClose,
}: ContextRailProps) {
  const openStages = (stages ?? []).filter((s) => s !== 'Won' && s !== 'Lost')
  const stageIdx = deal ? openStages.indexOf(deal.stage) : -1

  const summarySources: SourceChipItem[] = [
    {
      kind: conversation.channel === 'email' ? 'email' : conversation.channel === 'whatsapp' ? 'whatsapp' : 'note',
      label: `${channelLabel(conversation.channel)} · thread`,
    },
    { kind: 'note', label: 'Viewing log' },
  ]

  const relatedTasks = (tasks ?? [])
    .filter((t) => t.status === 'open' && t.relatedName?.toLowerCase().includes(conversation.contactName.split(' ')[0].toLowerCase()))
    .slice(0, 2)

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-base">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
        <p className="text-[14px] font-semibold text-ink-900">Context</p>
        <button
          type="button"
          aria-label="Close context panel"
          onClick={onClose}
          className="rounded-md p-1.5 text-ink-500 transition-colors hover:bg-sunken hover:text-ink-900"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="space-y-3 p-3">
        {/* 1 — contact card */}
        <Card index={0}>
          {contactLoading && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="h-9 w-9 animate-pulse rounded-full bg-sunken" />
                <span className="h-3 w-32 animate-pulse rounded bg-sunken" />
              </div>
              <span className="block h-2.5 w-full animate-pulse rounded bg-sunken" />
              <span className="block h-2.5 w-2/3 animate-pulse rounded bg-sunken" />
            </div>
          )}
          {!contactLoading && contact && (
            <>
              <div className="flex items-center gap-3">
                <Avatar name={contact.name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink-900">{contact.name}</p>
                  <p className="truncate text-[11.5px] text-ink-500">
                    {contact.contactType} · {contact.nationality} · {contact.languages}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[12.5px] text-ink-700">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
                  <span className="tnum">{contact.phone}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
                  <span className="truncate">{contact.email}</span>
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex h-[22px] items-center rounded-full bg-sunken px-2.5 text-[11.5px] text-ink-500 ring-1 ring-line">
                  Source: {contact.source}
                </span>
                <Link
                  to={`/relationships/${contact.id}`}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-palm-600 transition-colors hover:text-palm-700"
                >
                  Open record
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </div>
            </>
          )}
          {!contactLoading && !contact && (
            <p className="text-[12.5px] text-ink-500">No linked contact record for this thread.</p>
          )}
        </Card>

        {/* 2 — AI summary */}
        {contact?.aiSummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <AiSummaryBlock
              title="Summary"
              confidence={contact.aiConfidence ?? undefined}
              bullets={splitSummary(contact.aiSummary)}
              sources={summarySources}
            />
          </motion.div>
        )}

        {/* 3 — linked deal */}
        {deal && (
          <Card title="Linked deal" index={2}>
            <div className="flex items-start gap-3">
              {property && (
                <img
                  src={property.image}
                  alt={property.name}
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-lg bg-sunken object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-5 text-ink-900">{deal.title}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-ink-500">
                  <Building2 className="h-3 w-3 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{deal.propertyLine ?? property?.name ?? '—'}</span>
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="tnum font-mono text-[12.5px] font-medium text-ink-900">{aedCompact(deal.valueAed)}</span>
                  <span className="inline-flex h-[20px] items-center rounded-full bg-palm-100 px-2 text-[10.5px] font-semibold text-palm-700">
                    {deal.stage}
                  </span>
                  <DaysInStagePill days={deal.daysInStage} />
                </div>
              </div>
            </div>
            {/* stage progress dots */}
            <div className="mt-3 flex items-center gap-1">
              {openStages.map((s, i) => (
                <motion.span
                  key={s}
                  title={s}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 + i * 0.03 }}
                  className={cn('h-1.5 flex-1 rounded-full', i <= stageIdx ? 'bg-palm-600' : 'bg-sunken ring-1 ring-line')}
                />
              ))}
            </div>
            <Link
              to={`/deals/${deal.id}`}
              className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-palm-600 transition-colors hover:text-palm-700"
            >
              Open deal
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Card>
        )}

        {/* 4 — requirements snapshot */}
        {requirement && (
          <Card title="Requirements" index={3}>
            <dl className="space-y-1.5 text-[12.5px] leading-5">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Budget</dt>
                <dd className="tnum font-mono text-[12px] text-ink-900">
                  {aedCompact(requirement.budgetMin)}–{aedCompact(requirement.budgetMax)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Communities</dt>
                <dd className="text-right text-ink-900">{requirement.communities.join(', ')}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Beds</dt>
                <dd className="text-ink-900">
                  {requirement.bedsMin}–{requirement.bedsMax}BR · {requirement.propertyTypes.join(', ')}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Must have</dt>
                <dd className="text-right text-ink-900">{requirement.mustHaves.join(', ') || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-500">Timeline</dt>
                <dd className="text-ink-900">
                  {requirement.timeline} · {requirement.financing}
                </dd>
              </div>
            </dl>
            {contact && (
              <Link
                to={`/relationships/${contact.id}`}
                className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-palm-600 transition-colors hover:text-palm-700"
              >
                View matches
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            )}
          </Card>
        )}

        {/* 5 — up next */}
        {relatedTasks.length > 0 && (
          <Card title="Up next" index={4}>
            <ul className="space-y-2.5">
              {relatedTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[12.5px] font-medium leading-5', t.overdue ? 'text-red-600' : 'text-ink-900')}>
                      {t.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-500">
                      {t.dueLabel}
                      {t.overdue && <OverdueBadge />}
                      {t.aiSuggested && <AiBadge />}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
