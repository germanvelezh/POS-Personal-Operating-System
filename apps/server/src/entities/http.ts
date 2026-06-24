import { ZodError } from 'zod';

import { getGoogleAuthConfig, type GoogleAuthConfig } from '../auth/config.js';
import { getSessionFromCookieHeader, type AuthSession } from '../auth/session.js';
import type { EntityRepositories } from '../repositories/entityRepositories.js';
import { createGoogleEntityRepositories } from './googleContext.js';
import {
  entityRouteConfigs,
  isEntityRouteKey,
  type EntityRouteKey
} from './config.js';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;
type QueryValue = string | string[] | undefined;

export type EntityJsonResponse = {
  body: unknown;
  status: number;
};

export type EntityRepositoriesFactory = (
  session: AuthSession,
  config: GoogleAuthConfig,
  source: EnvSource
) => Promise<EntityRepositories>;

type EntityRequestContext = {
  body?: unknown;
  cookieHeader: string | undefined;
  entity: string;
  method: string | undefined;
  query?: Record<string, QueryValue>;
  repositoriesFactory?: EntityRepositoriesFactory;
  source?: EnvSource;
};

type EntityItemRequestContext = EntityRequestContext & {
  id: string | undefined;
};

type ResolvedRepositories =
  | {
      error: EntityJsonResponse;
    }
  | {
      repositories: EntityRepositories;
      session: AuthSession;
    };

type PreparedCreatePayload =
  | {
      error: EntityJsonResponse;
    }
  | {
      payload: Record<string, unknown>;
    };

function singleQueryValue(value: QueryValue) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeText(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function jsonError(status: number, error: string, message: string): EntityJsonResponse {
  return {
    body: { error, message },
    status
  };
}

async function resolveRepositories({
  cookieHeader,
  repositoriesFactory = createGoogleEntityRepositories,
  source = process.env
}: Pick<
  EntityRequestContext,
  'cookieHeader' | 'repositoriesFactory' | 'source'
>): Promise<ResolvedRepositories> {
  let config: GoogleAuthConfig;

  try {
    config = getGoogleAuthConfig(source);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      error: jsonError(
        503,
        'google_not_configured',
        'Configura Google OAuth antes de usar el CRUD.'
      )
    };
  }

  const session = getSessionFromCookieHeader(cookieHeader, config);

  if (!session || session.email.toLowerCase() !== config.allowedGoogleEmail) {
    return {
      error: jsonError(401, 'google_not_connected', 'Conecta Google antes de usar el CRUD.')
    };
  }

  return {
    repositories: await repositoriesFactory(session, config, source),
    session
  };
}

function getEntityConfig(entity: string) {
  if (!isEntityRouteKey(entity)) {
    return null;
  }

  return entityRouteConfigs[entity];
}

function filterRecords(
  entity: EntityRouteKey,
  records: Array<Record<string, unknown>>,
  query: Record<string, QueryValue> = {}
) {
  const config = entityRouteConfigs[entity];
  const search = normalizeText(singleQueryValue(query.search));
  const status = singleQueryValue(query.status);

  return records.filter((record) => {
    const matchesStatus = !status || String(record[config.statusField] ?? '') === status;
    const matchesSearch =
      !search ||
      config.searchFields.some((field) => normalizeText(record[field]).includes(search));

    return matchesStatus && matchesSearch;
  });
}

async function getInternalClientId(repositories: EntityRepositories) {
  const config = await repositories.configuration.get('CLIENTE_INTERNO_ID');
  const value = String(config.valor ?? '').trim();

  if (!value) {
    throw new Error('No se encontró CLIENTE_INTERNO_ID. Ejecuta Inicializar sistema.');
  }

  return value;
}

async function prepareCreatePayload(
  entity: EntityRouteKey,
  body: unknown,
  repositories: EntityRepositories
): Promise<PreparedCreatePayload> {
  const config = entityRouteConfigs[entity];
  const payload = {
    ...config.defaults,
    ...asRecord(body)
  };

  if (config.internalClientFallback && !payload.cliente_id) {
    payload.cliente_id = await getInternalClientId(repositories);
  }

  for (const field of config.requiredCreateFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      return {
        error: jsonError(400, 'missing_required_field', `Falta el campo requerido: ${field}.`)
      };
    }
  }

  return { payload };
}

function handleEntityError(error: unknown) {
  if (error instanceof ZodError) {
    return {
      body: {
        details: error.issues,
        error: 'validation_failed',
        message: 'La entidad no cumple el schema requerido.'
      },
      status: 400
    };
  }

  const message = error instanceof Error ? error.message : 'No se pudo procesar la entidad.';

  if (message.includes('not found')) {
    return jsonError(404, 'record_not_found', message);
  }

  return jsonError(500, 'entity_operation_failed', message);
}

export async function buildEntityCollectionResponse({
  body,
  cookieHeader,
  entity,
  method = 'GET',
  query,
  repositoriesFactory,
  source = process.env
}: EntityRequestContext): Promise<EntityJsonResponse> {
  const config = getEntityConfig(entity);

  if (!config || !isEntityRouteKey(entity)) {
    return jsonError(404, 'entity_not_found', `Entidad no soportada: ${entity}.`);
  }

  if (method !== 'GET' && method !== 'POST') {
    return jsonError(405, 'method_not_allowed', 'Método no permitido.');
  }

  const resolved = await resolveRepositories({
    cookieHeader,
    repositoriesFactory,
    source
  });

  if ('error' in resolved) {
    return resolved.error;
  }

  const repository = resolved.repositories[config.repositoryKey];

  try {
    if (method === 'GET') {
      const records = await repository.list({
        includeDeleted: singleQueryValue(query?.includeDeleted) === 'true'
      });

      return {
        body: {
          entity,
          records: filterRecords(entity, records as Array<Record<string, unknown>>, query)
        },
        status: 200
      };
    }

    const prepared = await prepareCreatePayload(entity, body, resolved.repositories);

    if ('error' in prepared) {
      return prepared.error;
    }

    return {
      body: {
        entity,
        record: await repository.create(prepared.payload as never, { actor: 'Germán' })
      },
      status: 201
    };
  } catch (error) {
    return handleEntityError(error);
  }
}

export async function buildEntityItemResponse({
  body,
  cookieHeader,
  entity,
  id,
  method = 'GET',
  repositoriesFactory,
  source = process.env
}: EntityItemRequestContext): Promise<EntityJsonResponse> {
  const config = getEntityConfig(entity);

  if (!config) {
    return jsonError(404, 'entity_not_found', `Entidad no soportada: ${entity}.`);
  }

  if (!id) {
    return jsonError(400, 'missing_record_id', 'Falta el ID del registro.');
  }

  if (method !== 'GET' && method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE') {
    return jsonError(405, 'method_not_allowed', 'Método no permitido.');
  }

  const resolved = await resolveRepositories({
    cookieHeader,
    repositoriesFactory,
    source
  });

  if ('error' in resolved) {
    return resolved.error;
  }

  const repository = resolved.repositories[config.repositoryKey];

  try {
    if (method === 'GET') {
      return {
        body: {
          entity,
          record: await repository.get(id)
        },
        status: 200
      };
    }

    if (method === 'DELETE') {
      return {
        body: {
          entity,
          record: await repository.delete(id, { actor: 'Germán' })
        },
        status: 200
      };
    }

    return {
      body: {
        entity,
        record: await repository.update(id, asRecord(body) as never, { actor: 'Germán' })
      },
      status: 200
    };
  } catch (error) {
    return handleEntityError(error);
  }
}
