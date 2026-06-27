import type {
  ChapterApiResponse,
  ChapterFormData,
  ChapterWizardData,
  CreateChapterRequest,
  UpdateChapterRequest,
} from '../types/audiobook';

export type ChapterWizardStep = 1 | 2 | 3 | 4;
export type WizardMode = 'create' | 'edit';

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
  return {
    title: initialData.title || '',
    description: initialData.description || '',
    chapterNumber: initialData.chapterNumber,
    file: null,
    duration: initialData.duration,
    startPosition: initialData.startPosition,
    endPosition: initialData.endPosition,
    scheduledAt: undefined,
    coverImage: null,
    existingCoverUrl: initialData.coverImage,
    existingAudioUrl: initialData.fileUrl,
    isPaid: initialData.minSubscriptionTier != null,
    minSubscriptionTier: initialData.minSubscriptionTier ?? null,
  };
}

export function validateChapterStep(
  step: ChapterWizardStep,
  data: ChapterWizardData,
  mode: WizardMode
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
    if (data.isPaid && data.minSubscriptionTier == null) {
      errors.minSubscriptionTier = 'Please select a subscription plan';
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
  mode: WizardMode
): Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>> {
  const errors = {
    ...validateChapterStep(1, data, mode),
    ...validateChapterStep(2, data, mode),
    ...validateChapterStep(3, data, mode),
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
  mode: WizardMode
): Partial<Record<keyof ChapterWizardData | 'scheduledAt', string>> {
  return {
    ...validateChapterStep(1, data, mode),
    ...validateChapterStep(2, data, mode),
    ...validateChapterStep(3, data, mode),
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
  return { minSubscriptionTier: null };
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
