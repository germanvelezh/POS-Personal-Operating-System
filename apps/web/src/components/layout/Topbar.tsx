import { Command, DatabaseZap, Play, Plus, Search } from 'lucide-react';

import type { GoogleAuthStatus } from '../../services/googleAuth';

type TopbarProps = {
  googleStatus: GoogleAuthStatus;
  googleStatusLoading: boolean;
  onQuickCreate: () => void;
};

function getConnectionLabel(status: GoogleAuthStatus, loading: boolean) {
  if (loading) {
    return 'Verificando Google';
  }

  if (status.connected) {
    return 'Google conectado';
  }

  if (status.configured) {
    return 'Google no conectado';
  }

  return 'Google sin configurar';
}

function getConnectionTone(status: GoogleAuthStatus, loading: boolean) {
  if (loading) {
    return 'connection-state-neutral';
  }

  if (status.connected) {
    return 'connection-state-success';
  }

  if (status.configured) {
    return 'connection-state-warning';
  }

  return 'connection-state-danger';
}

export function Topbar({ googleStatus, googleStatusLoading, onQuickCreate }: TopbarProps) {
  const connectionLabel = getConnectionLabel(googleStatus, googleStatusLoading);
  const connectionTone = getConnectionTone(googleStatus, googleStatusLoading);

  return (
    <header className="topbar">
      <label className="global-search">
        <Search aria-hidden="true" size={17} />
        <input placeholder="Buscar" type="search" />
        <span className="search-shortcut">
          <Command aria-hidden="true" size={12} />
          K
        </span>
      </label>

      <div className="topbar-actions">
        <span className={`connection-state ${connectionTone}`}>
          <i aria-hidden="true" />
          {connectionLabel}
          {googleStatus.connected && googleStatus.email ? (
            <small>{googleStatus.email}</small>
          ) : null}
        </span>
        <a className="button button-secondary" href="/auth/google">
          <DatabaseZap aria-hidden="true" size={15} />
          {googleStatus.connected ? 'Reconectar Google' : 'Conectar Google'}
        </a>
        <button className="button button-secondary" type="button">
          <Play aria-hidden="true" size={14} />
          Inicializar sistema
        </button>
        <button
          aria-label="Crear rapido"
          className="button button-primary"
          onClick={onQuickCreate}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          Crear rápido
        </button>
      </div>
    </header>
  );
}
