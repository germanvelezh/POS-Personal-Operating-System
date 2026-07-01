import { NavLink } from 'react-router-dom';
import { ChevronDown, Cloud, CloudOff, Grid2X2, UserRound } from 'lucide-react';

import { navItems } from '../../app/navigation';
import type { GoogleAuthStatus } from '../../services/googleAuth';

type SidebarProps = {
  googleStatus: GoogleAuthStatus;
  googleStatusLoading: boolean;
};

function getGoogleCard(status: GoogleAuthStatus, loading: boolean) {
  if (loading) {
    return {
      action: 'Conectar Google',
      detail: 'Validando sesión de Google.',
      icon: CloudOff,
      title: 'Verificando Google',
      tone: 'neutral'
    };
  }

  if (status.connected) {
    return {
      action: 'Reconectar Google',
      detail: status.email ?? 'Sheets, Drive y Docs listos.',
      icon: Cloud,
      title: 'Google conectado',
      tone: 'success'
    };
  }

  return {
    action: 'Conectar Google',
    detail: status.configured
      ? 'Conecta Sheets, Drive y Docs.'
      : 'Configura OAuth en Vercel.',
    icon: CloudOff,
    title: status.configured ? 'Google no conectado' : 'Google sin configurar',
    tone: 'warning'
  };
}

export function Sidebar({ googleStatus, googleStatusLoading }: SidebarProps) {
  const googleCard = getGoogleCard(googleStatus, googleStatusLoading);
  const GoogleIcon = googleCard.icon;

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
        <span
          className={`google-card-icon ${
            googleCard.tone === 'success' ? 'google-card-icon-success' : ''
          }`}
        >
          <GoogleIcon aria-hidden="true" size={18} />
        </span>
        <div>
          <p>{googleCard.title}</p>
          <small>{googleCard.detail}</small>
        </div>
        <a className="button button-quiet" href="/auth/google">
          {googleCard.action}
        </a>
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
