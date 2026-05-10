const FOOTER_LINKS = ["Services", "AI Suite", "Work", "Clients", "Privacy"];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto grid max-w-[1340px] gap-8 px-4 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl tracking-[0.28em] text-warm-white">
            AP<span className="text-gold">EX</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-titanium">
            Private AI intelligence platform for luxury operators, family offices, and influence-led ventures.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-beige/90 md:justify-self-center">
          {FOOTER_LINKS.map((item) => (
            <a
              key={item}
              href={item === "Privacy" ? "/privacy" : `#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="transition-colors duration-300 hover:text-gold"
              data-cursor="interactive"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="text-sm leading-7 text-titanium md:justify-self-end md:text-right">
          <p>Dubai, United Arab Emirates</p>
          <p>Private Concierge: access@apex.intelligence</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">Socials: IG / X / LinkedIn</p>
        </div>
      </div>
    </footer>
  );
}
