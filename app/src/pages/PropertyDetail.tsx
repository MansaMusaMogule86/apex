/**
 * Property Detail — `/properties/:id` (properties.md S4).
 * Hero gallery (photo + zoom-variant thumbs + floor-plan tile, keyboard ←/→,
 * lightbox), facts grid, price card with history chart (ChartSkin/Recharts),
 * listing agent card, ranked Matched Buyers panel, similar-properties strip.
 * All data live via trpc.apex.properties.* — skeletons while loading.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  PenTool,
  Share2,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { trpc } from '@/providers/trpc'
import { PropertyStatusChip, StatusChip } from '@/components/app/Chips'
import EmptyState from '@/components/app/EmptyState'
import { AgentAvatar } from '@/components/properties/bits'
import MatchedBuyersPanel from '@/components/properties/MatchedBuyersPanel'
import PriceCard from '@/components/properties/PriceCard'
import type { MatchedBuyerDto, PricePointDto, PropertyDto } from '@/components/properties/types'
import { formatAed, formatAedCompact, formatPerSqft, perSqft } from '@/components/properties/utils'

/* gallery: same photo with subtle zoom variants + a code-built floor-plan tile */
const slides = [
  { key: 'photo', label: 'Photo', imgClass: '' },
  { key: 'interior', label: 'Interior', imgClass: 'scale-110 object-left' },
  { key: 'view', label: 'View', imgClass: 'scale-125 object-right' },
  { key: 'floorplan', label: 'Floor plan PDF', imgClass: '' },
] as const

function isPropertyDto(value: unknown): value is PropertyDto {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    typeof v.ref === 'string' &&
    typeof v.name === 'string' &&
    typeof v.community === 'string' &&
    typeof v.priceAed === 'number' &&
    typeof v.sizeSqft === 'number'
  )
}

function isPricePoint(value: unknown): value is PricePointDto {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    typeof v.propertyId === 'number' &&
    typeof v.priceAed === 'number' &&
    typeof v.label === 'string'
  )
}

function isMatchedBuyer(value: unknown): value is MatchedBuyerDto {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.score === 'number' && typeof v.requirement === 'object' && v.requirement !== null
}

