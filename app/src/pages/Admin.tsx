/**
 * Administration — /admin (admin.md).
 * Left sub-nav + four sections: (1) Team & roles from trpc.apex.admin.team,
 * (2) Integration health cards from trpc.apex.admin.integrations with
 * HealthDot + Reconnect on degraded, (3) Pipeline & SLA config stub
 * (13 stages with probabilities, SLA inputs, disabled save), (4) AI
 * autonomy level selector stub (0–4, Level 3 "Draft" selected, gold
 * governance note).
 */
import { useMemo, useRef, useState } from 'react'
import {
  Users, Plug, Kanban, Sparkles, UserPlus, Check, Loader2, Lock, MessageCircle,
  Mail, CalendarDays, Database, Bell, ShieldCheck, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '@/components/app/DataTable'
import { HealthDot, StatusChip } from '@/components/app/Chips'
import { PersonAvatar, PrimaryButton, SkeletonBlock, StaggerItem } from '@/components/ops/OpsKit'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

/* ---------------- types ---------------- */

type TeamRow = {
  id: number
  name: string
  title: string
  initials: string
  email: string | null
  role: string
  isCurrent: boolean
}

type IntegrationRow = {
  id: number
  name: string
  category: string
  status: string
  detail: string | null
  lastSyncAgo: string | null
}

const FALLBACK_STAGES = [
  'New Inquiry', 'Qualified', 'Requirements Confirmed', 'Properties Shortlisted',
  'Viewing Scheduled', 'Viewing Completed', 'Offer Made', 'Negotiation',
  'MOU Signed', 'SPA Executed', 'Payment in Progress', 'Handover', 'Won',
]

/** Stage win-probabilities (admin.md S3 weights, Won = 100) */
const STAGE_PROB: Record<string, number> = {
  'New Inquiry': 5,
  Qualified: 10,
  'Requirements Confirmed': 15,
  'Properties Shortlisted': 25,
  'Viewing Scheduled': 30,
  'Viewing Completed': 40,
  'Offer Made': 55,
  Negotiation: 65,
  'MOU Signed': 80,
  'SPA Executed': 90,
  'Payment in Progress': 95,
  Handover: 98,
  Won: 100,
}

const roleMeta: Record<string, { tone: 'palm' | 'teal' | 'slate' | 'amber'; label: string }> = {
  admin: { tone: 'palm', label: 'Admin' },
  manager: { tone: 'teal', label: 'Manager' },
  advisor: { tone: 'slate', label: 'Advisor' },
  listing_manager: { tone: 'amber', label: 'Listing' },
}

const categoryIcons: Record<string, { icon: LucideIcon; className: string }> = {
  Messaging: { icon: MessageCircle, className: 'text-wa-green' },
  Email: { icon: Mail, className: 'text-mail-slate' },
  Calendar: { icon: CalendarDays, className: 'text-teal-600' },
  Storage: { icon: Database, className: 'text-ink-500' },
  System: { icon: Bell, className: 'text-ink-500' },
}

const integrationChip: Record<string, { tone: 'palm' | 'amber' | 'red' | 'neutral'; label: string }> = {
  connected: { tone: 'palm', label: 'Connected' },
  degraded: { tone: 'amber', label: 'Degraded' },
  error: { tone: 'red', label: 'Error' },
}

const AUTONOMY_LEVELS = [
  { level: 0, name: 'Off', note: 'AI features disabled across the workspace.' },
  { level: 1, name: 'Suggest', note: 'AI surfaces suggestions inline; nothing is drafted.' },
  { level: 2, name: 'Assist', note: 'AI drafts internal artifacts (summaries, tasks) only.' },
  { level: 3, name: 'Draft', note: 'AI prepares everything incl. client-facing drafts; humans send.' },
  { level: 4, name: 'Autopilot', note: 'Enterprise — AI sends within guardrails. Contact sales.' },
] as const

/* ---------------- section shell ---------------- */

function Section({
  id,
  icon: Icon,
  title,
  description,
  children,
  sectionRef,
}: {
  id: string
  icon: LucideIcon
  title: string
  description?: string
  children: React.ReactNode
  sectionRef: (el: HTMLElement | null) => void
}) {
  return (
    <section id={id} ref={sectionRef} className="scroll-mt-20 space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">{title}</h2>
      </div>
      {description && <p className="-mt-1 text-[13px] text-ink-500">{description}</p>}
      {children}
    </section>
  )
}

/* ---------------- page ---------------- */

export default function Admin() {
  const teamQ = trpc.apex.admin.team.useQuery()
  const integrationsQ = trpc.apex.admin.integrations.useQuery()
  const stagesQ = trpc.apex.deals.stages.useQuery()

  const [activeSection, setActiveSection] = useState('team')
  const [reconnect, setReconnect] = useState<Record<number, 'working' | 'done'>>({})
  const [autonomy, setAutonomy] = useState(3)
  const sectionEls = useRef<Record<string, HTMLElement | null>>({})

  const team = useMemo(() => (teamQ.data ?? []) as TeamRow[], [teamQ.data])
  const integrations = useMemo(() => (integrationsQ.data ?? []) as unknown as IntegrationRow[], [integrationsQ.data])
  const stages = useMemo(() => {
    const fromApi = (stagesQ.data ?? []).filter((s: string) => s !== 'Lost')
    return fromApi.length === 13 ? fromApi : FALLBACK_STAGES
  }, [stagesQ.data])

  const degradedCount = integrations.filter((i) => i.status !== 'connected').length

  const scrollTo = (key: string) => {
    setActiveSection(key)
    sectionEls.current[key]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startReconnect = (id: number) => {
    setReconnect((m) => ({ ...m, [id]: 'working' }))
    window.setTimeout(() => setReconnect((m) => ({ ...m, [id]: 'done' })), 900)
  }

  const teamColumns: Column<TeamRow>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (m) => (
        <span className="flex min-w-0 items-center gap-3">
          <PersonAvatar name={m.name} initialsOverride={m.initials} size={32} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[13.5px] font-semibold text-ink-900">{m.name}</span>
              {m.isCurrent && (
                <span className="inline-flex h-[18px] items-center rounded-full bg-palm-100 px-2 text-[10px] font-bold text-palm-700">
                  You
                </span>
              )}
            </span>
            <span className="block truncate text-[11.5px] text-ink-500">{m.title}</span>
          </span>
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      width: 120,
      render: (m) => {
        const meta = roleMeta[m.role] ?? { tone: 'slate' as const, label: m.role }
        return (
          <StatusChip tone={meta.tone} dot={false}>
            {meta.label}
          </StatusChip>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      render: () => (
        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-700">
          <HealthDot status="connected" />
          Active
        </span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (m) => <span className="text-[12.5px] text-ink-500">{m.email ?? '—'}</span>,
    },
  ]

  const navItems: { key: string; label: string; icon: LucideIcon }[] = [
    { key: 'team', label: 'Team', icon: Users },
    { key: 'integrations', label: 'Integrations', icon: Plug },
    { key: 'pipeline', label: 'Pipeline & SLA', icon: Kanban },
    { key: 'ai', label: 'AI & Approvals', icon: Sparkles },
  ]

  return (
    <div className="flex items-start gap-6">
      {/* left sub-nav (admin.md shell) */}
      <aside className="sticky top-20 hidden w-[200px] shrink-0 md:block">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeSection === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => scrollTo(item.key)}
                className={cn(
                  'relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-140',
                  active ? 'bg-palm-100 text-palm-700' : 'text-ink-700 hover:bg-sunken',
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-palm-600" />
                )}
                <Icon className={cn('h-4 w-4', active ? 'text-palm-600' : 'text-ink-400')} strokeWidth={1.75} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* content column (max 960px) */}
      <div className="min-w-0 max-w-[960px] flex-1 space-y-8">
        {/* S1 — Team & roles */}
        <Section
          id="team"
          icon={Users}
          title="Team members"
          description="Roles gate approvals, AI autonomy changes, and workspace settings."
          sectionRef={(el) => {
            sectionEls.current.team = el
          }}
        >
          <div className="flex justify-end">
            <PrimaryButton icon={UserPlus} onClick={() => toast.info('Invite member flow ships with the next milestone — team members are seeded from the demo workspace.')}>Invite member</PrimaryButton>
          </div>
          {teamQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DataTable<TeamRow> columns={teamColumns} data={team} rowKey={(m) => String(m.id)} />
          )}
          {/* roles explainer */}
          <div className="grid grid-cols-1 gap-2 rounded-[10px] border border-line bg-surface p-4 sm:grid-cols-2">
            {[
              ['Admin', 'Everything, incl. AI autonomy & workspace settings'],
              ['Manager', 'Approvals queue, reports, team pipelines'],
              ['Advisor', 'Own records; proposes approvals to manager'],
              ['Listing', 'Properties & documents, no deal-stage moves'],
            ].map(([role, note]) => (
              <p key={role} className="text-[12.5px] leading-5 text-ink-700">
                <span className="font-semibold text-ink-900">{role}</span>
                <span className="text-ink-400"> · </span>
                {note}
              </p>
            ))}
          </div>
        </Section>

        {/* S2 — Integrations */}
        <Section
          id="integrations"
          icon={Plug}
          title="Integrations"
          description="Channel health for messaging, email, calendars, and storage."
          sectionRef={(el) => {
            sectionEls.current.integrations = el
          }}
        >
          <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface px-4 py-2.5 text-[13px]">
            {degradedCount === 0 ? (
              <>
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-palm-600" />
                <span className="text-ink-900">All channels synced</span>
                <span className="tnum font-mono text-[11.5px] text-ink-400">· 2m ago</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-amber-600" />
                <span className="font-medium text-amber-600">
                  {degradedCount} integration{degradedCount === 1 ? '' : 's'} need{degradedCount === 1 ? 's' : ''} attention
                </span>
              </>
            )}
          </div>

          {integrationsQ.isLoading ? (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-[132px] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {integrations.map((intg, i) => {
                const cat = categoryIcons[intg.category] ?? categoryIcons.System!
                const Icon = cat.icon
                const chip = integrationChip[intg.status] ?? integrationChip.error!
                const state = reconnect[intg.id]
                return (
                  <StaggerItem key={intg.id} index={i}>
                    <div className="rounded-[10px] border border-line bg-surface p-4 transition-shadow duration-120 hover:shadow-e1">
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-sunken">
                          <Icon className={cn('h-5 w-5', cat.className)} strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13.5px] font-semibold leading-5 text-ink-900">{intg.name}</p>
                          <p className="text-[11.5px] text-ink-500">{intg.category}</p>
                        </div>
                        <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-[12px] text-ink-500">
                        <HealthDot status={(intg.status === 'connected' ? 'connected' : intg.status === 'degraded' ? 'degraded' : 'error')} />
                        <span className="min-w-0 flex-1 truncate">{intg.detail ?? '—'}</span>
                        {intg.lastSyncAgo && (
                          <span className="tnum shrink-0 font-mono text-[11px] text-ink-400">{intg.lastSyncAgo}</span>
                        )}
                      </div>
                      {intg.status !== 'connected' && (
                        <div className="mt-3 border-t border-line pt-3">
                          {state === 'done' ? (
                            <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-palm-700">
                              <Check className="h-4 w-4" strokeWidth={2} />
                              Reconnected — sync resuming
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={state === 'working'}
                              onClick={() => startReconnect(intg.id)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong px-3 text-[12.5px] font-medium text-ink-700 transition-all duration-120 hover:bg-sunken active:scale-[0.98] disabled:opacity-60"
                            >
                              {state === 'working' && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />}
                              {state === 'working' ? 'Reconnecting…' : 'Reconnect'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                )
              })}
            </div>
          )}
        </Section>

        {/* S3/S4 — Pipeline & SLA config stub */}
        <Section
          id="pipeline"
          icon={Kanban}
          title="Pipeline & SLA"
          description="Buyer Sales pipeline — 13 stages. Stage changes apply to open deals immediately."
          sectionRef={(el) => {
            sectionEls.current.pipeline = el
          }}
        >
          <div className="rounded-[10px] border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <StatusChip tone="palm">Active</StatusChip>
              <span className="text-[13.5px] font-semibold text-ink-900">Buyer Sales</span>
              <span className="tnum font-mono text-[11px] text-ink-500">{stages.length} stages</span>
            </div>
            {stagesQ.isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <ul>
                {stages.map((stage: string, i: number) => (
                  <li
                    key={stage}
                    className="flex items-center gap-3 border-b border-line px-4 py-2 last:border-b-0 hover:bg-palm-50"
                  >
                    <span className="tnum w-5 text-right font-mono text-[10.5px] text-ink-400">{i + 1}</span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          i < 4 ? '#5B6B7A' : i < 8 ? '#C08A2D' : i < 11 ? '#0B5D4A' : '#3FA984',
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-900">{stage}</span>
                    <span className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={5}
                        defaultValue={STAGE_PROB[stage] ?? 50}
                        aria-label={`${stage} win probability`}
                        className="tnum h-7 w-[64px] rounded-md border border-line bg-surface px-2 text-right font-mono text-[12px] text-ink-900 focus:border-palm-600 focus:outline-none"
                      />
                      <span className="text-[11px] text-ink-400">%</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {/* SLA inputs */}
            <div className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:grid-cols-2">
              {[
                { label: 'First-response target', value: '10', unit: 'min', help: 'Median across WhatsApp + email' },
                { label: 'Escalate after unanswered', value: '30', unit: 'min', help: 'Bumps priority + notifies manager' },
                { label: 'Follow-up cadence', value: '7', unit: 'days', help: 'Idle days before a deal is stalled' },
                { label: 'Commission default', value: '2.0', unit: '%', help: 'Brokerage fee on Won deals' },
              ].map((f) => (
                <label key={f.label} className="block">
                  <span className="text-[12.5px] font-medium text-ink-900">{f.label}</span>
                  <span className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={f.value}
                      className="tnum h-8 w-24 rounded-md border border-line bg-surface px-2.5 font-mono text-[12.5px] text-ink-900 focus:border-palm-600 focus:outline-none"
                    />
                    <span className="text-[12px] text-ink-500">{f.unit}</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-ink-400">{f.help}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-line bg-sunken/60 px-4 py-3">
              <button
                type="button"
                onClick={() => toast.info('Pipeline & SLA config saves in the next milestone — seeded values are loaded from the demo workspace.')}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-palm-600 px-3.5 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
                Save changes
              </button>
              <span className="text-[12px] text-ink-500">Changes require admin approval — stub in this workspace.</span>
            </div>
          </div>
        </Section>

        {/* S5 — AI autonomy */}
        <Section
          id="ai"
          icon={Sparkles}
          title="AI & Approvals"
          description="The trust center — how far APEX AI may act without a human."
          sectionRef={(el) => {
            sectionEls.current.ai = el
          }}
        >
          <div className="rounded-[10px] border border-line bg-surface p-4">
            <p className="text-[13px] font-semibold text-ink-900">Autonomy level</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {AUTONOMY_LEVELS.map((l) => {
                const selected = autonomy === l.level
                const disabled = l.level === 4
                return (
                  <button
                    key={l.level}
                    type="button"
                    disabled={disabled}
                    onClick={() => setAutonomy(l.level)}
                    className={cn(
                      'rounded-lg border px-3 py-2.5 text-left transition-all duration-180',
                      selected
                        ? 'border-gold-500 bg-gold-100 ring-1 ring-gold-500/40'
                        : 'border-line bg-surface hover:border-line-strong hover:bg-sunken',
                      disabled && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <span className="tnum block font-mono text-[10.5px] text-ink-400">Level {l.level}</span>
                    <span className={cn('mt-0.5 flex items-center gap-1 text-[13px] font-semibold', selected ? 'text-gold-600' : 'text-ink-900')}>
                      {l.level === 3 && <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />}
                      {l.name}
                      {l.level === 4 && <Lock className="h-3 w-3" strokeWidth={1.75} />}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[12.5px] leading-5 text-ink-700">
              {AUTONOMY_LEVELS.find((l) => l.level === autonomy)?.note}
            </p>
            <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-gold-100/60 px-3 py-2.5 text-[12px] leading-5 text-gold-600">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Draft: AI prepares, humans send. External actions always require approval — autonomy changes require
              Admin and apply to future drafts only.
            </p>
          </div>
        </Section>
      </div>
      <Toaster position="bottom-right" />
    </div>
  )
}
