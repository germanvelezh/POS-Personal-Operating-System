import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { AutomationsPage } from '../pages/AutomationsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { EntityPage } from '../pages/EntityPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { SettingsPage } from '../pages/SettingsPage';
import { pageRoutes } from './routes';

const crudRoutes = {
  '/clients': 'clients',
  '/ideas': 'ideas',
  '/projects': 'projects',
  '/tasks': 'tasks',
  '/opportunities': 'opportunities',
  '/invoices': 'invoices'
} as const;

export function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          {pageRoutes.map((route) => {
            if (route.path === '/') {
              return null;
            }

            const entity = crudRoutes[route.path as keyof typeof crudRoutes];
            const element = entity ? (
              <EntityPage entity={entity} route={route} />
            ) : route.path === '/documents' ? (
              <DocumentsPage />
            ) : route.path === '/automations' ? (
              <AutomationsPage />
            ) : route.path === '/settings' ? (
              <SettingsPage />
            ) : (
              <PlaceholderPage route={route} />
            );

            return (
              <Route key={route.path} path={route.path.slice(1)}>
                <Route index element={element} />
                {entity ? <Route path=":recordId" element={element} /> : null}
              </Route>
            );
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
