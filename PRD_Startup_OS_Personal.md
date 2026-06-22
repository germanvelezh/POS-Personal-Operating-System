# PRD — Startup OS Personal

## 1. Resumen ejecutivo

**Startup OS Personal** es una aplicación local tipo web app para que Germán gestione su startup desde un único sistema privado. La aplicación correrá en su computador y usará Google Workspace como capa documental y de almacenamiento estructurado: Google Sheets como base de datos, Google Drive como repositorio de carpetas/archivos y Google Docs como generador de documentos.

El producto no está diseñado inicialmente como SaaS, ni como plataforma multiusuario, ni como CRM empresarial complejo. Es un sistema operativo personal para organizar clientes, ideas, necesidades detectadas, investigaciones, oportunidades, proyectos, tareas, facturación, resultados y aprendizajes.

## 2. Contexto y problema

Germán necesita una herramienta centralizada para controlar todas las variables de su empresa: qué está pendiente, qué proyectos están abiertos, qué oportunidades están en el funnel, qué ideas existen, cuáles deben investigarse, cuáles deben convertirse en proyectos, qué debe facturarse y cuáles son las prioridades. Actualmente la información vive dispersa en Excel, carpetas, memoria personal y documentos sueltos.

La app debe reducir carga mental, evitar pérdida de oportunidades, priorizar mejor el tiempo y servir como centro de mando ejecutivo.

## 3. Objetivos del producto

### Objetivo principal

Crear una aplicación local privada que permita gestionar integralmente la startup de Germán desde un dashboard ejecutivo conectado con todos los módulos operativos y estratégicos.

### Objetivos específicos

1. Centralizar clientes, ideas, oportunidades, proyectos, tareas y facturación.
2. Permitir capturar ideas desde la app y llevarlas por investigación, validación y decisión.
3. Permitir que los proyectos nazcan desde clientes, ideas, oportunidades, investigaciones o necesidades detectadas.
4. Gestionar tareas y prioridades personales.
5. Controlar facturación en todos los modelos: mensualidad, proyecto cerrado, hitos, horas, éxito, anticipo y mixto.
6. Crear automáticamente carpetas y documentos en Google Drive/Docs.
7. Generar reportes semanales en Google Docs.
8. Mantener trazabilidad del origen de cada proyecto, oportunidad, idea y resultado.
9. Operar sin Supabase, Firebase, PostgreSQL ni base de datos externa.

## 4. Principios de diseño

1. **Local-first operativo:** la app corre en el computador de Germán.
2. **Google Workspace como backend documental:** Sheets, Docs y Drive son la fuente de verdad y repositorio.
3. **Un solo usuario:** no diseñar flujos pesados de permisos, roles o aprobación multiusuario.
4. **Dashboard primero:** la pantalla principal debe ser un centro ejecutivo que lleve a todo.
5. **No linealidad:** la app debe aceptar múltiples entradas: idea, cliente, proyecto, necesidad, oportunidad o investigación.
6. **Trazabilidad:** todo objeto debe conservar su origen y sus relaciones.
7. **Velocidad de captura:** crear una idea, tarea o necesidad debe tomar menos de 30 segundos.
8. **Automatización útil, no complejidad:** automatizar carpetas, documentos, reportes y recordatorios.
9. **Datos simples, pero consistentes:** Google Sheets debe tener estructura clara, IDs únicos y catálogos controlados.
10. **Evolución gradual:** MVP primero, IA y automatizaciones avanzadas después.

## 5. Alcance del MVP

### Incluido en MVP

1. App local tipo web app.
2. Autenticación/conexión con Google APIs.
3. Google Sheets como base de datos.
4. Google Drive para crear carpetas automáticamente.
5. Google Docs para generar documentos desde plantillas.
6. Dashboard ejecutivo.
7. Módulo de clientes.
8. Módulo de contactos.
9. Módulo de ideas.
10. Módulo de necesidades detectadas.
11. Módulo de investigaciones.
12. Módulo de oportunidades comerciales.
13. Módulo de proyectos.
14. Módulo de tareas.
15. Módulo de facturación y pagos.
16. Módulo de resultados/aprendizajes básico.
17. Reporte semanal generado como Google Doc.
18. Configuración básica de IDs, carpetas, templates y estados.

### Excluido del MVP

