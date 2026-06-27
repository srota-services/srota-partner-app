/**
 * Genre ID (from API)
 */
export type Genre = string;

/**
 * Tag ID (from API)
 */
export type Tag = string;

/**
 * Audiobook tag from API response
 */
export interface AudiobookTag {
  name: string;
  type: string;
}

/**
 * Genre from API response
 */
export interface AudiobookGenre {
  name: string;
}

/**
 * Audiobook structure from API response
 */
export interface AudiobookApiResponse {
  id: string;
  title: string;
  author: string;
  narrator?: string;
  narrators?: string[];
  description: string;
  duration?: number;
  chapterCount?: number;
  fileSize?: number;
  coverImage?: string;
  language?: string;
  publisher?: string;
  publishDate?: string;
  isbn?: string;
  isActive?: boolean;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  audiobookTags?: AudiobookTag[];
  genre?: AudiobookGenre;
  genres?: AudiobookGenre[];
  meta?: Record<string, string>;
  minSubscriptionTier?: number | null;
}

/**
 * Audiobook structure for form/UI
 */
export interface Audiobook {
  id?: string;
  title: string;
  author: string;
  narrator?: string;
  description: string;
  genre: Genre;
  tags: Tag[];
}

/**
 * Chapter structure
 */
export interface Chapter {
  id?: string;
  title: string;
  description: string;
  chapterNumber: number;
  file?: File | null;
  audiobookId?: string;
  duration?: number;
  startPosition?: number;
  endPosition?: number;
}

/**
 * Audiobook form data structure
 */
export interface AudiobookFormData {
  title: string;
  author: string;
  narrators: string[];
  description: string;
  genres: Genre[];
  tags: Tag[];
  language: string;
  coverImage: File | null;
  scheduledAt?: string;
  meta: Record<string, string>;
  isPaid: boolean;
  minSubscriptionTier: number | null;
  moodId: string | null;
}

export type AudiobookWizardData = AudiobookFormData & {
  existingCoverUrl?: string;
};

/**
 * Chapter form data structure
 */
export interface ChapterFormData {
  title: string;
  description: string;
  chapterNumber: number;
  file: File | null;
  duration?: number;
  startPosition?: number;
  endPosition?: number;
  scheduledAt?: string;
  coverImage: File | null;
  isPaid: boolean;
  minSubscriptionTier: number | null;
}

/**
 * Audiobook owner reference for create/update payloads
 */
export type AudioBookOwnerType = 'AUTHOR' | 'ORGANIZATION';

export interface AudioBookOwnerInput {
  type: AudioBookOwnerType;
  id: string;
}

/**
 * Create Audiobook request payload
 */
export interface CreateAudiobookRequest {
  title: string;
  author: string;
  narrators?: string[];
  description: string;
  genreIds: string[];
  tagIds: string[];
  owner?: AudioBookOwnerInput;
  duration: number;
  fileSize: number;
  language?: string;
  coverImage?: File;
  scheduledAt?: string;
  meta?: Record<string, string>;
  isPublic?: boolean;
  minSubscriptionTier?: number;
  moodId?: string;
}

/**
 * Update Audiobook request payload
 */
export interface UpdateAudiobookRequest {
  audiobookId: string;
  title?: string;
  author?: string;
  narrators?: string[];
  description?: string;
  genreIds?: string[];
  tagIds?: string[];
  duration?: number;
  fileSize?: number;
  language?: string;
  coverImage?: File;
  scheduledAt?: string;
  meta?: Record<string, string>;
  isPublic?: boolean;
  minSubscriptionTier?: number;
  moodId?: string;
}

export type ChapterWizardData = ChapterFormData & {
  existingCoverUrl?: string;
  existingAudioUrl?: string;
};

/**
 * Pagination information from API
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Audiobooks API response structure
 */
export interface AudiobooksApiResponse {
  success: boolean;
  data: AudiobookApiResponse[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  pagination?: PaginationInfo;
}

/**
 * Audiobook reference in chapter response
 */
export interface ChapterAudiobookReference {
  id: string;
  title: string;
  author: string;
}

/**
 * Chapter structure from API response
 */
export interface ChapterApiResponse {
  id: string;
  title: string;
  description: string;
  chapterNumber: number;
  audiobookId: string;
  duration?: number;
  startPosition?: number;
  endPosition?: number;
  filePath?: string;
  fileSize?: number;
  fileUrl?: string;
  coverImage?: string;
  isActive?: boolean;
  sourceUploadStatus?: 'pending' | 'ready' | 'failed';
  sourceUploadError?: string | null;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  minSubscriptionTier?: number | null;
  audiobook?: ChapterAudiobookReference;
  bookmarks?: unknown[];
  notes?: unknown[];
  chapterProgress?: unknown[];
}

/**
 * Create Chapter request payload
 */
export interface CreateChapterRequest {
  audiobookId: string;
  title: string;
  description: string;
  chapterNumber: number;
  file: File;
  coverImage: File;
  duration?: number;
  startPosition?: number;
  endPosition?: number;
  scheduledAt?: string;
  minSubscriptionTier?: number | null;
}

/**
 * Update Chapter request payload
 */
export interface UpdateChapterRequest {
  chapterId: string;
  title?: string;
  description?: string;
  chapterNumber?: number;
  file?: File;
  duration?: number;
  startPosition?: number;
  endPosition?: number;
  scheduledAt?: string;
  coverImage?: File;
  minSubscriptionTier?: number | null;
}

/**
 * Chapters API response structure
 */
export interface ChaptersApiResponse {
  success: boolean;
  data: ChapterApiResponse[];
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  pagination?: PaginationInfo;
}
