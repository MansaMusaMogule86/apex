/**
 * Properties — `/properties` (properties.md S1–S3).
 * Live inventory from trpc.apex.properties.list: stats strip, view toggle
 * Grid | Table | Map(stub), AND filter chips (community, type, status,
 * ready/off-plan) + name/ref search, photo grid with match badges, full
 * DataTable with portals. Row/card → /properties/:id.
 */
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Building2,
  LayoutGrid,
  Map as MapIcon,
  Search,
  Table2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/providers/trpc'
import { DataTable, type Column } from '@/components/app/DataTable'
import EmptyState from '@/components/app/EmptyState'
import PropertyCard from '@/components/properties/PropertyCard'
import {
  AgentAvatar,
  FilterDropdown,
  PhotoStatusChip,
  PropertyCardSkeleton,
  TableSkeletonRows,
} from '@/components/properties/bits'
import type { PropertyDto } from '@/components/properties/types'
import { formatAed, perSqft } from '@/components/properties/utils'

type View = 'grid' | 'table' | 'map'
const VIEW_KEY = 'apex.properties.view'

/** effective chip status: off-plan units surface the teal "Off-plan" state (§3.3) */
const chipStatus = (p: PropertyDto) => (p.offPlan ? 'Off-plan' : p.status)

export default function Properties() {
  const navigate = useNavigate()

  /* ------- live data ------- */
  const listQ = trpc.apex.properties.list.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const list = useMemo(() => (listQ.data ?? []) as PropertyDto[], [listQ.data])
  const team = useMemo(() => teamQ.data ?? [], [teamQ.data])
  const agentName = useMemo(() => {
    const m = new Map<number, string>()
    for (const t of team) m.set(t.id, t.name)
    return m
  }, [team])

  const ids = useMemo(() => list.map((p) => p.id), [list])
  // match-badge counts — reverse matching per unit, batched by httpBatchLink
  const matchQ = trpc.useQueries((t: { apex: { properties: { matchedBuyers: (input: { propertyId: number }) => { data?: unknown; isLoading?: boolean } } } }) =>
    ids.map((id) => t.apex.properties.matchedBuyers({ propertyId: id })),
  )
  const matchCounts = useMemo(() => {
    const m = new Map<number, number>()
    ids.forEach((id, i) => {
      const d = matchQ[i]?.data as { length: number } | undefined
      if (d) m.set(id, d.length)
    })
    return m
  }, [ids, matchQ])

  /* ------- view + filter state ------- */
  const [view, setView] = useState<View>(() => {
    try {
      const v = window.localStorage.getItem(VIEW_KEY)
      return v === 'table' || v === 'map' ? v : 'grid'
    } catch {
      return 'grid'
    }
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_KEY, view)
    } catch {
      /* noop */
    }
  }, [view])

  const [query, setQuery] = useState('')
  const [community, setCommunity] = useState<string | null>(null)
  const [ptype, setPtype] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [completion, setCompletion] = useState<string | null>(null) // Ready | Off-plan

  const communities = useMemo(
    () => [...new Set(list.map((p) => p.community))].sort((a, b) => a.localeCompare(b)),
    [list],
  )
  const types = useMemo(
    () => [...new Set(list.map((p) => p.propertyType))].sort((a, b) => a.localeCompare(b)),
    [list],
  )
  const statuses = useMemo(
    () => [...new Set(list.map(chipStatus))].sort((a, b) => a.localeCompare(b)),
    [list],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list.filter((p) => {
      if (community && p.community !== community) return false
      if (ptype && p.propertyType !== ptype) return false
      if (status && chipStatus(p) !== status) return false
      if (completion === 'Ready' && p.offPlan) return false
      if (completion === 'Off-plan' && !p.offPlan) return false
      if (q && !`${p.name} ${p.ref} ${p.community} ${p.developer}`.toLowerCase().includes(q))
        return false
      return true
    })
  }, [list, community, ptype, status, completion, query])

  const hasFilters = Boolean(community || ptype || status || completion || query.trim())
  const clearFilters = () => {
    setCommunity(null)
    setPtype(null)
    setStatus(null)
    setCompletion(null)
    setQuery('')
  }

  /* ------- stats strip (S1) — computed from live inventory ------- */
  const stats = useMemo(() => {
    const available = list.filter((p) => p.status === 'Available').length
    const avgPsf =
      list.length > 0
        ? Math.round(list.reduce((a, p) => a + perSqft(p.priceAed, p.sizeSqft), 0) / list.length)
        : 0
    const offPlan = list.filter((p) => p.offPlan).length
    return { total: list.length, available, avgPsf, offPlan }
  }, [list])

  /* ------- table columns (S3) ------- */
  const columns = useMemo<Column<PropertyDto>[]>(
    () => [
      {
        key: 'image',
        header: '',
        width: 64,
        render: (p) => (
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="h-9 w-12 rounded-md bg-sunken object-cover"
          />
        ),
      },
      {
        key: 'name',
        header: 'Project / Unit',
        sortable: true,
        render: (p) => (
          <span className="block max-w-[260px]">
            <span className="block truncate text-[13px] font-semibold text-ink-900">{p.name}</span>
            <span className="font-mono text-[10.5px] text-ink-400">{p.ref}</span>
          </span>
        ),
      },
      { key: 'community', header: 'Community', sortable: true },
      { key: 'developer', header: 'Developer', sortable: true },
      { key: 'propertyType', header: 'Type', sortable: true },
      {
        key: 'beds',
        header: 'Beds/Baths',
        sortable: true,
        sortValue: (p) => p.beds,
        render: (p) => (
          <span className="tnum text-ink-700">
            {p.beds} / {p.baths}
          </span>
        ),
      },
      {
        key: 'sizeSqft',
        header: 'Sqft',
        align: 'right',
        sortable: true,
        render: (p) => <span className="tnum">{p.sizeSqft.toLocaleString('en-US')}</span>,
      },
      {
        key: 'priceAed',
        header: 'Price AED',
        align: 'right',
        sortable: true,
        render: (p) => (
          <span className="tnum font-mono text-[12.5px] font-medium">{formatAed(p.priceAed)}</span>
        ),
      },
      {
        key: 'psf',
        header: 'AED/sqft',
        align: 'right',
        sortable: true,
        sortValue: (p) => perSqft(p.priceAed, p.sizeSqft),
        render: (p) => (
          <span className="tnum text-ink-500">
            {perSqft(p.priceAed, p.sizeSqft).toLocaleString('en-US')}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (p) => <PhotoStatusChip property={p} />,
      },
      { key: 'completion', header: 'Completion', sortable: true },
      {
        key: 'portals',
        header: 'Portals',
        render: (p) => (
          <span className="flex flex-wrap gap-1">
            {(p.portals ?? []).map((portal) => (
              <span
                key={portal}
                className="inline-flex h-[20px] items-center rounded-full bg-sunken px-2 text-[10.5px] font-medium text-ink-700 ring-1 ring-line"
              >
                {portal}
              </span>
            ))}
          </span>
        ),
      },
      {
        key: 'agentId',
        header: 'Agent',
        render: (p) => {
          const name = p.agentId !== null ? agentName.get(p.agentId) : undefined
          return (
            <span className="inline-flex items-center gap-1.5">
              <AgentAvatar name={name ?? 'Apex Team'} size={20} />
              <span className="text-[12.5px] text-ink-700">{name?.split(' ')[0] ?? '—'}</span>
            </span>
          )
        },
      },
    ],
    [agentName],
  )

  const open = (id: number) => navigate(`/properties/${id}`)
  const isLoading = listQ.isLoading

  return (
    <div className="space-y-4">
      {/* ------- S1 stats strip: inline KPI chips, hairline separated ------- */}
      <div className="flex h-10 flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-700">
        {isLoading ? (
          <>
            <div className="h-3.5 w-20 animate-pulse rounded bg-sunken" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-sunken" />
            <div className="h-3.5 w-32 animate-pulse rounded bg-sunken" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-sunken" />
          </>
        ) : (
          <>
            <span>
              <span className="tnum font-semibold text-ink-900">{stats.total}</span> units
            </span>
            <span className="h-4 w-px bg-line" />
            <span>
              <span className="tnum font-semibold text-palm-600">{stats.available}</span> available
            </span>
            <span className="h-4 w-px bg-line" />
            <span>
              Avg <span className="tnum font-semibold text-ink-900">AED {stats.avgPsf.toLocaleString('en-US')}</span>
              /sqft
            </span>
            <span className="h-4 w-px bg-line" />
            <span>
              <span className="tnum font-semibold text-teal-600">{stats.offPlan}</span> off-plan
            </span>
          </>
        )}
      </div>

      {/* ------- toolbar: view toggle · search · filter chips · count ------- */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-md border border-line bg-surface p-0.5">
          {(
            [
              { id: 'grid', label: 'Grid', icon: LayoutGrid },
              { id: 'table', label: 'Table', icon: Table2 },
              { id: 'map', label: 'Map', icon: MapIcon },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              aria-pressed={view === v.id}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12.5px] font-medium transition-colors duration-120',
                view === v.id ? 'bg-palm-100 text-palm-700' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              <v.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {v.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Project, community, unit…"
            className="h-8 w-56 rounded-md border border-line bg-surface pl-8 pr-7 text-[12.5px] text-ink-900 placeholder:text-ink-400 focus:border-palm-600 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-400 hover:text-ink-900"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>

        <FilterDropdown label="Community" value={community} options={communities} onSelect={setCommunity} />
        <FilterDropdown label="Type" value={ptype} options={types} onSelect={setPtype} />
        <FilterDropdown label="Status" value={status} options={statuses} onSelect={setStatus} />
        <FilterDropdown
          label="Completion"
          value={completion}
          options={['Ready', 'Off-plan']}
          onSelect={setCompletion}
        />

        <span className="ml-auto text-[12.5px] text-ink-500">
          <span className="tnum font-semibold text-ink-900">{filtered.length}</span> unit
          {filtered.length === 1 ? '' : 's'}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-2 font-medium text-palm-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </span>
      </div>

      {/* ------- views ------- */}
      {isLoading ? (
        view === 'table' ? (
          <TableSkeletonRows rows={8} />
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )
      ) : list.length === 0 ? (
        <div className="rounded-[10px] border border-line bg-surface">
          <EmptyState
            icon={Building2}
            title="No properties yet"
            description="Inventory syncs from Property Finder, Bayut and Dubizzle — refresh to pull the latest listings."
            primaryCta={{ label: 'Refresh inventory', onClick: () => void listQ.refetch() }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[10px] border border-line bg-surface">
          <EmptyState
            icon={Search}
            title="No properties match these filters"
            description="Try widening the community, price band, or completion filters — filters combine with AND."
            primaryCta={{ label: 'Clear filters', onClick: clearFilters }}
          />
        </div>
      ) : view === 'map' ? (
        <div className="rounded-[10px] border border-line bg-surface">
          <EmptyState
            icon={MapIcon}
            title="Map view is on the way"
            description="Community clusters and price-heat pins land with the geo release. Grid and table are fully live today."
            primaryCta={{ label: 'Back to grid', onClick: () => setView('grid') }}
            secondaryCta={{ label: 'Open table', onClick: () => setView('table') }}
          />
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {filtered.map((p, i) => (
            <PropertyCard
              key={p.id}
              property={p}
              index={i}
              agentName={p.agentId !== null ? agentName.get(p.agentId) : undefined}
              matchCount={matchCounts.get(p.id)}
              onOpen={open}
            />
          ))}
        </div>
      ) : (
        <DataTable<PropertyDto>
          columns={columns}
          data={filtered}
          rowKey={(p) => String(p.id)}
          onRowClick={(p) => open(p.id)}
        />
      )}
    </div>
  )
}
