import { afterEach, describe, expect, it, vi } from 'vitest';

import { updateEntityRecord } from '../services/entities';

describe('entity services', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('includes the HTTP status when an entity update fails without JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('<h1>Not found</h1>', { status: 404, statusText: 'Not Found' }))
    );

    await expect(updateEntityRecord('clients', 'CLI-OLD', { nombre: 'Cliente viejo' }))
      .rejects.toThrow('No se pudo completar la operación. HTTP 404 Not Found');
  });
});