1. Portal de clientes.
2. Multiusuario.
3. Permisos avanzados.
4. App móvil nativa.
5. Integración bancaria.
6. Facturación electrónica fiscal/DIAN.
7. Contabilidad completa.
8. Nómina.
9. Inventario.
10. Gantt avanzado.
11. Sprints tipo Jira avanzado.
12. IA autónoma que tome decisiones.
13. Supabase, Firebase, PostgreSQL o cualquier base de datos externa.
14. Backend cloud propietario.

## 6. Usuario principal

### Usuario único

**Germán**

Necesidades:

- Ver prioridades.
- Capturar ideas.
- Gestionar proyectos.
- Controlar oportunidades.
- Recordar pendientes.
- Controlar facturación.
- Generar documentos.
- Entender el estado general de la startup.

No hay clientes externos entrando a la app en MVP.

## 7. Lógica general del sistema

La app debe soportar varios caminos:

```text
Idea → Investigación → Validación → Decisión → Proyecto / Oportunidad / Producto / Descartado
```

```text
Cliente → Proyecto → Tareas → Facturación → Resultados
```

```text
Cliente → Necesidad Detectada → Idea → Investigación → Oportunidad → Propuesta → Proyecto
```

```text
Proyecto → Problema / Aprendizaje / Insight → Nueva Idea → Mejora / Producto / Oportunidad
```

```text
Idea interna → Cliente interno Germán → Proyecto interno → Tareas → Resultado
```

## 8. Cliente interno obligatorio

Debe existir un cliente interno por defecto:

```text
Cliente: Germán / Startup Interna
Tipo: Interno
```

Regla:

- Toda idea, proyecto, investigación u oportunidad interna sin cliente externo debe asociarse a este cliente interno.
- Esto evita objetos huérfanos y permite que todo el sistema funcione con una relación mínima a cliente.

## 9. Objetos principales

1. Cliente
2. Contacto
3. Idea
4. Necesidad detectada
5. Investigación
6. Validación
7. Oportunidad comercial
8. Propuesta
9. Contrato
10. Proyecto
11. Hito
12. Tarea
13. Factura
14. Pago
15. Resultado
16. Aprendizaje
17. Documento
18. Relación
19. Log de actividad

## 10. Relaciones obligatorias

| Objeto | Relación obligatoria |
|---|---|
| Contacto | Cliente |
| Idea | Cliente interno o cliente externo |
| Necesidad | Cliente o proyecto |
| Investigación | Idea, cliente o proyecto |
| Oportunidad | Cliente |
| Propuesta | Cliente y oportunidad/proyecto/idea |
| Contrato | Cliente |
| Proyecto | Cliente interno o externo |
| Hito | Proyecto |
| Tarea | Proyecto |
| Factura | Cliente |
| Pago | Factura |
| Resultado | Proyecto, idea, oportunidad o producto |
| Aprendizaje | Proyecto, idea, oportunidad o investigación |
| Documento | Al menos una entidad asociada |

## 11. Relaciones opcionales recomendadas

| Objeto | Relaciones opcionales |
|---|---|
| Idea | Proyecto, oportunidad, producto, necesidad |
| Necesidad | Contacto, tarea, investigación, oportunidad |
| Investigación | Varias ideas, varios clientes, oportunidad |
| Oportunidad | Idea, investigación, necesidad, proyecto origen |
| Proyecto | Idea origen, oportunidad origen, investigación origen, proyecto anterior |
| Factura | Proyecto, hito, contrato, entregable, oportunidad |
| Resultado | Cliente, proyecto, idea, oportunidad, producto |
| Aprendizaje | Cliente, producto, documento |

## 12. Dashboard ejecutivo

La pantalla principal debe ser un dashboard ejecutivo que permita navegar a todos los módulos.

### Debe mostrar

1. Resumen de prioridades del día.
2. Tareas vencidas.
3. Tareas que vencen esta semana.
4. Proyectos activos por semáforo.
5. Ideas por estado.
6. Oportunidades por estado y valor estimado.
7. Facturas por estado.
8. Facturación pendiente.
9. Top 3 prioridades sugeridas.
10. Objetos sin próxima acción.
11. Accesos rápidos: nueva idea, nuevo cliente, nuevo proyecto, nueva tarea, nueva oportunidad, nueva factura.

### KPIs iniciales

- Total oportunidades abiertas.
- Valor estimado del funnel.
- Proyectos activos.
- Tareas vencidas.
- Ideas en revisión.
- Ideas en investigación.
- Facturas por facturar.
- Facturas vencidas.
- Prioridad ponderada por impacto, dinero y urgencia.

## 13. Módulo de clientes

### Definición

