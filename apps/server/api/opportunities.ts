import { handleEntityCollectionApiRequest } from '../src/entities/vercelApi.js';

export default function handler(request: Parameters<typeof handleEntityCollectionApiRequest>[1], response: Parameters<typeof handleEntityCollectionApiRequest>[2]) {
  return handleEntityCollectionApiRequest('opportunities', request, response);
}
