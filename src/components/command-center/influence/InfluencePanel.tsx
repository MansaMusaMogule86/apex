type InfluencePanelProps = {
  title: string;
  subtitle: string;
  decisionTie?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export default function InfluencePanel({ title, subtitle, decisionTie, rightSlot, children }: InfluencePanelProps) {
  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4 md:p-5">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold/70">{subtitle}</p>
          <h3 className="font-display text-lg font-light tracking-tight text-warm-white md:text-xl">{title}</h3>
          {decisionTie ? <p className="text-xs text-titanium">Decision: {decisionTie}</p> : null}
        </div>
        {rightSlot}
      </header>
      {children}
    </section>
  );
}