Un cliente puede ser una persona, empresa o el cliente interno Germán/Startup Interna.

### Estados

- Prospecto
- Activo
- Inactivo

### Campos mínimos

- ID cliente
- Tipo: interno / externo
- Nombre
- Tipo de cliente: persona / empresa
- Estado
- Email principal
- Celular principal
- Datos de facturación
- Notas
- Carpeta Drive
- Fecha de creación
- Fecha de última actualización
- Próxima acción

### Ficha 360° del cliente

Debe mostrar:

1. Datos básicos.
2. Contactos.
3. Ideas relacionadas.
4. Necesidades detectadas.
5. Investigaciones relacionadas.
6. Oportunidades.
7. Proyectos.
8. Tareas abiertas.
9. Facturación.
10. Documentos.
11. Resultados.
12. Aprendizajes.
13. Próxima acción.

## 14. Módulo de contactos

### Campos mínimos

- ID contacto
- ID cliente
- Nombre
- Cargo
- Email
- Celular
- Rol: decisor, influenciador, usuario, financiero, legal, técnico, operativo, otro
- Nivel de influencia: alto, medio, bajo
- Nivel de relación: fuerte, normal, débil
- Notas

### Reglas

- Un contacto debe pertenecer a un cliente.
- Un contacto puede originar una idea o una oportunidad.
- No se gestionarán tareas directamente en contactos en MVP.

## 15. Módulo de ideas

### Definición

Una idea es cualquier posibilidad de crear, mejorar, automatizar, vender, investigar o explorar algo que pueda generar valor estratégico, operativo, comercial o financiero.

### Tipos de idea

- Nuevo producto
- Nuevo servicio
- Mejora interna
- Automatización
- Nueva línea de negocio
- Upsell a cliente
- Cross-sell
- Investigación de mercado
- Mejora de proceso
- Contenido
- Alianza
- Tecnología
- Reducción de costos
- Otro

### Estados

- Capturada
- En revisión
- En investigación
- En validación
- Priorizada
- Aprobada
- Convertida en proyecto
- Convertida en oportunidad
- Convertida en producto
- Descartada
- Archivada

### Campos mínimos

- ID idea
- Título
- Descripción
- Tipo
- Origen
- Cliente relacionado
- Proyecto relacionado
- Oportunidad relacionada
- Estado
- Impacto estimado: 1-5
- Dinero potencial: 1-5
- Urgencia: 1-5
- Esfuerzo estimado: 1-5
- Confianza: 1-5
- Score de prioridad
- Próxima acción
- Fecha de captura
- Fecha de revisión
- Comentarios
- Documento/Drive asociado

### Fórmula de prioridad sugerida

La prioridad debe ponderar impacto, dinero y urgencia por encima de facilidad.

```text
score_prioridad = (impacto * 0.35) + (dinero_potencial * 0.35) + (urgencia * 0.20) + ((6 - esfuerzo) * 0.10)
```

## 16. Módulo de necesidades detectadas

### Definición

Una necesidad detectada es un dolor, solicitud, problema, fricción, señal o deseo observado en un cliente, proyecto o proceso interno. Todavía no es una solución; es evidencia de que algo merece atención.

### Diferencia con idea

- Necesidad = qué duele o qué oportunidad aparece.
- Idea = qué podríamos hacer al respecto.

### Estados

- Nueva
- En análisis
- Convertida en idea
- Convertida en oportunidad
- Convertida en tarea
- Convertida en proyecto
- Descartada

### Campos mínimos

- ID necesidad
- Descripción
- Cliente relacionado
- Proyecto relacionado
- Contacto relacionado
- Evidencia
- Urgencia
- Impacto
- Estado
- Próxima acción
- Fecha de creación

## 17. Módulo de investigaciones

### Regla principal

Una investigación no debe existir sola. Debe estar asociada a una idea, cliente o proyecto.

### Estados

- Pendiente
- En curso
- Completa
- Requiere validación
- Archivada

### Campos mínimos

- ID investigación
- Título
- Tipo de origen: idea / cliente / proyecto / oportunidad / necesidad
- ID origen
- Problema
- Contexto
- Cliente o usuario afectado
- Mercado
- Competidores
- Soluciones existentes
- Benchmark
- Pricing
- Viabilidad técnica
- Viabilidad comercial
- Riesgos
- Fuentes
- Hallazgos
- Conclusión
- Recomendación
- Estado
- Documento Google Docs asociado

### Documento generado

