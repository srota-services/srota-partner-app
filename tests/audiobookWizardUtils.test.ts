import { describe, expect, it } from 'vitest';
import {
  buildCreateAudiobookRequest,
  createEmptyAudiobookWizardData,
  hydrateAudiobookWizardData,
  validateAudiobookStep,
} from '../src/utils/audiobookWizard';

describe('audiobook wizard request builder', () => {
  it('omits paid and mood fields when not set', () => {
    const data = createEmptyAudiobookWizardData();
    data.title = 'Test Title';
    data.author = 'Test Author';
    data.description = 'Test description';
    data.genres = ['genre-1'];
    data.tags = ['tag-1'];

    const request = buildCreateAudiobookRequest(data);

    expect(request.isPublic).toBe(true);
    expect(request.minSubscriptionTier).toBeUndefined();
    expect(request.moodId).toBeUndefined();
    expect(request.subscriptionGatingMode).toBe('NONE');
  });

  it('includes paid fields when audiobook is paid', () => {
    const data = createEmptyAudiobookWizardData();
    data.title = 'Test Title';
    data.author = 'Test Author';
    data.description = 'Test description';
    data.genres = ['genre-1'];
    data.tags = ['tag-1'];
    data.subscriptionGatingMode = 'AUDIOBOOK';
    data.isPaid = true;
    data.minSubscriptionTier = 2;

    const request = buildCreateAudiobookRequest(data);

    expect(request.isPublic).toBe(false);
    expect(request.minSubscriptionTier).toBe(2);
    expect(request.subscriptionGatingMode).toBe('AUDIOBOOK');
  });

  it('hydrates paid state from isPublic false', () => {
    const data = hydrateAudiobookWizardData(
      {
        id: 'ab-1',
        title: 'Paid Book',
        author: 'Author',
        description: 'Description',
        isPublic: false,
        minSubscriptionTier: 2,
      },
      [],
      []
    );

    expect(data.isPaid).toBe(true);
    expect(data.subscriptionGatingMode).toBe('AUDIOBOOK');
    expect(data.minSubscriptionTier).toBe(2);
  });

  it('hydrates free state from isPublic true', () => {
    const data = hydrateAudiobookWizardData(
      {
        id: 'ab-2',
        title: 'Free Book',
        author: 'Author',
        description: 'Description',
        isPublic: true,
      },
      [],
      []
    );

    expect(data.isPaid).toBe(false);
    expect(data.subscriptionGatingMode).toBe('NONE');
  });

  it('hydrates subscriptionGatingMode from API when provided', () => {
    const data = hydrateAudiobookWizardData(
      {
        id: 'ab-3',
        title: 'Chapter Gated Book',
        author: 'Author',
        description: 'Description',
        isPublic: true,
        subscriptionGatingMode: 'CHAPTER',
      },
      [],
      []
    );

    expect(data.subscriptionGatingMode).toBe('CHAPTER');
  });

  it('hydrates moodId from nested mood in API response', () => {
    const data = hydrateAudiobookWizardData(
      {
        id: 'ab-4',
        title: 'Mood Book',
        author: 'Author',
        description: 'Description',
        mood: {
          id: 'mood-calm',
          name: 'Calm',
          hexcode: '#38BDF8',
        },
      },
      [],
      []
    );

    expect(data.moodId).toBe('mood-calm');
  });

  it('hydrates moodId from moodId field in API response', () => {
    const data = hydrateAudiobookWizardData(
      {
        id: 'ab-5',
        title: 'Mood Book',
        author: 'Author',
        description: 'Description',
        moodId: 'mood-energetic',
        mood: {
          id: 'mood-energetic',
          name: 'Energetic',
        },
      },
      [],
      []
    );

    expect(data.moodId).toBe('mood-energetic');
  });

  it('includes moodId when a mood is selected', () => {
    const data = createEmptyAudiobookWizardData();
    data.title = 'Test Title';
    data.author = 'Test Author';
    data.description = 'Test description';
    data.genres = ['genre-1'];
    data.tags = ['tag-1'];
    data.moodId = 'mood-1';

    const request = buildCreateAudiobookRequest(data);

    expect(request.moodId).toBe('mood-1');
  });

  it('requires subscription plan on step 4 when audiobook gating is paid', () => {
    const data = createEmptyAudiobookWizardData();
    data.subscriptionGatingMode = 'AUDIOBOOK';
    data.isPaid = true;

    const errors = validateAudiobookStep(4, data, 'create');

    expect(errors.minSubscriptionTier).toBe('Please select a subscription plan');
  });

  it('does not require subscription plan on step 4 when gating mode is chapter', () => {
    const data = createEmptyAudiobookWizardData();
    data.subscriptionGatingMode = 'CHAPTER';

    const errors = validateAudiobookStep(4, data, 'create');

    expect(errors.minSubscriptionTier).toBeUndefined();
  });

  it('sends minSubscriptionTier 0 when gating mode is chapter', () => {
    const data = createEmptyAudiobookWizardData();
    data.title = 'Test Title';
    data.author = 'Test Author';
    data.description = 'Test description';
    data.genres = ['genre-1'];
    data.tags = ['tag-1'];
    data.subscriptionGatingMode = 'CHAPTER';

    const request = buildCreateAudiobookRequest(data);

    expect(request.subscriptionGatingMode).toBe('CHAPTER');
    expect(request.minSubscriptionTier).toBe(0);
    expect(request.isPublic).toBe(true);
  });
});
