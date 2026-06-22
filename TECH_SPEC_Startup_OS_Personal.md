# TECH SPEC — Startup OS Personal

## 1. Objetivo técnico

Construir una aplicación local tipo web app que corre en el computador de Germán y se conecta a Google Workspace para gestionar datos, documentos y carpetas.

La aplicación debe usar:

- Google Sheets como base de datos estructurada.
- Google Drive como repositorio de carpetas y archivos.
- Google Docs como generador de documentos desde plantillas.
- Google OAuth para autorización.
- Una interfaz web local para operar el sistema.

No debe usar Supabase, Firebase, PostgreSQL, MongoDB, Airtable ni backend cloud propietario.

## 2. Arquitectura general

```text
Computador de Germán
  ↓
App local en navegador: http://localhost:{port}
  ↓
Backend local Node.js
  ↓
Google OAuth
  ↓
Google Sheets API + Google Drive API + Google Docs API
  ↓
Google Workspace de Germán
```

## 3. Stack recomendado

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query o estado simple con hooks
- CSS modular, Tailwind o componentes básicos propios

### Backend local

- Node.js
- Express
- TypeScript
- Google APIs Node.js Client
- Zod para validación de datos
- dotenv para variables de entorno

### Persistencia

- Google Sheets como base de datos canónica.
- Archivo local `.startup-os-cache` opcional para caché no crítica.
- No usar base de datos externa.

### Documentos

- Google Drive API para carpetas.
- Google Docs API para reemplazo de placeholders en plantillas.
- Google Sheets API para lectura/escritura de registros.

## 4. Estructura sugerida del repositorio

```text
startup-os-personal/
  README.md
  package.json
  .env.example
  /apps
    /web
      index.html
      package.json
      src/
        main.tsx
        App.tsx
        routes/
        components/
        pages/
        hooks/
        services/
        styles/
    /server
      package.json
      src/
        index.ts
        config/
        google/
        routes/
        controllers/
        services/
        repositories/
        schemas/
        utils/
  /docs
    PRD.md
    DATA_MODEL.md
    GOOGLE_SETUP.md
  /templates
    sample-doc-placeholders.md
```

También puede construirse como monorepo simple si Codex lo prefiere.

## 5. Variables de entorno

Crear `.env.example` con:

```env
PORT=5174
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5174/auth/google/callback
GOOGLE_MASTER_SHEET_ID=
GOOGLE_ROOT_DRIVE_FOLDER_ID=
GOOGLE_TEMPLATE_ID_IDEA_BRIEF=
GOOGLE_TEMPLATE_ID_INVESTIGATION=
GOOGLE_TEMPLATE_ID_PROJECT_BRIEF=
GOOGLE_TEMPLATE_ID_INVOICE=
GOOGLE_TEMPLATE_ID_WEEKLY_REPORT=
```

## 6. Google APIs necesarias

La app debe preparar integración con:

- Google Sheets API
- Google Drive API
- Google Docs API
- Google OAuth 2.0

## 7. Autenticación Google

### Requerimiento

La app debe permitir que Germán autorice acceso a su Google Workspace.

### Flujo esperado

1. Usuario abre app local.
2. Si no hay token válido, se muestra botón “Conectar Google”.
3. Usuario autoriza permisos.
4. App recibe callback en localhost.
5. App guarda token localmente de forma segura o en archivo local ignorado por Git.
6. App usa refresh token para llamadas posteriores.

### Scopes mínimos sugeridos

- Sheets read/write.
- Drive file/folder read/write.
- Docs read/write.

Codex debe implementar los scopes mínimos necesarios y documentarlos.

## 8. Servicios internos

### GoogleAuthService

Responsabilidades:

- Crear URL de autorización.
- Procesar callback OAuth.
- Guardar y refrescar tokens.
- Exponer cliente autenticado.

### SheetsService

Responsabilidades:

- Leer registros de una hoja.
- Insertar registros.
- Actualizar registros por ID.
- Buscar registros por ID.
- Inicializar el master sheet.
- Crear hojas faltantes.
- Validar headers.

### DriveService

Responsabilidades:

