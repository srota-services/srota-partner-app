import { describe, expect, it } from 'vitest';
import {
  buildSubscriptionPlanSelectOptions,
  getAudiobookSubscriptionTierLabel,
  getEffectiveChapterSubscriptionTier,
  getSubscriptionPlanNameForTier,
  getSubscriptionTierForPlanName,
  isChapterSubscriptionTierBelowPrevious,
  normalizeMinSubscriptionTier,
  resolveSubscriptionPlanTier,
} from '../src/utils/subscriptionPlans';

describe('subscriptionPlans', () => {
  it('maps plan names to subscription tiers', () => {
    expect(getSubscriptionTierForPlanName('Base Plan')).toBe(1);
    expect(getSubscriptionTierForPlanName('Standard Plan')).toBe(2);
    expect(getSubscriptionTierForPlanName('Premium Plan')).toBe(3);
    expect(getSubscriptionTierForPlanName('Unknown Plan')).toBeUndefined();
  });

  it('matches plan names case-insensitively and by keyword', () => {
    expect(getSubscriptionTierForPlanName('base plan')).toBe(1);
    expect(getSubscriptionTierForPlanName('PREMIUM')).toBe(3);
    expect(getSubscriptionTierForPlanName('Standard')).toBe(2);
  });

  it('uses minSubscriptionTier from API when provided', () => {
    expect(
      resolveSubscriptionPlanTier({
        name: 'Any label',
        minSubscriptionTier: 2,
      })
    ).toBe(2);
  });

  it('builds select options from API plans', () => {
    const options = buildSubscriptionPlanSelectOptions([
      { name: 'base plan' },
      { name: 'Custom Standard', minSubscriptionTier: 2 },
      { name: 'Unsupported plan' },
    ]);

    expect(options).toEqual([
      { value: '1', label: 'base plan' },
      { value: '2', label: 'Custom Standard' },
    ]);
  });

  it('maps subscription tiers back to plan names', () => {
    expect(getSubscriptionPlanNameForTier(1)).toBe('Base Plan');
    expect(getSubscriptionPlanNameForTier(2)).toBe('Standard Plan');
    expect(getSubscriptionPlanNameForTier(3)).toBe('Premium Plan');
    expect(getSubscriptionPlanNameForTier(4)).toBeUndefined();
  });

  it('maps audiobook subscription tiers to table labels', () => {
    expect(getAudiobookSubscriptionTierLabel(null)).toBe('Free');
    expect(getAudiobookSubscriptionTierLabel(undefined)).toBe('Free');
    expect(getAudiobookSubscriptionTierLabel(0)).toBe('Free');
    expect(getAudiobookSubscriptionTierLabel(1)).toBe('Base');
    expect(getAudiobookSubscriptionTierLabel(2)).toBe('Standard');
    expect(getAudiobookSubscriptionTierLabel(3)).toBe('Premium');
    expect(getAudiobookSubscriptionTierLabel(4)).toBe('4');
  });

  it('normalizes API tier values', () => {
    expect(normalizeMinSubscriptionTier('STANDARD')).toBe(2);
    expect(normalizeMinSubscriptionTier('premium')).toBe(3);
    expect(normalizeMinSubscriptionTier(0)).toBeNull();
    expect(normalizeMinSubscriptionTier(null)).toBeNull();
  });
});

describe('chapter subscription tier ordering', () => {
  it('treats free chapters as tier 0', () => {
    expect(getEffectiveChapterSubscriptionTier(null)).toBe(0);
    expect(getEffectiveChapterSubscriptionTier(0)).toBe(0);
  });

  it('detects when a chapter tier is below the previous chapter', () => {
    expect(
      isChapterSubscriptionTierBelowPrevious(false, null, 2)
    ).toBe(true);
    expect(
      isChapterSubscriptionTierBelowPrevious(true, 1, 2)
    ).toBe(true);
    expect(
      isChapterSubscriptionTierBelowPrevious(true, 2, 2)
    ).toBe(false);
    expect(
      isChapterSubscriptionTierBelowPrevious(true, 3, 2)
    ).toBe(false);
  });
});
