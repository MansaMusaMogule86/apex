import { useRef, useState, type ReactNode } from 'react'
import {
  Sparkles, MessageCircle, Mail, Building2, AlertTriangle,
  Clock, MapPin, BedDouble,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/* ---------- mini mockup panels (dark, code-built) ---------- */

function PanelShell({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] border border-ink-line bg-ink-surface shadow-e2">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-ink-line px-4">
        <span className="flex gap-1.5">
          <i className="h-2 w-2 rounded-full bg-ink-line" />
          <i className="h-2 w-2 rounded-full bg-ink-line" />
        </span>
        <span className="font-mono text-[10px] text-ink-muted">{label}</span>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  )
}

function InboxPanel() {
  const threads = [
    { name: 'Arjun Mehta', chan: 'wa', msg: 'Is the Beach Isle unit still…', time: '2m', unread: 2, active: true },
    { name: 'Charlotte Bennett', chan: 'mail', msg: 'Thanks for the shortlist…', time: '5h', unread: 0, active: false },
    { name: 'Li Na', chan: 'mail', msg: '预算在 3–4M 之间…', time: '20m', unread: 1, active: false },
  ]
  return (
    <PanelShell label="apex.os/inbox">
      <div className="flex h-full">
        <div className="w-[38%] border-r border-ink-line">
          {threads.map((t) => (
            <div
              key={t.name}
              className={cn('border-b border-ink-line px-3 py-2.5', t.active && 'bg-ink-raised')}
            >
              <div className="flex items-center gap-1.5">
                {t.chan === 'wa' ? (
                  <MessageCircle className="h-3 w-3 text-wa-green" strokeWidth={1.75} />
                ) : (
                  <Mail className="h-3 w-3 text-mail-slate" strokeWidth={1.75} />
                )}
                <p className="truncate text-[11px] font-semibold text-ink-text">{t.name}</p>
                <span className="ml-auto font-mono text-[9px] text-ink-muted">{t.time}</span>
                {t.unread > 0 && (
                  <span className="rounded-full bg-red-600 px-1 font-mono text-[8.5px] text-white">{t.unread}</span>
                )}
              </div>
              <p className="mt-0.5 truncate text-[10px] text-ink-muted">{t.msg}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="max-w-[75%] rounded-lg rounded-bl-sm bg-ink-raised px-2.5 py-1.5 text-[10.5px] leading-4 text-ink-text">
            Is the Beach Isle unit still available? Budget up to 5M if the view is right.
          </div>
          <div className="mt-auto rounded-lg border-l-2 border-gold-400 bg-ink-bg p-2.5">
            <div className="flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-gold-400" strokeWidth={1.75} />
              <span className="text-[9px] font-semibold text-ink-text">AI draft — pending approval</span>
              <span className="ml-auto font-mono text-[8.5px] text-gold-400">87%</span>
            </div>
            <p className="mt-1 text-[10px] leading-4 text-ink-muted">
              Hi Arjun — yes, #2201 is available at AED 3.6M. Thursday 4pm viewing?
            </p>
            <div className="mt-1.5 flex gap-1">
              <span className="rounded bg-palm-600 px-1.5 py-0.5 text-[8.5px] font-semibold text-white">Approve &amp; send</span>
              <span className="rounded border border-ink-line px-1.5 py-0.5 text-[8.5px] text-ink-muted">Edit</span>
              <span className="rounded px-1.5 py-0.5 text-[8.5px] text-red-600">Reject</span>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  )
}

function CrmPanel() {
  return (
    <PanelShell label="apex.os/relationships/dmitri-volkov">
      <div className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9EDF0] text-[11px] font-semibold text-[#5B6B7A]">
            DV
          </span>
          <div>
            <p className="text-[13px] font-semibold text-ink-text">Dmitri Volkov</p>
            <p className="text-[10px] text-ink-muted">Buyer · Investor (RU) · AED 8–12M · Referral</p>
          </div>
          <span className="ml-auto rounded-full bg-palm-100/10 px-2 py-0.5 text-[9px] font-semibold text-palm-400 ring-1 ring-palm-400/30">
            Viewing Completed
          </span>
        </div>

        <div className="rounded-[10px] bg-gold-100/10 p-3 ring-1 ring-gold-400/20">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-gold-400" strokeWidth={1.75} />
            <span className="text-[10px] font-semibold text-ink-text">AI summary</span>
            <span className="ml-auto font-mono text-[9px] text-gold-400">92% confidence</span>
          </div>
          <ul className="mt-2 space-y-1 text-[10.5px] leading-4 text-ink-muted">
            <li>· Viewed Signature Villa (Frond N) twice; considering below-ask at AED 18.5M</li>
            <li>· Prefers RU communication; decision with partner this week</li>
            <li>· Proof of funds received 2 days ago — verified</li>
          </ul>
          <div className="mt-2 flex gap-1.5">
            {['WhatsApp · 6 msgs', 'Viewing notes', 'Property DB'].map((s) => (
              <span key={s} className="rounded-full bg-ink-raised px-2 py-0.5 text-[9px] text-ink-muted ring-1 ring-ink-line">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-[10px] border border-ink-line bg-ink-bg p-2.5">
          <img
            src="/prop-signature-villa.jpg"
            alt="Signature Villa, Frond N"
            loading="lazy"
            className="h-12 w-16 rounded-md object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-ink-text">Signature Villa, Frond N</p>
            <p className="text-[9.5px] text-ink-muted">Palm Jumeirah · 5BR · 7,200 sqft</p>
          </div>
          <span className="ml-auto font-mono text-[10.5px] text-ink-text">AED 28.0M</span>
        </div>

        <div className="space-y-1.5 border-l border-ink-line pl-3">
          {[
            ['Viewing completed — interest 8/10', '1d ago'],
            ['AI extracted budget update: 8–12M', '1d ago'],
            ['Call logged by Layla (14m)', '2d ago'],
          ].map(([t, when]) => (
            <div key={t} className="flex items-center gap-2 text-[10px]">
              <span className="h-1 w-1 shrink-0 rounded-full bg-palm-400" />
              <span className="truncate text-ink-muted">{t}</span>
              <span className="ml-auto shrink-0 font-mono text-[9px] text-ink-400">{when}</span>
            </div>
          ))}
        </div>
      </div>
    </PanelShell>
  )
}

function KanbanPanel() {
  const cols = [
    {
      stage: 'Offer Made', dot: 'bg-amber-600', sum: 'AED 2.05M', cards: [
        { name: 'Rajesh Kapoor', prop: 'JVC investor unit', value: 'AED 2.05M', days: 12, risk: true },
      ],
    },
    {
      stage: 'Negotiation', dot: 'bg-gold-500', sum: 'AED 10.8M', cards: [
        { name: 'Ahmed Al Rashid', prop: 'Golf Place Villa 17', value: 'AED 10.8M', days: 6, risk: false },
      ],
    },
    {
      stage: 'MOU Signed', dot: 'bg-palm-400', sum: 'AED 9.6M', cards: [
        { name: 'Zhang Wei', prop: 'Address Residences PH', value: 'AED 9.6M', days: 2, risk: false },
      ],
    },
  ]
  return (
    <PanelShell label="apex.os/deals">
      <div className="grid h-full grid-cols-3 gap-2.5 p-3">
        {cols.map((c) => (
          <div key={c.stage} className="flex flex-col rounded-[10px] bg-ink-bg p-2 ring-1 ring-ink-line">
            <div className="flex items-center gap-1.5 px-1 pb-2">
              <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
              <span className="text-[9.5px] font-semibold text-ink-text">{c.stage}</span>
              <span className="ml-auto font-mono text-[8.5px] text-ink-muted">{c.sum}</span>
            </div>
            {c.cards.map((card) => (
              <div
                key={card.name}
                className={cn(
                  'rounded-lg border border-ink-line bg-ink-surface p-2.5',
                  card.risk && 'border-l-2 border-l-red-600',
                )}
              >
                <div className="flex items-center gap-1">
                  <p className="text-[10.5px] font-semibold text-ink-text">{card.name}</p>
                  {card.risk && <AlertTriangle className="h-2.5 w-2.5 text-red-600" strokeWidth={1.75} />}
                </div>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-ink-muted">
                  <Building2 className="h-2.5 w-2.5 shrink-0" strokeWidth={1.75} />
                  {card.prop}
                </p>
                <p className="tnum mt-1.5 font-mono text-[10.5px] text-ink-text">{card.value}</p>
                <div className="mt-1.5 flex items-center gap-1">
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 font-mono text-[8.5px]',
                      card.days > 7 ? 'bg-red-600/15 text-red-600' : 'bg-ink-raised text-ink-muted',
                    )}
                  >
                    {card.days}d in stage
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PanelShell>
  )
}

function MatchingPanel() {
  const matches = [
    { img: '/prop-beach-isle.jpg', name: 'Beach Isle Tower 1, #2201', score: 92, why: 'Sea view · AED 3.6M in band · 2BR' },
    { img: '/prop-marina-gate.jpg', name: 'Marina Gate Tower 2, #1804', score: 88, why: 'Marina skyline · high floor · 2BR' },
    { img: '/prop-bluewaters.jpg', name: 'Bluewaters Residences 5, #903', score: 85, why: 'Ain Dubai view · 3BA layout' },
  ]
  return (
    <PanelShell label="apex.os/matching — Arjun Mehta">
      <div className="flex h-full flex-col gap-2.5 p-4">
        <div className="flex items-center gap-2 text-[10px] text-ink-muted">
          <MapPin className="h-3 w-3" strokeWidth={1.75} />
          Marina / Beachfront · AED 4–6M
          <BedDouble className="ml-2 h-3 w-3" strokeWidth={1.75} /> 2BR+
          <Clock className="ml-2 h-3 w-3" strokeWidth={1.75} /> Ready
        </div>
        {matches.map((m, i) => (
          <div key={m.name} className="flex items-center gap-3 rounded-[10px] border border-ink-line bg-ink-bg p-2.5">
            <span className="font-mono text-[10px] text-ink-400">#{i + 1}</span>
            <img src={m.img} alt={m.name} loading="lazy" className="h-11 w-14 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-ink-text">{m.name}</p>
              <p className="truncate text-[9.5px] text-ink-muted">{m.why}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink-raised">
                <div
                  className={cn('h-full rounded-full', i === 0 ? 'bg-gold-400' : 'bg-palm-400')}
                  style={{ width: `${m.score}%` }}
                />
              </div>
            </div>
            <span className="tnum font-mono text-[13px] font-medium text-ink-text">{m.score}</span>
          </div>
        ))}
        <p className="mt-auto flex items-center gap-1.5 text-[9.5px] text-ink-muted">
          <Sparkles className="h-2.5 w-2.5 text-gold-400" strokeWidth={1.75} />
          Scores recompute live as inventory and requirements change
        </p>
      </div>
    </PanelShell>
  )
}

/* ---------- pinned showcase section ---------- */

const features = [
  {
    num: '01',
    title: 'Unified Inbox',
    body: 'Every WhatsApp and email, one queue. SLA timers keep first response under 10 minutes. AI drafts the reply — you approve.',
    panel: <InboxPanel />,
  },
  {
    num: '02',
    title: 'Self-updating CRM',
    body: 'Calls, messages, and viewing outcomes write themselves back to the record. Confidence and sources on every extraction.',
    panel: <CrmPanel />,
  },
  {
    num: '03',
    title: 'Deal Flow that thinks ahead',
    body: 'Thirteen Dubai-ready stages from New Inquiry to Handover. Stuck deals surface before they die.',
    panel: <KanbanPanel />,
  },
  {
    num: '04',
    title: 'Matching that explains itself',
    body: 'Buyer requirements meet live inventory. Every match shows its score — and why.',
    panel: <MatchingPanel />,
  },
]

/** S4 — Pinned product showcase (~200vh): scroll progress drives 4 feature states. */
export default function Showcase() {
  const root = useRef<HTMLElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: '+=2200',
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(3, Math.floor(self.progress * 4))
            setActive((prev) => (prev === idx ? prev : idx))
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleY(${self.progress})`
            }
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="product" aria-label="Product showcase" className="relative">
      <div className="mx-auto flex min-h-[100dvh] max-w-container flex-col justify-center px-6 py-24">
        <div className="mb-14 max-w-[560px]" data-reveal>
          <p className="text-micro font-semibold uppercase tracking-[0.16em] text-gold-400">The workspace</p>
          <h2 className="mt-4 font-display text-[34px] font-medium leading-[1.06] tracking-[-0.015em] text-ink-text md:text-[48px]">
            One system, from first <span className="italic text-gold-400">hello</span> to handover.
          </h2>
        </div>

        {/* desktop: pinned rail + stage */}
        <div className="hidden items-center gap-16 lg:flex">
          <div className="relative w-[380px] shrink-0 pl-8">
            {/* progress track */}
            <div className="absolute left-0 top-1 h-[calc(100%-8px)] w-[2px] overflow-hidden rounded-full bg-ink-line">
              <div
                ref={fillRef}
                className="h-full w-full origin-top rounded-full bg-gold-400"
                style={{ transform: 'scaleY(0)' }}
              />
            </div>
            <div className="space-y-10">
              {features.map((f, i) => (
                <button
                  key={f.num}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    'block w-full text-left transition-all duration-300',
                    i === active ? 'translate-x-2 opacity-100' : 'opacity-40 hover:opacity-70',
                  )}
                >
                  <span className="font-mono text-[12px] font-medium text-gold-400">{f.num}</span>
                  <h3 className="mt-1 text-[16px] font-semibold leading-6 text-ink-text">{f.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[22px] text-ink-muted">{f.body}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[480px] w-[640px] shrink-0 xl:h-[520px]">
            {features.map((f, i) => (
              <div
                key={f.num}
                className={cn(
                  'absolute inset-0 transition-all duration-450 ease-out',
                  i === active
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-5 opacity-0',
                )}
                aria-hidden={i !== active}
              >
                {f.panel}
              </div>
            ))}
          </div>
        </div>

        {/* mobile / tablet: stacked static */}
        <div className="space-y-14 lg:hidden">
          {features.map((f) => (
            <div key={f.num} data-reveal>
              <span className="font-mono text-[12px] font-medium text-gold-400">{f.num}</span>
              <h3 className="mt-1 text-[16px] font-semibold text-ink-text">{f.title}</h3>
              <p className="mt-1.5 max-w-[52ch] text-[14px] leading-[22px] text-ink-muted">{f.body}</p>
              <div className="mt-5 h-[420px]">{f.panel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
