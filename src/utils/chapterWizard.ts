import type {
  ChapterApiResponse,
  ChapterFormData,
  ChapterWizardData,
  CreateChapterRequest,
  UpdateChapterRequest,
} from '../types/audiobook';
import {
  isChapterSubscriptionTierBelowPrevious,
  normalizeMinSubscriptionTier,
} from './subscriptionPlans';

export type ChapterWizardStep = 1 | 2 | 3 | 4;
export type WizardMode = 'create' | 'edit';

export interface ChapterSubscriptionContext {
  isFirstChapter?: boolean;
  previousChapterMinTier?: number | null;
}

export const FIRST_CHAPTER_MUST_BE_FREE_HINT =
  'The first chapter of this audiobook must be free.';

export const CHAPTER_SUBSCRIPTION_TIER_ORDER_HINT =
  'The subscription plan for this chapter must be same or higher than the previous chapter.';

export function createEmptyChapterWizardData(
  chapterNumber = 1
): ChapterWizardData {
  return {
    title: '',
    description: '',
    chapterNumber,
    file: null,
    duration: undefined,
    startPosition: undefined,
    endPosition: undefined,
    scheduledAt: undefined,
    coverImage: null,
    existingCoverUrl: undefined,
    existingAudioUrl: undefined,
    isPaid: false,
    minSubscriptionTier: null,
  };
}

export function createEmptyChapterFormData(
  chapterNumber = 1
): ChapterFormData {
  const data = createEmptyChapterWizardData(chapterNumber);
  return {
    title: data.title,
    description: data.description,
    chapterNumber: data.chapterNumber,
    file: data.file,
    duration: data.duration,
    startPosition: data.startPosition,
    endPosition: data.endPosition,
    scheduledAt: data.scheduledAt,
    coverImage: data.coverImage,
    isPaid: data.isPaid,
    minSubscriptionTier: data.minSubscriptionTier,
  };
}

export function chapterResponseToFormData(
  initialData: ChapterApiResponse,
  nextChapterNumber: number
): ChapterFormData {
  const data = hydrateChapterWizardData(initialData);
  return {
    title: data.title,
    description: data.description,
    chapterNumber: initialData.chapterNumber || nextChapterNumber,
    file: null,
    duration: data.duration,
    startPosition: data.startPosition,
    endPosition: data.endPosition,
    scheduledAt: data.scheduledAt,
    coverImage: null,
    isPaid: data.isPaid,
    minSubscriptionTier: data.minSubscriptionTier,
  };
}

export async function loadAudioMetadata(file: File): Promise<{
  duration: number;
  startPosition: number;
  endPosition: number;
}> {
  const audioUrl = URL.createObjectURL(file);
  const audio = new Audio(audioUrl);

  try {
    await new Promise<void>((resolve, reject) => {
      audio.addEventListener('loadedmetadata', () => resolve());
      audio.addEventListener('error', () => reject(new Error('Failed to load audio')));
    });

    const duration = Math.floor(audio.duration);
    return {
      duration,
      startPosition: 0,
      endPosition: duration,
    };
  } finally {
    URL.revokeObjectURL(audioUrl);
  }
}

export function hydrateChapterWizardData(
  initialData: ChapterApiResponse
): ChapterWizardData {
  const minSubscriptionTier = normalizeMinSubscriptionTier(
    initialData.minSubscriptionTier
  );

  return {
    title: initialData.title || '',
    description: initialData.description || '',
    chapterNumber: initialData.chapterNumber,
    file: null,
    duration: initialData.duration,
    startPosition: initialData.startPosition,
    endPosition: initialData.endPosition,
    scheduledAt: initialData.scheduledAt,
    coverImage: null,
    existingCoverUrl: initialData.coverImage,
    existingAudioUrl: initialData.fileUrl,
    isPaid: minSubscriptionTier != null,
    minSubscriptionTier,
  };
}

