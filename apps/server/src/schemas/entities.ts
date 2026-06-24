import { z } from 'zod';

const optionalText = z.string().optional().default('');
const requiredText = z.string().trim().min(1);
const timestampText = z.string().trim().min(1);
const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().optional()
);
const requiredNumber = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number()
);
const optionalBoolean = z
  .preprocess((value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }

    return value;
  }, z.boolean().optional())
  .default(false);
const requiredBoolean = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }

  return value;
}, z.boolean());

const monedaSchema = z.enum(['COP', 'USD', 'EUR', 'otro']);
const modalidadFacturacionSchema = z.enum([
  'mensualidad',
  'proyecto_cerrado',
  'hitos',
  'horas',
  'exito',
  'anticipo_saldo',
  'bolsa_horas',
  'mixto'
]);
const origenInvestigacionSchema = z.enum(['idea', 'cliente', 'proyecto', 'oportunidad', 'necesidad']);

const timestampFields = {
  fecha_actualizacion: timestampText,
  fecha_creacion: timestampText
};

export function calculateIdeaPriorityScore(input: {
  dinero_potencial?: number;
  esfuerzo?: number;
  impacto?: number;
  urgencia?: number;
}) {
  const impacto = input.impacto ?? 0;
  const dineroPotencial = input.dinero_potencial ?? 0;
  const urgencia = input.urgencia ?? 0;
  const esfuerzo = input.esfuerzo ?? 0;
  const score =
    impacto * 0.35 + dineroPotencial * 0.35 + urgencia * 0.2 + (6 - esfuerzo) * 0.1;

  return Math.round(score * 100) / 100;
}

export const clientSchema = z.object({
  cliente_id: requiredText,
  tipo_cliente: z.enum(['interno', 'externo']),
  nombre: requiredText,
  naturaleza: z.enum(['persona', 'empresa']),
  estado: z.enum(['prospecto', 'activo', 'inactivo']),
  email_principal: optionalText,
  celular_principal: optionalText,
  datos_facturacion: optionalText,
  notas: optionalText,
  drive_folder_id: optionalText,
  drive_folder_url: optionalText,
  proxima_accion: optionalText,
  ...timestampFields
});

export const contactSchema = z.object({
  contacto_id: requiredText,
  cliente_id: requiredText,
  nombre: requiredText,
  cargo: optionalText,
  email: optionalText,
  celular: optionalText,
  rol: z
    .enum(['decisor', 'influenciador', 'usuario', 'financiero', 'legal', 'tecnico', 'operativo', 'otro'])
    .optional()
    .or(z.literal('')),
  influencia: z.enum(['alta', 'media', 'baja']).optional().or(z.literal('')),
  relacion: z.enum(['fuerte', 'normal', 'debil']).optional().or(z.literal('')),
  notas: optionalText,
  ...timestampFields
});

export const ideaSchema = z.object({
  idea_id: requiredText,
  titulo: requiredText,
  descripcion: requiredText,
  tipo: z.enum([
    'nuevo_producto',
    'nuevo_servicio',
    'mejora_interna',
    'automatizacion',
    'nueva_linea_negocio',
    'upsell',
    'cross_sell',
    'investigacion_mercado',
    'mejora_proceso',
    'contenido',
    'alianza',
    'tecnologia',
    'reduccion_costos',
    'otro'
  ]),
  origen: z.enum([
    'idea_suelta',
    'cliente',
    'proyecto',
    'oportunidad',
    'investigacion',
    'queja',
    'problema_operativo',
    'insight_mercado',
    'otro'
  ]),
  cliente_id: requiredText,
  proyecto_id: optionalText,
  oportunidad_id: optionalText,
  necesidad_id: optionalText,
  estado: z.enum([
    'capturada',
    'en_revision',
    'en_investigacion',
    'en_validacion',
    'priorizada',
    'aprobada',
    'convertida_proyecto',
    'convertida_oportunidad',
    'convertida_producto',
    'descartada',
    'archivada'
  ]),
  impacto: optionalNumber,
  dinero_potencial: optionalNumber,
  urgencia: optionalNumber,
  esfuerzo: optionalNumber,
  confianza: optionalNumber,
  score_prioridad: optionalNumber,
  proxima_accion: optionalText,
  comentarios: optionalText,
  doc_id: optionalText,
  doc_url: optionalText,
  drive_folder_id: optionalText,
  fecha_captura: timestampText,
  fecha_revision: optionalText,
  fecha_actualizacion: timestampText
});

