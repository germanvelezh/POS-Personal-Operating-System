import { X } from 'lucide-react';

const quickCreateActions = [
  'Nueva idea',
  'Nuevo cliente',
  'Nuevo proyecto',
  'Nueva tarea',
  'Nueva oportunidad',
  'Nueva factura'
];

type QuickCreateModalProps = {
  open: boolean;
  onClose: () => void;
};

export function QuickCreateModal({ open, onClose }: QuickCreateModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-label="Crear rapido"
        aria-modal="true"
        className="quick-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <h2>Crear rápido</h2>
            <p>Captura el objeto y conéctalo a Google Workspace en las siguientes fases.</p>
          </div>
          <button
            aria-label="Cerrar modal"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="quick-grid">
          {quickCreateActions.map((action) => (
            <button className="quick-action" key={action} type="button">
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
