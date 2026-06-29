import type {
  AudiobookApiResponse,
  AudiobookFormData,
  AudiobookWizardData,
  CreateAudiobookRequest,
  SubscriptionGatingMode,
  UpdateAudiobookRequest,
} from '../types/audiobook';
import type { GenreItem, TagItem } from './audiobookApi';

export const DEFAULT_AUDIOBOOK_LANGUAGE = 'English';

export const AUDIOBOOK_LANGUAGE_OPTIONS = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Mandarin',
] as const;

export type AudiobookWizardStep = 1 | 2 | 3 | 4 | 5;
export type WizardMode = 'create' | 'edit';

export const SUBSCRIPTION_GATING_MODE_OPTIONS: {
  id: SubscriptionGatingMode;
  label: string;
}[] = [
  { id: 'NONE', label: 'None' },
  { id: 'AUDIOBOOK', label: 'Audiobook' },
  { id: 'CHAPTER', label: 'Chapter' },
];

const SUBSCRIPTION_GATING_MODE_LABELS = Object.fromEntries(
  SUBSCRIPTION_GATING_MODE_OPTIONS.map(option => [option.id, option.label])
) as Record<SubscriptionGatingMode, string>;

export function getSubscriptionGatingModeLabel(
  mode: SubscriptionGatingMode
): string {
  return SUBSCRIPTION_GATING_MODE_LABELS[mode];
}

export function createEmptyAudiobookWizardData(): AudiobookWizardData {
  return {
    title: '',
    author: '',
    narrators: [],
    description: '',
    genres: [],
    tags: [],
    language: DEFAULT_AUDIOBOOK_LANGUAGE,
    coverImage: null,
    scheduledAt: undefined,
    meta: {},
    isPaid: false,
    minSubscriptionTier: null,
    moodId: null,
    subscriptionGatingMode: 'NONE',
    existingCoverUrl: undefined,
  };
}

export function filterAudiobookMeta(
  meta: Record<string, string>
): Record<string, string> {
  return Object.entries(meta)
    .filter(
      ([key, value]) =>
        !key.startsWith('__empty_') && key.trim() && value.trim()
    )
    .reduce(
      (acc, [key, value]) => {
        acc[key.trim()] = value.trim();
        return acc;
      },
      {} as Record<string, string>
    );
}

export function hydrateAudiobookWizardData(
  initialData: AudiobookApiResponse,
  genres: GenreItem[],
  tags: TagItem[]
): AudiobookWizardData {
  const genreIds: string[] = [];
  if (initialData.genres && initialData.genres.length > 0) {
    genreIds.push(
      ...initialData.genres
        .map(g => genres.find(genre => genre.name === g.name)?.id || '')
        .filter(id => id)
    );
  } else if (initialData.genre?.name) {
    const genreId = genres.find(g => g.name === initialData.genre?.name)?.id;
    if (genreId) {
      genreIds.push(genreId);
    }
  }

  const narrators: string[] = [];
  if (initialData.narrators && initialData.narrators.length > 0) {
    narrators.push(...initialData.narrators);
  } else if (initialData.narrator) {
    narrators.push(initialData.narrator);
  }

  return {
    title: initialData.title || '',
    author: initialData.author || '',
    narrators,
    description: initialData.description || '',
    genres: genreIds,
    tags:
      initialData.audiobookTags
        ?.map(tag => tags.find(t => t.name === tag.name)?.id || '')
        .filter(id => id) || [],
    language: initialData.language || DEFAULT_AUDIOBOOK_LANGUAGE,
    coverImage: null,
    scheduledAt: undefined,
    meta: initialData.meta || {},
    isPaid: initialData.isPublic === false,
    minSubscriptionTier: initialData.minSubscriptionTier ?? null,
    moodId: null,
    subscriptionGatingMode:
      initialData.subscriptionGatingMode ??
      (initialData.isPublic === false ? 'AUDIOBOOK' : 'NONE'),
    existingCoverUrl: initialData.coverImage,
  };
}

