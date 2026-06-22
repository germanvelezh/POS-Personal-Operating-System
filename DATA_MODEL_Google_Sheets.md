# DATA MODEL — Google Sheets para Startup OS Personal

## 1. Principios del modelo

Google Sheets será la base de datos canónica. Cada hoja representa una entidad. Cada fila representa un registro. Cada registro debe tener ID único, timestamps y estado.

## 2. Hojas requeridas

1. Clientes
2. Contactos
3. Ideas
4. Necesidades
5. Investigaciones
6. Validaciones
7. Oportunidades
8. Propuestas
9. Contratos
10. Proyectos
11. Hitos
12. Tareas
13. Facturas
14. Pagos
15. Resultados
16. Aprendizajes
17. Documentos
18. Relaciones
19. Configuracion
20. Log_Actividad

## 3. Clientes

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| cliente_id | string | sí | CLI-YYYYMMDD-XXXX |
| tipo_cliente | enum | sí | interno, externo |
| nombre | string | sí | Nombre persona/empresa |
| naturaleza | enum | sí | persona, empresa |
| estado | enum | sí | prospecto, activo, inactivo |
| email_principal | string | no |  |
| celular_principal | string | no |  |
| datos_facturacion | text | no | NIT/CC, dirección, razón social, etc. |
| notas | text | no |  |
| drive_folder_id | string | no | ID carpeta Drive |
| drive_folder_url | string | no | URL carpeta Drive |
| proxima_accion | text | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 4. Contactos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| contacto_id | string | sí | CON-YYYYMMDD-XXXX |
| cliente_id | string | sí | FK Clientes |
| nombre | string | sí |  |
| cargo | string | no |  |
| email | string | no |  |
| celular | string | no |  |
| rol | enum | no | decisor, influenciador, usuario, financiero, legal, tecnico, operativo, otro |
| influencia | enum | no | alta, media, baja |
| relacion | enum | no | fuerte, normal, debil |
| notas | text | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 5. Ideas

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| idea_id | string | sí | IDE-YYYYMMDD-XXXX |
| titulo | string | sí |  |
| descripcion | text | sí |  |
| tipo | enum | sí | nuevo_producto, nuevo_servicio, mejora_interna, automatizacion, nueva_linea_negocio, upsell, cross_sell, investigacion_mercado, mejora_proceso, contenido, alianza, tecnologia, reduccion_costos, otro |
| origen | enum | sí | idea_suelta, cliente, proyecto, oportunidad, investigacion, queja, problema_operativo, insight_mercado, otro |
| cliente_id | string | sí | usar cliente interno si no hay externo |
| proyecto_id | string | no | FK Proyectos |
| oportunidad_id | string | no | FK Oportunidades |
| necesidad_id | string | no | FK Necesidades |
| estado | enum | sí | capturada, en_revision, en_investigacion, en_validacion, priorizada, aprobada, convertida_proyecto, convertida_oportunidad, convertida_producto, descartada, archivada |
| impacto | number | no | 1-5 |
| dinero_potencial | number | no | 1-5 |
| urgencia | number | no | 1-5 |
| esfuerzo | number | no | 1-5 |
| confianza | number | no | 1-5 |
| score_prioridad | number | no | calculado |
| proxima_accion | text | no |  |
| comentarios | text | no |  |
| doc_id | string | no | Google Doc |
| doc_url | string | no |  |
| drive_folder_id | string | no |  |
| fecha_captura | date | sí |  |
| fecha_revision | date | no |  |
| fecha_actualizacion | date | sí |  |

