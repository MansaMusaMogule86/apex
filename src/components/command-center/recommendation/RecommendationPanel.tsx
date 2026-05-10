import type { ReactNode } from "react";

type RecommendationPanelProps = {
  title: string;
  eyebrow?: string;
  rightNode?: ReactNode;
  children: ReactNode;
};

export default function RecommendationPanel({ title, eyebrow, rightNode, children }: RecommendationPanelProps) {
  return (
    <section className="rounded-xs border border-white/10 bg-linear-to-b from-white/4 to-white/1 p-3 md:p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          {eyebrow ? <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70">{eyebrow}</p> : null}
          <h3 className="font-display text-xl font-light text-warm-white md:text-2xl">{title}</h3>
        </div>
        {rightNode}
      </header>
      {children}
    </section>
  );
}
