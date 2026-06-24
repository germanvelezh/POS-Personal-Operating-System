import {
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  FilePlus2,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import type { NavItem } from '../app/navigation';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import {
  createEntityRecord,
  deleteEntityRecord,
  fetchEntityRecords,
  updateEntityRecord,
  type EntityKey,
  type EntityRecord
} from '../services/entities';
import {
  runWorkspaceAction,
  type WorkspaceAction
} from '../services/workspace';

type FieldType = 'date' | 'email' | 'number' | 'select' | 'tel' | 'text' | 'textarea' | 'url';

type FieldConfig = {
  label: string;
  name: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  type?: FieldType;
};

type ColumnConfig = {
  field: string;
  label: string;
  tone?: boolean;
  type?: 'currency' | 'date' | 'link' | 'number' | 'text';
};

type ViewConfig = {
  label: string;
  status?: string;
};

type EntityPageConfig = {
  columns: ColumnConfig[];
  defaultValues: Record<string, string>;
  entity: EntityKey;
  fields: FieldConfig[];
  idField: string;
  linkFields: Array<{ field: string; label: string }>;
  statusField: string;
  titleField: string;
  views: ViewConfig[];
};

type WorkspaceActionConfig = {
  action: WorkspaceAction;
  icon: typeof FilePlus2;
  label: string;
};

type EntityPageProps = {
  entity: EntityKey;
  route: NavItem;
};

const statusOptions = {
  clients: [
    { label: 'Prospecto', value: 'prospecto' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
  ],
  ideas: [
    { label: 'Capturada', value: 'capturada' },
    { label: 'En revisión', value: 'en_revision' },
    { label: 'En investigación', value: 'en_investigacion' },
    { label: 'En validación', value: 'en_validacion' },
    { label: 'Priorizada', value: 'priorizada' },
    { label: 'Aprobada', value: 'aprobada' },
    { label: 'Convertida proyecto', value: 'convertida_proyecto' },
    { label: 'Convertida oportunidad', value: 'convertida_oportunidad' },
    { label: 'Descartada', value: 'descartada' },
    { label: 'Archivada', value: 'archivada' }
  ],
  projects: [
    { label: 'Planeado', value: 'planeado' },
    { label: 'Activo', value: 'activo' },
    { label: 'En pausa', value: 'en_pausa' },
    { label: 'Bloqueado', value: 'bloqueado' },
    { label: 'En revisión', value: 'en_revision' },
    { label: 'Cerrado', value: 'cerrado' },
    { label: 'Cancelado', value: 'cancelado' }
  ],
  tasks: [
    { label: 'Backlog', value: 'backlog' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En progreso', value: 'en_progreso' },
    { label: 'Bloqueada', value: 'bloqueada' },
    { label: 'En revisión', value: 'en_revision' },
    { label: 'Terminada', value: 'terminada' },
    { label: 'Cancelada', value: 'cancelada' }
  ],
  opportunities: [
    { label: 'Nueva', value: 'nueva' },
    { label: 'Calificada', value: 'calificada' },
    { label: 'En descubrimiento', value: 'en_descubrimiento' },
    { label: 'Propuesta pendiente', value: 'propuesta_pendiente' },
    { label: 'Propuesta enviada', value: 'propuesta_enviada' },
    { label: 'Negociación', value: 'negociacion' },
    { label: 'Ganada', value: 'ganada' },
    { label: 'Perdida', value: 'perdida' },
    { label: 'Pausada', value: 'pausada' }
  ],
  invoices: [
    { label: 'Por facturar', value: 'por_facturar' },
    { label: 'Borrador', value: 'borrador' },
    { label: 'Facturada', value: 'facturada' },
    { label: 'Pagada parcialmente', value: 'pagada_parcialmente' },
    { label: 'Pagada', value: 'pagada' },
    { label: 'Vencida', value: 'vencida' },
    { label: 'Cancelada', value: 'cancelada' }
  ]
} satisfies Record<EntityKey, Array<{ label: string; value: string }>>;

const entityPageConfigs: Record<EntityKey, EntityPageConfig> = {
  clients: {
    columns: [
      { field: 'nombre', label: 'Cliente' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'proxima_accion', label: 'Próxima acción' },
      { field: 'drive_folder_url', label: 'Drive', type: 'link' }
    ],
    defaultValues: {
      estado: 'prospecto',
      naturaleza: 'empresa',
      tipo_cliente: 'externo'
    },
    entity: 'clients',
    fields: [
      { label: 'Nombre', name: 'nombre', required: true },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.clients,
        required: true,
        type: 'select'
      },
      {
        label: 'Tipo de cliente',
        name: 'tipo_cliente',
        options: [
          { label: 'Externo', value: 'externo' },
          { label: 'Interno', value: 'interno' }
        ],
        required: true,
        type: 'select'
      },
      {
        label: 'Naturaleza',
        name: 'naturaleza',
        options: [
          { label: 'Empresa', value: 'empresa' },
          { label: 'Persona', value: 'persona' }
        ],
        required: true,
        type: 'select'
      },
      { label: 'Email principal', name: 'email_principal', type: 'email' },
      { label: 'Celular principal', name: 'celular_principal', type: 'tel' },
      { label: 'Próxima acción', name: 'proxima_accion' },
      { label: 'Notas', name: 'notas', type: 'textarea' }
    ],
    idField: 'cliente_id',
    linkFields: [{ field: 'drive_folder_url', label: 'Carpeta Drive' }],
    statusField: 'estado',
    titleField: 'nombre',
    views: [
      { label: 'Todos' },
      { label: 'Prospectos', status: 'prospecto' },
      { label: 'Activos', status: 'activo' },
      { label: 'Inactivos', status: 'inactivo' }
    ]
  },
  ideas: {
    columns: [
      { field: 'titulo', label: 'Idea' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'score_prioridad', label: 'Score', type: 'number' },
      { field: 'proxima_accion', label: 'Próxima acción' },
      { field: 'doc_url', label: 'Doc', type: 'link' }
    ],
    defaultValues: {
      estado: 'capturada',
      origen: 'idea_suelta',
      tipo: 'otro'
    },
    entity: 'ideas',
    fields: [
      { label: 'Título', name: 'titulo', required: true },
      { label: 'Descripción', name: 'descripcion', required: true, type: 'textarea' },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.ideas,
        required: true,
        type: 'select'
      },
      {
        label: 'Tipo',
        name: 'tipo',
        options: [
          { label: 'Nuevo producto', value: 'nuevo_producto' },
          { label: 'Nuevo servicio', value: 'nuevo_servicio' },
          { label: 'Mejora interna', value: 'mejora_interna' },
          { label: 'Automatización', value: 'automatizacion' },
          { label: 'Nueva línea negocio', value: 'nueva_linea_negocio' },
          { label: 'Upsell', value: 'upsell' },
          { label: 'Cross sell', value: 'cross_sell' },
          { label: 'Investigación mercado', value: 'investigacion_mercado' },
          { label: 'Mejora proceso', value: 'mejora_proceso' },
          { label: 'Contenido', value: 'contenido' },
          { label: 'Alianza', value: 'alianza' },
          { label: 'Tecnología', value: 'tecnologia' },
          { label: 'Reducción costos', value: 'reduccion_costos' },
          { label: 'Otro', value: 'otro' }
        ],
        required: true,
        type: 'select'
      },
      { label: 'Cliente ID', name: 'cliente_id' },
      { label: 'Impacto', name: 'impacto', type: 'number' },
      { label: 'Dinero potencial', name: 'dinero_potencial', type: 'number' },
      { label: 'Urgencia', name: 'urgencia', type: 'number' },
      { label: 'Esfuerzo', name: 'esfuerzo', type: 'number' },
      { label: 'Próxima acción', name: 'proxima_accion' },
      { label: 'Comentarios', name: 'comentarios', type: 'textarea' }
    ],
    idField: 'idea_id',
    linkFields: [
      { field: 'doc_url', label: 'Brief Docs' },
      { field: 'drive_folder_id', label: 'Carpeta Drive' }
    ],
    statusField: 'estado',
    titleField: 'titulo',
    views: [
      { label: 'Todas' },
      { label: 'Capturadas', status: 'capturada' },
      { label: 'En revisión', status: 'en_revision' },
      { label: 'En investigación', status: 'en_investigacion' },
      { label: 'En validación', status: 'en_validacion' },
      { label: 'Priorizadas', status: 'priorizada' },
      { label: 'Aprobadas', status: 'aprobada' },
      { label: 'Convertidas', status: 'convertida_proyecto' },
      { label: 'Descartadas', status: 'descartada' }
    ]
  },
  projects: {
    columns: [
      { field: 'titulo', label: 'Proyecto' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'semaforo', label: 'Semáforo', tone: true },
      { field: 'proxima_accion', label: 'Próxima acción' },
      { field: 'drive_folder_url', label: 'Drive', type: 'link' }
    ],
    defaultValues: {
      estado: 'planeado',
      origen: 'otro',
      responsable: 'Germán',
      semaforo: 'verde',
      tipo: 'interno'
    },
    entity: 'projects',
    fields: [
      { label: 'Título', name: 'titulo', required: true },
      { label: 'Descripción', name: 'descripcion', type: 'textarea' },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.projects,
        required: true,
        type: 'select'
      },
      {
        label: 'Semáforo',
        name: 'semaforo',
        options: [
          { label: 'Verde', value: 'verde' },
          { label: 'Amarillo', value: 'amarillo' },
          { label: 'Rojo', value: 'rojo' }
        ],
        required: true,
        type: 'select'
      },
      { label: 'Cliente ID', name: 'cliente_id' },
      { label: 'Responsable', name: 'responsable', required: true },
      { label: 'Objetivo', name: 'objetivo', type: 'textarea' },
      { label: 'Próxima acción', name: 'proxima_accion' }
    ],
    idField: 'proyecto_id',
    linkFields: [
      { field: 'drive_folder_url', label: 'Carpeta Drive' },
      { field: 'doc_brief_url', label: 'Brief Docs' }
    ],
    statusField: 'estado',
    titleField: 'titulo',
    views: [
      { label: 'Todos' },
      { label: 'Activos', status: 'activo' },
      { label: 'Planeados', status: 'planeado' },
      { label: 'Bloqueados', status: 'bloqueado' },
      { label: 'En revisión', status: 'en_revision' },
      { label: 'Cerrados', status: 'cerrado' },
      { label: 'Cancelados', status: 'cancelado' }
    ]
  },
  tasks: {
    columns: [
      { field: 'titulo', label: 'Tarea' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'prioridad', label: 'Prioridad', tone: true },
      { field: 'fecha_vencimiento', label: 'Vence', type: 'date' },
      { field: 'proyecto_id', label: 'Proyecto' }
    ],
    defaultValues: {
      estado: 'pendiente',
      prioridad: 'media',
      responsable: 'Germán',
      tipo: 'tarea'
    },
    entity: 'tasks',
    fields: [
      { label: 'Título', name: 'titulo', required: true },
      { label: 'Proyecto ID', name: 'proyecto_id', required: true },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.tasks,
        required: true,
        type: 'select'
      },
      {
        label: 'Prioridad',
        name: 'prioridad',
        options: [
          { label: 'Baja', value: 'baja' },
          { label: 'Media', value: 'media' },
          { label: 'Alta', value: 'alta' },
          { label: 'Crítica', value: 'critica' }
        ],
        required: true,
        type: 'select'
      },
      { label: 'Responsable', name: 'responsable', required: true },
      { label: 'Fecha vencimiento', name: 'fecha_vencimiento', type: 'date' },
      { label: 'Descripción', name: 'descripcion', type: 'textarea' },
      { label: 'Próxima acción', name: 'proxima_accion' }
    ],
    idField: 'tarea_id',
    linkFields: [],
    statusField: 'estado',
    titleField: 'titulo',
    views: [
      { label: 'Todas' },
      { label: 'Pendientes', status: 'pendiente' },
      { label: 'En progreso', status: 'en_progreso' },
      { label: 'Bloqueadas', status: 'bloqueada' },
      { label: 'En revisión', status: 'en_revision' },
      { label: 'Terminadas', status: 'terminada' }
    ]
  },
  opportunities: {
    columns: [
      { field: 'titulo', label: 'Oportunidad' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'valor_estimado', label: 'Valor', type: 'currency' },
      { field: 'probabilidad', label: 'Prob.', type: 'number' },
      { field: 'proxima_accion', label: 'Próxima acción' }
    ],
    defaultValues: {
      estado: 'nueva',
      moneda: 'COP',
      origen: 'lead'
    },
    entity: 'opportunities',
    fields: [
      { label: 'Título', name: 'titulo', required: true },
      { label: 'Cliente ID', name: 'cliente_id', required: true },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.opportunities,
        required: true,
        type: 'select'
      },
      { label: 'Valor estimado', name: 'valor_estimado', type: 'number' },
      { label: 'Probabilidad', name: 'probabilidad', type: 'number' },
      { label: 'Descripción', name: 'descripcion', type: 'textarea' },
      { label: 'Próxima acción', name: 'proxima_accion' }
    ],
    idField: 'oportunidad_id',
    linkFields: [],
    statusField: 'estado',
    titleField: 'titulo',
    views: [
      { label: 'Pipeline' },
      { label: 'Nuevas', status: 'nueva' },
      { label: 'Calificadas', status: 'calificada' },
      { label: 'Descubrimiento', status: 'en_descubrimiento' },
      { label: 'Propuesta enviada', status: 'propuesta_enviada' },
      { label: 'Negociación', status: 'negociacion' },
      { label: 'Ganadas', status: 'ganada' },
      { label: 'Perdidas', status: 'perdida' }
    ]
  },
  invoices: {
    columns: [
      { field: 'concepto', label: 'Factura' },
      { field: 'estado', label: 'Estado', tone: true },
      { field: 'valor', label: 'Valor', type: 'currency' },
      { field: 'fecha_vencimiento', label: 'Vence', type: 'date' },
      { field: 'doc_url', label: 'Doc', type: 'link' }
    ],
    defaultValues: {
      estado: 'por_facturar',
      modalidad: 'proyecto_cerrado',
      moneda: 'COP'
    },
    entity: 'invoices',
    fields: [
      { label: 'Concepto', name: 'concepto', required: true },
      { label: 'Cliente ID', name: 'cliente_id', required: true },
      { label: 'Valor', name: 'valor', required: true, type: 'number' },
      {
        label: 'Estado',
        name: 'estado',
        options: statusOptions.invoices,
        required: true,
        type: 'select'
      },
      { label: 'Fecha vencimiento', name: 'fecha_vencimiento', type: 'date' },
      { label: 'Doc URL', name: 'doc_url', type: 'url' }
    ],
    idField: 'factura_id',
    linkFields: [
      { field: 'doc_url', label: 'Factura Docs' },
      { field: 'soporte_pago_url', label: 'Soporte pago' }
    ],
    statusField: 'estado',
    titleField: 'concepto',
    views: [
      { label: 'Todas' },
      { label: 'Por facturar', status: 'por_facturar' },
      { label: 'Borradores', status: 'borrador' },
      { label: 'Facturadas', status: 'facturada' },
      { label: 'Vencidas', status: 'vencida' },
      { label: 'Parciales', status: 'pagada_parcialmente' },
      { label: 'Pagadas', status: 'pagada' }
    ]
  }
};

