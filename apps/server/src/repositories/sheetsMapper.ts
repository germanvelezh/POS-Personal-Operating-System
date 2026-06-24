export function rowToRecord(headers: string[], values: string[]) {
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
}

function serializeCell(value: unknown) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }

  return String(value);
}

export function recordToRow(headers: string[], record: Record<string, unknown>) {
  return headers.map((header) => serializeCell(record[header]));
}
