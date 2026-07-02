import { Wallet } from 'lucide-react';
import InfoHint from '../../../../../components/common/InfoHint';
import PillSwitch from '../../../../../components/common/PillSwitch';
import Select from '../../../../../components/common/Select';
import WizardFieldLabel from '../../../../../components/wizard/WizardFieldLabel';
import type { ChapterWizardData } from '../../../../../types/audiobook';
import {
  CHAPTER_SUBSCRIPTION_TIER_ORDER_HINT,
  FIRST_CHAPTER_MUST_BE_FREE_HINT,
} from '../../../../../utils/chapterWizard';
import {
  buildSubscriptionPlanSelectOptions,
  isChapterSubscriptionTierBelowPrevious,
} from '../../../../../utils/subscriptionPlans';
import type { SubscriptionPlanItem } from '../../../../../utils/audiobookApi';

interface ChapterBasicsStepProps {
  data: ChapterWizardData;
  errors: Partial<Record<keyof ChapterWizardData, string>>;
  subscriptionPlans: SubscriptionPlanItem[];
  subscriptionPlansLoading: boolean;
  isFirstChapter: boolean;
  previousChapterMinTier?: number | null;
  isLoading?: boolean;
  onChange: (updates: Partial<ChapterWizardData>) => void;
}

function ChapterBasicsStep({
  data,
  errors,
  subscriptionPlans,
  subscriptionPlansLoading,
  isFirstChapter,
  previousChapterMinTier = null,
  isLoading = false,
  onChange,
}: ChapterBasicsStepProps) {
  const subscriptionPlanOptions = buildSubscriptionPlanSelectOptions(
    subscriptionPlans ?? []
  );

  const showTierOrderHint =
    !isFirstChapter &&
    isChapterSubscriptionTierBelowPrevious(
      data.isPaid,
      data.minSubscriptionTier,
      previousChapterMinTier
    );

  return (
    <div className="wizard-step-form">
      <div className="wizard-field-group">
        <label htmlFor="chapter-title">
          Title <span className="wizard-required">*</span>
        </label>
        <input
          id="chapter-title"
          type="text"
          value={data.title}
          onChange={e => onChange({ title: e.target.value })}
          placeholder="Enter chapter title"
          disabled={isLoading}
        />
        {errors.title && (
          <span className="wizard-field-error">{errors.title}</span>
        )}
      </div>

      <div className="wizard-field-group">
        <label htmlFor="chapter-description">
          Description <span className="wizard-required">*</span>
        </label>
        <textarea
          id="chapter-description"
          value={data.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Enter chapter description"
          rows={4}
          disabled={isLoading}
        />
        {errors.description && (
          <span className="wizard-field-error">{errors.description}</span>
        )}
      </div>

      <div className="wizard-field-group">
        <label htmlFor="chapter-number">Chapter Number</label>
        <input
          id="chapter-number"
          type="number"
          value={data.chapterNumber}
          readOnly
          className="readonly-input"
        />
      </div>

      <div className="wizard-field-group">
        <div className="wizard-paid-plan-layout">
          <div className="wizard-paid-switch">
            <div className="wizard-paid-switch-row">
              <PillSwitch
                id="chapter-paid-switch"
                label="Paid"
                checked={data.isPaid}
                disabled={isLoading || isFirstChapter}
                onChange={checked => {
                  if (checked) {
                    onChange({ isPaid: true });
                  } else {
                    onChange({ isPaid: false, minSubscriptionTier: null });
                  }
                }}
              />
              {isFirstChapter && (
                <InfoHint message={FIRST_CHAPTER_MUST_BE_FREE_HINT} />
              )}
            </div>
          </div>
          {data.isPaid && (
            <div className="wizard-paid-plan-content">
              <div className="wizard-subscription-plan-label-row">
                <WizardFieldLabel
                  htmlFor="chapter-subscription-plan"
                  icon={Wallet}
                  required
                >
                  Subscription plan
                </WizardFieldLabel>
                {showTierOrderHint && (
                  <InfoHint
                    variant="error"
                    message={CHAPTER_SUBSCRIPTION_TIER_ORDER_HINT}
                  />
                )}
              </div>
              <div className="wizard-paid-plan-dropdown">
                <Select
                  id="chapter-subscription-plan"
                  options={subscriptionPlanOptions}
                  placeholder={
                    subscriptionPlansLoading
                      ? 'Loading plans...'
                      : 'Select a subscription plan'
                  }
                  loading={subscriptionPlansLoading}
                  value={
                    data.minSubscriptionTier != null
                      ? String(data.minSubscriptionTier)
                      : ''
                  }
                  onChange={e => {
                    const tier = e.target.value ? Number(e.target.value) : null;
                    onChange({
                      minSubscriptionTier:
                        tier != null && !Number.isNaN(tier) ? tier : null,
                    });
                  }}
                  disabled={
                    isLoading || !data.isPaid || subscriptionPlansLoading
                  }
                  error={Boolean(errors.minSubscriptionTier)}
                />
                {errors.minSubscriptionTier && (
                  <span className="wizard-field-error">
                    {errors.minSubscriptionTier}
                  </span>
                )}
              </div>
            </div>
          )}
          {!data.isPaid && showTierOrderHint && (
            <InfoHint
              variant="error"
              message={CHAPTER_SUBSCRIPTION_TIER_ORDER_HINT}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterBasicsStep;
