import { randomBytes } from 'node:crypto';

const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export type EntityIdOptions = {
  now?: () => Date;
  randomSuffix?: () => string;
};

function formatDateStamp(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '');
}

function createRandomSuffix() {
  return Array.from(randomBytes(4))
    .map((byte) => ID_ALPHABET[byte % ID_ALPHABET.length])
    .join('');
}

export function createEntityId(prefix: string, options: EntityIdOptions = {}) {
  const now = options.now?.() ?? new Date();
  const suffix = (options.randomSuffix?.() ?? createRandomSuffix())
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(4, '0')
    .slice(0, 4);

  return `${prefix}-${formatDateStamp(now)}-${suffix}`;
}
