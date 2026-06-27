import type { ApiError } from '../types/auth';
import type {
  AuthorProfileDto,
  AuthorAppProfile,
  AuthorAppProfileResponse,
  CompletePartnerOrganizationInput,
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  OrganizationItem,
  RegisterIndividualInput,
  RegisterPartnerUserInput,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UserProfileResponse,
  VerifyRegistrationOtpRequest,
  VerifyRegistrationOtpResponse,
} from '../types/partner';
import {
  getAuthApiBaseUrl,
  getContentApiBaseUrl,
  getAuthHeaders,
  getAuthHeadersForFileUpload,
  handleApiError,
} from './config';
import { buildOrganizationFormData } from './organizationFormData';
import {
  buildRegisterFormData,
  type RegisterFormDataInput,
} from './registerFormData';
import { setStoredWorkspaceSlug } from './workspaceSlug';
import { setAccessToken } from './token';

function getPublicJsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

function storeTokenFromResponse(response: VerifyRegistrationOtpResponse): void {
  if (response.accessToken) {
    setAccessToken(response.accessToken);
  } else if (response.token) {
    setAccessToken(response.token);
  }
}

/**
 * Creates a new organization on auth-service
 */
export async function createOrganization(
  payload: CreateOrganizationRequest
): Promise<OrganizationItem> {
  try {
    const formData = buildOrganizationFormData({
      organizationName: payload.name,
      websiteUrl: payload.websiteUrl,
      teamSize: payload.teamSize,
      preferredGenre: payload.preferredGenre,
      image: payload.image,
    });
    const headers = getAuthHeadersForFileUpload();
    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to create organization',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const orgResponse = data as CreateOrganizationResponse;
    if (orgResponse.organization?.slug) {
      setStoredWorkspaceSlug(orgResponse.organization.slug);
    }
    return orgResponse.organization;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Registers a new user
 */
export async function registerUser(
  payload: RegisterFormDataInput
): Promise<RegisterResponse> {
  try {
    const isAuthorRegistration = payload.role === 'AUTHOR';
    const useMultipart = isAuthorRegistration || Boolean(payload.profileImage);
    const { profileImage, ...jsonPayload } = payload;
    void profileImage;

    const response = await fetch(`${getAuthApiBaseUrl()}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: useMultipart ? {} : getPublicJsonHeaders(),
      body: useMultipart
        ? buildRegisterFormData(payload)
        : JSON.stringify(jsonPayload),
    });
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to register user',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    return data as RegisterResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Verifies registration OTP
 */
export async function verifyRegistrationOtp(
  payload: VerifyRegistrationOtpRequest
): Promise<VerifyRegistrationOtpResponse> {
  try {
    const body: VerifyRegistrationOtpRequest = {
      email: payload.email,
      otp: payload.otp,
      type: payload.type,
    };
    if (payload.firstName?.trim()) {
      body.firstName = payload.firstName.trim();
    }
    if (payload.lastName?.trim()) {
      body.lastName = payload.lastName.trim();
    }

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/verify-registration-otp`,
      {
        method: 'POST',
        credentials: 'include',
        headers: getPublicJsonHeaders(),
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to verify OTP',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const verifyResponse = data as VerifyRegistrationOtpResponse;
    storeTokenFromResponse(verifyResponse);
    return verifyResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches the authenticated author's app-service profile (avatar)
 */
export async function getMyAuthorAppProfile(): Promise<AuthorAppProfile> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/author-profiles/me`,
      {
        method: 'GET',
        headers,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message:
          data.message || data.error || 'Failed to fetch author app profile',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const profileResponse = data as AuthorAppProfileResponse;
    return profileResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches the authenticated author's profile from auth-service
 */
export async function getMyAuthorProfile(): Promise<AuthorProfileDto> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${getAuthApiBaseUrl()}/auth/authors/me`, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch author profile',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    return (data as { author: AuthorProfileDto }).author;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Persists author slug after registration before logout
 */
export async function storeAuthorSlugAfterRegistration(): Promise<void> {
  try {
    const author = await getMyAuthorProfile();
    if (author.slug) {
      setStoredWorkspaceSlug(author.slug);
    }
  } catch {
    // slug can be entered manually at login if fetch fails
  }
}

const PROFILE_RETRY_DELAY_MS = 500;

/**
 * Fetches the authenticated user's profile from app-service
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/user/profile`,
      {
        method: 'GET',
        headers,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch user profile',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const profileResponse = data as UserProfileResponse;
    return profileResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches user profile, retrying on 404 up to maxAttempts times
 */
export async function fetchUserProfileWithRetry(
  maxAttempts = 3
): Promise<UserProfile> {
  let lastError: ApiError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await getUserProfile();
    } catch (error) {
      const apiError = error as ApiError;
      lastError = apiError;

      if (apiError.statusCode !== 404 || attempt === maxAttempts) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, PROFILE_RETRY_DELAY_MS));
    }
  }

  throw (
    lastError ?? {
      message: 'Failed to fetch user profile',
      error: 'ProfileNotFound',
      statusCode: 404,
    }
  );
}

/**
 * Registers an organization admin user with email, password, and role
 */
export async function registerPartnerUser(
  input: RegisterPartnerUserInput
): Promise<string> {
  const body: RegisterRequest = {
    email: input.email.trim(),
    password: input.password,
    confirmPassword: input.confirmPassword,
    role: input.role,
  };
  if (input.address?.trim()) {
    body.address = input.address.trim();
  }
  if (input.contact?.trim()) {
    body.contact = input.contact.trim();
  }
  await registerUser(body);
  return input.email.trim();
}

/**
 * Registers an individual author partner with personal details and role AUTHOR
 */
export async function registerIndividualPartner(
  input: RegisterIndividualInput
): Promise<string> {
  const body: RegisterFormDataInput = {
    email: input.email.trim(),
    password: input.password,
    confirmPassword: input.confirmPassword,
    role: 'AUTHOR',
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    address: input.address.trim(),
  };
  if (input.contact?.trim()) {
    body.contact = input.contact.trim();
  }
  if (input.profileImage) {
    body.profileImage = input.profileImage;
  }
  await registerUser(body);
  return input.email.trim();
}

/**
 * Creates organization after OTP verification
 */
export async function completePartnerOrganizationSetup(
  input: CompletePartnerOrganizationInput
): Promise<OrganizationItem> {
  return createOrganization({
    name: input.organizationName.trim(),
    websiteUrl: input.websiteUrl,
    teamSize: input.teamSize,
    preferredGenre: input.preferredGenre,
    image: input.image,
  });
}
