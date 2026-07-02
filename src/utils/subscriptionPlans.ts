import type { SubscriptionPlanItem } from './audiobookApi';

export const SUBSCRIPTION_TIER_BY_NAME = {
  'Base Plan': 1,
  'Standard Plan': 2,
  'Premium Plan': 3,
} as const;

export type SubscriptionTier =
  (typeof SUBSCRIPTION_TIER_BY_NAME)[keyof typeof SUBSCRIPTION_TIER_BY_NAME];

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  1: 'Base',
  2: 'Standard',
  3: 'Premium',
};

export interface SubscriptionPlanSelectOption {
  value: string;
  label: string;
}

function isSubscriptionTier(value: number): value is SubscriptionTier {
  return value === 1 || value === 2 || value === 3;
}

const SUBSCRIPTION_TIER_CODE_TO_NUMBER = {
  BASE: 1,
  STANDARD: 2,
  PREMIUM: 3,
} as const;

type SubscriptionTierCode = keyof typeof SUBSCRIPTION_TIER_CODE_TO_NUMBER;

function isSubscriptionTierCode(value: string): value is SubscriptionTierCode {
  return value in SUBSCRIPTION_TIER_CODE_TO_NUMBER;
}

/** Normalizes API tier values (number or enum string) to 1–3, or null when free. */
export function normalizeMinSubscriptionTier(
  tier: number | string | null | undefined
): number | null {
  if (tier == null) {
    return null;
  }

  if (typeof tier === 'number') {
    if (tier <= 0) {
      return null;
    }
    return tier;
  }

  const normalized = tier.trim().toUpperCase();
  if (isSubscriptionTierCode(normalized)) {
    return SUBSCRIPTION_TIER_CODE_TO_NUMBER[normalized];
  }

  const parsed = Number(normalized);
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed;
  }

  return null;
}

export function getSubscriptionTierForPlanName(
  name: string
): SubscriptionTier | undefined {
  const normalized = name.trim().toLowerCase();

  const exactMatch = Object.entries(SUBSCRIPTION_TIER_BY_NAME).find(
    ([planName]) => planName.toLowerCase() === normalized
  );
  if (exactMatch) {
    return exactMatch[1];
  }

  if (normalized.includes('base')) {
    return 1;
  }
  if (normalized.includes('standard')) {
    return 2;
  }
  if (normalized.includes('premium')) {
    return 3;
  }

  return undefined;
}

export function resolveSubscriptionPlanTier(
  plan: Pick<SubscriptionPlanItem, 'name' | 'minSubscriptionTier'>
): SubscriptionTier | undefined {
  if (plan.minSubscriptionTier != null && isSubscriptionTier(plan.minSubscriptionTier)) {
    return plan.minSubscriptionTier;
  }

  return getSubscriptionTierForPlanName(plan.name);
}

export function buildSubscriptionPlanSelectOptions(
  plans: SubscriptionPlanItem[]
): SubscriptionPlanSelectOption[] {
  return (plans ?? [])
    .map(plan => {
      const tier = resolveSubscriptionPlanTier(plan);
      if (tier == null) {
        return null;
      }

      return {
        value: String(tier),
        label: plan.name,
      };
    })
    .filter(
      (option): option is SubscriptionPlanSelectOption => option != null
    );
}

export function getSubscriptionPlanNameForTier(
  tier: number
): string | undefined {
  const entry = Object.entries(SUBSCRIPTION_TIER_BY_NAME).find(
    ([, value]) => value === tier
  );
  return entry?.[0];
}

export function getAudiobookSubscriptionTierLabel(
  minSubscriptionTier: number | null | undefined
): string {
  if (minSubscriptionTier == null || minSubscriptionTier === 0) {
    return 'Free';
  }

  if (isSubscriptionTier(minSubscriptionTier)) {
    return SUBSCRIPTION_TIER_LABELS[minSubscriptionTier];
  }

  return `${minSubscriptionTier}`;
}

/** Effective tier for comparison: free chapters are tier 0. */
export function getEffectiveChapterSubscriptionTier(
  minSubscriptionTier: number | null | undefined
): number {
  return normalizeMinSubscriptionTier(minSubscriptionTier) ?? 0;
}

export function isChapterSubscriptionTierBelowPrevious(
  isPaid: boolean,
  minSubscriptionTier: number | null | undefined,
  previousChapterMinTier: number | null | undefined
): boolean {
  const currentTier =
    isPaid && minSubscriptionTier != null ? minSubscriptionTier : 0;
  const previousTier = getEffectiveChapterSubscriptionTier(
    previousChapterMinTier
  );
  return currentTier < previousTier;
}