export const needSchema = z
  .object({
    necesidad_id: requiredText,
    descripcion: requiredText,
    cliente_id: optionalText,
    proyecto_id: optionalText,
    contacto_id: optionalText,
    evidencia: optionalText,
    urgencia: optionalNumber,
    impacto: optionalNumber,
    estado: z.enum([
      'nueva',
      'en_analisis',
      'convertida_idea',
      'convertida_oportunidad',
      'convertida_tarea',
      'convertida_proyecto',
      'descartada'
    ]),
    proxima_accion: optionalText,
    ...timestampFields
  })
  .refine((value) => value.cliente_id || value.proyecto_id, {
    message: 'Necesidad requiere cliente_id o proyecto_id.'
  });

export const researchSchema = z.object({
  investigacion_id: requiredText,
  titulo: requiredText,
  tipo_origen: origenInvestigacionSchema,
  origen_id: requiredText,
  cliente_id: optionalText,
  problema: optionalText,
  contexto: optionalText,
  usuario_afectado: optionalText,
  mercado: optionalText,
  competidores: optionalText,
  soluciones_existentes: optionalText,
  benchmark: optionalText,
  pricing: optionalText,
  viabilidad_tecnica: optionalText,
  viabilidad_comercial: optionalText,
  riesgos: optionalText,
  fuentes: optionalText,
  hallazgos: optionalText,
  conclusion: optionalText,
  recomendacion: optionalText,
  estado: z.enum(['pendiente', 'en_curso', 'completa', 'requiere_validacion', 'archivada']),
  doc_id: optionalText,
  doc_url: optionalText,
  ...timestampFields
});

export const validationSchema = z.object({
  validacion_id: requiredText,
  tipo_origen: z.enum(['idea', 'investigacion', 'oportunidad']),
  origen_id: requiredText,
  hipotesis: requiredText,
  metodo: z.enum([
    'entrevista',
    'encuesta',
    'prototipo',
    'landing_page',
    'cotizacion',
    'prueba_interna',
    'prueba_cliente',
    'venta_real',
    'analisis_financiero',
    'revision_tecnica'
  ]),
  criterio_exito: optionalText,
  resultado: optionalText,
  aprendizaje: optionalText,
  decision: z.enum(['continuar', 'pausar', 'descartar', 'convertir']).optional().or(z.literal('')),
  evidencia: optionalText,
  fecha: timestampText
});

export const opportunitySchema = z.object({
  oportunidad_id: requiredText,
  cliente_id: requiredText,
  contacto_id: optionalText,
  titulo: requiredText,
  descripcion: optionalText,
  origen: z.enum(['lead', 'cliente', 'idea', 'investigacion', 'proyecto', 'necesidad', 'otro']),
  origen_id: optionalText,
  valor_estimado: optionalNumber,
  moneda: monedaSchema.optional().or(z.literal('')),
  probabilidad: optionalNumber,
  fecha_cierre_esperada: optionalText,
  estado: z.enum([
    'nueva',
    'calificada',
    'en_descubrimiento',
    'propuesta_pendiente',
    'propuesta_enviada',
    'negociacion',
    'ganada',
    'perdida',
    'pausada'
  ]),
  proxima_accion: optionalText,
  propuesta_id: optionalText,
  proyecto_id: optionalText,
  razon_perdida: optionalText,
  ...timestampFields
});