- Crear estructura raíz `/Startup OS`.
- Crear carpetas de cliente.
- Crear carpetas de proyecto.
- Crear carpetas de idea/investigación si aplica.
- Buscar carpetas existentes.
- Guardar IDs de carpetas en Sheets.

### DocsService

Responsabilidades:

- Copiar plantilla de Google Docs.
- Reemplazar placeholders.
- Guardar documento en carpeta correspondiente.
- Devolver URL/document ID.

### EntityServices

Crear servicios por entidad:

- ClientService
- ContactService
- IdeaService
- NeedService
- ResearchService
- OpportunityService
- ProjectService
- TaskService
- InvoiceService
- PaymentService
- ResultService
- LearningService
- ReportService

## 9. Convención de IDs

Usar IDs legibles y únicos:

```text
CLI-YYYYMMDD-XXXX
CON-YYYYMMDD-XXXX
IDE-YYYYMMDD-XXXX
NEC-YYYYMMDD-XXXX
INV-YYYYMMDD-XXXX
OPP-YYYYMMDD-XXXX
PRO-YYYYMMDD-XXXX
TAR-YYYYMMDD-XXXX
FAC-YYYYMMDD-XXXX
PAG-YYYYMMDD-XXXX
RES-YYYYMMDD-XXXX
APR-YYYYMMDD-XXXX
DOC-YYYYMMDD-XXXX
```

Donde `XXXX` puede ser número incremental diario o short random alfanumérico.

## 10. Rutas API backend

### Sistema

```http
GET /api/health
GET /api/config
POST /api/setup/initialize
```

### Auth

```http
GET /auth/google
GET /auth/google/callback
GET /api/auth/status
POST /api/auth/logout
```

### Dashboard

```http
GET /api/dashboard/summary
GET /api/dashboard/priorities
GET /api/dashboard/alerts
```

### Clientes

```http
GET /api/clients
GET /api/clients/:id
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id
POST /api/clients/:id/create-drive-folder
```

### Contactos

```http
GET /api/contacts
GET /api/contacts/:id
POST /api/contacts
PUT /api/contacts/:id
DELETE /api/contacts/:id
```

### Ideas

```http
GET /api/ideas
GET /api/ideas/:id
POST /api/ideas
PUT /api/ideas/:id
POST /api/ideas/:id/generate-brief
POST /api/ideas/:id/convert-to-project
POST /api/ideas/:id/convert-to-opportunity
```

### Necesidades

```http
GET /api/needs
GET /api/needs/:id
POST /api/needs
PUT /api/needs/:id
POST /api/needs/:id/convert-to-idea
POST /api/needs/:id/convert-to-opportunity
POST /api/needs/:id/convert-to-task
```

### Investigaciones

```http
GET /api/research
GET /api/research/:id
POST /api/research
PUT /api/research/:id
POST /api/research/:id/generate-doc
```

### Oportunidades

```http
GET /api/opportunities
GET /api/opportunities/:id
POST /api/opportunities
PUT /api/opportunities/:id
POST /api/opportunities/:id/mark-won
POST /api/opportunities/:id/mark-lost
```

### Proyectos

```http
GET /api/projects
GET /api/projects/:id
POST /api/projects
PUT /api/projects/:id
POST /api/projects/:id/create-drive-structure
POST /api/projects/:id/generate-brief
POST /api/projects/:id/close
```

### Tareas

```http
GET /api/tasks
GET /api/tasks/:id
POST /api/tasks
PUT /api/tasks/:id
POST /api/tasks/:id/complete
POST /api/tasks/:id/block
```

### Facturas

```http
GET /api/invoices
GET /api/invoices/:id
POST /api/invoices
PUT /api/invoices/:id
POST /api/invoices/:id/generate-doc
POST /api/invoices/:id/mark-paid
```

### Reportes

```http
POST /api/reports/weekly
```

## 11. Frontend — páginas MVP

### `/`

Dashboard ejecutivo.

Debe mostrar cards de:

- Tareas vencidas.
- Proyectos activos.
- Ideas pendientes de revisión.
- Oportunidades abiertas.
- Facturación pendiente.
- Facturas vencidas.
- Top prioridades.

