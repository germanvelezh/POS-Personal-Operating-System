import {
  entityConfigs,
  entitySchemas,
  type EntityKey
} from '../schemas/entities.js';
import {
  SheetEntityRepository,
  type RepositoryRuntimeOptions,
  type SheetsTableGateway
} from './sheetsRepository.js';

export type { RepositoryRuntimeOptions, SheetsTableGateway } from './sheetsRepository.js';

export type EntityRepositories = {
  [TKey in EntityKey]: SheetEntityRepository<TKey>;
};

const entityKeys = [
  'clients',
  'contacts',
  'ideas',
  'needs',
  'research',
  'validations',
  'opportunities',
  'proposals',
  'contracts',
  'projects',
  'milestones',
  'tasks',
  'invoices',
  'payments',
  'results',
  'learnings',
  'documents',
  'relations',
  'configuration',
  'activityLog'
] as const satisfies EntityKey[];

export function createEntityRepositories(
  gateway: SheetsTableGateway,
  options: RepositoryRuntimeOptions = {}
): EntityRepositories {
  return Object.fromEntries(
    entityKeys.map((key) => [
      key,
      new SheetEntityRepository(
        gateway,
        key,
        entityConfigs[key],
        entitySchemas[key],
        options
      )
    ])
  ) as EntityRepositories;
}
