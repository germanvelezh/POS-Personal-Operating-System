import { handleEntityItemApiRequest } from '../../src/entities/vercelApi.js';

export default function handler(request: Parameters<typeof handleEntityItemApiRequest>[1], response: Parameters<typeof handleEntityItemApiRequest>[2]) {
  return handleEntityItemApiRequest('clients', request, response);
}
