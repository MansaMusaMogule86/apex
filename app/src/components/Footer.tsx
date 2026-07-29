import { Link } from 'react-router'
import Logo from '@/components/Logo'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Command', to: '/command' },
      { label: 'Inbox', to: '/inbox' },
      { label: 'Deal Flow', to: '/deals' },
      { label: 'Matching', to: '/properties' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/' },
      { label: 'Terms', to: '/' },
      { label: 'DIFC Data Compliance', to: '/' },
    ],
  },
]

/** Landing footer — S9. Dark ink, hairline top, 4 columns + bottom row. */
export default function Footer() {
  return (
    <footer className="border-t border-ink-line bg-ink-bg text-ink-muted">
      <div className="mx-auto max-w-container px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo className="text-ink-text" />
            <p className="mt-4 max-w-[26ch] text-[13px] leading-5">
              The revenue OS for Dubai real estate.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-micro font-semibold uppercase tracking-[0.07em] text-ink-400">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="underline-sweep text-[13.5px] transition-colors duration-180 hover:text-ink-text"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-line pt-6 text-[12.5px] sm:flex-row sm:items-center">
          <p>© 2025 APEX Revenue OS FZ-LLC · Dubai, UAE</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-palm-400 animate-pulse-dot" />
              All systems operational
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-line px-2.5 py-1 font-mono text-[11px]">
              <span className="text-ink-text">EN</span>
              <span className="text-ink-400">/</span>
              <span className="cursor-pointer transition-colors hover:text-ink-text">AR</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
