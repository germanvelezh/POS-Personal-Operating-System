import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

type BadgeProps = {
  children: ReactNode;
  dot?: boolean;
  tone?: BadgeTone;
};

export function Badge({ children, dot = false, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot ? <i aria-hidden="true" className="badge-dot" /> : null}
      {children}
    </span>
  );
}