## 6. Necesidades

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| necesidad_id | string | sí | NEC-YYYYMMDD-XXXX |
| descripcion | text | sí |  |
| cliente_id | string | no | Requerido si no hay proyecto_id |
| proyecto_id | string | no | Requerido si no hay cliente_id |
| contacto_id | string | no |  |
| evidencia | text | no |  |
| urgencia | number | no | 1-5 |
| impacto | number | no | 1-5 |
| estado | enum | sí | nueva, en_analisis, convertida_idea, convertida_oportunidad, convertida_tarea, convertida_proyecto, descartada |
| proxima_accion | text | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 7. Investigaciones

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| investigacion_id | string | sí | INV-YYYYMMDD-XXXX |
| titulo | string | sí |  |
| tipo_origen | enum | sí | idea, cliente, proyecto, oportunidad, necesidad |
| origen_id | string | sí | ID entidad origen |
| cliente_id | string | no |  |
| problema | text | no |  |
| contexto | text | no |  |
| usuario_afectado | text | no |  |
| mercado | text | no |  |
| competidores | text | no |  |
| soluciones_existentes | text | no |  |
| benchmark | text | no |  |
| pricing | text | no |  |
| viabilidad_tecnica | text | no |  |
| viabilidad_comercial | text | no |  |
| riesgos | text | no |  |
| fuentes | text | no | URLs o referencias |
| hallazgos | text | no |  |
| conclusion | text | no |  |
| recomendacion | text | no |  |
| estado | enum | sí | pendiente, en_curso, completa, requiere_validacion, archivada |
| doc_id | string | no | Google Doc |
| doc_url | string | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 8. Validaciones

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| validacion_id | string | sí | VAL-YYYYMMDD-XXXX |
| tipo_origen | enum | sí | idea, investigacion, oportunidad |
| origen_id | string | sí |  |
| hipotesis | text | sí |  |
| metodo | enum | sí | entrevista, encuesta, prototipo, landing_page, cotizacion, prueba_interna, prueba_cliente, venta_real, analisis_financiero, revision_tecnica |
| criterio_exito | text | no |  |
| resultado | text | no |  |
| aprendizaje | text | no |  |
| decision | enum | no | continuar, pausar, descartar, convertir |
| evidencia | text | no | link o texto |
| fecha | date | sí |  |

## 9. Oportunidades

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| oportunidad_id | string | sí | OPP-YYYYMMDD-XXXX |
| cliente_id | string | sí | FK Clientes |
| contacto_id | string | no | contacto principal |
| titulo | string | sí |  |
| descripcion | text | no |  |
| origen | enum | sí | lead, cliente, idea, investigacion, proyecto, necesidad, otro |
| origen_id | string | no |  |
| valor_estimado | number | no |  |
| moneda | enum | no | COP, USD, EUR, otro |
| probabilidad | number | no | 0-100 |
| fecha_cierre_esperada | date | no |  |
| estado | enum | sí | nueva, calificada, en_descubrimiento, propuesta_pendiente, propuesta_enviada, negociacion, ganada, perdida, pausada |
| proxima_accion | text | no |  |
| propuesta_id | string | no |  |
| proyecto_id | string | no | si gana |
| razon_perdida | text | no | obligatorio si estado=perdida |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 10. Propuestas

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| propuesta_id | string | sí | PRP-YYYYMMDD-XXXX |
| cliente_id | string | sí |  |
| oportunidad_id | string | no |  |
| idea_id | string | no |  |
| proyecto_id | string | no |  |
| titulo | string | sí |  |
| alcance | text | no |  |
| exclusiones | text | no |  |
| precio | number | no |  |
| moneda | enum | no | COP, USD, EUR, otro |
| modalidad_facturacion | enum | no | mensualidad, proyecto_cerrado, hitos, horas, exito, anticipo_saldo, bolsa_horas, mixto |
| hitos | text | no |  |
| cronograma | text | no |  |
| version | string | no | v1, v2, etc. |
| estado | enum | sí | borrador, en_revision, aprobada_internamente, enviada, aceptada, rechazada, vencida |
| doc_id | string | no |  |
| doc_url | string | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 11. Contratos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| contrato_id | string | sí | CTR-YYYYMMDD-XXXX |
| cliente_id | string | sí |  |
| propuesta_id | string | no |  |
| titulo | string | sí |  |
| vigencia_inicio | date | no |  |
| vigencia_fin | date | no |  |
| condiciones_pago | text | no |  |
| responsable_interno | string | no | Germán por defecto |
| contacto_firmante_id | string | no |  |
| estado | enum | sí | borrador, activo, vencido, terminado, cancelado |
| doc_id | string | no |  |
| doc_url | string | no |  |
| fecha_creacion | date | sí |  |

