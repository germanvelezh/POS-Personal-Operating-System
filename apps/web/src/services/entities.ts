export type EntityKey =
  | 'clients'
  | 'ideas'
  | 'projects'
  | 'tasks'
  | 'opportunities'
  | 'invoices';

export type EntityRecord = Record<string, string | number | boolean | null | undefined>;

export type EntityListResponse = {
  entity: EntityKey;
  records: EntityRecord[];
};

export type EntityItemResponse = {
  entity: EntityKey;
  record: EntityRecord;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : 'No se pudo completar la operación.';

    throw new Error(message);
  }

  return payload as T;
}

export async function fetchEntityRecords(entity: EntityKey): Promise<EntityRecord[]> {
  const response = await fetch(`/api/${entity}`, {
    credentials: 'include'
  });
  const payload = await parseJsonResponse<EntityListResponse>(response);

  return payload.records;
}

export async function createEntityRecord(entity: EntityKey, record: EntityRecord) {
  const response = await fetch(`/api/${entity}`, {
    body: JSON.stringify(record),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  });
  const payload = await parseJsonResponse<EntityItemResponse>(response);

  return payload.record;
}

export async function updateEntityRecord(
  entity: EntityKey,
  id: string,
  record: EntityRecord
) {
  const response = await fetch(`/api/${entity}/${id}`, {
    body: JSON.stringify(record),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'PUT'
  });
  const payload = await parseJsonResponse<EntityItemResponse>(response);

  return payload.record;
}

export async function deleteEntityRecord(entity: EntityKey, id: string) {
  const response = await fetch(`/api/${entity}/${id}`, {
    credentials: 'include',
    method: 'DELETE'
  });
  const payload = await parseJsonResponse<EntityItemResponse>(response);

  return payload.record;
}
