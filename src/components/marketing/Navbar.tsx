"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto mt-3 flex max-w-350 items-center justify-between px-3 transition-all duration-500 md:px-6">
        <div
          className={`flex h-16 w-full items-center justify-between rounded-[2px] border px-4 transition-all duration-500 md:px-6 ${
            scrolled ? "border-gold/30 bg-black/60 backdrop-blur-xl" : "border-white/10 bg-black/20 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="font-display text-2xl tracking-[0.32em] text-warm-white" data-cursor="interactive">
            AP<span className="text-gold">EX</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative text-[11px] uppercase tracking-[0.2em] text-titanium transition-colors duration-300 hover:text-warm-white"
                data-cursor="interactive"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <MagneticButton href="/private-access" label="Request Access" className="h-10 px-5 text-[10px]" />
          </div>

          <a
            href="/private-access"
            className="rounded-[2px] border border-gold/40 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold lg:hidden"
            data-cursor="interactive"
          >
            Access
          </a>
        </div>
      </div>
    </motion.header>
  );
}
