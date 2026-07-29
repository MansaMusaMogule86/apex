/**
 * Marketing — `/marketing`
 * Social account integration cards, stats bar, marketing campaigns DataTable
 * with toggle, and a "+ New campaign" modal.
 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Instagram,
  type LucideProps,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DataTable, type Column } from '@/components/app/DataTable'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

/* ---------- platform icons (custom SVG since lucide lacks some brands) ---------- */

type MarketingIcon = React.ComponentType<LucideProps>

const Icons: Record<string, MarketingIcon> = {
  Instagram,
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  LinkedIn: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  TikTok: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Pinterest: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.936 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  ),
}

/* ---------- platform config ---------- */

interface SocialAccount {
  platform: string
  handle: string
  connected: boolean
  followers: string
}

const socialAccounts: SocialAccount[] = [
  { platform: 'Instagram', handle: '@apexreality', connected: true, followers: '12.4K' },
  { platform: 'Facebook', handle: 'APEX Realty', connected: true, followers: '8.2K' },
  { platform: 'LinkedIn', handle: 'APEX Realty Brokerage', connected: false, followers: '4.7K' },
  { platform: 'TikTok', handle: '@apexreality', connected: true, followers: '24.1K' },
  { platform: 'YouTube', handle: 'APEX Realty', connected: false, followers: '3.2K' },
  { platform: 'Pinterest', handle: 'apexreality', connected: false, followers: '1.8K' },
]

/* ---------- campaign types ---------- */

interface CampaignRow {
  id: number
  name: string
  platform: string
  status: 'active' | 'paused' | 'draft'
  reach: number
  engagements: number
  budget: string
}

const statusMeta: Record<string, { tone: 'palm' | 'amber' | 'neutral'; label: string }> = {
  active: { tone: 'palm', label: 'Active' },
  paused: { tone: 'amber', label: 'Paused' },
  draft: { tone: 'neutral', label: 'Draft' },
}

/* ---------- status pill ---------- */

function StatusPill({ tone, children }: { tone: 'palm' | 'amber' | 'neutral'; children: string }) {
  const colors: Record<string, string> = {
    palm: 'bg-palm-100 text-palm-700 ring-palm-200',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200',
    neutral: 'bg-sunken text-ink-500 ring-line',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        colors[tone],
      )}
    >
      {children}
    </span>
  )
}

/* ---------- platform icon wrapper ---------- */

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const Icon = Icons[platform]
  if (!Icon) return null
  return <Icon className={cn('h-5 w-5 shrink-0', className)} />
}

/* ---------- stat card ---------- */

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface p-4">
      <p className="text-micro font-semibold uppercase text-ink-500">{label}</p>
      <p className="mt-1.5 tnum font-mono text-[22px] font-semibold leading-7 tracking-[-0.02em] text-ink-900">
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-[12px] text-ink-400">{sub}</p>
      )}
    </div>
  )
}

/* ---------- social account card ---------- */

function SocialCard({ account }: { account: SocialAccount }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-line bg-surface p-3.5 transition-shadow duration-120 hover:shadow-e1">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-sunken">
        <PlatformIcon platform={account.platform} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-5 text-ink-900">{account.platform}</p>
        <p className="truncate text-[12px] text-ink-500">{account.handle}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {account.connected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-palm-100 px-2 py-0.5 text-[11px] font-medium text-palm-700 ring-1 ring-palm-200">
            <span className="h-1.5 w-1.5 rounded-full bg-palm-600" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sunken px-2 py-0.5 text-[11px] font-medium text-ink-500 ring-1 ring-line">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-400" />
            Disconnected
          </span>
        )}
        <span className="tnum font-mono text-[11px] text-ink-400">{account.followers}</span>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

