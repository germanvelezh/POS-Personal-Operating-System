type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
};

export function MetricCard({
  label,
  value,
  detail,
  tone = 'neutral'
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}
