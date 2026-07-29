import type { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/**
 * Landing layout — children pattern (App.tsx: `<Layout><Home/></Layout>`).
 * Navbar is sticky in normal flow, so no page needs nav-offset bookkeeping.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-ink-bg text-ink-text">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
