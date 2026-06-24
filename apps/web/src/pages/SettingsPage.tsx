import {
  CheckCircle2,
  Cloud,
  CloudOff,
  ExternalLink,
  FileKey2,
  FolderRoot,
  LogOut,
  Play,
  Settings2,
  Sheet,
  TriangleAlert
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import type { AppOutletContext } from '../components/layout/AppLayout';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { logoutGoogleAuth } from '../services/googleAuth';

type SetupSection = {
  label: string;
  detail: string;
  icon: LucideIcon;
  tone: BadgeTone;
};

const setupSections: SetupSection[] = [
  {
    label: 'Estado de conexión Google',
    detail: 'OAuth web server flow listo para producción en Vercel.',
    icon: CloudOff,
    tone: 'warning'
  },
  {
    label: 'Google Sheet maestro',
    detail: 'Repositorio canónico de clientes, ideas, proyectos y facturas.',
    icon: Sheet,
    tone: 'neutral'
  },
  {
    label: 'Carpeta raíz Drive',
    detail: 'Estructura /Startup OS con carpetas por cliente y proyecto.',
    icon: FolderRoot,
    tone: 'neutral'
  },
  {
    label: 'IDs de plantillas Docs',
    detail: 'Briefs, investigaciones, facturas y reportes semanales.',
    icon: FileKey2,
    tone: 'neutral'
  }
];

const diagnostics = [
  ['Frontend', 'Listo para Vercel'],
  ['API health', 'Disponible'],
  ['Persistencia', 'Google Sheets']
];

export function SettingsPage() {
  const {
    googleStatus,
    googleStatusLoading,
    initializeSystem,
    refreshGoogleStatus,
    setupError,
    setupPending,
    setupResult
  } =
    useOutletContext<AppOutletContext>();
  const [logoutPending, setLogoutPending] = useState(false);
  const googleConnected = googleStatus.connected;
  const googleConfigured = googleStatus.configured;
  const googleBadgeTone: BadgeTone = googleStatusLoading
    ? 'neutral'
    : googleConnected
      ? 'success'
      : googleConfigured
        ? 'warning'
        : 'danger';
  const googleBadgeLabel = googleStatusLoading
    ? 'Verificando'
    : googleConnected
      ? 'Google conectado'
      : googleConfigured
        ? 'Google pendiente'
        : 'Google sin configurar';
  const ConnectionIcon = googleConnected ? Cloud : TriangleAlert;
  const connectionTitle = googleConnected ? 'Google conectado' : 'Google no conectado';
  const connectionDescription = googleConnected
    ? `Sesión autorizada para ${googleStatus.email}. Ya podemos avanzar hacia Sheets, Drive y Docs.`
    : googleConfigured
      ? 'OAuth está configurado. Conecta la cuenta autorizada para habilitar Sheets, Drive y Docs.'
      : 'Faltan variables de entorno OAuth en Vercel o en el entorno local.';
  const setupRows = setupSections.map((section) => ({
    ...section,
    ...(section.label === 'Estado de conexión Google'
      ? {
          detail: googleConnected
            ? `Autorizado como ${googleStatus.email}.`
            : 'OAuth web server flow pendiente de conexión.',
          icon: googleConnected ? Cloud : CloudOff,
          tone: googleBadgeTone
        }
      : {}),
    ...(section.label === 'Google Sheet maestro' && setupResult
      ? {
          detail: `Creado o validado: ${setupResult.masterSheetId}.`,
          tone: 'success' as BadgeTone
        }
      : {}),
    ...(section.label === 'Carpeta raíz Drive' && setupResult
      ? {
          detail: `Creada o validada: ${setupResult.rootFolderId}.`,
          tone: 'success' as BadgeTone
        }
      : {})
  }));
  const setupComplete = Boolean(setupResult?.initialized);
  const setupBadgeTone: BadgeTone = setupPending
    ? 'info'
    : setupComplete
      ? 'success'
      : 'warning';
  const setupBadgeLabel = setupPending
    ? 'Inicializando'
    : setupComplete
      ? 'Sistema inicializado'
      : 'Pendiente';
  const diagnosticsRows = [
    ...diagnostics,
    ['OAuth callback', googleConfigured ? 'Configurado' : 'Pendiente de variables'],
    ['Email autorizado', googleStatus.allowedGoogleEmail ?? 'Pendiente'],
    ['Sheet maestro', setupResult?.masterSheetId ?? 'Pendiente'],
    ['Carpeta Drive', setupResult?.rootFolderId ?? 'Pendiente']
  ];

  async function handleLogout() {
    setLogoutPending(true);

    try {
      await logoutGoogleAuth();
      await refreshGoogleStatus();
    } finally {
      setLogoutPending(false);
    }
  }

  function handleInitialize() {
    void initializeSystem();
  }

  return (
    <section className="module-page settings-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <Settings2 aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>Configuración</h1>
            <p>Conexión Google, setup del sistema y diagnóstico técnico para Vercel.</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge dot tone={googleBadgeTone}>{googleBadgeLabel}</Badge>
          <a className="button button-secondary" href="/auth/google">
            <CloudOff aria-hidden="true" size={15} />
            {googleConnected ? 'Reconectar Google' : 'Conectar Google'}
          </a>
          <button
            className="button button-primary"
            disabled={!googleConnected || setupPending}
            onClick={handleInitialize}
            type="button"
          >
            <Play aria-hidden="true" size={14} />
            {setupPending ? 'Inicializando' : 'Inicializar sistema'}
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <article className="panel settings-connection">
          <div className="connection-hero">
            <span
              className={`connection-icon ${googleConnected ? 'connection-icon-success' : ''}`}
            >
              <ConnectionIcon aria-hidden="true" size={22} />
            </span>
            <div>
              <h2>{connectionTitle}</h2>
              <p>{connectionDescription}</p>
            </div>
          </div>
          <div className="settings-actions">
            <a className="button button-primary" href="/auth/google">
              {googleConnected ? 'Renovar permisos' : 'Conectar Google'}
            </a>
            {googleConnected ? (
              <button
                className="button button-secondary"
                disabled={logoutPending}
                onClick={handleLogout}
                type="button"
              >
                <LogOut aria-hidden="true" size={15} />
                Desconectar
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Inicialización</h2>
              <p>Secuencia que creará hojas, headers, cliente interno y carpetas.</p>
            </div>
            <Badge tone={setupBadgeTone}>{setupBadgeLabel}</Badge>
          </div>
          {setupError ? (
            <div className="settings-alert" role="alert">
              <TriangleAlert aria-hidden="true" size={16} />
              <span>{setupError}</span>
            </div>
          ) : null}
          <div className="setup-list">
            {setupRows.map((section) => {
              const Icon = section.icon;
              const rowReady =
                (section.label === 'Estado de conexión Google' && googleConnected) ||
                (section.label === 'Google Sheet maestro' && setupComplete) ||
                (section.label === 'Carpeta raíz Drive' && setupComplete);

              return (
                <div className="setup-row" key={section.label}>
                  <span className="setup-icon">
                    <Icon aria-hidden="true" size={17} />
                  </span>
                  <div>
                    <strong>{section.label}</strong>
                    <small>{section.detail}</small>
                  </div>
                  <Badge tone={rowReady ? 'success' : section.tone}>
                    {rowReady ? 'Listo' : 'Pendiente'}
                  </Badge>
                </div>
              );
            })}
          </div>
          {setupResult ? (
            <div className="setup-result">
              <div className="setup-result-header">
                <CheckCircle2 aria-hidden="true" size={18} />
                <div>
                  <strong>Sistema inicializado</strong>
                  <span>Google Workspace quedó listo para usar como backend.</span>
                </div>
              </div>
              <div className="setup-result-grid">
                <div>
                  <span>Sheet maestro</span>
                  <strong>{setupResult.masterSheetId}</strong>
                  <a href={setupResult.masterSheetUrl} rel="noreferrer" target="_blank">
                    Abrir Sheet <ExternalLink aria-hidden="true" size={12} />
                  </a>
                </div>
                <div>
                  <span>Carpeta Drive</span>
                  <strong>{setupResult.rootFolderId}</strong>
                  <a href={setupResult.rootFolderUrl} rel="noreferrer" target="_blank">
                    Abrir Drive <ExternalLink aria-hidden="true" size={12} />
                  </a>
                </div>
                <div>
                  <span>Cliente interno</span>
                  <strong>{setupResult.internalClientId}</strong>
                </div>
                <div>
                  <span>Hojas validadas</span>
                  <strong>{setupResult.sheets.headersWritten.length}</strong>
                </div>
              </div>
            </div>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Diagnóstico técnico</h2>
              <p>Lectura rápida del estado del MVP.</p>
            </div>
            <CheckCircle2 aria-hidden="true" size={18} />
          </div>
          <div className="settings-list">
            {diagnosticsRows.map(([label, value]) => (
              <div className="settings-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
