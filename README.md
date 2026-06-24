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
APP_BASE_URL=https://pos-personal-operating-system-serve.vercel.app
PUBLIC_APP_URL=https://pos-personal-operating-system-serve.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://pos-personal-operating-system-serve.vercel.app/auth/google/callback
SESSION_SECRET=
ALLOWED_GOOGLE_EMAIL=germanvelezh@gmail.com
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
https://pos-personal-operating-system-serve.vercel.app
http://localhost:5173

Authorized redirect URIs:
https://pos-personal-operating-system-serve.vercel.app/auth/google/callback
http://localhost:5174/auth/google/callback
```

Si usas un dominio propio, usa ese dominio en vez del `vercel.app`.

Genera `SESSION_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

No agregues `GOOGLE_CLIENT_SECRET` ni `SESSION_SECRET` como variables `VITE_*`;
esas variables quedan expuestas al navegador.

### OAuth implementado

- `GET /auth/google` inicia el flujo Google OAuth.
- `GET /auth/google/callback` procesa el callback, valida
  `ALLOWED_GOOGLE_EMAIL` y guarda una sesion cifrada en cookie `HttpOnly`.
- `GET /api/auth/status` devuelve si Google esta configurado/conectado.
- `POST /api/auth/logout` borra la cookie local de sesion.

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

Fase 2 esta en progreso/completada a nivel backend base. La app ya tiene:

- Fase 0: shell ejecutivo, `/api/health`, build local y build Vercel.
- Fase 1: OAuth Google en Vercel e inicializacion de Google Workspace desde
  `/settings`.
- Fase 2: schemas Zod, generacion de IDs, mapeo fila Sheets, repositorio
  generico y fabrica de repositorios para las 20 hojas canonicas.

El siguiente bloque es Fase 3: APIs CRUD y UI operativa para clientes, ideas,
proyectos, tareas, oportunidades y facturas.
