import { ZodError } from 'zod';

import { getGoogleAuthConfig, type GoogleAuthConfig } from '../auth/config.js';
import { getSessionFromCookieHeader, type AuthSession } from '../auth/session.js';
import { createGoogleWorkspaceSetupAdapter } from './googleWorkspaceAdapter.js';
import {
  initializeStartupOs,
  type StartupOsSetupAdapter
} from './initialize.js';

type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

export type SetupJsonResponse = {
  status: number;
  body: unknown;
};

export type SetupInitializeContext = {
  adapterFactory?: (
    session: AuthSession,
    config: GoogleAuthConfig
  ) => StartupOsSetupAdapter;
  cookieHeader: string | undefined;
  method?: string;
  source?: EnvSource;
};

export async function buildSetupInitializeResponse({
  adapterFactory = createGoogleWorkspaceSetupAdapter,
  cookieHeader,
  method = 'POST',
  source = process.env
}: SetupInitializeContext): Promise<SetupJsonResponse> {
  if (method !== 'POST') {
    return {
      status: 405,
      body: { error: 'method_not_allowed' }
    };
  }

  let config: GoogleAuthConfig;

  try {
    config = getGoogleAuthConfig(source);
  } catch (error) {
    if (!(error instanceof ZodError)) {
      throw error;
    }

    return {
      status: 503,
      body: {
        error: 'google_not_configured',
        message: 'Configura las variables de Google OAuth antes de inicializar.'
      }
    };
  }

  const session = getSessionFromCookieHeader(cookieHeader, config);

  if (!session || session.email.toLowerCase() !== config.allowedGoogleEmail) {
    return {
      status: 401,
      body: {
        error: 'google_not_connected',
        message: 'Conecta Google antes de inicializar el sistema.'
      }
    };
  }

  try {
    return {
      status: 200,
      body: await initializeStartupOs(adapterFactory(session, config))
    };
  } catch (error) {
    return {
      status: 500,
      body: {
        error: 'setup_initialize_failed',
        message: error instanceof Error ? error.message : 'No se pudo inicializar el sistema.'
      }
    };
  }
}
