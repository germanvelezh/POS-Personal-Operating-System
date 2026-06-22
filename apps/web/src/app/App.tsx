import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { SettingsPage } from '../pages/SettingsPage';
import { pageRoutes } from './routes';

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

            const element =
              route.path === '/settings' ? (
                <SettingsPage />
              ) : (
                <PlaceholderPage route={route} />
              );

            return <Route key={route.path} path={route.path.slice(1)} element={element} />;
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
