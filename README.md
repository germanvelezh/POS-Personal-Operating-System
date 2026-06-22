# Startup OS Personal

Aplicacion local para que German gestione clientes, ideas, proyectos, tareas,
oportunidades, facturas y documentos usando Google Workspace como fuente de
verdad.

## Stack

- Frontend: React + TypeScript + Vite.
- Backend local: Node.js + Express + TypeScript.
- Validacion: Zod.
- Google APIs: `googleapis`.
- Persistencia canonica futura: Google Sheets.
- Documentos/carpetas futuras: Google Docs y Google Drive.

No usa Supabase, Firebase, PostgreSQL, MongoDB, Airtable ni backend cloud.

## Setup local

```bash
npm install
cp .env.example .env
npm run dev
```

La app web corre en `http://localhost:5173` y el backend local en
`http://localhost:5174`.

## Deploy en Vercel

El proyecto tambien puede alojarse en Vercel. En ese modo, Vercel sirve el
frontend de `apps/web/dist` y usa funciones serverless en `api/`.

Configuracion esperada en Vercel:

```text
Framework Preset: Vite
Root Directory: ./  (la raiz del repo, no apps/web ni apps/server)
Install Command: npm install
Build Command: npm run vercel:build
Output Directory: apps/web/dist
```

Importante: este repo se debe importar como un proyecto Vercel desde la raiz.
Si Vercel queda apuntando a `apps/web`, `npm` no vera los workspaces. Si queda
apuntando a `apps/server`, Vercel lo detectara como Express y no publicara el
frontend Vite correctamente.

El archivo `vercel.json` ya deja configurado:

- Build del frontend Vite.
- Output estatico en `apps/web/dist`.
- Funcion `GET /api/health`.
- Rutas preparadas para OAuth:
  - `/auth/google`
  - `/auth/google/callback`
- Fallback de SPA para rutas como `/clients`, `/ideas` y `/settings`.

### Variables de entorno en Vercel

En Vercel, crea estas variables en Project Settings > Environment Variables:

```env
APP_BASE_URL=https://tu-proyecto.vercel.app
PUBLIC_APP_URL=https://tu-proyecto.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://tu-proyecto.vercel.app/auth/google/callback
GOOGLE_MASTER_SHEET_ID=
GOOGLE_ROOT_DRIVE_FOLDER_ID=
GOOGLE_TEMPLATE_ID_IDEA_BRIEF=
GOOGLE_TEMPLATE_ID_INVESTIGATION=
GOOGLE_TEMPLATE_ID_PROJECT_BRIEF=
GOOGLE_TEMPLATE_ID_INVOICE=
GOOGLE_TEMPLATE_ID_WEEKLY_REPORT=
```

No pongas secretos en variables `VITE_*`; esas se exponen al navegador.

### Google OAuth para Vercel

En Google Cloud Console, agrega tambien estos valores al OAuth Client:

```text
Authorized JavaScript origins:
https://tu-proyecto.vercel.app

Authorized redirect URIs:
https://tu-proyecto.vercel.app/auth/google/callback
```

Si usas un dominio propio, usa ese dominio en vez del `vercel.app`.

## Scripts

```bash
npm run dev
npm run build:web
npm run build
npm run test
npm run typecheck
npm run deploy:preview
```

## Fase actual

Fase 0 crea la estructura base, `/api/health`, el shell inicial de la app, el
dashboard ejecutivo vacio y configuracion base para Vercel. La conexion real
con Google OAuth, Sheets, Drive y Docs empieza en Fase 1.
