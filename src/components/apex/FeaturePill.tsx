interface FeaturePillProps {
  label: string;
}

export function FeaturePill({ label }: FeaturePillProps) {
  return <span className="apex-pill">{label}</span>;
}
