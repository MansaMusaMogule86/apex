const names = [
  'Harbor & Co',
  'Palm Gate Realty',
  'Marina Crest',
  'Emirates Key',
  'Oasis Homes',
  'Falcon Estates',
  'Bluewater Partners',
  'Skyline Properties',
]

/** S3 — Social proof marquee strip (28s linear, pause on hover, masked edges). */
export default function ProofStrip() {
  return (
    <section aria-label="Trusted by" className="pt-20" data-reveal>
      <div className="flex h-[72px] items-center border-y border-ink-line">
        <div className="mx-auto flex w-full max-w-container items-center gap-10 px-6">
          <p className="hidden shrink-0 text-micro font-semibold uppercase tracking-[0.12em] text-ink-muted md:block">
            Trusted by Dubai brokerage teams
          </p>
          <div className="marquee-mask marquee-pause relative flex-1 overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-14 pr-14">
              {[...names, ...names].map((n, i) => (
                <span
                  key={i}
                  className="whitespace-nowrap text-[15px] font-semibold text-ink-muted/70 transition-colors duration-180 hover:text-ink-text"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
