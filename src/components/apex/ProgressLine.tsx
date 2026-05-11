interface ProgressLineProps {
  step: 1 | 2 | 3 | 4;
}

const NODES: Array<{ label: string; index: 1 | 2 | 3 | 4 }> = [
  { label: "01", index: 1 },
  { label: "02", index: 2 },
  { label: "03", index: 3 },
  { label: "✓", index: 4 },
];

export function ProgressLine({ step }: ProgressLineProps) {
  return (
    <div className="apex-progress" aria-label="Progress">
      {NODES.map((node, i) => {
        const state =
          node.index < step ? "done" : node.index === step ? "active" : "pending";
        return (
          <div key={node.label} className="apex-progress__node-wrap">
            <div className={`apex-progress__node apex-progress__node--${state}`}>
              {node.label}
            </div>
            {i < NODES.length - 1 && (
              <div
                className={`apex-progress__line apex-progress__line--${
                  node.index < step ? "done" : "pending"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
