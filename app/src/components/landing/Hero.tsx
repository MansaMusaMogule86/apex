import { useRef } from 'react'
import { Link } from 'react-router'
import { Play, Sparkles, Zap, FileSignature, Check, X, Pencil } from 'lucide-react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const words: { text: string; accent?: boolean }[] = [
  { text: 'The' },
  { text: 'revenue' },
  { text: 'OS' },
  { text: 'for' },
  { text: 'Dubai', accent: true },
  { text: 'real' },
  { text: 'estate.' },
]

const stageBars = [34, 48, 41, 62, 55, 78, 68, 92]

const kpis = [
  { label: 'OPEN PIPELINE', value: 'AED 67.0M', delta: '+12.3%', bars: stageBars.slice(0, 5) },
  { label: 'MEDIAN FIRST RESPONSE', value: '8m 12s', delta: '−38%', bars: stageBars.slice(2, 7) },
  { label: 'VIEWINGS THIS WEEK', value: '18', delta: '+6', bars: stageBars.slice(1, 6) },
]

/** S2 — Hero: kinetic Fraunces headline, code-built dashboard mockup, floating chips. */
export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-eyebrow', { opacity: 0, duration: 0.2 }, 0.15)
        .from('.hero-word-inner', { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.25)
        .from('.hero-rise', { y: 24, opacity: 0, duration: 0.7, stagger: 0.08 }, 0.75)
        .from(mockupRef.current, { y: 80, opacity: 0, duration: 1 }, 0.9)
        .from('.hero-chip', { scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.6)' }, 1.25)

      // Scroll: mockup straightens 8deg -> 0deg, chips drift at 0.4x scroll speed
      gsap.to(mockupRef.current, {
        rotateX: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 35%', scrub: true },
      })
      gsap.to('.hero-chip', {
        y: -90,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.4 },
      })

      // Mouse parallax on floating chips (separate depths)
      const depths = [1, 0.6, 1.4]
      const setters = chipRefs.current.map((el) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power2.out' }),
        y: gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power2.out' }),
      }))
      const onMove = (e: MouseEvent) => {
        const cx = e.clientX / window.innerWidth - 0.5
        const cy = e.clientY / window.innerHeight - 0.5
        setters.forEach((s, i) => {
          const d = depths[i] ?? 1
          s.x(cx * 20 * d)
          s.y(cy * 14 * d)
        })
      }
      window.addEventListener('mousemove', onMove, { passive: true })
      return () => window.removeEventListener('mousemove', onMove)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative overflow-visible" aria-label="Hero">
      {/* background layers */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="hero-grid absolute inset-0" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(720px 480px at 50% 62%, rgb(11 93 74 / 0.08), transparent 70%)',
          }}
        />
        <div className="absolute bottom-0 left-0 w-[200%] opacity-[0.18]">
          <div className="flex w-full animate-skyline-drift">
            <img src="/skyline-dubai.svg" alt="" className="h-auto w-1/2 shrink-0" />
            <img src="/skyline-dubai.svg" alt="" className="h-auto w-1/2 shrink-0" />
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, #101311 78%)' }}
        />
      </div>

      {/* copy */}
      <div className="relative z-10 mx-auto max-w-container px-6 pt-36 text-center md:pt-44">
        <p className="hero-eyebrow inline-flex items-center gap-2 text-micro font-semibold uppercase tracking-[0.16em] text-gold-400">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
          AI-Native · Dubai Real Estate
        </p>

        <h1 className="mx-auto mt-6 max-w-[16ch] font-display text-[56px] font-medium leading-[1.02] tracking-[-0.02em] text-ink-text md:text-[76px]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <span
                className={`hero-word-inner inline-block will-change-transform ${
                  w.accent ? 'italic text-gold-400' : ''
                }`}
              >
                {w.text}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-rise mx-auto mt-6 max-w-[52ch] text-[17px] leading-7 text-ink-muted">
          APEX unifies your leads, WhatsApp conversations, deals, properties, and viewings into one
          workspace that updates itself — and recommends the next best action.
        </p>

        <div className="hero-rise mt-9 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="rounded-lg bg-palm-600 px-6 py-3 text-[15px] font-semibold text-white shadow-e2 transition-all duration-140 hover:-translate-y-0.5 hover:bg-palm-700"
          >
            Sign in
          </Link>
          <a
            href="#product"
            className="inline-flex items-center gap-2 rounded-lg border border-ink-line px-6 py-3 text-[15px] font-medium text-ink-text transition-all duration-140 hover:-translate-y-0.5 hover:bg-ink-surface"
          >
            <Play className="h-4 w-4" strokeWidth={1.75} />
            Watch 2-min tour
          </a>
        </div>

        <p className="hero-rise mt-8 font-mono text-[12px] tracking-wide text-ink-muted">
          SOC 2-ready · Data hosted in-region · DLD-aware workflows
        </p>
      </div>

      {/* product mockup — straddles into the next section */}
      <div
        className="relative z-20 mx-auto mt-16 max-w-[1160px] px-6"
        style={{ perspective: '1400px' }}
      >
        <div
          ref={mockupRef}
          className="relative -bottom-20 overflow-hidden rounded-[14px] border border-ink-line bg-ink-surface shadow-e3 will-change-transform"
          style={{ transform: 'rotateX(8deg)', transformOrigin: 'center top' }}
        >
          {/* browser chrome */}
          <div className="flex h-10 items-center gap-3 border-b border-ink-line px-4">
            <span className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-ink-line" />
              <i className="h-2.5 w-2.5 rounded-full bg-ink-line" />
              <i className="h-2.5 w-2.5 rounded-full bg-ink-line" />
            </span>
            <span className="mx-auto flex h-6 w-64 items-center justify-center rounded-md bg-ink-raised font-mono text-[10.5px] text-ink-muted">
              apex.os/dashboard
            </span>
            <span className="w-10" />
          </div>

          <div className="flex">
            {/* mini sidebar strip */}
            <div className="hidden w-14 flex-col items-center gap-3 border-r border-ink-line py-4 sm:flex">
              <span className="h-6 w-6 rounded-md bg-palm-600/30 ring-1 ring-palm-400/40" />
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-5 w-5 rounded bg-ink-raised" />
              ))}
              <span className="mt-auto h-5 w-5 rounded-full bg-gold-400/25 ring-1 ring-gold-400/50" />
            </div>

            {/* mini dashboard body */}
            <div className="grid flex-1 gap-3 p-4 md:grid-cols-3 md:p-5">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-[10px] border border-ink-line bg-ink-bg p-4 text-left">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">{k.label}</p>
                  <div className="mt-1.5 flex items-end justify-between gap-2">
                    <p className="tnum text-[22px] font-semibold leading-none text-ink-text">{k.value}</p>
                    <span className="text-[11px] font-medium text-palm-400">{k.delta}</span>
                  </div>
                  <div className="mt-3 flex h-7 items-end gap-1">
                    {k.bars.map((h, i) => (
                      <span key={i} className="w-full rounded-[2px] bg-palm-400/45" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ))}

              {/* stage bar chart */}
              <div className="rounded-[10px] border border-ink-line bg-ink-bg p-4 text-left md:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
                    PIPELINE BY STAGE · AED
                  </p>
                  <p className="font-mono text-[10px] text-ink-muted">13 stages</p>
                </div>
                <div className="mt-4 flex h-24 items-end gap-2 md:h-28">
                  {stageBars.map((h, i) => (
                    <div key={i} className="flex w-full flex-col items-center gap-1.5">
                      <span
                        className={`w-full rounded-t-[3px] ${i === 5 ? 'bg-gold-400/70' : 'bg-palm-400/50'}`}
                        style={{ height: `${h}%` }}
                      />
                      <span className="h-1 w-1 rounded-full bg-ink-line" />
                    </div>
                  ))}
                </div>
              </div>

              {/* AI approval card */}
              <div className="rounded-[10px] border border-ink-line border-l-2 border-l-gold-400 bg-ink-bg p-4 text-left">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-gold-400" strokeWidth={1.75} />
                  <p className="text-[10px] font-semibold text-ink-text">Draft reply — pending approval</p>
                </div>
                <p className="mt-2 line-clamp-3 text-[10.5px] leading-4 text-ink-muted">
                  Hi Arjun, great timing — Beach Isle #2201 just came back to market at AED 3.6M.
                  Shall I hold a viewing slot for Thursday?
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-palm-600 px-2 py-1 text-[9px] font-semibold text-white">
                    <Check className="h-2.5 w-2.5" /> Approve
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-ink-line px-2 py-1 text-[9px] font-medium text-ink-muted">
                    <Pencil className="h-2.5 w-2.5" /> Edit
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-medium text-red-600">
                    <X className="h-2.5 w-2.5" /> Reject
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* floating glass chips */}
        <div
          ref={(el) => { chipRefs.current[0] = el }}
          className="hero-chip absolute -left-2 top-24 z-30 hidden items-center gap-2 rounded-[10px] border border-ink-line bg-ink-raised/90 px-3.5 py-2.5 shadow-e2 backdrop-blur-md lg:flex"
        >
          <Sparkles className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
          <span className="text-[12px] font-medium text-ink-text">AI draft approved · sent on WhatsApp</span>
        </div>
        <div
          ref={(el) => { chipRefs.current[1] = el }}
          className="hero-chip absolute -right-3 top-40 z-30 hidden items-center gap-2 rounded-[10px] border border-ink-line bg-ink-raised/90 px-3.5 py-2.5 shadow-e2 backdrop-blur-md lg:flex"
        >
          <FileSignature className="h-3.5 w-3.5 text-palm-400" strokeWidth={1.75} />
          <span className="text-[12px] font-medium text-ink-text">
            AED 9.6M · MOU Signed — <span className="text-ink-muted">Address Residences</span>
          </span>
        </div>
        <div
          ref={(el) => { chipRefs.current[2] = el }}
          className="hero-chip absolute -left-6 bottom-16 z-30 hidden items-center gap-2 rounded-[10px] border border-ink-line bg-ink-raised/90 px-3.5 py-2.5 shadow-e2 backdrop-blur-md lg:flex"
        >
          <Zap className="h-3.5 w-3.5 text-gold-400" strokeWidth={1.75} />
          <span className="text-[12px] font-medium text-ink-text">
            First response <span className="tnum font-mono">3m 41s</span>
          </span>
        </div>
      </div>
    </section>
  )
}
