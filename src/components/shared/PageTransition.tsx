"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const SILK = [0.16, 1, 0.3, 1] as const;

type PageTransitionProps = {
  children: ReactNode;
  /** Optional override key (defaults to pathname) */
  routeKey?: string;
};

export default function PageTransition({
  children,
  routeKey,
}: PageTransitionProps) {
  const pathname = usePathname();
  const key = routeKey ?? pathname ?? "page";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.6, ease: SILK }}
        className="relative"
      >
        {/* Gold sweep curtain on enter */}
        <motion.span
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gold/40"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.9, ease: SILK }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