const numberFieldNames = new Set([
  'dinero_potencial',
  'esfuerzo',
  'impacto',
  'probabilidad',
  'score_prioridad',
  'urgencia',
  'valor',
  'valor_estimado'
]);

function humanize(value: unknown) {
  const text = String(value ?? '').trim();

  if (!text) {
    return 'Sin dato';
  }

  return text
    .replaceAll('_', ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function getStatusTone(value: unknown): BadgeTone {
  const status = String(value ?? '').toLowerCase();

  if (
    ['activo', 'aprobada', 'ganada', 'pagada', 'terminada', 'verde', 'cerrado'].includes(status)
  ) {
    return 'success';
  }

  if (
    [
      'bloqueado',
      'bloqueada',
      'cancelado',
      'cancelada',
      'descartada',
      'inactivo',
      'perdida',
      'rojo',
      'vencida'
    ].includes(status)
  ) {
    return 'danger';
  }

  if (
    [
      'amarillo',
      'borrador',
      'en_progreso',
      'en_revision',
      'negociacion',
      'pagada_parcialmente',
      'pendiente',
      'propuesta_enviada',
      'propuesta_pendiente'
    ].includes(status)
  ) {
    return 'warning';
  }

  if (['capturada', 'nueva', 'planeado', 'priorizada', 'prospecto'].includes(status)) {
    return 'info';
  }

  return 'neutral';
}

function formatCellValue(record: EntityRecord, column: ColumnConfig) {
  const value = record[column.field];

  if (column.type === 'currency' && value !== undefined && value !== null && value !== '') {
    return new Intl.NumberFormat('es-CO', {
      currency: String(record.moneda ?? 'COP') || 'COP',
      maximumFractionDigits: 0,
      style: 'currency'
    }).format(Number(value));
  }

  if (column.type === 'date' && value) {
    return String(value).slice(0, 10);
  }

  if (column.type === 'link') {
    return value ? 'Abrir' : 'Sin enlace';
  }

  if (column.type === 'number' && value !== undefined && value !== null && value !== '') {
    return String(value);
  }

  return String(value ?? '').trim() || 'Sin dato';
}

function recordId(record: EntityRecord, config: EntityPageConfig) {
  return String(record[config.idField] ?? '');
}

function createInitialForm(config: EntityPageConfig, record?: EntityRecord) {
  const next: Record<string, string> = {};

  for (const field of config.fields) {
    const value = record?.[field.name] ?? config.defaultValues[field.name] ?? '';
    next[field.name] = String(value ?? '');
  }

  return next;
}

function buildPayload(config: EntityPageConfig, values: Record<string, string>) {
  const payload: EntityRecord = {};

  for (const field of config.fields) {
    const rawValue = values[field.name]?.trim() ?? '';

    if (!rawValue && !field.required) {
      continue;
    }

    payload[field.name] = numberFieldNames.has(field.name) && rawValue ? Number(rawValue) : rawValue;
  }

  return payload;
}

function filterRecords(
  records: EntityRecord[],
  config: EntityPageConfig,
  search: string,
  status?: string
) {
  const normalizedSearch = search.trim().toLowerCase();

  return records.filter((record) => {
    const matchesStatus = !status || record[config.statusField] === status;
    const searchable = [
      record[config.titleField],
      record.proxima_accion,
      record.descripcion,
      record.notas,
      record.cliente_id,
      record.proyecto_id
    ]
      .map((value) => String(value ?? '').toLowerCase())
      .join(' ');

    return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
  });
}

function getWorkspaceActions(entity: EntityKey, record: EntityRecord): WorkspaceActionConfig[] {
  if (entity === 'clients') {
    return [
      {
        action: 'create_client_folder',
        icon: FolderPlus,
        label: record.drive_folder_url ? 'Actualizar carpeta Drive' : 'Crear carpeta Drive'
      }
    ];
  }

  if (entity === 'ideas') {
    return [
      {
        action: 'generate_idea_brief',
        icon: FilePlus2,
        label: 'Generar brief'
      }
    ];
  }

  if (entity === 'projects') {
    return [
      {
        action: 'create_project_structure',
        icon: FolderPlus,
        label: record.drive_folder_url ? 'Actualizar estructura Drive' : 'Crear estructura Drive'
      },
      {
        action: 'generate_project_brief',
        icon: FilePlus2,
        label: 'Generar brief'
      }
    ];
  }

  if (entity === 'invoices') {
    return [
      {
        action: 'generate_invoice',
        icon: FilePlus2,
        label: 'Generar factura'
      }
    ];
  }

  return [];
}

function EntityField({
  field,
  onChange,
  value
}: {
  field: FieldConfig;
  onChange: (field: string, value: string) => void;
  value: string;
}) {
  const id = `entity-field-${field.name}`;

  if (field.type === 'select') {
    return (
      <label className="entity-field" htmlFor={id}>
        <span>{field.label}</span>
        <select
          aria-required={field.required}
          id={id}
          onChange={(event) => onChange(field.name, event.target.value)}
          value={value}
        >
          <option value="">Seleccionar</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="entity-field entity-field-wide" htmlFor={id}>
        <span>{field.label}</span>
        <textarea
          aria-required={field.required}
          id={id}
          onChange={(event) => onChange(field.name, event.target.value)}
          rows={4}
          value={value}
        />
      </label>
    );
  }

  return (
    <label className="entity-field" htmlFor={id}>
      <span>{field.label}</span>
      <input
        aria-required={field.required}
        id={id}
        inputMode={field.type === 'number' ? 'decimal' : undefined}
        onChange={(event) => onChange(field.name, event.target.value)}
        type={field.type ?? 'text'}
        value={value}
      />
    </label>
  );
}

export function EntityPage({ entity, route }: EntityPageProps) {
  const Icon = route.icon;
  const navigate = useNavigate();
  const { recordId: routeRecordId } = useParams();
  const config = entityPageConfigs[entity];
  const [records, setRecords] = useState<EntityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState(config.views[0]?.label ?? 'Todos');
  const [selectedId, setSelectedId] = useState<string | null>(routeRecordId ?? null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>(() =>
    createInitialForm(config)
  );
  const [workspaceAction, setWorkspaceAction] = useState<WorkspaceAction | null>(null);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);

  const activeStatus = config.views.find((view) => view.label === activeView)?.status;
  const filteredRecords = useMemo(
    () => filterRecords(records, config, search, activeStatus),
    [activeStatus, config, records, search]
  );
  const selectedRecord = useMemo(
    () =>
      records.find((record) => recordId(record, config) === selectedId) ??
      filteredRecords[0] ??
      null,
    [config, filteredRecords, records, selectedId]
  );
  const currentSelectedId = selectedRecord ? recordId(selectedRecord, config) : null;
  const entityColumns = `minmax(180px, 1.3fr) repeat(${Math.max(
    config.columns.length - 1,
    1
  )}, minmax(110px, 0.8fr))`;

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setLoading(true);
      setError(null);

      try {
        const nextRecords = await fetchEntityRecords(entity);

        if (!cancelled) {
          setRecords(nextRecords);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [entity]);

  useEffect(() => {
    setSelectedId(routeRecordId ?? null);
    setFormMode(null);
  }, [routeRecordId]);

  function openCreateForm() {
    setFormMode('create');
    setFormValues(createInitialForm(config));
    setSelectedId(null);
  }

  function openEditForm(record: EntityRecord) {
    setFormMode('edit');
    setFormValues(createInitialForm(config, record));
    setSelectedId(recordId(record, config));
  }

  function handleFieldChange(field: string, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value
    }));
  }

  function selectRecord(record: EntityRecord) {
    const id = recordId(record, config);

    setSelectedId(id);
    setFormMode(null);
    navigate(`${route.path}/${id}`);
  }

  async function handleWorkspaceAction(action: WorkspaceAction) {
    if (!currentSelectedId) {
      return;
    }

    setWorkspaceAction(action);
    setWorkspaceMessage(null);
    setError(null);

    try {
      const result = await runWorkspaceAction({
        action,
        entity,
        id: currentSelectedId
      });

      if (result.record) {
        const nextId = recordId(result.record, config);

        setRecords((current) =>
          current.map((record) =>
            recordId(record, config) === nextId ? result.record as EntityRecord : record
          )
        );
        setSelectedId(nextId);
      }

      setWorkspaceMessage(result.document ? 'Documento generado' : 'Drive actualizado');
    } catch (workspaceError) {
      setError(
        workspaceError instanceof Error ? workspaceError.message : 'No se pudo ejecutar la acción.'
      );
    } finally {
      setWorkspaceAction(null);
    }
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLDivElement>, record: EntityRecord) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectRecord(record);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload(config, formValues);
      const nextRecord =
        formMode === 'edit' && currentSelectedId
          ? await updateEntityRecord(entity, currentSelectedId, payload)
          : await createEntityRecord(entity, payload);
      const nextId = recordId(nextRecord, config);

      setRecords((current) => {
        if (formMode === 'edit') {
          return current.map((record) =>
            recordId(record, config) === nextId ? nextRecord : record
          );
        }

        return [nextRecord, ...current];
      });
      setSelectedId(nextId);
      setFormMode(null);
      navigate(`${route.path}/${nextId}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!currentSelectedId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const deletedRecord = await deleteEntityRecord(entity, currentSelectedId);
      const deletedId = recordId(deletedRecord, config);

      setRecords((current) =>
        current.map((record) => (recordId(record, config) === deletedId ? deletedRecord : record))
      );
      setSelectedId(deletedId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="module-page entity-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <Icon aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>{route.label}</h1>
            <p>{route.description}</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge tone="info">Fase 3</Badge>
          <button className="button button-secondary" onClick={() => void fetchEntityRecords(entity).then(setRecords)} type="button">
            {loading ? <Loader2 aria-hidden="true" className="spin-icon" size={15} /> : null}
            Actualizar
          </button>
          <button className="button button-primary" onClick={openCreateForm} type="button">
            <Plus aria-hidden="true" size={15} />
            Crear
          </button>
        </div>
      </div>

      <nav className="segment-tabs" aria-label={`Subvistas de ${route.label}`}>
        {config.views.map((view) => (
          <button
            className={view.label === activeView ? 'segment-tab segment-tab-active' : 'segment-tab'}
            key={view.label}
            onClick={() => setActiveView(view.label)}
            type="button"
          >
            {view.label}
          </button>
        ))}
      </nav>

      <div className="entity-toolbar">
        <label className="entity-search">
          <Search aria-hidden="true" size={16} />
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Buscar en ${route.label.toLowerCase()}`}
            type="search"
            value={search}
          />
        </label>
        <div className="entity-count">
          <strong>{filteredRecords.length}</strong>
          <span>{filteredRecords.length === 1 ? 'registro' : 'registros'}</span>
        </div>
      </div>

      {error ? (
        <div className="settings-alert" role="alert">
          <AlertTriangle aria-hidden="true" size={16} />
          {error}
        </div>
      ) : null}

      <div className="entity-layout">
        <article className="panel entity-main-panel">
          <div className="panel-header">
            <div>
              <h2>Listado</h2>
              <p>{activeView}</p>
            </div>
          </div>

          {loading ? (
            <div className="entity-empty">
              <Loader2 aria-hidden="true" className="spin-icon" size={18} />
              <span>Cargando datos</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="entity-empty">
              <span>Sin registros</span>
              <button className="link-button" onClick={openCreateForm} type="button">
                Crear primero
                <ArrowUpRight aria-hidden="true" size={14} />
              </button>
            </div>
          ) : (
            <div className="data-table entity-table">
              <div
                className="data-row data-head entity-row"
                style={{ gridTemplateColumns: entityColumns }}
              >
                {config.columns.map((column) => (
                  <span key={column.field}>{column.label}</span>
                ))}
              </div>
              {filteredRecords.map((record) => {
                const id = recordId(record, config);

                return (
                  <div
                    aria-current={id === currentSelectedId ? 'true' : undefined}
                    className={
                      id === currentSelectedId
                        ? 'data-row entity-row entity-row-active'
                        : 'data-row entity-row'
                    }
                    key={id}
                    onClick={() => selectRecord(record)}
                    onKeyDown={(event) => handleRowKeyDown(event, record)}
                    role="button"
                    style={{ gridTemplateColumns: entityColumns }}
                    tabIndex={0}
                  >
                    {config.columns.map((column, index) => {
                      const value = record[column.field];

                      if (column.tone) {
                        return (
                          <span key={column.field}>
                            <Badge tone={getStatusTone(value)}>{humanize(value)}</Badge>
                          </span>
                        );
                      }

                      if (column.type === 'link') {
                        return (
                          <span className="entity-link-cell" key={column.field}>
                            {value ? <ExternalLink aria-hidden="true" size={14} /> : null}
                            {formatCellValue(record, column)}
                          </span>
                        );
                      }

                      return index === 0 ? (
                        <strong key={column.field}>{formatCellValue(record, column)}</strong>
                      ) : (
                        <span key={column.field}>{formatCellValue(record, column)}</span>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <aside className="panel entity-side-panel">
          {formMode ? (
            <form className="entity-form" onSubmit={handleSubmit}>
              <div className="panel-header">
                <div>
                  <h2>{formMode === 'edit' ? 'Editar' : 'Nuevo registro'}</h2>
                  <p>{route.label}</p>
                </div>
                <button
                  aria-label="Cerrar formulario"
                  className="icon-button"
                  onClick={() => setFormMode(null)}
                  type="button"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </div>

              <div className="entity-form-grid">
                {config.fields.map((field) => (
                  <EntityField
                    field={field}
                    key={field.name}
                    onChange={handleFieldChange}
                    value={formValues[field.name] ?? ''}
                  />
                ))}
              </div>

              <div className="entity-form-actions">
                <button className="button button-secondary" onClick={() => setFormMode(null)} type="button">
                  Cancelar
                </button>
                <button className="button button-primary" disabled={saving} type="submit">
                  <Save aria-hidden="true" size={15} />
                  {saving ? 'Guardando' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : selectedRecord ? (
            <div className="entity-detail">
              <div className="panel-header">
                <div>
                  <h2>Detalle</h2>
                  <p>{currentSelectedId}</p>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => openEditForm(selectedRecord)}
                  type="button"
                >
                  <Pencil aria-hidden="true" size={14} />
                  Editar
                </button>
              </div>

              <div className="entity-detail-stack">
                {config.columns.slice(1).map((column) => (
                  <div className="entity-detail-row" key={column.field}>
                    <span>{column.label}</span>
                    {column.tone ? (
                      <Badge tone={getStatusTone(selectedRecord[column.field])}>
                        {humanize(selectedRecord[column.field])}
                      </Badge>
                    ) : (
                      <strong>{formatCellValue(selectedRecord, column)}</strong>
                    )}
                  </div>
                ))}
                {config.linkFields
                  .filter((link) => selectedRecord[link.field])
                  .map((link) => (
                    <a
                      className="entity-link-card"
                      href={String(selectedRecord[link.field])}
                      key={link.field}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                      <ExternalLink aria-hidden="true" size={14} />
                    </a>
                  ))}
              </div>

              <div className="entity-workspace-actions">
                {getWorkspaceActions(entity, selectedRecord).map((item) => {
                  const ActionIcon = item.icon;

                  return (
                    <button
                      className="button button-secondary"
                      disabled={Boolean(workspaceAction) || saving}
                      key={item.action}
                      onClick={() => void handleWorkspaceAction(item.action)}
                      type="button"
                    >
                      {workspaceAction === item.action ? (
                        <Loader2 aria-hidden="true" className="spin-icon" size={14} />
                      ) : (
                        <ActionIcon aria-hidden="true" size={14} />
                      )}
                      {workspaceAction === item.action ? 'Procesando' : item.label}
                    </button>
                  );
                })}
              </div>

              {workspaceMessage ? (
                <div className="entity-success" role="status">
                  {workspaceMessage}
                </div>
              ) : null}

              <button
                className="danger-link"
                disabled={saving}
                onClick={() => void handleDelete()}
                type="button"
              >
                <Trash2 aria-hidden="true" size={14} />
                Archivar
              </button>
            </div>
          ) : (
            <div className="entity-empty entity-empty-side">
              <span>Sin selección</span>
              <button className="button button-primary" onClick={openCreateForm} type="button">
                <Plus aria-hidden="true" size={15} />
                Crear
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
