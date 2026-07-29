import { useRef, useState } from 'react'
import { Check, Sparkles, Pencil, X, MessageCircle, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useGSAP, gsap, prefersReducedMotion } from '@/lib/gsap'

const checklist = [
  'Confidence score on every output',
  'Source citations — WhatsApp, email, property DB',
  'One-tap approve, edit, or reject',
  'Full audit trail in Administration',
]

/** S5 — AI governance split: "AI proposes. You decide." + oversized approval card fan. */
export default function Governance() {
  const root = useRef<HTMLElement>(null)
  const [sent, setSent] = useState(false)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-fan-card]', {
        rotate: 0,
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'elastic.out(1, 0.75)',
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="ai" aria-label="AI governance" className="py-24">
      <div className="mx-auto flex max-w-container flex-col items-center gap-16 px-6 lg:flex-row lg:gap-20">
        {/* text column */}
        <div className="w-full max-w-[480px] shrink-0">
          <p className="text-micro font-semibold uppercase tracking-[0.16em] text-gold-400" data-reveal>
            Draft autonomy
          </p>
          <h2
            className="mt-4 font-display text-[34px] font-medium leading-[1.06] tracking-[-0.015em] text-ink-text md:text-[48px]"
            data-reveal
          >
            AI proposes. <span className="italic text-gold-400">You</span> decide.
          </h2>
          <p className="mt-5 text-[17px] leading-7 text-ink-muted" data-reveal>
            Every APEX action that leaves your workspace — a WhatsApp reply, a price change, a
            contract reminder — is drafted with its confidence and sources attached, and waits for
            a human. Nothing sends itself.
          </p>
          <ul className="mt-8 space-y-3.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] text-ink-text" data-reveal>
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-palm-600/20">
                  <Check className="h-3 w-3 text-palm-400" strokeWidth={2.25} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* visual column — stacked approval cards fanning out */}
        <div className="relative w-full max-w-[560px]" data-reveal>
          {[2, 1].map((depth) => (
            <div
              key={depth}
              data-fan-card
              aria-hidden="true"
              className="absolute inset-x-0 top-0 rounded-[14px] border border-ink-line bg-ink-surface"
              style={{
                transform: `translateY(${-depth * 8}px) rotate(${depth === 2 ? -2 : 0}deg)`,
                opacity: depth === 2 ? 0.3 : 0.6,
                height: '100%',
              }}
            />
          ))}

          <div
            data-fan-card
            className={cn(
              'relative rounded-[14px] border border-ink-line border-l-2 border-l-gold-400 bg-ink-surface p-6 shadow-e3 transition-all duration-300',
              sent && 'scale-[0.98] opacity-70',
            )}
            style={{ transform: 'rotate(2deg)' }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold-400" strokeWidth={1.75} />
              <p className="text-[14px] font-semibold text-ink-text">Draft reply to Arjun Mehta</p>
              <span className="ml-auto flex items-center gap-2">
                <span className="h-1 w-11 overflow-hidden rounded-full bg-gold-400/20">
                  <span className="block h-full w-[87%] rounded-full bg-gold-400" />
                </span>
                <span className="tnum font-mono text-[12px] font-medium text-gold-400">87%</span>
                <span className="text-[11px] text-ink-muted">confidence</span>
              </span>
            </div>

            <div className="mt-4 rounded-[10px] bg-ink-bg p-4 ring-1 ring-ink-line">
              <p className="text-[14px] leading-[22px] text-ink-text">
                Hi Arjun bhai — great timing. Beach Isle #2201 (2BR, full sea view) just came back
                at AED 3.6M, inside your band. I can hold Thursday 4:00 PM for a viewing. Shall I
                lock it in?
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-ink-raised px-2.5 text-[11.5px] text-ink-muted ring-1 ring-ink-line">
                <MessageCircle className="h-3 w-3 text-wa-green" strokeWidth={1.75} />
                WhatsApp · 4 msgs
              </span>
              <span className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-ink-raised px-2.5 text-[11.5px] text-ink-muted ring-1 ring-ink-line">
                <Database className="h-3 w-3 text-ink-400" strokeWidth={1.75} />
                Property DB
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSent(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-palm-600 px-4 py-2 text-[13px] font-semibold text-white transition-all duration-140 hover:scale-[1.02] hover:bg-palm-700"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
                {sent ? 'Approved — queued to send' : 'Approve & send'}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-line px-4 py-2 text-[13px] font-medium text-ink-text transition-colors duration-140 hover:bg-ink-raised"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                Edit
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium text-red-600 transition-colors duration-140 hover:bg-red-600/10"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
