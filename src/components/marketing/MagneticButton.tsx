"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  label: string;
  variant?: "gold" | "ghost";
  className?: string;
};

export default function MagneticButton({
  href,
  label,
  variant = "gold",
  className,
}: MagneticButtonProps) {
  const magnetic = useMagnetic(16);

  return (
    <div
      ref={magnetic.ref}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      className="transition-transform duration-300 ease-out"
      data-cursor="interactive"
    >
      <Button
        asChild
        className={cn(
          "group h-12 rounded-[2px] px-7 text-[11px] font-medium tracking-[0.22em] uppercase transition-all duration-300",
          variant === "gold"
            ? "border border-gold/60 bg-gradient-to-b from-[#dbc289] to-gold text-void shadow-[0_10px_30px_rgba(200,169,110,0.32)] hover:scale-[1.02] hover:shadow-[0_16px_42px_rgba(200,169,110,0.42)]"
            : "border border-white/20 bg-white/[0.02] text-warm-white hover:border-gold/60 hover:bg-gold/[0.08]",
          className,
        )}
      >
        <Link href={href}>
          <span className="inline-flex items-center gap-2">
            {label}
            <ArrowUpRight className="size-3.5 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
      </Button>
    </div>
  );
}
