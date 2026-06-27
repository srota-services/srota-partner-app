import type { ApiError } from '../types/auth';
import type {
  AuthorInvitationForAuthor,
  AuthorInvitationForOrg,
  OrganizationAuthorMember,
} from '../types/authorInvitation';
import {
  getAuthApiBaseUrl,
  getAuthHeaders,
  handleApiError,
} from './config';

interface InvitationsForOrgResponse {
  message: string;
  invitations: AuthorInvitationForOrg[];
}

interface InvitationForOrgResponse {
  message: string;
  invitation: AuthorInvitationForOrg;
}

interface LinkedAuthorsResponse {
  message: string;
  authors: OrganizationAuthorMember[];
}

interface InvitationsForAuthorResponse {
  message: string;
  invitations: AuthorInvitationForAuthor[];
}

interface InvitationForAuthorResponse {
  message: string;
  invitation: AuthorInvitationForAuthor;
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

export async function createAuthorInvitation(
  organizationId: string,
  authorId: string
): Promise<{ invitation: AuthorInvitationForOrg; message: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-invitations`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ authorId }),
      }
    );
    const data = await parseJsonResponse<InvitationForOrgResponse>(response);
    return { invitation: data.invitation, message: data.message };
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getOrganizationInvitations(
  organizationId: string
): Promise<AuthorInvitationForOrg[]> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/author-invitations`,
      { method: 'GET', headers }
    );
    const data =
      await parseJsonResponse<InvitationsForOrgResponse>(response);
    return data.invitations ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getOrganizationAuthors(
  organizationId: string
): Promise<OrganizationAuthorMember[]> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/authors`,
      { method: 'GET', headers }
    );
    const data = await parseJsonResponse<LinkedAuthorsResponse>(response);
    return data.authors ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getMyOrganizationInvitations(): Promise<
  AuthorInvitationForAuthor[]
> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-invitations`,
      { method: 'GET', headers }
    );
    const data =
      await parseJsonResponse<InvitationsForAuthorResponse>(response);
    return data.invitations ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function revealContact(
  invitationId: string,
  reveal: boolean
): Promise<{ invitation: AuthorInvitationForAuthor; message: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-invitations/${invitationId}/reveal-contact`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ reveal }),
      }
    );
    const data =
      await parseJsonResponse<InvitationForAuthorResponse>(response);
    return { invitation: data.invitation, message: data.message };
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function confirmOrgContact(
  invitationId: string,
  contacted: boolean
): Promise<{ invitation: AuthorInvitationForAuthor; message: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-invitations/${invitationId}/confirm-contact`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ contacted }),
      }
    );
    const data =
      await parseJsonResponse<InvitationForAuthorResponse>(response);
    return { invitation: data.invitation, message: data.message };
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function decideJoin(
  invitationId: string,
  accept: boolean
): Promise<{ invitation: AuthorInvitationForAuthor; message: string }> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/me/organization-invitations/${invitationId}/join`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ accept }),
      }
    );
    const data =
      await parseJsonResponse<InvitationForAuthorResponse>(response);
    return { invitation: data.invitation, message: data.message };
  } catch (error) {
    throw handleApiError(error);
  }
}