export const proposalSchema = z.object({
  propuesta_id: requiredText,
  cliente_id: requiredText,
  oportunidad_id: optionalText,
  idea_id: optionalText,
  proyecto_id: optionalText,
  titulo: requiredText,
  alcance: optionalText,
  exclusiones: optionalText,
  precio: optionalNumber,
  moneda: monedaSchema.optional().or(z.literal('')),
  modalidad_facturacion: modalidadFacturacionSchema.optional().or(z.literal('')),
  hitos: optionalText,
  cronograma: optionalText,
  version: optionalText,
  estado: z.enum(['borrador', 'en_revision', 'aprobada_internamente', 'enviada', 'aceptada', 'rechazada', 'vencida']),
  doc_id: optionalText,
  doc_url: optionalText,
  ...timestampFields
});

export const contractSchema = z.object({
  contrato_id: requiredText,
  cliente_id: requiredText,
  propuesta_id: optionalText,
  titulo: requiredText,
  vigencia_inicio: optionalText,
  vigencia_fin: optionalText,
  condiciones_pago: optionalText,
  responsable_interno: optionalText,
  contacto_firmante_id: optionalText,
  estado: z.enum(['borrador', 'activo', 'vencido', 'terminado', 'cancelado']),
  doc_id: optionalText,
  doc_url: optionalText,
  fecha_creacion: timestampText
});

export const projectSchema = z.object({
  proyecto_id: requiredText,
  cliente_id: requiredText,
  titulo: requiredText,
  descripcion: optionalText,
  tipo: z.enum(['cliente', 'interno', 'investigacion', 'producto', 'comercial', 'implementacion', 'mejora']),
  origen: z.enum(['cliente', 'idea', 'oportunidad', 'investigacion', 'proyecto_anterior', 'necesidad', 'otro']),
  origen_id: optionalText,
  objetivo: optionalText,
  responsable: requiredText,
  estado: z.enum(['planeado', 'activo', 'en_pausa', 'bloqueado', 'en_revision', 'cerrado', 'cancelado']),
  semaforo: z.enum(['verde', 'amarillo', 'rojo']),
  fecha_inicio: optionalText,
  fecha_fin_estimada: optionalText,
  presupuesto: optionalNumber,
  moneda: monedaSchema.optional().or(z.literal('')),
  facturable: requiredBoolean,
  modalidad_facturacion: modalidadFacturacionSchema.optional().or(z.literal('')),
  proxima_accion: optionalText,
  resultado_esperado: optionalText,
  drive_folder_id: optionalText,
  drive_folder_url: optionalText,
  doc_brief_id: optionalText,
  doc_brief_url: optionalText,
  ...timestampFields
});

export const milestoneSchema = z.object({
  hito_id: requiredText,
  proyecto_id: requiredText,
  titulo: requiredText,
  descripcion: optionalText,
  fecha_compromiso: optionalText,
  estado: z.enum(['pendiente', 'en_progreso', 'cumplido', 'vencido', 'cancelado']),
  facturable: optionalBoolean,
  valor_facturable: optionalNumber,
  factura_id: optionalText
});

export const taskSchema = z.object({
  tarea_id: requiredText,
  proyecto_id: requiredText,
  hito_id: optionalText,
  tipo: z.enum(['tarea', 'subtarea', 'solicitud', 'bug', 'bloqueador', 'riesgo', 'aprobacion', 'entregable']),
  titulo: requiredText,
  descripcion: optionalText,
  estado: z.enum(['backlog', 'pendiente', 'en_progreso', 'bloqueada', 'en_revision', 'terminada', 'cancelada']),
  prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
  fecha_vencimiento: optionalText,
  responsable: requiredText,
  proxima_accion: optionalText,
  checklist: optionalText,
  comentarios: optionalText,
  genera_idea: optionalBoolean,
  genera_necesidad: optionalBoolean,
  genera_aprendizaje: optionalBoolean,
  ...timestampFields
});