## 12. Proyectos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| proyecto_id | string | sí | PRO-YYYYMMDD-XXXX |
| cliente_id | string | sí | usar cliente interno si aplica |
| titulo | string | sí |  |
| descripcion | text | no |  |
| tipo | enum | sí | cliente, interno, investigacion, producto, comercial, implementacion, mejora |
| origen | enum | sí | cliente, idea, oportunidad, investigacion, proyecto_anterior, necesidad, otro |
| origen_id | string | no |  |
| objetivo | text | no |  |
| responsable | string | sí | Germán por defecto |
| estado | enum | sí | planeado, activo, en_pausa, bloqueado, en_revision, cerrado, cancelado |
| semaforo | enum | sí | verde, amarillo, rojo |
| fecha_inicio | date | no |  |
| fecha_fin_estimada | date | no |  |
| presupuesto | number | no |  |
| moneda | enum | no | COP, USD, EUR, otro |
| facturable | boolean | sí | true/false |
| modalidad_facturacion | enum | no | mensualidad, proyecto_cerrado, hitos, horas, exito, anticipo_saldo, bolsa_horas, mixto |
| proxima_accion | text | no |  |
| resultado_esperado | text | no |  |
| drive_folder_id | string | no |  |
| drive_folder_url | string | no |  |
| doc_brief_id | string | no |  |
| doc_brief_url | string | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 13. Hitos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| hito_id | string | sí | HIT-YYYYMMDD-XXXX |
| proyecto_id | string | sí |  |
| titulo | string | sí |  |
| descripcion | text | no |  |
| fecha_compromiso | date | no |  |
| estado | enum | sí | pendiente, en_progreso, cumplido, vencido, cancelado |
| facturable | boolean | no |  |
| valor_facturable | number | no |  |
| factura_id | string | no |  |

## 14. Tareas

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| tarea_id | string | sí | TAR-YYYYMMDD-XXXX |
| proyecto_id | string | sí |  |
| hito_id | string | no |  |
| tipo | enum | sí | tarea, subtarea, solicitud, bug, bloqueador, riesgo, aprobacion, entregable |
| titulo | string | sí |  |
| descripcion | text | no |  |
| estado | enum | sí | backlog, pendiente, en_progreso, bloqueada, en_revision, terminada, cancelada |
| prioridad | enum | sí | baja, media, alta, critica |
| fecha_vencimiento | date | no |  |
| responsable | string | sí | Germán por defecto |
| proxima_accion | text | no |  |
| checklist | text | no | JSON/texto simple |
| comentarios | text | no |  |
| genera_idea | boolean | no |  |
| genera_necesidad | boolean | no |  |
| genera_aprendizaje | boolean | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 15. Facturas

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| factura_id | string | sí | FAC-YYYYMMDD-XXXX |
| cliente_id | string | sí |  |
| proyecto_id | string | no |  |
| oportunidad_id | string | no |  |
| contrato_id | string | no |  |
| hito_id | string | no |  |
| concepto | text | sí |  |
| modalidad | enum | sí | mensualidad, proyecto_cerrado, hitos, horas, exito, anticipo_saldo, bolsa_horas, mixto |
| valor | number | sí |  |
| moneda | enum | sí | COP, USD, EUR, otro |
| fecha_emision | date | no |  |
| fecha_vencimiento | date | no |  |
| estado | enum | sí | por_facturar, borrador, facturada, pagada_parcialmente, pagada, vencida, cancelada |
| doc_id | string | no | Google Doc |
| doc_url | string | no |  |
| soporte_pago_url | string | no |  |
| pago_id | string | no |  |
| fecha_creacion | date | sí |  |
| fecha_actualizacion | date | sí |  |

