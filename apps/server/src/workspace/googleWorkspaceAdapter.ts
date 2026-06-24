import { google } from 'googleapis';

import type { GoogleAuthConfig } from '../auth/config.js';
import { createOAuthClient } from '../auth/oauth.js';
import type { AuthSession } from '../auth/session.js';

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

export type DriveFolderInput = {
  name: string;
  parentId?: string;
};

export type DriveResource = {
  id: string;
  name: string;
  url: string;
};

export type GoogleDocInput = {
  content?: string;
  folderId?: string;
  placeholders: Record<string, string>;
  templateId?: string;
  title: string;
};

export type WorkspaceAdapter = {
  createDocument: (input: GoogleDocInput) => Promise<DriveResource>;
  ensureFolder: (input: DriveFolderInput) => Promise<DriveResource>;
};

function driveFolderUrl(id: string) {
  return `https://drive.google.com/drive/folders/${id}`;
}

function googleDocUrl(id: string) {
  return `https://docs.google.com/document/d/${id}/edit`;
}

function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function folderQuery({ name, parentId }: DriveFolderInput) {
  const parts = [
    `name = '${escapeDriveQueryValue(name)}'`,
    `mimeType = '${FOLDER_MIME_TYPE}'`,
    'trashed = false'
  ];

  if (parentId) {
    parts.push(`'${escapeDriveQueryValue(parentId)}' in parents`);
  }

  return parts.join(' and ');
}

export function createGoogleWorkspaceAdapter(
  session: AuthSession,
  config: GoogleAuthConfig
): WorkspaceAdapter {
  const auth = createOAuthClient(config);
  auth.setCredentials({
    access_token: session.accessToken,
    expiry_date: session.expiryDate,
    refresh_token: session.refreshToken
  });

  const docs = google.docs({ auth, version: 'v1' });
  const drive = google.drive({ auth, version: 'v3' });

  return {
    async ensureFolder(input) {
      const { data: existing } = await drive.files.list({
        fields: 'files(id,name,webViewLink)',
        pageSize: 1,
        q: folderQuery(input)
      });
      const existingFolder = existing.files?.[0];

      if (existingFolder?.id && existingFolder.name) {
        return {
          id: existingFolder.id,
          name: existingFolder.name,
          url: existingFolder.webViewLink ?? driveFolderUrl(existingFolder.id)
        };
      }

      const { data } = await drive.files.create({
        fields: 'id,name,webViewLink',
        requestBody: {
          mimeType: FOLDER_MIME_TYPE,
          name: input.name,
          parents: input.parentId ? [input.parentId] : undefined
        }
      });

      if (!data.id || !data.name) {
        throw new Error('Google Drive did not return the created folder.');
      }

      return {
        id: data.id,
        name: data.name,
        url: data.webViewLink ?? driveFolderUrl(data.id)
      };
    },

    async createDocument(input) {
      let documentId: string | undefined;
      let documentName = input.title;
      let documentUrl: string | undefined;

      if (input.templateId) {
        const { data } = await drive.files.copy({
          fields: 'id,name,webViewLink',
          fileId: input.templateId,
          requestBody: {
            name: input.title,
            parents: input.folderId ? [input.folderId] : undefined
          }
        });

        documentId = data.id ?? undefined;
        documentName = data.name ?? input.title;
        documentUrl = data.webViewLink ?? undefined;
      } else {
        const { data } = await docs.documents.create({
          requestBody: {
            title: input.title
          }
        });

        documentId = data.documentId ?? undefined;
        documentName = data.title ?? input.title;

        if (documentId && input.folderId) {
          const { data: moved } = await drive.files.update({
            addParents: input.folderId,
            fields: 'id,name,webViewLink',
            fileId: documentId
          });

          documentUrl = moved.webViewLink ?? undefined;
        }
      }

      if (!documentId) {
        throw new Error('Google Docs did not return the created document.');
      }

      const requests = [];

      if (!input.templateId && input.content) {
        requests.push({
          insertText: {
            location: { index: 1 },
            text: input.content
          }
        });
      }

      for (const [placeholder, value] of Object.entries(input.placeholders)) {
        requests.push({
          replaceAllText: {
            containsText: {
              matchCase: true,
              text: placeholder
            },
            replaceText: value
          }
        });
      }

      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests
          }
        });
      }

      return {
        id: documentId,
        name: documentName,
        url: documentUrl ?? googleDocUrl(documentId)
      };
    }
  };
}
