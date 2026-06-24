export const ROOT_FOLDER_NAME = 'Startup OS';
export const MASTER_SPREADSHEET_NAME = 'Startup OS Personal - Base Maestra';
export const INTERNAL_CLIENT_NAME = 'Germán / Startup Interna';

export type SheetDefinition = {
  name: string;
  headers: string[];
};

export const SHEET_DEFINITIONS: SheetDefinition[] = [
  {
    name: 'Clientes',
    headers: [
      'cliente_id',
      'tipo_cliente',
      'nombre',
      'naturaleza',
      'estado',
      'email_principal',
      'celular_principal',
      'datos_facturacion',
      'notas',
      'drive_folder_id',
      'drive_folder_url',
      'proxima_accion',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Contactos',
    headers: [
      'contacto_id',
      'cliente_id',
      'nombre',
      'cargo',
      'email',
      'celular',
      'rol',
      'influencia',
      'relacion',
      'notas',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Ideas',
    headers: [
      'idea_id',
      'titulo',
      'descripcion',
      'tipo',
      'origen',
      'cliente_id',
      'proyecto_id',
      'oportunidad_id',
      'necesidad_id',
      'estado',
      'impacto',
      'dinero_potencial',
      'urgencia',
      'esfuerzo',
      'confianza',
      'score_prioridad',
      'proxima_accion',
      'comentarios',
      'doc_id',
      'doc_url',
      'drive_folder_id',
      'fecha_captura',
      'fecha_revision',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Necesidades',
    headers: [
      'necesidad_id',
      'descripcion',
      'cliente_id',
      'proyecto_id',
      'contacto_id',
      'evidencia',
      'urgencia',
      'impacto',
      'estado',
      'proxima_accion',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Investigaciones',
    headers: [
      'investigacion_id',
      'titulo',
      'tipo_origen',
      'origen_id',
      'cliente_id',
      'problema',
      'contexto',
      'usuario_afectado',
      'mercado',
      'competidores',
      'soluciones_existentes',
      'benchmark',
      'pricing',
      'viabilidad_tecnica',
      'viabilidad_comercial',
      'riesgos',
      'fuentes',
      'hallazgos',
      'conclusion',
      'recomendacion',
      'estado',
      'doc_id',
      'doc_url',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Validaciones',
    headers: [
      'validacion_id',
      'tipo_origen',
      'origen_id',
      'hipotesis',
      'metodo',
      'criterio_exito',
      'resultado',
      'aprendizaje',
      'decision',
      'evidencia',
      'fecha'
    ]
  },
  {
    name: 'Oportunidades',
    headers: [
      'oportunidad_id',
      'cliente_id',
      'contacto_id',
      'titulo',
      'descripcion',
      'origen',
      'origen_id',
      'valor_estimado',
      'moneda',
      'probabilidad',
      'fecha_cierre_esperada',
      'estado',
      'proxima_accion',
      'propuesta_id',
      'proyecto_id',
      'razon_perdida',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Propuestas',
    headers: [
      'propuesta_id',
      'cliente_id',
      'oportunidad_id',
      'idea_id',
      'proyecto_id',
      'titulo',
      'alcance',
      'exclusiones',
      'precio',
      'moneda',
      'modalidad_facturacion',
      'hitos',
      'cronograma',
      'version',
      'estado',
      'doc_id',
      'doc_url',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Contratos',
    headers: [
      'contrato_id',
      'cliente_id',
      'propuesta_id',
      'titulo',
      'vigencia_inicio',
      'vigencia_fin',
      'condiciones_pago',
      'responsable_interno',
      'contacto_firmante_id',
      'estado',
      'doc_id',
      'doc_url',
      'fecha_creacion'
    ]
  },
  {
    name: 'Proyectos',
    headers: [
      'proyecto_id',
      'cliente_id',
      'titulo',
      'descripcion',
      'tipo',
      'origen',
      'origen_id',
      'objetivo',
      'responsable',
      'estado',
      'semaforo',
      'fecha_inicio',
      'fecha_fin_estimada',
      'presupuesto',
      'moneda',
      'facturable',
      'modalidad_facturacion',
      'proxima_accion',
      'resultado_esperado',
      'drive_folder_id',
      'drive_folder_url',
      'doc_brief_id',
      'doc_brief_url',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Hitos',
    headers: [
      'hito_id',
      'proyecto_id',
      'titulo',
      'descripcion',
      'fecha_compromiso',
      'estado',
      'facturable',
      'valor_facturable',
      'factura_id'
    ]
  },
  {
    name: 'Tareas',
    headers: [
      'tarea_id',
      'proyecto_id',
      'hito_id',
      'tipo',
      'titulo',
      'descripcion',
      'estado',
      'prioridad',
      'fecha_vencimiento',
      'responsable',
      'proxima_accion',
      'checklist',
      'comentarios',
      'genera_idea',
      'genera_necesidad',
      'genera_aprendizaje',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Facturas',
    headers: [
      'factura_id',
      'cliente_id',
      'proyecto_id',
      'oportunidad_id',
      'contrato_id',
      'hito_id',
      'concepto',
      'modalidad',
      'valor',
      'moneda',
      'fecha_emision',
      'fecha_vencimiento',
      'estado',
      'doc_id',
      'doc_url',
      'soporte_pago_url',
      'pago_id',
      'fecha_creacion',
      'fecha_actualizacion'
    ]
  },
  {
    name: 'Pagos',
    headers: [
      'pago_id',
      'factura_id',
      'cliente_id',
      'valor_pagado',
      'moneda',
      'fecha_pago',
      'metodo_pago',
      'soporte_url',
      'notas'
    ]
  },
  {
    name: 'Resultados',
    headers: [
      'resultado_id',
      'tipo',
      'cliente_id',
      'proyecto_id',
      'idea_id',
      'oportunidad_id',
      'producto_id',
      'metrica',
      'valor_esperado',
      'valor_real',
      'conclusion',
      'fecha'
    ]
  },
  {
    name: 'Aprendizajes',
    headers: [
      'aprendizaje_id',
      'origen',
      'origen_id',
      'descripcion',
      'que_funciono',
      'que_no_funciono',
      'recomendacion_futura',
      'genera_nueva_idea',
      'idea_id_generada',
      'fecha'
    ]
  },
  {
    name: 'Documentos',
    headers: [
      'documento_id',
      'titulo',
      'tipo',
      'entidad_tipo',
      'entidad_id',
      'google_doc_id',
      'google_doc_url',
      'drive_folder_id',
      'fecha_creacion'
    ]
  },
  {
    name: 'Relaciones',
    headers: [
      'relacion_id',
      'entidad_a_tipo',
      'entidad_a_id',
      'relacion',
      'entidad_b_tipo',
      'entidad_b_id',
      'notas',
      'fecha_creacion'
    ]
  },
  {
    name: 'Configuracion',
    headers: ['clave', 'valor', 'descripcion', 'fecha_actualizacion']
  },
  {
    name: 'Log_Actividad',
    headers: [
      'log_id',
      'fecha',
      'usuario',
      'accion',
      'entidad_tipo',
      'entidad_id',
      'descripcion',
      'resultado',
      'error'
    ]
  }
];

export function getSheetDefinition(sheetName: string) {
  return SHEET_DEFINITIONS.find((definition) => definition.name === sheetName);
}
