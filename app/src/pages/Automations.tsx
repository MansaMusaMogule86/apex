/**
 * Automations — `/automations` (automations.md).
 * Draft-autonomy banner, rule/template cards grid from
 * trpc.apex.automations.list (trigger → action chips, status pill, run
 * stats, palm toggle via trpc.apex.automations.toggle + invalidate,
 * "requires approval" gold note on draft cards), plus a run-log style
 * recent-activity strip fed by trpc.apex.dashboard.bundle activities.
 */
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  Sparkles, ArrowRight, Plus, Zap, UserPlus, CalendarDays, MessageCircle, FileText,
  Handshake, Trophy, Lock, History, Bell, type LucideIcon,
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { StatusChip, CountBadge } from '@/components/app/Chips'
import { EmptyState } from '@/components/app/EmptyState'
import { PersonAvatar, PrimaryButton, SkeletonBlock, StaggerItem } from '@/components/ops/OpsKit'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

/* ---------------- types ---------------- */

type AutomationRow = {
  id: number
  name: string
  triggerLabel: string
  actionLabel: string
  status: string
  runsCount: number
  lastRunAgo: string | null
}

type ActivityRow = {
  id: number
  actorName: string
  kind: string
  actionText: string
  ago: string
}

const statusMeta: Record<string, { tone: 'palm' | 'amber' | 'neutral'; label: string }> = {
  active: { tone: 'palm', label: 'Active' },
  paused: { tone: 'amber', label: 'Paused' },
  draft: { tone: 'neutral', label: 'Draft' },
}

function ruleIcon(a: AutomationRow) {
  const s = `${a.triggerLabel} ${a.actionLabel}`.toLowerCase()
  if (s.includes('lead')) return <UserPlus className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  if (s.includes('viewing')) return <CalendarDays className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  if (s.includes('message') || s.includes('whatsapp') || s.includes('email')) return <MessageCircle className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  if (s.includes('document')) return <FileText className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  if (s.includes('won')) return <Trophy className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  if (s.includes('stage') || s.includes('offer') || s.includes('deal')) return <Handshake className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
  return <Zap className="h-[18px] w-[18px] text-palm-600" strokeWidth={1.75} />
}

const activityKindMeta: Record<string, { icon: LucideIcon; className: string }> = {
  ai: { icon: Sparkles, className: 'text-gold-600' },
  deal: { icon: Handshake, className: 'text-palm-600' },
  message: { icon: MessageCircle, className: 'text-mail-slate' },
  viewing: { icon: CalendarDays, className: 'text-teal-600' },
  lead: { icon: UserPlus, className: 'text-ink-500' },
}

/* ---------------- rule card ---------------- */

