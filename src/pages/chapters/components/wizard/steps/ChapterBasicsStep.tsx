import { Wallet } from 'lucide-react';
import PillSwitch from '../../../../../components/common/PillSwitch';
import WizardFieldLabel from '../../../../../components/wizard/WizardFieldLabel';
import type { ChapterWizardData } from '../../../../../types/audiobook';
import { buildSubscriptionPlanSelectOptions } from '../../../../../utils/subscriptionPlans';
import type { SubscriptionPlanItem } from '../../../../../utils/audiobookApi';

interface ChapterBasicsStepProps {
  data: ChapterWizardData;
  errors: Partial<Record<keyof ChapterWizardData, string>>;
  subscriptionPlans: SubscriptionPlanItem[];
  subscriptionPlansLoading: boolean;
  isLoading?: boolean;
  onChange: (updates: Partial<ChapterWizardData>) => void;
}

function ChapterBasicsStep({
  data,
  errors,
  subscriptionPlans,
  subscriptionPlansLoading,
  isLoading = false,
  onChange,
}: ChapterBasicsStepProps) {
  const subscriptionPlanOptions = buildSubscriptionPlanSelectOptions(
    subscriptionPlans ?? []
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
            <PillSwitch
              id="chapter-paid-switch"
              label="Paid"
              checked={data.isPaid}
              disabled={isLoading}
              onChange={checked => {
                if (checked) {
                  onChange({ isPaid: true });
                } else {
                  onChange({ isPaid: false, minSubscriptionTier: null });
                }
              }}
            />
          </div>
          {data.isPaid && (
            <div className="wizard-paid-plan-content">
              <WizardFieldLabel
                htmlFor="chapter-subscription-plan"
                icon={Wallet}
                required
              >
                Subscription plan
              </WizardFieldLabel>
              <div className="wizard-paid-plan-dropdown">
                <select
                  id="chapter-subscription-plan"
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
                  aria-invalid={Boolean(errors.minSubscriptionTier)}
                >
                  <option value="">
                    {subscriptionPlansLoading
                      ? 'Loading plans...'
                      : 'Select a subscription plan'}
                  </option>
                  {subscriptionPlanOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.minSubscriptionTier && (
                  <span className="wizard-field-error">
                    {errors.minSubscriptionTier}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterBasicsStep;