export const invoiceSchema = z.object({
  factura_id: requiredText,
  cliente_id: requiredText,
  proyecto_id: optionalText,
  oportunidad_id: optionalText,
  contrato_id: optionalText,
  hito_id: optionalText,
  concepto: requiredText,
  modalidad: modalidadFacturacionSchema,
  valor: requiredNumber,
  moneda: monedaSchema,
  fecha_emision: optionalText,
  fecha_vencimiento: optionalText,
  estado: z.enum(['por_facturar', 'borrador', 'facturada', 'pagada_parcialmente', 'pagada', 'vencida', 'cancelada']),
  doc_id: optionalText,
  doc_url: optionalText,
  soporte_pago_url: optionalText,
  pago_id: optionalText,
  ...timestampFields
});

export const paymentSchema = z.object({
  pago_id: requiredText,
  factura_id: requiredText,
  cliente_id: requiredText,
  valor_pagado: requiredNumber,
  moneda: monedaSchema,
  fecha_pago: timestampText,
  metodo_pago: optionalText,
  soporte_url: optionalText,
  notas: optionalText
});

export const resultSchema = z.object({
  resultado_id: requiredText,
  tipo: z.enum(['financiero', 'operativo', 'comercial', 'innovacion', 'satisfaccion_cliente', 'otro']),
  cliente_id: optionalText,
  proyecto_id: optionalText,
  idea_id: optionalText,
  oportunidad_id: optionalText,
  producto_id: optionalText,
  metrica: optionalText,
  valor_esperado: optionalText,
  valor_real: optionalText,
  conclusion: optionalText,
  fecha: timestampText
});

export const learningSchema = z.object({
  aprendizaje_id: requiredText,
  origen: z.enum(['proyecto', 'idea', 'oportunidad', 'investigacion', 'cliente']),
  origen_id: requiredText,
  descripcion: requiredText,
  que_funciono: optionalText,
  que_no_funciono: optionalText,
  recomendacion_futura: optionalText,
  genera_nueva_idea: optionalBoolean,
  idea_id_generada: optionalText,
  fecha: timestampText
});

export const documentSchema = z.object({
  documento_id: requiredText,
  titulo: requiredText,
  tipo: z.enum([
    'idea_brief',
    'investigacion',
    'validacion',
    'propuesta',
    'contrato',
    'proyecto_brief',
    'factura',
    'reporte',
    'cierre',
    'retrospectiva',
    'otro'
  ]),
  entidad_tipo: requiredText,
  entidad_id: requiredText,
  google_doc_id: optionalText,
  google_doc_url: optionalText,
  drive_folder_id: optionalText,
  fecha_creacion: timestampText
});

export const relationSchema = z.object({
  relacion_id: requiredText,
  entidad_a_tipo: requiredText,
  entidad_a_id: requiredText,
  relacion: requiredText,
  entidad_b_tipo: requiredText,
  entidad_b_id: requiredText,
  notas: optionalText,
  fecha_creacion: timestampText
});

export const configurationSchema = z.object({
  clave: requiredText,
  valor: requiredText,
  descripcion: optionalText,
  fecha_actualizacion: timestampText
});

export const activityLogSchema = z.object({
  log_id: requiredText,
  fecha: timestampText,
  usuario: requiredText,
  accion: requiredText,
  entidad_tipo: optionalText,
  entidad_id: optionalText,
  descripcion: optionalText,
  resultado: z.enum(['success', 'error']).optional().or(z.literal('')),
  error: optionalText
});

export const entitySchemas = {
  activityLog: activityLogSchema,
  clients: clientSchema,
  configuration: configurationSchema,
  contacts: contactSchema,
  contracts: contractSchema,
  documents: documentSchema,
  ideas: ideaSchema,
  invoices: invoiceSchema,
  learnings: learningSchema,
  milestones: milestoneSchema,
  needs: needSchema,
  opportunities: opportunitySchema,
  payments: paymentSchema,
  projects: projectSchema,
  proposals: proposalSchema,
  relations: relationSchema,
  research: researchSchema,
  results: resultSchema,
  tasks: taskSchema,
  validations: validationSchema
};

export type EntitySchemaMap = typeof entitySchemas;
export type EntityKey = keyof EntitySchemaMap;
export type EntityRecord<TKey extends EntityKey> = z.infer<EntitySchemaMap[TKey]>;

