import type { EntityKey } from '../schemas/entities.js';

export type EntityRouteKey =
  | 'clients'
  | 'ideas'
  | 'projects'
  | 'tasks'
  | 'opportunities'
  | 'invoices';

export type EntityRouteConfig = {
  defaults: Record<string, unknown>;
  idField: string;
  internalClientFallback?: boolean;
  repositoryKey: EntityKey;
  requiredCreateFields: string[];
  searchFields: string[];
  statusField: string;
  titleField: string;
};

export const entityRouteConfigs: Record<EntityRouteKey, EntityRouteConfig> = {
  clients: {
    defaults: {
      estado: 'prospecto',
      naturaleza: 'empresa',
      tipo_cliente: 'externo'
    },
    idField: 'cliente_id',
    repositoryKey: 'clients',
    requiredCreateFields: ['nombre'],
    searchFields: ['nombre', 'email_principal', 'celular_principal', 'notas'],
    statusField: 'estado',
    titleField: 'nombre'
  },
  ideas: {
    defaults: {
      estado: 'capturada',
      origen: 'idea_suelta',
      tipo: 'otro'
    },
    idField: 'idea_id',
    internalClientFallback: true,
    repositoryKey: 'ideas',
    requiredCreateFields: ['titulo', 'descripcion'],
    searchFields: ['titulo', 'descripcion', 'comentarios', 'proxima_accion'],
    statusField: 'estado',
    titleField: 'titulo'
  },
  projects: {
    defaults: {
      estado: 'planeado',
      facturable: false,
      origen: 'otro',
      responsable: 'Germán',
      semaforo: 'verde',
      tipo: 'interno'
    },
    idField: 'proyecto_id',
    internalClientFallback: true,
    repositoryKey: 'projects',
    requiredCreateFields: ['titulo'],
    searchFields: ['titulo', 'descripcion', 'objetivo', 'proxima_accion'],
    statusField: 'estado',
    titleField: 'titulo'
  },
  tasks: {
    defaults: {
      estado: 'pendiente',
      prioridad: 'media',
      responsable: 'Germán',
      tipo: 'tarea'
    },
    idField: 'tarea_id',
    repositoryKey: 'tasks',
    requiredCreateFields: ['titulo', 'proyecto_id'],
    searchFields: ['titulo', 'descripcion', 'responsable', 'proxima_accion'],
    statusField: 'estado',
    titleField: 'titulo'
  },
  opportunities: {
    defaults: {
      estado: 'nueva',
      moneda: 'COP',
      origen: 'lead'
    },
    idField: 'oportunidad_id',
    repositoryKey: 'opportunities',
    requiredCreateFields: ['titulo', 'cliente_id'],
    searchFields: ['titulo', 'descripcion', 'proxima_accion', 'razon_perdida'],
    statusField: 'estado',
    titleField: 'titulo'
  },
  invoices: {
    defaults: {
      estado: 'por_facturar',
      modalidad: 'proyecto_cerrado',
      moneda: 'COP'
    },
    idField: 'factura_id',
    repositoryKey: 'invoices',
    requiredCreateFields: ['concepto', 'cliente_id', 'valor'],
    searchFields: ['concepto', 'doc_url', 'soporte_pago_url'],
    statusField: 'estado',
    titleField: 'concepto'
  }
};

export function isEntityRouteKey(value: string): value is EntityRouteKey {
  return value in entityRouteConfigs;
}