export function validateChapterStep(
  step: ChapterWizardStep,
  data: ChapterWizardData,
  mode: WizardMode,
  subscriptionContext?: ChapterSubscriptionContext
): Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>> {
  const errors: Partial<
    Record<keyof ChapterWizardData | 'scheduledAt', string>
  > = {};

  if (step === 1) {
    if (!data.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!data.description.trim()) {
      errors.description = 'Description is required';
    }
    if (subscriptionContext?.isFirstChapter) {
      if (data.isPaid || data.minSubscriptionTier != null) {
        errors.minSubscriptionTier = FIRST_CHAPTER_MUST_BE_FREE_HINT;
      }
    } else if (data.isPaid && data.minSubscriptionTier == null) {
      errors.minSubscriptionTier = 'Please select a subscription plan';
    } else if (
      !subscriptionContext?.isFirstChapter &&
      subscriptionContext?.previousChapterMinTier !== undefined &&
      isChapterSubscriptionTierBelowPrevious(
        data.isPaid,
        data.minSubscriptionTier,
        subscriptionContext.previousChapterMinTier
      )
    ) {
      errors.minSubscriptionTier = CHAPTER_SUBSCRIPTION_TIER_ORDER_HINT;
    }
  }

  if (step === 2) {
    if (mode === 'create' && !data.file) {
      errors.file = 'Audio file is required';
    }
  }

  if (step === 3) {
    const hasCover = Boolean(data.coverImage || data.existingCoverUrl);
    if (!hasCover) {
      errors.coverImage = 'Cover image is required';
    }
  }

  return errors;
}

export function validateChapterForSchedule(
  data: ChapterWizardData,
  mode: WizardMode,
  subscriptionContext?: ChapterSubscriptionContext
): Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>> {
  const errors = {
    ...validateChapterStep(1, data, mode, subscriptionContext),
    ...validateChapterStep(2, data, mode, subscriptionContext),
    ...validateChapterStep(3, data, mode, subscriptionContext),
  };

  if (!data.scheduledAt) {
    errors.scheduledAt = 'Schedule date and time is required';
  }

  if (mode === 'create' && !data.file) {
    errors.file = 'Audio file is required';
  }

  return errors;
}

export function validateChapterForPublish(
  data: ChapterWizardData,
  mode: WizardMode,
  subscriptionContext?: ChapterSubscriptionContext
): Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>> {
  return {
    ...validateChapterStep(1, data, mode, subscriptionContext),
    ...validateChapterStep(2, data, mode, subscriptionContext),
    ...validateChapterStep(3, data, mode, subscriptionContext),
  };
}

function buildChapterSubscriptionFields(data: ChapterFormData): {
  minSubscriptionTier?: number | null;
} {
  if (data.isPaid && data.minSubscriptionTier != null) {
    return { minSubscriptionTier: data.minSubscriptionTier };
  }
  if (data.isPaid) {
    return {};
  }
  return { minSubscriptionTier: 0 };
}

export function buildCreateChapterRequest(
  audiobookId: string,
  data: ChapterFormData
): CreateChapterRequest {
  if (!data.file || !data.coverImage) {
    throw new Error('Audio file and cover image are required');
  }

  return {
    audiobookId,
    title: data.title.trim(),
    description: data.description.trim(),
    chapterNumber: data.chapterNumber,
    file: data.file,
    duration: data.duration,
    startPosition: data.startPosition,
    endPosition: data.endPosition,
    scheduledAt: data.scheduledAt,
    coverImage: data.coverImage,
    ...buildChapterSubscriptionFields(data),
  };
}

export function buildUpdateChapterRequest(
  chapterId: string,
  data: ChapterFormData
): UpdateChapterRequest {
  const request: UpdateChapterRequest = {
    chapterId,
    title: data.title.trim(),
    description: data.description.trim(),
    chapterNumber: data.chapterNumber,
    duration: data.duration,
    startPosition: data.startPosition,
    endPosition: data.endPosition,
    scheduledAt: data.scheduledAt,
  };

  if (data.file) {
    request.file = data.file;
  }
  if (data.coverImage) {
    request.coverImage = data.coverImage;
  }

  Object.assign(request, buildChapterSubscriptionFields(data));

  return request;
}
