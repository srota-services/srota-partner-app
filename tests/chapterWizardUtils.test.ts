import { describe, expect, it } from 'vitest';
import {
  buildCreateChapterRequest,
  createEmptyChapterWizardData,
  hydrateChapterWizardData,
  validateChapterStep,
} from '../src/utils/chapterWizard';
import { testAudioFile, testCoverFile } from './wizardTestHelpers';

describe('chapterWizard subscription fields', () => {
  it('sends minSubscriptionTier 0 when chapter is not paid', () => {
    const data = createEmptyChapterWizardData();
    data.title = 'Chapter One';
    data.description = 'Description';
    data.file = testAudioFile;
    data.coverImage = testCoverFile;

    const request = buildCreateChapterRequest('ab-1', data);

    expect(request.minSubscriptionTier).toBe(0);
  });

  it('includes minSubscriptionTier when chapter is paid', () => {
    const data = createEmptyChapterWizardData();
    data.title = 'Chapter One';
    data.description = 'Description';
    data.file = testAudioFile;
    data.coverImage = testCoverFile;
    data.isPaid = true;
    data.minSubscriptionTier = 2;

    const request = buildCreateChapterRequest('ab-1', data);

    expect(request.minSubscriptionTier).toBe(2);
  });

  it('hydrates paid state from minSubscriptionTier', () => {
    const hydrated = hydrateChapterWizardData({
      id: 'ch-1',
      title: 'Paid Chapter',
      description: 'Description',
      chapterNumber: 1,
      audiobookId: 'ab-1',
      minSubscriptionTier: 3,
    });

    expect(hydrated.isPaid).toBe(true);
    expect(hydrated.minSubscriptionTier).toBe(3);
  });

  it('hydrates free state when minSubscriptionTier is 0', () => {
    const hydrated = hydrateChapterWizardData({
      id: 'ch-2',
      title: 'Free Chapter',
      description: 'Description',
      chapterNumber: 2,
      audiobookId: 'ab-1',
      minSubscriptionTier: 0,
    });

    expect(hydrated.isPaid).toBe(false);
    expect(hydrated.minSubscriptionTier).toBeNull();
  });

  it('requires a subscription plan when paid switch is on', () => {
    const data = createEmptyChapterWizardData();
    data.title = 'Chapter One';
    data.description = 'Description';
    data.isPaid = true;

    const errors = validateChapterStep(1, data, 'create');

    expect(errors.minSubscriptionTier).toBe('Please select a subscription plan');
  });
});