function AutomationCard({
  rule,
  pending,
  onToggle,
}: {
  rule: AutomationRow
  pending: boolean
  onToggle: () => void
}) {
  const meta = statusMeta[rule.status] ?? statusMeta.draft!
  const isDraft = rule.status === 'draft'
  return (
    <div className="flex h-full flex-col rounded-[10px] border border-line bg-surface p-4 transition-shadow duration-120 hover:shadow-e1">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-palm-100">
          {ruleIcon(rule)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold leading-5 text-ink-900">{rule.name}</p>
          <div className="mt-1.5">
            <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
          </div>
        </div>
        <Switch
          checked={rule.status === 'active'}
          disabled={isDraft || pending}
          onCheckedChange={onToggle}
          aria-label={rule.status === 'active' ? `Pause ${rule.name}` : `Activate ${rule.name}`}
          className="data-[state=checked]:bg-palm-600"
        />
      </div>

      {/* trigger → action flow chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-sunken px-2 py-1 text-[11.5px] font-medium text-ink-700 ring-1 ring-line">
          <span className="text-micro font-semibold uppercase text-ink-400">When</span>
          {rule.triggerLabel}
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-400" strokeWidth={1.75} />
        <span className="inline-flex items-center gap-1.5 rounded-md bg-gold-100 px-2 py-1 text-[11.5px] font-medium text-gold-600 ring-1 ring-gold-500/30">
          <Sparkles className="h-3 w-3" strokeWidth={1.75} />
          {rule.actionLabel}
        </span>
      </div>

      {/* draft governance note */}
      {isDraft && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-gold-100/60 px-2.5 py-2 text-[11.5px] leading-4 text-gold-600">
          <Lock className="mt-px h-3 w-3 shrink-0" strokeWidth={1.75} />
          Requires approval — activation is queued in AI approvals (draft autonomy).
        </p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-3 text-[12px] text-ink-500">
        <span className="tnum font-mono">{rule.runsCount} runs</span>
        <span className="h-3 w-px bg-line" />
        <span>{rule.lastRunAgo ? `last run ${rule.lastRunAgo}` : 'never run'}</span>
      </div>
    </div>
  )
}

/* ---------------- page ---------------- */

export default function Automations() {
  const automationsQ = trpc.apex.automations.list.useQuery()
  const bundleQ = trpc.apex.dashboard.bundle.useQuery()
  const utils = trpc.useUtils()
  const createM = trpc.apex.automations.create.useMutation({
    onSettled: () => utils.apex.automations.list.invalidate(),
  })
  const [autoModalOpen, setAutoModalOpen] = useState(false)
  const [newAuto, setNewAuto] = useState({ name: '', triggerLabel: '', actionLabel: '' })

  const submitAuto = async () => {
    if (!newAuto.name.trim()) return
    const draftName = newAuto.name.trim()

    try {
      await createM.mutateAsync({
        name: draftName,
        triggerLabel: newAuto.triggerLabel.trim(),
        actionLabel: newAuto.actionLabel.trim(),
      })
      setAutoModalOpen(false)
      setNewAuto({ name: '', triggerLabel: '', actionLabel: '' })
      toast.success(`"${draftName}" created as draft`)
    } catch {
      toast.error('Could not create automation draft. Please try again.')
    }
  }

  const toggleM = trpc.apex.automations.toggle.useMutation({
    onSettled: () => utils.apex.automations.list.invalidate(),
  })

  const rules = useMemo(() => (automationsQ.data ?? []) as AutomationRow[], [automationsQ.data])
  const activities = useMemo(
    () => ((bundleQ.data?.activities ?? []) as ActivityRow[]).slice(0, 8),
    [bundleQ.data],
  )
  const approvalsPending = bundleQ.data?.kpis.aiApprovalsPending ?? 5
  const isLoading = automationsQ.isLoading

  return (
    <div className="space-y-4">
      {/* S1 — autonomy banner (persistent trust anchor) */}
      <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-line border-l-2 border-l-gold-500 bg-surface px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-gold-600" strokeWidth={1.75} />
        <p className="text-[13px] text-ink-900">
          <span className="font-semibold">Draft autonomy is on</span>
          <span className="text-ink-700"> — automations prepare actions, humans approve client-facing sends.</span>
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gold-600 underline-offset-2 hover:underline"
        >
          <CountBadge count={approvalsPending} tone="gold" />
          approvals pending
        </Link>
        <Link
          to="/admin"
          className="ml-auto inline-flex h-8 items-center rounded-md border border-line-strong px-3 text-[12.5px] font-medium text-ink-700 transition-colors hover:bg-sunken"
        >
          Change in Administration
        </Link>
      </div>

      {/* header row */}
      <div className="flex items-center gap-3">
        <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Rules</h2>
        <span className="tnum font-mono text-[11px] text-ink-500">
          {rules.filter((r) => r.status === 'active').length} active · {rules.length} total
        </span>
        <PrimaryButton icon={Plus} className="ml-auto" onClick={() => setAutoModalOpen(true)}>
          New automation
        </PrimaryButton>
      </div>

      {/* S2/S3 — rule/template cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[180px] w-full" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-[10px] border border-line bg-surface">
          <EmptyState
            icon={Zap}
            title="Automate your first follow-up"
            description="Trigger → action recipes remove busywork. Client-facing sends always stay behind human approval."
            primaryCta={{ label: 'New automation', onClick: () => setAutoModalOpen(true) }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {rules.map((r, i) => (
            <StaggerItem key={r.id} index={i}>
              <AutomationCard
                rule={r}
                pending={toggleM.isPending && toggleM.variables?.id === r.id}
                onToggle={() => toggleM.mutate({ id: r.id })}
              />
            </StaggerItem>
          ))}
        </div>
      )}

      {/* S4 — run-log style recent activity strip */}
      <div className="rounded-[10px] border border-line bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <History className="h-4 w-4 text-ink-500" strokeWidth={1.75} />
          <h2 className="text-[14px] font-semibold leading-5 text-ink-900">Recent activity</h2>
          <span className="text-[12px] text-ink-500">— automation &amp; workspace run log</span>
        </div>
        {bundleQ.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13px] text-ink-500">No runs logged yet.</p>
        ) : (
          <ul>
            {activities.map((a) => {
              const meta = activityKindMeta[a.kind] ?? { icon: Bell, className: 'text-ink-500' }
              const Icon = meta.icon
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 border-b border-line px-4 py-2.5 text-[13px] last:border-b-0 hover:bg-palm-50"
                >
                  <Icon className={cn('h-4 w-4 shrink-0', meta.className)} strokeWidth={1.75} />
                  <PersonAvatar name={a.actorName} size={20} />
                  <span className="shrink-0 font-medium text-ink-900">{a.actorName}</span>
                  <span className="min-w-0 flex-1 truncate text-ink-700">{a.actionText}</span>
                  <span className="tnum shrink-0 font-mono text-[11.5px] text-ink-400">{a.ago}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <Toaster position="bottom-right" />

      {/* New automation modal */}
      {autoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">New automation</h2>
              <p className="mt-1 text-[13px] text-ink-500">Create a trigger → action recipe. Created as draft — requires approval to activate.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Name</label>
                <input
                  value={newAuto.name}
                  onChange={(e) => setNewAuto((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. New lead welcome"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Trigger</label>
                <input
                  value={newAuto.triggerLabel}
                  onChange={(e) => setNewAuto((p) => ({ ...p, triggerLabel: e.target.value }))}
                  placeholder="e.g. New contact created"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Action</label>
                <input
                  value={newAuto.actionLabel}
                  onChange={(e) => setNewAuto((p) => ({ ...p, actionLabel: e.target.value }))}
                  placeholder="e.g. Send WhatsApp → Create task"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setAutoModalOpen(false); setNewAuto({ name: '', triggerLabel: '', actionLabel: '' }) }}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAuto}
                disabled={!newAuto.name.trim()}
                className="inline-flex h-9 items-center rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-palm-700 active:scale-[0.98] disabled:opacity-50"
              >
                Create draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
