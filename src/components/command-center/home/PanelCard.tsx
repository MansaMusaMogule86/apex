import { cn } from "@/lib/utils";

type PanelCardProps = {
  title: string;
  subtitle?: string;
  decisionTie?: string;
  children: React.ReactNode;
  className?: string;
};

export default function PanelCard({ title, subtitle, decisionTie, children, className }: PanelCardProps) {
  return (
    <section className={cn("rounded-[2px] border border-white/10 bg-white/[0.03] p-4 md:p-5", className)}>
      <header className="mb-4 space-y-1.5 border-b border-gold/10 pb-3">
        <p className="font-display text-2xl leading-tight text-warm-white md:text-3xl">{title}</p>
        {subtitle ? <p className="text-xs uppercase tracking-[0.18em] text-mist">{subtitle}</p> : null}
        {decisionTie ? (
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light">Decision: {decisionTie}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