Al crear una investigación, la app debe poder generar un Google Doc desde plantilla con secciones estructuradas.

## 18. Módulo de validación

### Propósito

Registrar evidencia antes de convertir una idea/investigación en proyecto, oportunidad, producto o descarte.

### Tipos de validación

- Entrevista
- Encuesta
- Prototipo
- Landing page
- Cotización
- Prueba interna
- Prueba con cliente
- Venta real
- Análisis financiero
- Revisión técnica

### Campos mínimos

- ID validación
- ID idea/investigación/oportunidad
- Hipótesis
- Método
- Criterio de éxito
- Resultado
- Aprendizaje
- Decisión: continuar / pausar / descartar / convertir
- Evidencia
- Fecha

## 19. Módulo de oportunidades comerciales

### Definición

Una oportunidad comercial es una posibilidad concreta de generar ingresos con un cliente o prospecto, nacida de un lead, cliente existente, idea, investigación, proyecto o necesidad detectada.

### Estados

- Nueva
- Calificada
- En descubrimiento
- Propuesta pendiente
- Propuesta enviada
- Negociación
- Ganada
- Perdida
- Pausada

### Campos mínimos

- ID oportunidad
- Cliente
- Contacto principal
- Origen: lead / cliente / idea / investigación / proyecto / necesidad
- ID origen
- Valor estimado
- Probabilidad de cierre
- Fecha esperada de cierre
- Estado
- Próxima acción
- Propuesta asociada
- Proyecto asociado si se gana
- Razón de pérdida

### Reglas

- Toda oportunidad debe tener cliente.
- Si no hay cliente externo, usar cliente interno.
- Una oportunidad ganada puede crear proyecto, contrato y plan de facturación.

## 20. Módulo de propuestas y contratos

### Propuestas

Estados:

- Borrador
- En revisión
- Aprobada internamente
- Enviada
- Aceptada
- Rechazada
- Vencida

Campos mínimos:

- ID propuesta
- Cliente
- Oportunidad / idea / proyecto origen
- Alcance
- Exclusiones
- Precio
- Modalidad de facturación
- Hitos
- Cronograma
- Responsable
- Versión
- Estado
- Documento Google Docs

### Contratos

Campos mínimos:

- ID contrato
- Cliente
- Propuesta asociada
- Vigencia
- Condiciones de pago
- Responsable interno
- Contacto firmante
- Documento asociado
- Estado

## 21. Módulo de proyectos

### Definición

Un proyecto es una iniciativa organizada con objetivo, responsable, tareas, estado, fechas y resultado esperado. Puede ser para cliente externo o para la startup interna.

### Tipos

- Proyecto cliente
- Proyecto interno
- Proyecto de investigación
- Proyecto de producto
- Proyecto comercial
- Proyecto de implementación
- Proyecto de mejora

### Estados

- Planeado
- Activo
- En pausa
- Bloqueado
- En revisión
- Cerrado
- Cancelado

### Semáforo

- Verde: avanza normalmente, sin vencimientos críticos.
- Amarillo: tiene riesgo, retraso moderado, falta información o hay tareas próximas a vencer.
- Rojo: bloqueado, vencido, sin próxima acción crítica o con impacto alto.

### Campos mínimos

- ID proyecto
- Cliente
- Tipo
- Origen: cliente / idea / oportunidad / investigación / proyecto anterior
- ID origen
- Objetivo
- Responsable
- Estado
- Semáforo
- Fecha inicio
- Fecha fin estimada
- Presupuesto
- Facturable: sí/no
- Modalidad de facturación
- Próxima acción
- Carpeta Drive
- Documento brief
- Resultado esperado

### Automatización al crear proyecto

La app debe crear automáticamente:

1. Carpeta del proyecto en Drive.
2. Subcarpetas estándar.
3. Documento brief del proyecto.
4. Tareas base si existe plantilla.

## 22. Módulo de tareas

### Tipos

- Tarea
- Subtarea
- Solicitud
- Bug/problema
- Bloqueador
- Riesgo
- Aprobación
- Entregable

### Estados

- Backlog
- Pendiente
- En progreso
- Bloqueada
- En revisión
- Terminada
- Cancelada

### Campos mínimos

- ID tarea
- Proyecto
- Tipo
- Título
- Descripción
- Estado
- Prioridad
- Fecha vencimiento
- Responsable
- Próxima acción
- Checklist
- Comentarios
- Genera idea: sí/no
- Genera necesidad: sí/no
- Genera aprendizaje: sí/no

