import type { ApiError } from '../types/auth';
import type {
  CreateAudiobookRequest,
  UpdateAudiobookRequest,
  AudiobooksApiResponse,
  AudiobookApiResponse,
  CreateChapterRequest,
  UpdateChapterRequest,
  ChapterApiResponse,
  ChaptersApiResponse,
} from '../types/audiobook';
import {
  getAuthApiBaseUrl,
  getContentApiBaseUrl,
  getAuthHeaders,
  getAuthHeadersForFileUpload,
  handleApiError,
} from './config';
import { normalizeHexColor } from './colorUtils';
import { getAccessToken } from './token';

/**
 * Genre item from API response
 */
export interface GenreItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Tag item from API response
 */
export interface TagItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Language item from API response
 */
export interface LanguageItem {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * API response structure for genres
 */
export interface GenresResponse {
  success: boolean;
  data: GenreItem[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * API response structure for tags
 */
export interface TagsResponse {
  success: boolean;
  data: TagItem[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * API response structure for languages
 */
export interface LanguagesResponse {
  success: boolean;
  data: LanguageItem[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Subscription plan item from API response
 */
export interface SubscriptionPlanItem {
  id?: string;
  name: string;
  minSubscriptionTier?: number;
}

/**
 * API response structure for subscription plans
 */
export interface SubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlanItem[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Mood item from API response
 */
export interface MoodItem {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeMoodItem(raw: Record<string, unknown>): MoodItem | null {
  const id = typeof raw.id === 'string' ? raw.id : undefined;
  const name = typeof raw.name === 'string' ? raw.name : undefined;

  if (!id || !name) {
    return null;
  }

  const color =
    normalizeHexColor(raw.hexcode) ??
    normalizeHexColor(raw.hexCode) ??
    normalizeHexColor(raw.color) ??
    normalizeHexColor(raw.hex) ??
    normalizeHexColor(raw.colour) ??
    normalizeHexColor(raw.backgroundColor);

  return {
    id,
    name,
    ...(color ? { color } : {}),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
  };
}

function normalizeMoodsPayload(data: unknown): MoodItem[] {
  const rawMoods = Array.isArray(data)
    ? data
    : data &&
        typeof data === 'object' &&
        Array.isArray((data as MoodsResponse).data)
      ? (data as MoodsResponse).data
      : [];

  return rawMoods
    .map(item =>
      item && typeof item === 'object'
        ? normalizeMoodItem(item as Record<string, unknown>)
        : null
    )
    .filter((mood): mood is MoodItem => mood != null);
}

/**
 * API response structure for moods
 */
export interface MoodsResponse {
  success: boolean;
  data: MoodItem[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Organization nested in a user membership response
 */
export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * User organization membership from API response
 */
export interface UserOrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  organization?: OrganizationItem;
}

/**
 * API response structure for organizations from auth-service
 */
export interface OrganizationsAuthResponse {
  message: string;
  organizations: UserOrganizationMembership[];
}

/** Organization entry from the public catalog listing */
export interface CatalogOrganizationItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  preferredGenre?: string | null;
  websiteUrl?: string | null;
  teamSize?: string | null;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationsPagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export interface AllOrganizationsResponse {
  message: string;
  organizations: CatalogOrganizationItem[];
  pagination?: OrganizationsPagination;
}

/**
 * Fetches genres from the API
 * @returns Promise resolving to genres response or throwing an error
 */
export async function getGenres(): Promise<GenreItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/genres`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch genres',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const genresResponse = data as GenresResponse;
    return genresResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches organizations for the current user from the API
 * @returns Promise resolving to user organization memberships or throwing an error
 */
export async function getOrganizations(): Promise<
  UserOrganizationMembership[]
> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch organizations',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const organizationsResponse = data as OrganizationsAuthResponse;
    return organizationsResponse.organizations ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches all organizations from the catalog (for author marketplace discovery).
 */
export async function getAllOrganizations(
  page = 1,
  limit = 100
): Promise<{
  organizations: CatalogOrganizationItem[];
  pagination?: OrganizationsPagination;
}> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/organizations/all?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch organizations',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const catalogResponse = data as AllOrganizationsResponse;
    return {
      organizations: catalogResponse.organizations ?? [],
      pagination: catalogResponse.pagination,
    };
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches tags from the API
 * @returns Promise resolving to tags response or throwing an error
 */
export async function getTags(): Promise<TagItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/tags`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch tags',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const tagsResponse = data as TagsResponse;
    return tagsResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches languages from the API
 * @returns Promise resolving to languages response or throwing an error
 */
export async function getLanguages(): Promise<LanguageItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/languages`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch languages',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const languagesResponse = data as LanguagesResponse;
    return languagesResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

function extractSubscriptionPlansPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return [];
  }

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data;
  }

  if (record.data && typeof record.data === 'object') {
    const nested = record.data as Record<string, unknown>;
    if (Array.isArray(nested.plans)) {
      return nested.plans;
    }
    if (Array.isArray(nested.items)) {
      return nested.items;
    }
  }

  if (Array.isArray(record.plans)) {
    return record.plans;
  }

  return [];
}

function parseSubscriptionPlanRecord(raw: unknown): SubscriptionPlanItem | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const nameField = [record.name, record.planName, record.title, record.label].find(
    value => typeof value === 'string' && value.trim()
  );

  if (typeof nameField !== 'string') {
    return null;
  }

  const tierCandidate =
    record.minSubscriptionTier ?? record.tier ?? record.level;
  let minSubscriptionTier: number | undefined;

  if (typeof tierCandidate === 'number') {
    minSubscriptionTier = tierCandidate;
  } else if (typeof tierCandidate === 'string' && tierCandidate.trim()) {
    const parsedTier = Number(tierCandidate);
    if (!Number.isNaN(parsedTier)) {
      minSubscriptionTier = parsedTier;
    }
  }

  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    name: nameField.trim(),
    minSubscriptionTier,
  };
}

/**
 * Fetches subscription plans from the API
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlanItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/subscription-plans/`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message:
          data.message || data.error || 'Failed to fetch subscription plans',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    return extractSubscriptionPlansPayload(data)
      .map(parseSubscriptionPlanRecord)
      .filter((plan): plan is SubscriptionPlanItem => plan != null);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches moods from the API
 */
export async function getMoods(): Promise<MoodItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/moods`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch moods',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    return normalizeMoodsPayload(data);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * API response structure for a single genre
 */
export interface GenreResponse {
  success: boolean;
  data: GenreItem;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * API response structure for a single tag
 */
export interface TagResponse {
  success: boolean;
  data: TagItem;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

/**
 * Creates a new genre
 * @param name - The name of the genre
 * @returns Promise resolving to created genre or throwing an error
 */
export async function createGenre(name: string): Promise<GenreItem> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/genres/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to create genre',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const genreResponse = data as GenreResponse;
    return genreResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Updates an existing genre
 * @param id - The ID of the genre to update
 * @param name - The new name of the genre
 * @returns Promise resolving to updated genre or throwing an error
 */
export async function updateGenre(
  id: string,
  name: string
): Promise<GenreItem> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/genres/${id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to update genre',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const genreResponse = data as GenreResponse;
    return genreResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Deletes a genre
 * @param id - The ID of the genre to delete
 * @returns Promise resolving to success response or throwing an error
 */
export async function deleteGenre(id: string): Promise<void> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/genres/${id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    // DELETE requests may return empty body (204 No Content) or JSON
    let data: ApiError | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text) as ApiError;
        } catch {
          // Empty or invalid JSON - treat as success if status is ok
          data = null;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || 'Failed to delete genre',
        error: data?.error || 'DeleteFailed',
        statusCode: response.status,
      };
      throw error;
    }
    // Success - DELETE operations may return empty body
  } catch (error) {
    // Only re-throw if it's not already an ApiError
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'error' in error
    ) {
      throw error;
    }
    throw handleApiError(error);
  }
}

/**
 * Creates a new tag
 * @param name - The name of the tag
 * @param type - Optional type of the tag
 * @returns Promise resolving to created tag or throwing an error
 */
export async function createTag(name: string, type?: string): Promise<TagItem> {
  try {
    const headers = getAuthHeaders();

    const body: { name: string; type?: string } = { name };
    if (type) {
      body.type = type;
    }

    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/tags/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to create tag',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const tagResponse = data as TagResponse;
    return tagResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Updates an existing tag
 * @param id - The ID of the tag to update
 * @param name - The new name of the tag
 * @param type - Optional new type of the tag
 * @returns Promise resolving to updated tag or throwing an error
 */
export async function updateTag(
  id: string,
  name: string,
  type?: string
): Promise<TagItem> {
  try {
    const headers = getAuthHeaders();

    const body: { name: string; type?: string } = { name };
    if (type) {
      body.type = type;
    }

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/tags/${id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to update tag',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const tagResponse = data as TagResponse;
    return tagResponse.data;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Deletes a tag
 * @param id - The ID of the tag to delete
 * @returns Promise resolving to success response or throwing an error
 */
export async function deleteTag(id: string): Promise<void> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/tags/${id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    // DELETE requests may return empty body (204 No Content) or JSON
    let data: ApiError | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text) as ApiError;
        } catch {
          // Empty or invalid JSON - treat as success if status is ok
          data = null;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || 'Failed to delete tag',
        error: data?.error || 'DeleteFailed',
        statusCode: response.status,
      };
      throw error;
    }
    // Success - DELETE operations may return empty body
  } catch (error) {
    // Only re-throw if it's not already an ApiError
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'error' in error
    ) {
      throw error;
    }
    throw handleApiError(error);
  }
}

/**
 * Author item from API response
 */
export interface AuthorItem {
  id: string;
  userId: string;
  slug: string;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  contact?: string | null;
  organizations?: Array<{ id: string; name: string; slug: string }>;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthorsAuthResponse {
  message: string;
  authors: AuthorItem[];
}

interface AuthorAuthResponse {
  message: string;
  author: AuthorItem;
}

/**
 * Request interface for creating an author (auth-service)
 */
export interface CreateAuthorRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  contact?: string;
  organizationIds?: string[];
}

/**
 * Request interface for updating an author
 */
export interface UpdateAuthorRequest {
  firstName?: string;
  lastName?: string;
  address?: string;
  contact?: string;
  organizationIds?: string[];
}

function getAuthorDisplayName(author: AuthorItem): string {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : author.slug;
}

export { getAuthorDisplayName };

/**
 * Fetches authors from auth-service
 */
export async function getAuthors(): Promise<AuthorItem[]> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getAuthApiBaseUrl()}/auth/authors`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch authors',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const authorsResponse = data as AuthorsAuthResponse;
    return authorsResponse.authors ?? [];
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Creates a new author record for an existing AUTHOR user
 */
export async function createAuthor(
  authorData: CreateAuthorRequest
): Promise<AuthorItem> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${getAuthApiBaseUrl()}/auth/authors`, {
      method: 'POST',
      headers,
      body: JSON.stringify(authorData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to create author',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const authorResponse = data as AuthorAuthResponse;
    return authorResponse.author;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Updates an existing author
 */
export async function updateAuthor(
  id: string,
  authorData: UpdateAuthorRequest
): Promise<AuthorItem> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/${id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(authorData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to update author',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    const authorResponse = data as AuthorAuthResponse;
    return authorResponse.author;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Deletes an author
 */
export async function deleteAuthor(id: string): Promise<void> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getAuthApiBaseUrl()}/auth/authors/${id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    let data: ApiError | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text) as ApiError;
        } catch {
          data = null;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || 'Failed to delete author',
        error: data?.error || 'DeleteFailed',
        statusCode: response.status,
      };
      throw error;
    }
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'error' in error
    ) {
      throw error;
    }
    throw handleApiError(error);
  }
}

function appendAudiobookPaidAndMoodFields(
  formData: FormData,
  audiobookData: CreateAudiobookRequest | UpdateAudiobookRequest
): void {
  if (audiobookData.isPublic !== undefined) {
    formData.append('isPublic', String(audiobookData.isPublic));
  }
  if (audiobookData.minSubscriptionTier !== undefined) {
    formData.append(
      'minSubscriptionTier',
      String(audiobookData.minSubscriptionTier)
    );
  }
  if (audiobookData.moodId !== undefined) {
    formData.append('moodId', audiobookData.moodId);
  }
  if (audiobookData.subscriptionGatingMode !== undefined) {
    formData.append(
      'subscriptionGatingMode',
      audiobookData.subscriptionGatingMode
    );
  }
}

export async function createAudiobook(
  audiobookData: CreateAudiobookRequest
): Promise<AudiobookApiResponse> {
  try {
    // If coverImage is provided, use FormData; otherwise use JSON
    // NOTE: Audiobook creation does NOT include audio files - only coverImage if provided
    // Multer on the backend should handle FormData with only coverImage (no audio files)
    if (audiobookData.coverImage) {
      const headers = getAuthHeadersForFileUpload();
      const formData = new FormData();

      // Text fields
      formData.append('title', audiobookData.title);
      formData.append('author', audiobookData.author);
      if (audiobookData.narrators && audiobookData.narrators.length > 0) {
        formData.append('narrators', JSON.stringify(audiobookData.narrators));
      }
      formData.append('description', audiobookData.description);
      if (audiobookData.language) {
        formData.append('language', audiobookData.language);
      }
      if (audiobookData.owner) {
        formData.append('owner', JSON.stringify(audiobookData.owner));
      }

      // Send genreIds as JSON array string
      formData.append('genreIds', JSON.stringify(audiobookData.genreIds));

      // Send tagIds as JSON array string
      formData.append('tagIds', JSON.stringify(audiobookData.tagIds));

      // Send meta as JSON object string if provided
      if (
        audiobookData.meta !== undefined &&
        Object.keys(audiobookData.meta).length > 0
      ) {
        formData.append('meta', JSON.stringify(audiobookData.meta));
      }

      // File field - only coverImage, NO audio files
      formData.append(
        'coverImage',
        audiobookData.coverImage,
        audiobookData.coverImage.name
      );

      // Optional fields
      if (audiobookData.scheduledAt !== undefined) {
        formData.append('scheduledAt', audiobookData.scheduledAt);
      }

      appendAudiobookPaidAndMoodFields(formData, audiobookData);

      const response = await fetch(
        `${getContentApiBaseUrl()}/api/v1/audiobooks`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Failed to create audiobook',
          error: data.error,
          statusCode: response.status,
        };
        throw error;
      }
      if (data.success && data.data) {
        return data.data as AudiobookApiResponse;
      }
      return data as AudiobookApiResponse;
    } else {
      // No file, use JSON - exclude duration and fileSize
      const headers = getAuthHeaders();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { duration, fileSize, ...jsonData } = audiobookData;
      const response = await fetch(
        `${getContentApiBaseUrl()}/api/v1/audiobooks`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(jsonData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Failed to create audiobook',
          error: data.error,
          statusCode: response.status,
        };
        throw error;
      }
      if (data.success && data.data) {
        return data.data as AudiobookApiResponse;
      }
      return data as AudiobookApiResponse;
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

export async function getAudiobooks(
  page?: number,
  active?: boolean,
  scheduled?: boolean,
  ownerId?: string
): Promise<AudiobooksApiResponse> {
  try {
    const headers = getAuthHeaders();
    let url = `${getContentApiBaseUrl()}/api/v1/audiobooks`;
    const queryParams: string[] = [];

    if (page) {
      queryParams.push(`page=${page}`);
    }
    if (active !== undefined) {
      queryParams.push(`active=${active}`);
    }
    if (scheduled !== undefined) {
      queryParams.push(`scheduled=${scheduled}`);
    }
    if (ownerId) {
      queryParams.push(`ownerId=${encodeURIComponent(ownerId)}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch audiobooks',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }
    return data as AudiobooksApiResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Updates an existing audiobook
 * @param audiobookData - Audiobook data to update (coverImage is optional)
 * @returns Promise resolving to updated audiobook response or throwing an error
 */
export async function updateAudiobook(
  audiobookData: UpdateAudiobookRequest
): Promise<AudiobookApiResponse> {
  try {
    // If coverImage is provided, use FormData; otherwise use JSON
    if (audiobookData.coverImage) {
      const headers = getAuthHeadersForFileUpload();
      const formData = new FormData();
      formData.append('audiobookId', audiobookData.audiobookId);

      if (audiobookData.title !== undefined) {
        formData.append('title', audiobookData.title);
      }
      if (audiobookData.author !== undefined) {
        formData.append('author', audiobookData.author);
      }
      if (
        audiobookData.narrators !== undefined &&
        audiobookData.narrators.length > 0
      ) {
        formData.append('narrators', JSON.stringify(audiobookData.narrators));
      }
      if (audiobookData.description !== undefined) {
        formData.append('description', audiobookData.description);
      }
      if (audiobookData.language !== undefined) {
        formData.append('language', audiobookData.language);
      }
      if (
        audiobookData.genreIds !== undefined &&
        audiobookData.genreIds.length > 0
      ) {
        formData.append('genreIds', JSON.stringify(audiobookData.genreIds));
      }
      if (audiobookData.tagIds !== undefined) {
        // Send tagIds as JSON array string
        formData.append('tagIds', JSON.stringify(audiobookData.tagIds));
      }
      if (
        audiobookData.meta !== undefined &&
        Object.keys(audiobookData.meta).length > 0
      ) {
        formData.append('meta', JSON.stringify(audiobookData.meta));
      }
      formData.append('coverImage', audiobookData.coverImage);
      if (audiobookData.scheduledAt !== undefined) {
        formData.append('scheduledAt', audiobookData.scheduledAt);
      }

      appendAudiobookPaidAndMoodFields(formData, audiobookData);

      const response = await fetch(
        `${getContentApiBaseUrl()}/api/v1/audiobooks/${audiobookData.audiobookId}`,
        {
          method: 'PUT',
          headers,
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Failed to update audiobook',
          error: data.error,
          statusCode: response.status,
        };
        throw error;
      }
      if (data.success && data.data) {
        return data.data as AudiobookApiResponse;
      }
      return data as AudiobookApiResponse;
    } else {
      // No file, use JSON - exclude duration and fileSize
      const headers = getAuthHeaders();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { audiobookId, coverImage, duration, fileSize, ...jsonData } =
        audiobookData;
      const response = await fetch(
        `${getContentApiBaseUrl()}/api/v1/audiobooks/${audiobookId}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(jsonData),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        const error: ApiError = {
          message: data.message || data.error || 'Failed to update audiobook',
          error: data.error,
          statusCode: response.status,
        };
        throw error;
      }
      if (data.success && data.data) {
        return data.data as AudiobookApiResponse;
      }
      return data as AudiobookApiResponse;
    }
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Deletes an audiobook
 * @param audiobookId - The ID of the audiobook to delete
 * @returns Promise resolving to success response or throwing an error
 */
export async function deleteAudiobook(audiobookId: string): Promise<void> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/audiobooks/${audiobookId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    // DELETE requests may return empty body (204 No Content) or JSON
    let data: ApiError | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text) as ApiError;
        } catch {
          // Empty or invalid JSON - treat as success if status is ok
          data = null;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || 'Failed to delete audiobook',
        error: data?.error || 'DeleteFailed',
        statusCode: response.status,
      };
      throw error;
    }
    // Success - DELETE operations may return empty body
  } catch (error) {
    // Only re-throw if it's not already an ApiError
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'error' in error
    ) {
      throw error;
    }
    throw handleApiError(error);
  }
}

/**
 * Creates a new chapter for an audiobook
 * @param chapterData - Chapter data including file
 * @returns Promise resolving to created chapter response or throwing an error
 */
function appendChapterSubscriptionTier(
  formData: FormData,
  minSubscriptionTier: number | null | undefined
): void {
  if (minSubscriptionTier === undefined) {
    return;
  }
  if (minSubscriptionTier === null) {
    formData.append('minSubscriptionTier', '');
    return;
  }
  formData.append('minSubscriptionTier', String(minSubscriptionTier));
}

function appendChapterSubscriptionTierToJson(
  jsonData: Record<string, unknown>,
  minSubscriptionTier: number | null | undefined
): void {
  if (minSubscriptionTier !== undefined) {
    jsonData.minSubscriptionTier = minSubscriptionTier;
  }
}

export async function createChapter(
  chapterData: CreateChapterRequest
): Promise<ChapterApiResponse> {
  try {
    // Always use FormData for chapter creation (file is required)
    const token = getAccessToken();
    if (!token) {
      throw {
        message: 'Access token not found. Please login again.',
        error: 'TokenNotFound',
      };
    }

    // Create clean headers object with ONLY Authorization
    // DO NOT include Content-Type - browser MUST set it automatically for FormData
    // If you set Content-Type manually, you must include the boundary, but the browser
    // generates a unique boundary automatically when you don't set Content-Type
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      // Content-Type is intentionally NOT set here - browser will set:
      // Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
    };

    // Create FormData for file upload
    const formData = new FormData();

    // Required fields - ensure they are strings and not empty
    formData.append('audiobookId', String(chapterData.audiobookId).trim());
    formData.append('title', String(chapterData.title).trim());
    formData.append('description', String(chapterData.description).trim());
    formData.append('chapterNumber', String(chapterData.chapterNumber));

    // File is required for creation
    if (!chapterData.file || !(chapterData.file instanceof File)) {
      throw {
        message: 'Audio file is required for chapter creation',
        error: 'FileRequired',
      };
    }
    formData.append('file', chapterData.file, chapterData.file.name);

    // Cover Image is required for creation
    if (!chapterData.coverImage || !(chapterData.coverImage instanceof File)) {
      throw {
        message: 'Cover image is required for chapter creation',
        error: 'CoverImageRequired',
      };
    }
    formData.append(
      'coverImage',
      chapterData.coverImage,
      chapterData.coverImage.name
    );

    // Add optional fields only if they have valid values
    if (
      chapterData.duration !== undefined &&
      chapterData.duration !== null &&
      !isNaN(chapterData.duration)
    ) {
      formData.append('duration', String(chapterData.duration));
    }
    if (
      chapterData.startPosition !== undefined &&
      chapterData.startPosition !== null &&
      !isNaN(chapterData.startPosition)
    ) {
      formData.append('startPosition', String(chapterData.startPosition));
    }
    if (
      chapterData.endPosition !== undefined &&
      chapterData.endPosition !== null &&
      !isNaN(chapterData.endPosition)
    ) {
      formData.append('endPosition', String(chapterData.endPosition));
    }
    if (
      chapterData.scheduledAt !== undefined &&
      chapterData.scheduledAt !== null &&
      chapterData.scheduledAt.trim() !== ''
    ) {
      formData.append('scheduledAt', String(chapterData.scheduledAt).trim());
    }
    if (chapterData.minSubscriptionTier !== undefined) {
      appendChapterSubscriptionTier(formData, chapterData.minSubscriptionTier);
    }

    // Use fetch with FormData - browser will automatically set Content-Type: multipart/form-data
    // with the correct boundary parameter. DO NOT set Content-Type manually.
    const response = await fetch(`${getContentApiBaseUrl()}/api/v1/chapters`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to create chapter',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    // Handle response structure
    if (data.success && data.data) {
      return data.data as ChapterApiResponse;
    }
    return data as ChapterApiResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches a single chapter by ID
 * @param chapterId - The ID of the chapter
 * @returns Promise resolving to chapter data or throwing an error
 */
export async function getChapter(
  chapterId: string
): Promise<ChapterApiResponse> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/chapters/${chapterId}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch chapter',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    if (data.success && data.data) {
      return data.data as ChapterApiResponse;
    }
    return data as ChapterApiResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Fetches chapters for a specific audiobook
 * @param audiobookId - The ID of the audiobook
 * @param page - Optional page number for pagination
 * @returns Promise resolving to chapters response or throwing an error
 */
export async function getChapters(
  audiobookId: string,
  page?: number
): Promise<ChaptersApiResponse> {
  try {
    const headers = getAuthHeaders();

    let url = `${getContentApiBaseUrl()}/api/v1/audiobooks/${audiobookId}/chapters`;
    if (page) {
      url += `?page=${page}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to fetch chapters',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    return data as ChaptersApiResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Updates an existing chapter
 * @param chapterData - Chapter data to update (file is optional)
 * @returns Promise resolving to updated chapter response or throwing an error
 */
export async function updateChapter(
  chapterData: UpdateChapterRequest
): Promise<ChapterApiResponse> {
  try {
    // Check if we need FormData (if there are files to upload)
    const hasFiles =
      chapterData.file !== undefined || chapterData.coverImage !== undefined;

    let headers: HeadersInit;
    let body: FormData | string;

    if (hasFiles) {
      // Use FormData for file uploads
      headers = getAuthHeadersForFileUpload();
      const formData = new FormData();
      formData.append('chapterId', chapterData.chapterId);

      if (chapterData.title !== undefined) {
        formData.append('title', chapterData.title);
      }
      if (chapterData.description !== undefined) {
        formData.append('description', chapterData.description);
      }
      if (chapterData.chapterNumber !== undefined) {
        formData.append('chapterNumber', chapterData.chapterNumber.toString());
      }
      if (chapterData.file !== undefined) {
        formData.append('file', chapterData.file);
      }
      if (chapterData.duration !== undefined) {
        formData.append('duration', chapterData.duration.toString());
      }
      if (chapterData.startPosition !== undefined) {
        formData.append('startPosition', chapterData.startPosition.toString());
      }
      if (chapterData.endPosition !== undefined) {
        formData.append('endPosition', chapterData.endPosition.toString());
      }
      if (chapterData.scheduledAt !== undefined) {
        formData.append('scheduledAt', chapterData.scheduledAt);
      }
      if (chapterData.coverImage !== undefined) {
        formData.append('coverImage', chapterData.coverImage);
      }
      appendChapterSubscriptionTier(formData, chapterData.minSubscriptionTier);
      body = formData;
    } else {
      // Use JSON for non-file updates
      headers = getAuthHeaders();
      const jsonData: Record<string, unknown> = {
        chapterId: chapterData.chapterId,
      };

      if (chapterData.title !== undefined) {
        jsonData.title = chapterData.title;
      }
      if (chapterData.description !== undefined) {
        jsonData.description = chapterData.description;
      }
      if (chapterData.chapterNumber !== undefined) {
        jsonData.chapterNumber = chapterData.chapterNumber;
      }
      if (chapterData.duration !== undefined) {
        jsonData.duration = chapterData.duration;
      }
      if (chapterData.startPosition !== undefined) {
        jsonData.startPosition = chapterData.startPosition;
      }
      if (chapterData.endPosition !== undefined) {
        jsonData.endPosition = chapterData.endPosition;
      }
      if (chapterData.scheduledAt !== undefined) {
        jsonData.scheduledAt = chapterData.scheduledAt;
      }
      appendChapterSubscriptionTierToJson(jsonData, chapterData.minSubscriptionTier);
      body = JSON.stringify(jsonData);
    }

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/chapters/${chapterData.chapterId}`,
      {
        method: 'PUT',
        headers,
        body,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || data.error || 'Failed to update chapter',
        error: data.error,
        statusCode: response.status,
      };
      throw error;
    }

    // Handle response structure
    if (data.success && data.data) {
      return data.data as ChapterApiResponse;
    }
    return data as ChapterApiResponse;
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Deletes a chapter
 * @param chapterId - The ID of the chapter to delete
 * @returns Promise resolving to success response or throwing an error
 */
export async function deleteChapter(chapterId: string): Promise<void> {
  try {
    const headers = getAuthHeaders();

    const response = await fetch(
      `${getContentApiBaseUrl()}/api/v1/chapters/${chapterId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    // DELETE requests may return empty body (204 No Content) or JSON
    let data: ApiError | null = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text) as ApiError;
        } catch {
          // Empty or invalid JSON - treat as success if status is ok
          data = null;
        }
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data?.message || data?.error || 'Failed to delete chapter',
        error: data?.error || 'DeleteFailed',
        statusCode: response.status,
      };
      throw error;
    }
    // Success - DELETE operations may return empty body
  } catch (error) {
    // Only re-throw if it's not already an ApiError
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      'error' in error
    ) {
      throw error;
    }
    throw handleApiError(error);
  }
}
