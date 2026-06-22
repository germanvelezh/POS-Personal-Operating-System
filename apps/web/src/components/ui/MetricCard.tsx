import type { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  icon?: LucideIcon;
  label: string;
  detail: string;
  trend?: 'up' | 'down' | 'flat';
  tone?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
  value: string;
};

export function MetricCard({
  icon: Icon,
  label,
  detail,
  tone = 'neutral',
  trend = 'flat',
  value
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-card-header">
        {Icon ? (
          <span className="metric-icon" aria-hidden="true">
            <Icon size={17} strokeWidth={2} />
          </span>
        ) : null}
        <p>{label}</p>
      </div>
      <strong>{value}</strong>
      <span className={`metric-detail metric-trend-${trend}`}>{detail}</span>
    </article>
  );
}
