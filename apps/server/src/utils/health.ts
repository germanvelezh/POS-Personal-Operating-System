export type HealthPayload = {
  status: 'ok';
  service: 'startup-os';
  target: 'local-express' | 'vercel-function';
  phase: '0';
  timestamp: string;
};

export function createHealthPayload(
  target: HealthPayload['target'],
  now: Date = new Date()
): HealthPayload {
  return {
    status: 'ok',
    service: 'startup-os',
    target,
    phase: '0',
    timestamp: now.toISOString()
  };
}