## 16. Pagos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| pago_id | string | sí | PAG-YYYYMMDD-XXXX |
| factura_id | string | sí |  |
| cliente_id | string | sí |  |
| valor_pagado | number | sí |  |
| moneda | enum | sí | COP, USD, EUR, otro |
| fecha_pago | date | sí |  |
| metodo_pago | string | no |  |
| soporte_url | string | no |  |
| notas | text | no |  |

## 17. Resultados

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| resultado_id | string | sí | RES-YYYYMMDD-XXXX |
| tipo | enum | sí | financiero, operativo, comercial, innovacion, satisfaccion_cliente, otro |
| cliente_id | string | no |  |
| proyecto_id | string | no |  |
| idea_id | string | no |  |
| oportunidad_id | string | no |  |
| producto_id | string | no | futuro |
| metrica | string | no |  |
| valor_esperado | string | no |  |
| valor_real | string | no |  |
| conclusion | text | no |  |
| fecha | date | sí |  |

## 18. Aprendizajes

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| aprendizaje_id | string | sí | APR-YYYYMMDD-XXXX |
| origen | enum | sí | proyecto, idea, oportunidad, investigacion, cliente |
| origen_id | string | sí |  |
| descripcion | text | sí |  |
| que_funciono | text | no |  |
| que_no_funciono | text | no |  |
| recomendacion_futura | text | no |  |
| genera_nueva_idea | boolean | no |  |
| idea_id_generada | string | no |  |
| fecha | date | sí |  |

## 19. Documentos

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| documento_id | string | sí | DOC-YYYYMMDD-XXXX |
| titulo | string | sí |  |
| tipo | enum | sí | idea_brief, investigacion, validacion, propuesta, contrato, proyecto_brief, factura, reporte, cierre, retrospectiva, otro |
| entidad_tipo | string | sí | cliente, idea, proyecto, etc. |
| entidad_id | string | sí |  |
| google_doc_id | string | no |  |
| google_doc_url | string | no |  |
| drive_folder_id | string | no |  |
| fecha_creacion | date | sí |  |

## 20. Relaciones

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| relacion_id | string | sí | REL-YYYYMMDD-XXXX |
| entidad_a_tipo | string | sí |  |
| entidad_a_id | string | sí |  |
| relacion | string | sí | origina, relacionado_con, convertido_en, depende_de, etc. |
| entidad_b_tipo | string | sí |  |
| entidad_b_id | string | sí |  |
| notas | text | no |  |
| fecha_creacion | date | sí |  |

## 21. Configuracion

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| clave | string | sí |  |
| valor | string | sí |  |
| descripcion | text | no |  |
| fecha_actualizacion | date | sí |  |

Claves iniciales:

- CLIENTE_INTERNO_ID
- DRIVE_ROOT_FOLDER_ID
- DRIVE_ROOT_FOLDER_URL
- TEMPLATE_IDEA_BRIEF_ID
- TEMPLATE_INVESTIGATION_ID
- TEMPLATE_PROJECT_BRIEF_ID
- TEMPLATE_INVOICE_ID
- TEMPLATE_WEEKLY_REPORT_ID

## 22. Log_Actividad

| Columna | Tipo | Requerido | Notas |
|---|---|---:|---|
| log_id | string | sí | LOG-YYYYMMDD-XXXX |
| fecha | datetime | sí |  |
| usuario | string | sí | Germán |
| accion | string | sí | created, updated, deleted, generated_doc, etc. |
| entidad_tipo | string | no |  |
| entidad_id | string | no |  |
| descripcion | text | no |  |
| resultado | enum | no | success, error |
| error | text | no |  |

