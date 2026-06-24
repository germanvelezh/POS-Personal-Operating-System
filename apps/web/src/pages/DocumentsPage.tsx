import { AlertTriangle, ExternalLink, FileText, Loader2, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '../components/ui/Badge';
import {
  fetchWorkspaceDocuments,
  type WorkspaceDocumentRecord
} from '../services/workspace';

function humanize(value: string | undefined) {
  return String(value ?? '')
    .replaceAll('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase()) || 'Sin dato';
}

function formatDate(value: string | undefined) {
  return value ? value.slice(0, 10) : 'Sin fecha';
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<WorkspaceDocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDocuments() {
    setLoading(true);
    setError(null);

    try {
      setDocuments(await fetchWorkspaceDocuments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar documentos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  return (
    <section className="module-page">
      <div className="module-hero">
        <div className="module-title-block">
          <span className="module-icon">
            <FileText aria-hidden="true" size={20} />
          </span>
          <div>
            <h1>Documentos</h1>
            <p>Briefs, investigaciones, facturas y reportes generados.</p>
          </div>
        </div>
        <div className="module-actions">
          <Badge tone="success">Fase 5</Badge>
          <button className="button button-secondary" onClick={() => void loadDocuments()} type="button">
            {loading ? <Loader2 aria-hidden="true" className="spin-icon" size={15} /> : <RefreshCw aria-hidden="true" size={15} />}
            Actualizar
          </button>
        </div>
      </div>

      {error ? (
        <div className="settings-alert" role="alert">
          <AlertTriangle aria-hidden="true" size={16} />
          {error}
        </div>
      ) : null}

      <article className="panel module-main-panel">
        <div className="panel-header">
          <div>
            <h2>Documentos generados</h2>
            <p>{documents.length} registros</p>
          </div>
        </div>

        {loading ? (
          <div className="entity-empty">
            <Loader2 aria-hidden="true" className="spin-icon" size={18} />
            <span>Cargando documentos</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="entity-empty">
            <span>Sin documentos generados</span>
          </div>
        ) : (
          <div className="data-table documents-table">
            <div className="data-row data-head">
              <span>Documento</span>
              <span>Tipo</span>
              <span>Origen</span>
              <span>Fecha</span>
              <span>Acción</span>
            </div>
            {documents.map((document) => (
              <div className="data-row" key={document.documento_id}>
                <strong>{document.titulo}</strong>
                <Badge tone="info">{humanize(document.tipo)}</Badge>
                <span>{humanize(document.entidad_tipo)}</span>
                <time>{formatDate(document.fecha_creacion)}</time>
                <a
                  className="link-button"
                  href={document.google_doc_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Abrir documento
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