export type EntityConfig<TKey extends EntityKey = EntityKey> = {
  deletedStates?: string[];
  idField: string;
  idPrefix: string;
  logActivity?: boolean;
  sheetName: string;
  deletePatch?: Record<string, unknown>;
};

export const entityConfigs = {
  clients: {
    deletedStates: ['inactivo'],
    deletePatch: { estado: 'inactivo' },
    idField: 'cliente_id',
    idPrefix: 'CLI',
    sheetName: 'Clientes'
  },
  contacts: {
    idField: 'contacto_id',
    idPrefix: 'CON',
    sheetName: 'Contactos'
  },
  ideas: {
    deletedStates: ['archivada'],
    deletePatch: { estado: 'archivada' },
    idField: 'idea_id',
    idPrefix: 'IDE',
    sheetName: 'Ideas'
  },
  needs: {
    deletedStates: ['descartada'],
    deletePatch: { estado: 'descartada' },
    idField: 'necesidad_id',
    idPrefix: 'NEC',
    sheetName: 'Necesidades'
  },
  research: {
    deletedStates: ['archivada'],
    deletePatch: { estado: 'archivada' },
    idField: 'investigacion_id',
    idPrefix: 'INV',
    sheetName: 'Investigaciones'
  },
  validations: {
    idField: 'validacion_id',
    idPrefix: 'VAL',
    sheetName: 'Validaciones'
  },
  opportunities: {
    deletedStates: ['perdida', 'pausada'],
    deletePatch: { estado: 'pausada' },
    idField: 'oportunidad_id',
    idPrefix: 'OPP',
    sheetName: 'Oportunidades'
  },
  proposals: {
    deletedStates: ['rechazada', 'vencida'],
    deletePatch: { estado: 'rechazada' },
    idField: 'propuesta_id',
    idPrefix: 'PRP',
    sheetName: 'Propuestas'
  },
  contracts: {
    deletedStates: ['cancelado'],
    deletePatch: { estado: 'cancelado' },
    idField: 'contrato_id',
    idPrefix: 'CTR',
    sheetName: 'Contratos'
  },
  projects: {
    deletedStates: ['cancelado'],
    deletePatch: { estado: 'cancelado' },
    idField: 'proyecto_id',
    idPrefix: 'PRO',
    sheetName: 'Proyectos'
  },
  milestones: {
    deletedStates: ['cancelado'],
    deletePatch: { estado: 'cancelado' },
    idField: 'hito_id',
    idPrefix: 'HIT',
    sheetName: 'Hitos'
  },
  tasks: {
    deletedStates: ['cancelada'],
    deletePatch: { estado: 'cancelada' },
    idField: 'tarea_id',
    idPrefix: 'TAR',
    sheetName: 'Tareas'
  },
  invoices: {
    deletedStates: ['cancelada'],
    deletePatch: { estado: 'cancelada' },
    idField: 'factura_id',
    idPrefix: 'FAC',
    sheetName: 'Facturas'
  },
  payments: {
    idField: 'pago_id',
    idPrefix: 'PAG',
    sheetName: 'Pagos'
  },
  results: {
    idField: 'resultado_id',
    idPrefix: 'RES',
    sheetName: 'Resultados'
  },
  learnings: {
    idField: 'aprendizaje_id',
    idPrefix: 'APR',
    sheetName: 'Aprendizajes'
  },
  documents: {
    idField: 'documento_id',
    idPrefix: 'DOC',
    sheetName: 'Documentos'
  },
  relations: {
    idField: 'relacion_id',
    idPrefix: 'REL',
    sheetName: 'Relaciones'
  },
  configuration: {
    idField: 'clave',
    idPrefix: 'CFG',
    logActivity: false,
    sheetName: 'Configuracion'
  },
  activityLog: {
    idField: 'log_id',
    idPrefix: 'LOG',
    logActivity: false,
    sheetName: 'Log_Actividad'
  }
} satisfies { [TKey in EntityKey]: EntityConfig<TKey> };
