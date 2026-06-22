import { NavLink } from 'react-router-dom';
import { ChevronDown, CloudOff, Grid2X2, UserRound } from 'lucide-react';

import { navItems } from '../../app/navigation';

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="brand-block">
        <div className="brand-mark">
          <Grid2X2 aria-hidden="true" size={18} strokeWidth={2.2} />
        </div>
        <div>
          <p className="brand-title">Startup OS Personal</p>
          <p className="brand-subtitle">Germán</p>
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
              <Icon aria-hidden="true" size={17} strokeWidth={1.9} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-google-card">
        <span className="google-card-icon">
          <CloudOff aria-hidden="true" size={18} />
        </span>
        <div>
          <p>Google no conectado</p>
          <small>Conecta Sheets, Drive y Docs.</small>
        </div>
        <button className="button button-quiet" type="button">
          Conectar Google
        </button>
      </div>

      <div className="sidebar-footer">
        <span className="user-avatar">
          <UserRound aria-hidden="true" size={17} />
        </span>
        <div>
          <p>Germán</p>
          <small>Founder</small>
        </div>
        <ChevronDown aria-hidden="true" className="sidebar-footer-chevron" size={15} />
      </div>
    </aside>
  );
}
