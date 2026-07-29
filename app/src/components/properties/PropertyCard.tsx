/**
 * Property grid card — properties.md S2.
 * 4:3 lazy photo with bg-sunken placeholder + 1.04 hover zoom, floating status
 * chip, name, community · developer, spec row, AED price + AED/sqft, agent
 * initials + match badge. Staggered mount (45ms), e1 hover lift.
 */
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import type { PropertyDto } from './types'
import { formatAed, formatPerSqft } from './utils'
import { AgentAvatar, PhotoStatusChip, SpecRow } from './bits'

export default function PropertyCard({
  property,
  agentName,
  matchCount,
  index,
  onOpen,
}: {
  property: PropertyDto
  agentName?: string
  matchCount?: number
  index: number
  onOpen: (id: number) => void
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 7) * 0.045, ease: [0.16, 1, 0.3, 1] }}
      className="group cursor-pointer overflow-hidden rounded-[10px] border border-line bg-surface transition-shadow duration-140 hover:-translate-y-1 hover:shadow-e1"
      onClick={() => onOpen(property.id)}
      role="button"
      tabIndex={0}
      aria-label={`Open ${property.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(property.id)
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sunken">
        <img
          src={property.image}
          alt={property.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, delay: Math.min(index, 7) * 0.045 + 0.1 }}
          className="absolute left-2.5 top-2.5"
        >
          <PhotoStatusChip property={property} />
        </motion.div>
      </div>

      <div className="p-3.5">
        <h3 className="truncate text-[14px] font-semibold leading-5 text-ink-900">{property.name}</h3>
        <p className="mt-0.5 truncate text-[12.5px] leading-[18px] text-ink-500">
          {property.community} · {property.developer}
        </p>
        <SpecRow beds={property.beds} baths={property.baths} sizeSqft={property.sizeSqft} className="mt-2" />
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="tnum text-[15px] font-semibold leading-6 text-ink-900">
            {formatAed(property.priceAed)}
          </span>
          <span className="tnum text-[11px] text-ink-400">
            {formatPerSqft(property.priceAed, property.sizeSqft)}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <AgentAvatar name={agentName ?? 'Apex Team'} size={20} />
          <span className="truncate text-[12px] text-ink-500">{agentName ?? 'Unassigned'}</span>
          {matchCount !== undefined && matchCount > 0 && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-palm-600">
              <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
              {matchCount} matching buyer{matchCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}
