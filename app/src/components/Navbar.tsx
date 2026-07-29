import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'

const links = [
  { label: 'Product', href: '#product' },
  { label: 'Why Dubai', href: '#why-dubai' },
  { label: 'AI', href: '#ai' },
  { label: 'Pricing', href: '#pricing' },
]

/**
 * Landing-page navbar — dark ink, sticky top-0 z-50 (normal flow; no offset
 * bookkeeping needed in pages). Hairline bottom border appears after 24px scroll.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-16 animate-nav-drop border-b bg-ink-bg/80 backdrop-blur-[12px] transition-colors duration-200',
        scrolled ? 'border-ink-line' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        <Link to="/" className="text-ink-text" aria-label="APEX Revenue OS home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              className="underline-sweep text-[13.5px] font-medium text-ink-muted transition-colors duration-180 hover:text-ink-text"
              style={{ animationDelay: `${300 + i * 50}ms` }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="hidden rounded-lg px-4 py-2 text-[13.5px] font-medium text-ink-text transition-colors duration-140 hover:bg-ink-surface sm:block"
          >
            Book a demo
          </a>
          <Link
            to="/login"
            className="rounded-lg bg-palm-600 px-4 py-2 text-[13.5px] font-semibold text-white shadow-e1 transition-all duration-140 hover:-translate-y-px hover:bg-palm-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  )
}