export function validateAudiobookStep(
  step: AudiobookWizardStep,
  data: AudiobookWizardData,
  mode: WizardMode
): Partial<Record<keyof AudiobookWizardData | 'scheduledAt', string>> {
  const errors: Partial<
    Record<keyof AudiobookWizardData | 'scheduledAt', string>
  > = {};

  if (step === 1) {
    if (!data.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }
    if (data.genres.length === 0) {
      errors.genres = 'At least one genre is required';
    }
    if (data.tags.length === 0) {
      errors.tags = 'At least one tag is required';
    }
  }

  if (step === 2) {
    if (!data.author.trim()) {
      errors.author = 'Author is required';
    }
  }

  if (step === 3) {
    const hasCover = Boolean(data.coverImage || data.existingCoverUrl);
    if (!hasCover) {
      errors.coverImage = 'Cover image is required';
    }
  }

  if (step === 4) {
    if (
      data.subscriptionGatingMode === 'AUDIOBOOK' &&
      data.isPaid &&
      data.minSubscriptionTier == null
    ) {
      errors.minSubscriptionTier = 'Please select a subscription plan';
    }
  }

  if (step === 5 && !data.scheduledAt && mode === 'create') {
    // scheduledAt validated only when scheduling explicitly
  }

  return errors;
}

export function validateAudiobookForSchedule(
  data: AudiobookWizardData
): Partial<Record<keyof AudiobookWizardData | 'scheduledAt', string>> {
  const errors = {
    ...validateAudiobookStep(1, data, 'create'),
    ...validateAudiobookStep(2, data, 'create'),
    ...validateAudiobookStep(3, data, 'create'),
    ...validateAudiobookStep(4, data, 'create'),
  };

  if (!data.scheduledAt) {
    errors.scheduledAt = 'Schedule date and time is required';
  }

  return errors;
}

export function validateAudiobookForPublish(
  data: AudiobookWizardData,
  mode: WizardMode
): Partial<Record<keyof AudiobookWizardData | 'scheduledAt', string>> {
  return {
    ...validateAudiobookStep(1, data, mode),
    ...validateAudiobookStep(2, data, mode),
    ...validateAudiobookStep(3, data, mode),
    ...validateAudiobookStep(4, data, mode),
  };
}

function buildPaidAndMoodFields(data: AudiobookFormData): {
  isPublic?: boolean;
  minSubscriptionTier?: number;
  moodId?: string;
} {
  const fields: {
    isPublic?: boolean;
    minSubscriptionTier?: number;
    moodId?: string;
  } = {};

  if (data.isPaid) {
    fields.isPublic = false;
    if (data.minSubscriptionTier != null) {
      fields.minSubscriptionTier = data.minSubscriptionTier;
    }
  } else {
    fields.isPublic = true;
  }

  if (data.subscriptionGatingMode === 'CHAPTER') {
    fields.isPublic = true;
    fields.minSubscriptionTier = 0;
  }

  if (data.moodId) {
    fields.moodId = data.moodId;
  }

  return fields;
}

export function buildCreateAudiobookRequest(
  data: AudiobookFormData,
  owner?: { type: 'ORGANIZATION' | 'AUTHOR'; id: string }
): CreateAudiobookRequest {
  const filteredMeta = filterAudiobookMeta(data.meta);

  return {
    title: data.title.trim(),
    author: data.author.trim(),
    narrators:
      data.narrators.length > 0
        ? data.narrators.map(n => n.trim()).filter(n => n)
        : undefined,
    description: data.description.trim(),
    genreIds: data.genres,
    tagIds: data.tags,
    ...(owner ? { owner } : {}),
    duration: 0,
    fileSize: 0,
    language: data.language.trim() || DEFAULT_AUDIOBOOK_LANGUAGE,
    coverImage: data.coverImage || undefined,
    scheduledAt: data.scheduledAt,
    meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
    subscriptionGatingMode: data.subscriptionGatingMode,
    ...buildPaidAndMoodFields(data),
  };
}

export function buildUpdateAudiobookRequest(
  audiobookId: string,
  data: AudiobookFormData
): UpdateAudiobookRequest {
  const filteredMeta = filterAudiobookMeta(data.meta);

  return {
    audiobookId,
    title: data.title.trim(),
    author: data.author.trim(),
    narrators:
      data.narrators.length > 0
        ? data.narrators.map(n => n.trim()).filter(n => n)
        : undefined,
    description: data.description.trim(),
    genreIds: data.genres,
    tagIds: data.tags,
    duration: 0,
    fileSize: 0,
    language: data.language.trim() || DEFAULT_AUDIOBOOK_LANGUAGE,
    coverImage: data.coverImage || undefined,
    scheduledAt: data.scheduledAt,
    meta: Object.keys(filteredMeta).length > 0 ? filteredMeta : undefined,
    subscriptionGatingMode: data.subscriptionGatingMode,
    ...buildPaidAndMoodFields(data),
  };
}