export default function Marketing() {
  const [modalOpen, setModalOpen] = useState(false)
  const [newCampaign, setNewCampaign] = useState({ name: '', platform: 'Instagram', budget: '' })

  /* mock campaign data */
  const campaigns = useMemo<CampaignRow[]>(
    () => [
      { id: 1, name: 'Marina Crest Launch', platform: 'Instagram', status: 'active', reach: 45200, engagements: 3840, budget: 'AED 15,000' },
      { id: 2, name: 'Palm Jumeirah Showcase', platform: 'Facebook', status: 'active', reach: 38100, engagements: 2100, budget: 'AED 12,000' },
      { id: 3, name: 'Downtown Dubai Re-target', platform: 'Instagram', status: 'paused', reach: 28400, engagements: 1560, budget: 'AED 8,000' },
      { id: 4, name: 'Luxury Villa Campaign', platform: 'LinkedIn', status: 'draft', reach: 0, engagements: 0, budget: 'AED 20,000' },
      { id: 5, name: 'Off-Plan Expo Push', platform: 'TikTok', status: 'active', reach: 67500, engagements: 8940, budget: 'AED 10,000' },
      { id: 6, name: 'Q3 Brand Awareness', platform: 'YouTube', status: 'draft', reach: 0, engagements: 0, budget: 'AED 25,000' },
    ],
    [],
  )

  /* stats from mock data */
  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === 'active')
    const totalReach = campaigns.reduce((s, c) => s + c.reach, 0)
    const totalEngagements = campaigns.reduce((s, c) => s + c.engagements, 0)
    const engagementRate = totalReach > 0 ? ((totalEngagements / totalReach) * 100).toFixed(1) : '0.0'
    return {
      activeCampaigns: active.length,
      totalReach: totalReach.toLocaleString(),
      engagementRate: `${engagementRate}%`,
      leadsGenerated: 186,
    }
  }, [campaigns])

  const submitCampaign = () => {
    if (!newCampaign.name.trim()) return
    const campaign = {
      id: Date.now(),
      name: newCampaign.name.trim(),
      platform: newCampaign.platform,
      status: 'draft' as const,
      reach: 0,
      engagements: 0,
      budget: newCampaign.budget.trim() || 'AED 0',
    }
    const existing = (window as Window & { __mockCampaignsCache?: CampaignRow[] }).__mockCampaignsCache ?? []
    existing.push(campaign)
    ;(window as Window & { __mockCampaignsCache?: CampaignRow[] }).__mockCampaignsCache = existing
    setModalOpen(false)
    setNewCampaign({ name: '', platform: 'Instagram', budget: '' })
    toast.success(`"${campaign.name}" created as draft`)
  }

  /* toggle handler */
  const [toggling, setToggling] = useState<number | null>(null)
  const handleToggle = (campaign: CampaignRow) => {
    setToggling(campaign.id)
    const newStatus = campaign.status === 'active' ? 'paused' : 'active'
    // Simulate toggle — in a real app this would be a mutation
    setTimeout(() => {
      setToggling(null)
      toast.success(`${campaign.name} ${newStatus === 'active' ? 'activated' : 'paused'}`)
    }, 200)
  }

  /* DataTable columns */
  const columns = useMemo<Column<CampaignRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Campaign',
        sortable: true,
        render: (c) => (
          <span className="flex items-center gap-2">
            <PlatformIcon platform={c.platform} className="text-ink-500" />
            <span className="font-medium">{c.name}</span>
          </span>
        ),
      },
      {
        key: 'platform',
        header: 'Platform',
        sortable: true,
        render: (c) => (
          <span className="flex items-center gap-1.5 text-ink-700">
            <PlatformIcon platform={c.platform} className="h-3.5 w-3.5 text-ink-400" />
            {c.platform}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        sortValue: (c) => c.status,
        render: (c) => {
          const meta = statusMeta[c.status] ?? statusMeta.draft
          return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        },
      },
      {
        key: 'reach',
        header: 'Reach',
        align: 'right',
        sortable: true,
        render: (c) => <span className="tnum font-mono text-[12.5px]">{c.reach.toLocaleString()}</span>,
      },
      {
        key: 'engagements',
        header: 'Engagements',
        align: 'right',
        sortable: true,
        render: (c) => <span className="tnum font-mono text-[12.5px]">{c.engagements.toLocaleString()}</span>,
      },
      {
        key: 'budget',
        header: 'Budget',
        align: 'right',
        sortable: true,
        render: (c) => <span className="tnum font-mono text-[12.5px] text-ink-500">{c.budget}</span>,
      },
      {
        key: 'toggle',
        header: '',
        width: 60,
        render: (c) => {
          const isDraft = c.status === 'draft'
          return (
            <Switch
              checked={c.status === 'active'}
              disabled={isDraft || toggling === c.id}
              onCheckedChange={() => handleToggle(c)}
              aria-label={c.status === 'active' ? `Pause ${c.name}` : `Activate ${c.name}`}
              className="data-[state=checked]:bg-palm-600"
            />
          )
        },
      },
    ],
    [toggling],
  )

  return (
    <div className="space-y-4">
      {/* S1 — Social account integration cards */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Social Accounts</h2>
          <span className="tnum font-mono text-[11px] text-ink-500">
            {socialAccounts.filter((a) => a.connected).length} connected · {socialAccounts.length} total
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {socialAccounts.map((account) => (
            <motion.div
              key={account.platform}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SocialCard account={account} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* S2 — Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Active campaigns" value={String(stats.activeCampaigns)} sub="Currently running" />
        <StatCard label="Total reach" value={stats.totalReach} sub="All campaigns" />
        <StatCard label="Engagement rate" value={stats.engagementRate} sub="Avg. across channels" />
        <StatCard label="Leads generated" value={String(stats.leadsGenerated)} sub="This month" />
      </div>

      {/* S3 — Marketing campaigns */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Marketing campaigns</h2>
          <span className="tnum font-mono text-[11px] text-ink-500">
            {campaigns.filter((c) => c.status === 'active').length} active · {campaigns.length} total
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-palm-600 px-3.5 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            New campaign
          </button>
        </div>
        <DataTable
          columns={columns}
          data={campaigns}
          rowKey={(c) => String(c.id)}
          pageSize={10}
        />
      </div>

      <Toaster position="bottom-right" />

      {/* New campaign modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-[480px] rounded-[12px] bg-surface p-6 shadow-e3">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-ink-900">New campaign</h2>
              <p className="mt-1 text-[13px] text-ink-500">Create a new marketing campaign. Saved as draft until activated.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Campaign name</label>
                <input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Q4 Luxury Push"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Platform</label>
                <select
                  value={newCampaign.platform}
                  onChange={(e) => setNewCampaign((p) => ({ ...p, platform: e.target.value }))}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none focus:border-palm-600"
                >
                  {['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest'].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-ink-700">Budget</label>
                <input
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign((p) => ({ ...p, budget: e.target.value }))}
                  placeholder="e.g. AED 15,000"
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-ink-900 outline-none placeholder:text-ink-400 focus:border-palm-600"
                />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setModalOpen(false); setNewCampaign({ name: '', platform: 'Instagram', budget: '' }) }}
                className="inline-flex h-9 items-center rounded-md border border-line-strong bg-surface px-4 text-[13px] font-medium text-ink-700 transition-colors hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCampaign}
                disabled={!newCampaign.name.trim()}
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