import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { QuickCreateModal } from '../quick-create/QuickCreateModal';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar onQuickCreate={() => setQuickCreateOpen(true)} />
        <main className="page-frame">
          <Outlet />
        </main>
      </div>
      <QuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
      />
    </div>
  );
}
