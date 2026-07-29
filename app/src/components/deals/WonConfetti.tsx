/**
 * WonConfetti — restrained gold burst (12 particles, 500ms) when a deal is
 * Won (deals.md §S2). Fired at most once per session by useMoveStage.
 */
import { useMemo } from 'react'
import { motion } from 'framer-motion'

const PARTICLES = 12

export function WonConfetti({ burstKey }: { burstKey: number }) {
  const seeds = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2 + (i % 3) * 0.22
        const dist = 46 + (i % 4) * 22
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 18,
          size: 4 + (i % 3) * 2,
          gold: i % 2 === 0,
        }
      }),
    [],
  )

  if (burstKey === 0) return null

  return (
    <div
      key={burstKey}
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-1/3 z-[90]"
    >
      {seeds.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: s.size,
            height: s.size,
            background: s.gold ? 'var(--gold-400)' : 'var(--palm-400)',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.4 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  )
}

export default WonConfetti