export default function PropertyDetail() {
  const { id: rawId } = useParams()
  const id = Number(rawId)
  const valid = Number.isInteger(id) && id > 0
  const navigate = useNavigate()

  /* ------- live data ------- */
  const propQ = trpc.apex.properties.get.useQuery({ id: valid ? id : 0 }, { enabled: valid })
  const listQ = trpc.apex.properties.list.useQuery()
  const teamQ = trpc.apex.admin.team.useQuery()
  const priceQ = trpc.apex.properties.priceHistory.useQuery(
    { propertyId: valid ? id : 0 },
    { enabled: valid },
  )
  const buyersQ = trpc.apex.properties.matchedBuyers.useQuery(
    { propertyId: valid ? id : 0 },
    { enabled: valid },
  )

  const p = isPropertyDto(propQ.data) ? propQ.data : null

  const propertyList = useMemo(
    () => (Array.isArray(listQ.data) ? listQ.data.filter(isPropertyDto) : []),
    [listQ.data],
  )

  const safePriceHistory = useMemo(
    () => (Array.isArray(priceQ.data) ? priceQ.data.filter(isPricePoint) : []),
    [priceQ.data],
  )

  const safeMatchedBuyers = useMemo(
    () => (Array.isArray(buyersQ.data) ? buyersQ.data.filter(isMatchedBuyer) : []),
    [buyersQ.data],
  )

  /* ------- gallery state (reset when navigating between properties) ------- */
  const [slide, setSlide] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [copiedWhat, setCopiedWhat] = useState<'link' | 'ref' | null>(null)
  // reset gallery when navigating between properties (render-time adjustment)
  const [prevId, setPrevId] = useState(id)
  if (prevId !== id) {
    setPrevId(id)
    setSlide(0)
    setLightbox(false)
    setCopiedWhat(null)
  }
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setSlide((s) => (s + slides.length - 1) % slides.length)
      if (e.key === 'ArrowRight') setSlide((s) => (s + 1) % slides.length)
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ------- derived data ------- */
  const communityAvgPsf = useMemo(() => {
    if (!p || propertyList.length === 0) return null
    const peers = propertyList.filter((x) => x.id !== p.id && x.community === p.community)
    if (peers.length === 0) return null
    return Math.round(
      peers.reduce((a: number, x) => a + perSqft(x.priceAed, x.sizeSqft), 0) / peers.length,
    )
  }, [p, propertyList])

  const similar = useMemo(() => {
    if (!p || propertyList.length === 0) return [] as PropertyDto[]
    return propertyList
      .filter((x) => x.id !== p.id && (x.community === p.community || x.propertyType === p.propertyType))
      .slice(0, 6)
  }, [p, propertyList])

  const agent = useMemo(() => {
    if (!p || p.agentId === null) return undefined
    return (teamQ.data ?? []).find((t: { id: number }) => t.id === p.agentId)
  }, [p, teamQ.data])

  const buyersRef = useRef<HTMLDivElement>(null)

  const copyText = async (text: string, what: 'link' | 'ref') => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard unavailable — still show confirmation */
    }
    setCopiedWhat(what)
    window.setTimeout(() => setCopiedWhat(null), 2000)
  }

  /* ------- states ------- */
  if (!valid || (!propQ.isLoading && p === null)) {
    return (
      <div className="rounded-[10px] border border-line bg-surface">
        <EmptyState
          icon={Building2}
          title="Property not found"
          description="This unit may have been delisted or the link is wrong. The live inventory is one click away."
          primaryCta={{ label: 'Back to properties', onClick: () => navigate('/properties') }}
        />
      </div>
    )
  }

  if (propQ.isLoading || !p) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-28 animate-pulse rounded bg-sunken" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-sunken" />
            <div className="mt-3 flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-24 animate-pulse rounded-lg bg-sunken" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-5 w-40 animate-pulse rounded-full bg-sunken" />
            <div className="h-7 w-3/4 animate-pulse rounded bg-sunken" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-sunken" />
            <div className="h-9 w-48 animate-pulse rounded bg-sunken" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-sunken" />
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="h-72 animate-pulse rounded-[10px] bg-sunken" />
          <div className="h-72 animate-pulse rounded-[10px] bg-sunken" />
        </div>
      </div>
    )
  }

  const sold = p.status === 'Sold'
  const isFloorPlan = slides[slide].key === 'floorplan'

  const facts: { label: string; value: string }[] = [
    { label: 'Ref', value: p.ref },
    { label: 'Type', value: p.propertyType },
    { label: 'Beds', value: `${p.beds}BR` },
    { label: 'Baths', value: `${p.baths}BA` },
    { label: 'Size', value: `${p.sizeSqft.toLocaleString('en-US')} sqft` },
    { label: 'Completion', value: p.completion },
    { label: 'Community', value: p.community },
    { label: 'Developer', value: p.developer },
  ]

  return (
    <div>
      {/* back link */}
      <Link
        to="/properties"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-palm-600 transition-colors hover:text-palm-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Properties
      </Link>

      {/* under-offer banner (properties.md states) */}
      {p.status === 'Under Offer' && (
        <div className="mt-3 rounded-lg border border-amber-600/25 bg-amber-100 px-3.5 py-2 text-[12.5px] font-medium text-amber-600">
          Under offer — backup interest is still being accepted by the listing agent.
        </div>
      )}

      {/* ------- hero band ------- */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* gallery */}
        <div>
          <div className="relative overflow-hidden rounded-xl bg-sunken">
            {isFloorPlan ? (
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-line-strong bg-sunken">
                <PenTool className="h-8 w-8 text-ink-400" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-ink-500">Floor plan PDF</p>
                <p className="font-mono text-[11px] text-ink-400">{p.ref}-FP.pdf</p>
              </div>
            ) : (
              <button
                type="button"
                aria-label="Open photo fullscreen"
                onClick={() => setLightbox(true)}
                className="block w-full cursor-zoom-in"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  className={cn(
                    'aspect-[4/3] w-full object-cover',
                    slides[slide].imgClass,
                    sold && 'grayscale-[40%]',
                  )}
                />
              </button>
            )}

            {sold && (
              <span className="absolute left-3 top-3">
                <StatusChip tone="red" className="shadow-sm">
                  Sold
                </StatusChip>
              </span>
            )}

            {/* arrows */}
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setSlide((s) => (s + slides.length - 1) % slides.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-ink-700 shadow-sm backdrop-blur-[2px] transition-colors hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setSlide((s) => (s + 1) % slides.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-ink-700 shadow-sm backdrop-blur-[2px] transition-colors hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* thumb strip */}
          <div className="mt-3 flex gap-3">
            {slides.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSlide(i)}
                aria-label={`Show ${s.label}`}
                className={cn(
                  'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all duration-120',
                  slide === i
                    ? 'border-palm-600 ring-2 ring-palm-600/25'
                    : 'border-line opacity-75 hover:opacity-100',
                )}
              >
                {s.key === 'floorplan' ? (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 border border-dashed border-line-strong bg-sunken">
                    <PenTool className="h-4 w-4 text-ink-400" strokeWidth={1.5} />
                    <span className="px-1 text-center text-[9px] font-medium leading-tight text-ink-500">
                      Floor plan PDF
                    </span>
                  </span>
                ) : (
                  <img
                    src={p.image}
                    alt=""
                    loading="lazy"
                    className={cn('h-full w-full bg-sunken object-cover', s.imgClass)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* right panel */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            {p.offPlan ? (
              <StatusChip tone="teal">{p.completion}</StatusChip>
            ) : (
              <StatusChip tone="neutral">Ready</StatusChip>
            )}
            <PropertyStatusChip status={p.status} />
          </div>

          <h1 className="mt-2.5 text-[20px] font-semibold leading-7 tracking-[-0.01em] text-ink-900">
            {p.name}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {p.community} · {p.developer} · {p.completion}
          </p>

          <div className="mt-3">
            <p className="tnum text-[32px] font-semibold leading-9 text-ink-900">
              {formatAed(p.priceAed)}
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              <span className="tnum">{formatPerSqft(p.priceAed, p.sizeSqft)}</span>
              {communityAvgPsf !== null && (
                <>
                  {' · community avg '}
                  <span className="tnum">AED {communityAvgPsf.toLocaleString('en-US')}/sqft</span>
                </>
              )}
            </p>
          </div>

          {/* facts grid */}
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-micro font-semibold uppercase text-ink-400">{f.label}</dt>
                <dd className="tnum mt-0.5 text-[13px] text-ink-900">{f.value}</dd>
              </div>
            ))}
          </dl>

          {/* portals + features chips */}
          {(p.portals ?? []).length > 0 && (
            <div className="mt-4">
              <p className="text-micro font-semibold uppercase text-ink-400">Listed on</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(p.portals ?? []).map((portal) => (
                  <span
                    key={portal}
                    className="inline-flex h-[22px] items-center rounded-full bg-palm-50 px-2.5 text-[11.5px] font-medium text-palm-700 ring-1 ring-palm-100"
                  >
                    {portal}
                  </span>
                ))}
              </div>
            </div>
          )}
          {(p.features ?? []).length > 0 && (
            <div className="mt-3">
              <p className="text-micro font-semibold uppercase text-ink-400">Features</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(p.features ?? []).map((f) => (
                  <span
                    key={f}
                    className="inline-flex h-[22px] items-center rounded-full bg-sunken px-2.5 text-[11.5px] text-ink-700 ring-1 ring-line"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {sold ? (
              <button
                type="button"
                onClick={() => navigate('/deals')}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-palm-600 px-4 text-[13px] font-semibold text-palm-600 transition-colors duration-120 hover:bg-palm-50 active:scale-[0.98]"
              >
                View closed deal
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => buyersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-palm-600 px-4 text-[13px] font-semibold text-white transition-colors duration-120 hover:bg-palm-700 active:scale-[0.98]"
                >
                  <Users className="h-4 w-4" strokeWidth={1.75} />
                  Find matching buyers
                </button>
                <button
                  type="button"
                  onClick={() => void copyText(window.location.href, 'link')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line-strong px-4 text-[13px] font-medium text-ink-700 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
                >
                  {copiedWhat === 'link' ? (
                    <>
                      <Check className="h-4 w-4 text-palm-600" strokeWidth={2} />
                      Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" strokeWidth={1.75} />
                      Share listing
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => void copyText(p.ref, 'ref')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-ink-500 transition-colors duration-120 hover:bg-sunken active:scale-[0.98]"
                >
                  {copiedWhat === 'ref' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-palm-600" strokeWidth={2} />
                      Ref copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Copy ref
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ------- body: matched buyers + price/agent rail ------- */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div ref={buyersRef} className="scroll-mt-20">
          <MatchedBuyersPanel property={p} buyers={safeMatchedBuyers} isLoading={buyersQ.isLoading} />
        </div>
        <div className="space-y-6">
          <PriceCard
            property={p}
            history={safePriceHistory}
            isLoading={priceQ.isLoading}
            communityAvgPsf={communityAvgPsf}
          />

          {/* listing agent card */}
          <section className="rounded-[10px] border border-line bg-surface" aria-label="Listing agent">
            <div className="border-b border-line px-4 py-3">
              <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Listing agent</h2>
            </div>
            <div className="p-4">
              {agent ? (
                <>
                  <div className="flex items-center gap-3">
                    <AgentAvatar name={agent.name} size={36} />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold leading-5 text-ink-900">
                        {agent.name}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-500">{agent.title}</p>
                    </div>
                  </div>
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-palm-600 transition-colors hover:text-palm-700"
                    >
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {agent.email}
                    </a>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <AgentAvatar name="Apex Team" size={36} />
                  <p className="text-[13px] text-ink-500">Unassigned — Marina Crest Realty pool</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ------- similar properties strip ------- */}
      {similar.length > 0 && (
        <section className="mt-8" aria-label="Similar properties">
          <h2 className="text-[16px] font-semibold leading-6 text-ink-900">Similar properties</h2>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Same community or type · {p.community} · {p.propertyType}
          </p>
          <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
            {similar.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => navigate(`/properties/${sp.id}`)}
                className="group w-[220px] shrink-0 text-left"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-sunken">
                  <img
                    src={sp.image ?? undefined}
                    alt={sp.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-2 top-2">
                    {sp.offPlan ? (
                      <StatusChip tone="teal" className="bg-white/85 shadow-sm backdrop-blur-[2px]">
                        Off-plan
                      </StatusChip>
                    ) : (
                      <PropertyStatusChip status={sp.status} className="shadow-sm" />
                    )}
                  </span>
                </div>
                <p className="mt-2 truncate text-[13px] font-semibold text-ink-900">{sp.name}</p>
                <p className="truncate text-[11.5px] text-ink-500">
                  {sp.community} · {sp.beds}BR · {sp.sizeSqft.toLocaleString('en-US')} sqft
                </p>
                <p className="tnum mt-0.5 text-[13px] font-semibold text-palm-700">
                  {formatAedCompact(sp.priceAed)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ------- lightbox ------- */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/90 p-6"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              src={p.image}
              alt={p.name}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
            <button
              type="button"
              aria-label="Close fullscreen photo"
              onClick={() => setLightbox(false)}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
