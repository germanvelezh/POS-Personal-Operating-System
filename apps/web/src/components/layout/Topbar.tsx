import { Plus, Search } from 'lucide-react';

type TopbarProps = {
  onQuickCreate: () => void;
};

export function Topbar({ onQuickCreate }: TopbarProps) {
  return (
    <header className="topbar">
      <label className="global-search">
        <Search aria-hidden="true" size={17} />
        <input placeholder="Buscar clientes, ideas, proyectos o facturas" type="search" />
      </label>

      <div className="topbar-actions">
        <span className="connection-state">Google no conectado</span>
        <button className="button button-secondary" type="button">
          Conectar Google
        </button>
        <button className="button button-secondary" type="button">
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
