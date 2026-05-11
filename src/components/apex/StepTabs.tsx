interface StepTabsProps {
  step: 1 | 2 | 3 | 4;
}

const TABS = [
  { idx: 1, label: "Profile" },
  { idx: 2, label: "Intent" },
  { idx: 3, label: "Authority" },
  { idx: 4, label: "Confirmed" },
] as const;

export function StepTabs({ step }: StepTabsProps) {
  return (
    <nav className="apex-tabs" aria-label="Application steps">
      {TABS.map((t) => {
        const active = t.idx === step;
        const done = t.idx < step;
        return (
          <div
            key={t.idx}
            className={`apex-tab ${active ? "apex-tab--active" : ""} ${
              done ? "apex-tab--done" : ""
            }`}
          >
            <span className="apex-tab__index">
              {String(t.idx).padStart(2, "0")}
            </span>
            <span className="apex-tab__label">{t.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
