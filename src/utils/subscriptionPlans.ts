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