## 23. Módulo de facturación y pagos

### Alcance MVP

La app debe controlar facturas y generar documentos de factura en Google Docs. No debe emitir facturación electrónica fiscal/DIAN en MVP, salvo que en el futuro se integre un proveedor especializado.

### Modalidades soportadas

- Mensualidad
- Proyecto cerrado
- Por hitos
- Por horas
- Por éxito
- Anticipo + saldo
- Bolsa de horas
- Mixto

### Estados de factura

- Por facturar
- Borrador
- Facturada
- Pagada parcialmente
- Pagada
- Vencida
- Cancelada

### Campos mínimos

- ID factura
- Cliente
- Proyecto
- Oportunidad
- Contrato
- Hito
- Concepto
- Modalidad
- Valor
- Moneda
- Fecha emisión
- Fecha vencimiento
- Estado
- Documento Google Docs
- Soporte de pago
- Pago asociado

## 24. Módulo de resultados y aprendizajes

### Resultado

Un resultado puede ser financiero, operativo, comercial, de innovación o satisfacción del cliente.

Campos mínimos:

- ID resultado
- Tipo
- Cliente
- Proyecto / idea / oportunidad / producto
- Métrica
- Valor esperado
- Valor real
- Conclusión
- Fecha

### Aprendizaje

Campos mínimos:

- ID aprendizaje
- Origen: proyecto / idea / oportunidad / investigación / cliente
- Descripción
- Qué funcionó
- Qué no funcionó
- Recomendación futura
- Puede generar nueva idea: sí/no
- Fecha

## 25. Documentos y Google Drive

### Estructura Drive

```text
/Startup OS
  /00_Dashboard
  /01_Clientes
    /{Cliente}
      /00_Resumen
      /01_Oportunidades
      /02_Proyectos
      /03_Propuestas
      /04_Contratos
      /05_Facturacion
      /06_Documentos
  /02_Ideas
  /03_Investigaciones
  /04_Productos
  /05_Reportes
  /99_Templates
```

### Plantillas Google Docs

- Brief de idea
- Investigación
- Validación / Business case
- Propuesta
- Proyecto
- Factura
- Reporte semanal
- Cierre de proyecto
- Retrospectiva

## 26. Automatizaciones MVP

1. Crear carpeta Drive al crear cliente.
2. Crear carpeta Drive al crear proyecto.
3. Crear documento de brief al crear proyecto.
4. Crear documento de investigación desde plantilla.
5. Crear documento de factura desde plantilla.
6. Generar reporte semanal como Google Doc.
7. Calcular score de ideas.
8. Detectar tareas vencidas.
9. Marcar proyecto amarillo/rojo según tareas vencidas o bloqueadas.
10. Mostrar objetos sin próxima acción.

## 27. Criterios de aceptación generales

1. La app corre localmente.
2. No requiere Supabase, Firebase, PostgreSQL ni base de datos externa.
3. Puede conectarse al Google Drive de Germán.
4. Puede leer/escribir en un Google Sheet maestro.
5. Puede crear carpetas en Drive.
6. Puede generar Google Docs desde plantillas.
7. Permite crear y editar clientes, ideas, oportunidades, proyectos, tareas y facturas.
8. El dashboard ejecutivo muestra prioridades y estado general.
9. Toda idea/proyecto interno queda asociado a cliente interno.
10. Toda entidad tiene ID único.
11. Toda acción relevante queda registrada en Log_Actividad.
12. El reporte semanal se genera como Google Doc.

## 28. Roadmap

### Fase 1 — Base técnica

- App local.
- Conexión Google OAuth.
- Conexión Sheets/Drive/Docs.
- Crear archivo maestro si no existe.
- Crear estructura inicial en Drive.

### Fase 2 — CRUD principal

- Clientes.
- Ideas.
- Proyectos.
- Tareas.
- Oportunidades.
- Facturas.

### Fase 3 — Dashboard ejecutivo

- KPIs.
- Prioridades.
- Vistas filtradas.
- Alertas.

### Fase 4 — Documentos y automatización

- Crear carpetas.
- Generar Docs.
- Reporte semanal.
- Plantillas.

### Fase 5 — Refinamiento

- Migración desde Excel/Sheets existentes.
- Mejoras de UX.
- Búsqueda global.
- Relaciones entre entidades.

### Fase 6 — IA opcional

- Resumen de ideas.
- Priorización asistida.
- Reportes automáticos.
- Sugerencias de próximos pasos.