### `/clients`

Listado de clientes con filtros.

### `/clients/:id`

Ficha 360° del cliente.

### `/ideas`

Pipeline/listado de ideas.

### `/ideas/:id`

Detalle de idea.

### `/projects`

Listado/Kanban de proyectos.

### `/projects/:id`

Detalle del proyecto.

### `/tasks`

Lista de tareas, filtro por vencidas, hoy, semana, estado y proyecto.

### `/opportunities`

Pipeline comercial.

### `/invoices`

Control de facturación.

### `/research`

Investigaciones.

### `/settings`

Configuración de Google Sheet, folder raíz, templates, catálogos.

## 12. Componentes frontend sugeridos

- AppLayout
- Sidebar
- Topbar
- DashboardCard
- EntityTable
- EntityForm
- StatusBadge
- PriorityBadge
- QuickCreateModal
- RelationshipPanel
- DocumentLinksPanel
- DriveFolderLink
- EmptyState
- LoadingState
- ErrorState

## 13. Reglas de negocio críticas

1. Si una idea no tiene cliente externo, asignar cliente interno.
2. Si un proyecto no tiene cliente externo, asignar cliente interno.
3. Toda tarea debe pertenecer a un proyecto.
4. Toda factura debe pertenecer a un cliente.
5. Toda investigación debe tener origen: idea, cliente, proyecto, oportunidad o necesidad.
6. Al crear cliente, si no existe carpeta Drive, crearla.
7. Al crear proyecto, crear estructura Drive.
8. Al crear investigación, permitir generar Google Doc desde plantilla.
9. Al crear factura, permitir generar Google Doc de factura.
10. Al cambiar estado de oportunidad a Ganada, ofrecer crear proyecto.
11. Al cerrar proyecto, solicitar resultado y aprendizaje.
12. Toda acción relevante debe registrarse en Log_Actividad.

## 14. Cálculos

### Score de idea

```ts
score = impacto * 0.35 + dineroPotencial * 0.35 + urgencia * 0.20 + (6 - esfuerzo) * 0.10
```

### Semáforo de proyecto

Regla sugerida:

- Rojo si hay tareas bloqueadas o vencidas de prioridad alta.
- Amarillo si hay tareas vencidas no críticas o próximos vencimientos.
- Verde si no hay alertas.

### Factura vencida

Factura con `estado != Pagada` y `fecha_vencimiento < today`.

## 15. Inicialización del sistema

Al ejecutar setup:

1. Validar conexión Google.
2. Crear o usar Google Sheet maestro.
3. Crear hojas faltantes con headers.
4. Crear cliente interno `Germán / Startup Interna` si no existe.
5. Crear carpeta raíz `/Startup OS` si no existe.
6. Crear subcarpetas base.
7. Guardar IDs en hoja `Configuracion`.
8. Mostrar resumen de setup.

## 16. Manejo de errores

La app debe mostrar errores claros:

- No autorizado con Google.
- No se encontró master sheet.
- Falta una hoja requerida.
- Falta folder raíz.
- Falta template.
- Error creando documento.
- Error escribiendo en Sheets.

Todo error debe registrarse en `Log_Actividad` si es posible.

## 17. Testing mínimo

Codex debe crear pruebas unitarias o validaciones para:

1. Generación de IDs.
2. Cálculo de score.
3. Normalización de estados.
4. Validación de entidades.
5. Mapeo de registros Sheets ↔ objetos TypeScript.
6. Semáforo de proyecto.

## 18. Criterios técnicos de aceptación

1. `npm install` instala dependencias.
2. `npm run dev` levanta frontend y backend local.
3. La app permite conectar Google OAuth.
4. Setup crea o valida Sheet maestro.
5. Setup crea cliente interno.
6. Se puede crear cliente desde UI.
7. Se puede crear idea desde UI.
8. Se puede crear proyecto desde UI.
9. Crear proyecto genera carpeta en Drive.
10. Se puede crear factura y generar Google Doc.
11. Dashboard muestra datos reales desde Sheets.
12. No hay dependencias a Supabase/Firebase/PostgreSQL.

