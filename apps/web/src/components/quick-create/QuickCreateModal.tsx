import {
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  Lightbulb,
  ReceiptText,
  Target,
  UserRound,
  X
} from 'lucide-react';

const quickCreateActions = [
  {
    label: 'Nueva idea',
    detail: 'Captura hipótesis, score y próxima acción.',
    icon: Lightbulb,
    tone: 'amber'
  },
  {
    label: 'Nuevo cliente',
    detail: 'Crea ficha 360 y carpeta Drive.',
    icon: UserRound,
    tone: 'blue'
  },
  {
    label: 'Nuevo proyecto',
    detail: 'Define owner, semáforo y entregables.',
    icon: BriefcaseBusiness,
    tone: 'green'
  },
  {
    label: 'Nueva tarea',
    detail: 'Asigna prioridad, fecha y proyecto.',
    icon: CheckSquare,
    tone: 'neutral'
  },
  {
    label: 'Nueva oportunidad',
    detail: 'Agrega etapa, valor y siguiente paso.',
    icon: Target,
    tone: 'purple'
  },
  {
    label: 'Nueva factura',
    detail: 'Prepara documento y seguimiento.',
    icon: ReceiptText,
    tone: 'red'
  },
  {
    label: 'Nuevo documento',
    detail: 'Brief, investigación o reporte semanal.',
    icon: FileText,
    tone: 'blue'
  }
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
            <p>Captura en segundos. Quedará listo para conectarse a Google Workspace.</p>
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
          {quickCreateActions.map((action) => {
            const Icon = action.icon;

            return (
            <button
              className={`quick-action quick-action-${action.tone}`}
              key={action.label}
              type="button"
            >
              <span className="quick-action-icon">
                <Icon aria-hidden="true" size={18} strokeWidth={2} />
              </span>
              <span>
                <strong>{action.label}</strong>
                <small>{action.detail}</small>
              </span>
            </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
