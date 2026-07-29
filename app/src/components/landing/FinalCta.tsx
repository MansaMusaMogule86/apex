import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP, gsap, prefersReducedMotion } from '@/lib/gsap'

/** S8 — Final CTA with faint skyline echo + word-split headline rise. */
export default function FinalCta() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('.cta-word-inner', {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: root.current, start: 'top 78%', once: true },
      })
    },
    { scope: root },
  )

  const words = [
    { text: 'Run' },
    { text: 'your' },
    { text: 'brokerage' },
    { text: 'on' },
    { text: 'APEX', accent: true },
  ]

  return (
    <section ref={root} id="pricing" aria-label="Get started" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-[0.08]" aria-hidden="true">
        <img src="/skyline-dubai.svg" alt="" className="mx-auto w-full min-w-[1200px]" />
      </div>

      <div className="relative mx-auto max-w-container px-6 py-32 text-center">
        <h2 className="mx-auto max-w-[18ch] font-display text-[34px] font-medium leading-[1.06] tracking-[-0.015em] text-ink-text md:text-[48px]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <span
                className={`cta-word-inner inline-block will-change-transform ${
                  w.accent ? 'italic text-gold-400' : ''
                }`}
              >
                {w.text}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            </span>
          ))}
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[17px] leading-7 text-ink-muted" data-reveal>
          Sign in to your workspace, or book a 20-minute walkthrough with our Dubai team.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3" data-reveal>
          <Link
            to="/login"
            className="rounded-lg bg-palm-600 px-6 py-3 text-[15px] font-semibold text-white shadow-e2 transition-all duration-140 hover:-translate-y-0.5 hover:bg-palm-700"
          >
            Sign in
          </Link>
          <a
            href="#pricing"
            className="rounded-lg px-6 py-3 text-[15px] font-medium text-ink-text transition-all duration-140 hover:-translate-y-0.5 hover:bg-ink-surface"
          >
            Book a demo
          </a>
        </div>
        <p className="mt-7 text-[12px] text-ink-muted" data-reveal>
          14-day pilot · onboarding in one business day
        </p>
      </div>
    </section>
  )
}
