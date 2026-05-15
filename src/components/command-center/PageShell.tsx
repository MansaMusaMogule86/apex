"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { getPageTitle, getPageDescription } from "@/components/command-center/config";
import { COMMAND_EASE } from "@/components/command-center/motion";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function PageShell({ children, className = "", fullWidth = false }: PageShellProps) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const description = getPageDescription(pathname);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: COMMAND_EASE }}
      className={fullWidth ? className : `mx-auto max-w-7xl ${className}`}
    >
      {/* Page Header */}
      <header className="mb-6 rounded-sm border border-gold/10 bg-linear-to-r from-gold/7 to-transparent px-5 py-5">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">
            APEX Command Center
          </p>
          <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-titanium">
            {description}
          </p>
        </div>
      </header>

      {/* Page Content */}
      <main>{children}</main>
    </motion.div>
  );
}
