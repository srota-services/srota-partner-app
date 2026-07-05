import type { ApiError } from '../types/auth';
import type {
  AuthorCollaboration,
  CreateCollaborationInput,
  OrgCollaboration,
} from '../types/authorCollaboration';
import {
  getAuthApiBaseUrl,
  getAuthHeaders,
  handleApiError,
} from './config';
import { getAccessToken } from './token';

interface AuthorCollaborationsResponse {
  message: string;
  collaborations: AuthorCollaboration[];
}

interface OrgCollaborationsResponse {
  message: string;
  collaborations: OrgCollaboration[];
}

interface CollaborationResponse {
  message: string;
  collaboration: AuthorCollaboration | OrgCollaboration;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const error: ApiError = {
      message:
        (data as ApiError).message ||
        (data as ApiError).error ||
        'Request failed',
      error: (data as ApiError).error,
      statusCode: response.status,
    };
    throw error;
  }
  return data as T;
}

function buildCollaborationFormData(
  input: CreateCollaborationInput
): FormData {
  const formData = new FormData();
  formData.append('organizationId', input.organizationId);
  formData.append('authorBudget', String(input.authorBudget));
  formData.append('currency', input.currency);

  if (input.description?.trim()) {
    formData.append('description', input.description.trim());
  }

  input.attachments?.forEach(file => {
    formData.append('attachments', file);
  });

  return formData;
}

function getMultipartHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createAuthorCollaboration(
  input: CreateCollaborationInput
): Promise<AuthorCollaboration> {
  try {
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-collaborations`,
      {
        method: 'POST',
        headers: getMultipartHeaders(),
        body: buildCollaborationFormData(input),
      }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as AuthorCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getMyAuthorCollaborations(): Promise<AuthorCollaboration[]> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-collaborations`,
      { method: 'GET', headers }
    );
    const data =
      await parseJsonResponse<AuthorCollaborationsResponse>(response);
    return data.collaborations ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function counterCollaborationBudget(
  collaborationId: string,
  authorBudget: number
): Promise<AuthorCollaboration> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-collaborations/${collaborationId}/counter`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ authorBudget }),
      }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as AuthorCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function abortCollaboration(
  collaborationId: string
): Promise<AuthorCollaboration> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-collaborations/${collaborationId}/abort`,
      { method: 'PATCH', headers }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as AuthorCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getOrganizationCollaborations(
  organizationId: string
): Promise<OrgCollaboration[]> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-collaborations`,
      { method: 'GET', headers }
    );
    const data = await parseJsonResponse<OrgCollaborationsResponse>(response);
    return data.collaborations ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function acceptOrganizationCollaboration(
  organizationId: string,
  collaborationId: string
): Promise<OrgCollaboration> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-collaborations/${collaborationId}/accept`,
      { method: 'PATCH', headers }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as OrgCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function rejectOrganizationCollaboration(
  organizationId: string,
  collaborationId: string
): Promise<OrgCollaboration> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-collaborations/${collaborationId}/reject`,
      { method: 'PATCH', headers }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as OrgCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function negotiateOrganizationCollaboration(
  organizationId: string,
  collaborationId: string,
  organizationAsk: number
): Promise<OrgCollaboration> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-collaborations/${collaborationId}/negotiate`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ organizationAsk }),
      }
    );
    const data = await parseJsonResponse<CollaborationResponse>(response);
    return data.collaboration as OrgCollaboration;
  } catch (error) {
    throw handleApiError(error);
  }
}
