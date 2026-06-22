import { createHealthPayload } from '../routes/health.js';

describe('health payload', () => {
  it('returns the local server health contract', () => {
    expect(createHealthPayload('local-express')).toMatchObject({
      status: 'ok',
      service: 'startup-os',
      target: 'local-express',
      phase: '0'
    });
    expect(createHealthPayload('local-express').timestamp).toEqual(expect.any(String));
  });
});
