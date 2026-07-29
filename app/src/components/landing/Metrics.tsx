import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

interface Metric {
  value: number
  format: (v: number) => string
  label: string
  mono?: boolean
}

const metrics: Metric[] = [
  {
    value: 492, // 8m 12s in seconds
    format: (v) => {
      const s = Math.round(v)
      return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
    },
    label: 'median first response across channels',
    mono: true,
  },
  { value: 67, format: (v) => `AED ${v.toFixed(1)}M`, label: 'open pipeline managed by a 6-advisor team' },
  { value: 99.4, format: (v) => `${v.toFixed(1)}%`, label: 'message sync success, WhatsApp + email' },
  { value: 40, format: (v) => `−${Math.round(v)}%`, label: "response time vs. team's previous quarter" },
]

/** S6 — Metrics band: count-up on enter (once), underline draw. */
export default function Metrics() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        // instant final state
        root.current?.querySelectorAll<HTMLElement>('[data-metric-value]').forEach((el) => {
          const idx = Number(el.dataset.metricValue)
          el.textContent = metrics[idx].format(metrics[idx].value)
        })
        return
      }

      const items = gsap.utils.toArray<HTMLElement>('[data-metric-value]', root.current)
      items.forEach((el, i) => {
        const m = metrics[i]
        const state = { v: 0 }
        gsap.to(state, {
          v: m.value,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent = m.format(state.v)
          },
        })
      })
      gsap.from('[data-metric-rule]', {
        scaleX: 0,
        transformOrigin: 'left',
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: root.current, start: 'top 85%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="Metrics" className="border-y border-ink-line bg-ink-surface">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-x-6 gap-y-10 px-6 py-16 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <div key={m.label} data-reveal>
            <p
              data-metric-value={i}
              className={`tnum text-[40px] font-semibold leading-none tracking-[-0.01em] text-ink-text ${
                m.mono ? 'font-mono' : ''
              }`}
            >
              {m.format(0)}
            </p>
            <span data-metric-rule className="mt-4 block h-[2px] w-10 bg-palm-400" />
            <p className="mt-3 max-w-[26ch] text-[13px] leading-5 text-ink-muted">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
