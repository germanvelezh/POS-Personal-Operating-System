import { Command, DatabaseZap, Play, Plus, Search } from 'lucide-react';

type TopbarProps = {
  onQuickCreate: () => void;
};

export function Topbar({ onQuickCreate }: TopbarProps) {
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
        <span className="connection-state">
          <i aria-hidden="true" />
          Google no conectado
        </span>
        <button className="button button-secondary" type="button">
          <DatabaseZap aria-hidden="true" size={15} />
          Conectar Google
        </button>
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
