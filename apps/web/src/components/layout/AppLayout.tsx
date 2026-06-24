import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import {
  defaultGoogleAuthStatus,
  fetchGoogleAuthStatus,
  initializeGoogleWorkspace,
  type SetupInitializeResult,
  type GoogleAuthStatus
} from '../../services/googleAuth';
import { QuickCreateModal } from '../quick-create/QuickCreateModal';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export type AppOutletContext = {
  googleStatus: GoogleAuthStatus;
  googleStatusLoading: boolean;
  initializeSystem: () => Promise<void>;
  refreshGoogleStatus: () => Promise<void>;
  setupError: string | null;
  setupPending: boolean;
  setupResult: SetupInitializeResult | null;
};

export function AppLayout() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(defaultGoogleAuthStatus);
  const [googleStatusLoading, setGoogleStatusLoading] = useState(true);
  const [setupPending, setSetupPending] = useState(false);
  const [setupResult, setSetupResult] = useState<SetupInitializeResult | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  const refreshGoogleStatus = useCallback(async () => {
    setGoogleStatusLoading(true);

    try {
      setGoogleStatus(await fetchGoogleAuthStatus());
    } catch {
      setGoogleStatus(defaultGoogleAuthStatus);
    } finally {
      setGoogleStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshGoogleStatus();
  }, [refreshGoogleStatus]);

  const initializeSystem = useCallback(async () => {
    setSetupPending(true);
    setSetupError(null);

    try {
      const result = await initializeGoogleWorkspace();
      setSetupResult(result);
      await refreshGoogleStatus();
    } catch (error) {
      setSetupError(
        error instanceof Error ? error.message : 'No se pudo inicializar el sistema.'
      );
    } finally {
      setSetupPending(false);
    }
  }, [refreshGoogleStatus]);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar
          googleStatus={googleStatus}
          googleStatusLoading={googleStatusLoading}
          onInitializeSystem={initializeSystem}
          onQuickCreate={() => setQuickCreateOpen(true)}
          setupPending={setupPending}
        />
        <main className="page-frame">
          <Outlet
            context={{
              googleStatus,
              googleStatusLoading,
              initializeSystem,
              setupError,
              setupPending,
              setupResult,
              refreshGoogleStatus
            }}
          />
        </main>
      </div>
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
      />
    </div>
  );
}
