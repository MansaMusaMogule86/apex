import { Building2, FileCheck2, Languages } from 'lucide-react'

const cards = [
  {
    icon: Building2,
    title: 'Portal-native leads',
    body: 'Property Finder, Bayut, and Dubizzle inquiries land in your inbox in seconds, deduplicated and enriched.',
  },
  {
    icon: FileCheck2,
    title: 'Dubai paperwork, tracked',
    body: 'Form A, Form F, MOU, SPA, NOC — every document type DLD transactions actually need, with expiry alerts.',
  },
  {
    icon: Languages,
    title: 'Multilingual by default',
    body: "EN, AR, RU, HI, ZH. AI drafts in your client's language, with RTL threads rendered correctly.",
  },
]

/** S7 — Built for Dubai: 3 value cards. */
export default function Dubai() {
  return (
    <section id="why-dubai" aria-label="Built for Dubai" className="py-24">
      <div className="mx-auto max-w-container px-6">
        <div className="max-w-[560px]">
          <h2
            className="font-display text-[34px] font-medium leading-[1.06] tracking-[-0.015em] text-ink-text md:text-[48px]"
            data-reveal
          >
            Speaks Dubai <span className="italic text-gold-400">fluently</span>.
          </h2>
          <p className="mt-4 text-[17px] leading-7 text-ink-muted" data-reveal>
            Portals, communities, currencies, and paperwork — native, not bolted on.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              data-reveal
              className="group rounded-[10px] border border-ink-line bg-ink-surface p-6 transition-all duration-180 hover:-translate-y-1 hover:shadow-e2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-ink-raised transition-transform duration-180 group-hover:-rotate-6">
                <c.icon className="h-5 w-5 text-palm-400" strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-[16px] font-semibold leading-6 text-ink-text">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-[22px] text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
