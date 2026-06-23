import { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

import {
  defaultGoogleAuthStatus,
  fetchGoogleAuthStatus,
  type GoogleAuthStatus
} from '../../services/googleAuth';
import { QuickCreateModal } from '../quick-create/QuickCreateModal';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export type AppOutletContext = {
  googleStatus: GoogleAuthStatus;
  googleStatusLoading: boolean;
  refreshGoogleStatus: () => Promise<void>;
};

export function AppLayout() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [googleStatus, setGoogleStatus] = useState(defaultGoogleAuthStatus);
  const [googleStatusLoading, setGoogleStatusLoading] = useState(true);

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

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar
          googleStatus={googleStatus}
          googleStatusLoading={googleStatusLoading}
          onQuickCreate={() => setQuickCreateOpen(true)}
        />
        <main className="page-frame">
          <Outlet
            context={{
              googleStatus,
              googleStatusLoading,
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
