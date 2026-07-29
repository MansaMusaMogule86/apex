import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import Hero from '@/components/landing/Hero'
import ProofStrip from '@/components/landing/ProofStrip'
import Showcase from '@/components/landing/Showcase'
import Governance from '@/components/landing/Governance'
import Metrics from '@/components/landing/Metrics'
import Dubai from '@/components/landing/Dubai'
import FinalCta from '@/components/landing/FinalCta'

/**
 * Landing page `/` — dark cinematic marketing zone (home.md).
 * Lenis smooth scroll (lerp 0.1) + GSAP ScrollTrigger. Sections reveal with
 * translateY 28px + opacity (trigger 85%, stagger 0.08s) via [data-reveal].
 */
export default function Home() {
  const root = useRef<HTMLDivElement>(null)

  // Lenis smooth scroll synced to GSAP ticker
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  // Standard reveal pattern for anything tagged [data-reveal]
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out', overwrite: true },
          ),
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="bg-ink-bg text-ink-text">
      <Hero />
      <ProofStrip />
      <Showcase />
      <Governance />
      <Metrics />
      <Dubai />
      <FinalCta />
    </div>
  )
}
