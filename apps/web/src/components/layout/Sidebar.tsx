import { NavLink } from 'react-router-dom';

import { navItems } from '../../app/navigation';

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand-block">
        <div className="brand-mark">SO</div>
        <div>
          <p className="brand-title">Startup OS Personal</p>
          <p className="brand-subtitle">Sistema local</p>
        </div>
      </div>

      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              aria-label={item.ariaLabel ?? item.label}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
              end={item.path === '/'}
              key={item.path}
              to={item.path}
            >
              <Icon aria-hidden="true" size={17} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot status-dot-warning" />
        <div>
          <p>Google no conectado</p>
          <small>Fase 1 habilitará OAuth</small>
        </div>
      </div>
    </aside>
  );
}
