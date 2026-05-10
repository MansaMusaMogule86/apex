"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagneticButton from "@/components/marketing/MagneticButton";

const ITEMS = [
  { href: "#services", label: "Services" },
  { href: "#ai-suite", label: "AI Suite" },
  { href: "#work", label: "Work" },
  { href: "/founder-authority", label: "Founder" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto mt-3 flex max-w-350 items-center justify-between px-3 transition-all duration-500 md:px-6">
        <div
          className={`flex h-14 w-full items-center justify-between rounded-[2px] border px-3 transition-all duration-500 md:h-16 md:px-6 ${
            scrolled ? "border-white/20 bg-black/65 backdrop-blur-xl" : "border-white/10 bg-black/25 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="font-display text-xl tracking-[0.32em] text-warm-white md:text-2xl" data-cursor="interactive">
            AP<span className="text-gold">EX</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative text-[11px] uppercase tracking-[0.2em] text-titanium transition-colors duration-300 hover:text-platinum"
                data-cursor="interactive"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal-blue transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <MagneticButton href="/private-access" label="Request Access" className="h-10 px-5 text-[10px]" />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a
              href="/private-access"
              className="rounded-[2px] border border-gold/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              data-cursor="interactive"
            >
              Access
            </a>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 text-platinum"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 flex h-full w-[88%] max-w-[360px] flex-col border-l border-white/15 bg-obsidian pb-[env(safe-area-inset-bottom)]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <span className="font-display text-xl tracking-[0.32em] text-warm-white">
                  AP<span className="text-gold">EX</span>
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 text-titanium"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
                {ITEMS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[2px] border border-transparent px-4 py-4 font-display text-2xl text-warm-white transition-colors hover:border-signal-blue/25 hover:bg-white/[0.03]"
                  >
                    {item.label}
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">→</span>
                  </a>
                ))}
              </nav>
              <div className="border-t border-white/10 px-5 py-5">
                <a
                  href="/private-access"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-[2px] border border-gold/40 bg-gold/[0.08] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-gold"
                >
                  Request Access
                </a>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
