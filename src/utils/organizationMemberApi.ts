import type { ApiError } from '../types/auth';
import type { OrganizationMemberDto } from '../types/partner';
import {
  getAuthApiBaseUrl,
  getAuthHeaders,
  handleApiError,
} from './config';

export type OrganizationMemberRole = 'OWNER' | 'ADMIN';

export interface AddOrganizationMemberInput {
  userId: string;
  role?: OrganizationMemberRole;
}

export interface UpdateOrganizationMemberInput {
  role: OrganizationMemberRole;
}

interface MembersResponse {
  message: string;
  members: OrganizationMemberDto[];
}

interface MemberResponse {
  message: string;
  member: OrganizationMemberDto;
}

interface RemoveMemberResponse {
  message: string;
  removed: boolean;
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

export async function getOrganizationMembers(
  organizationId: string
): Promise<OrganizationMemberDto[]> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/members`,
      { method: 'GET', headers }
    );
    const data = await parseJsonResponse<MembersResponse>(response);
    return data.members ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function addOrganizationMember(
  organizationId: string,
  input: AddOrganizationMemberInput
): Promise<OrganizationMemberDto> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/members`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(input),
      }
    );
    const data = await parseJsonResponse<MemberResponse>(response);
    return data.member;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function updateOrganizationMemberRole(
  organizationId: string,
  userId: string,
  input: UpdateOrganizationMemberInput
): Promise<OrganizationMemberDto> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/members/${userId}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(input),
      }
    );
    const data = await parseJsonResponse<MemberResponse>(response);
    return data.member;
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  userId: string
): Promise<void> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/${organizationId}/members/${userId}`,
      { method: 'DELETE', headers }
    );
    await parseJsonResponse<RemoveMemberResponse>(response);
  } catch (error) {
    throw handleApiError(error);
  }
}
