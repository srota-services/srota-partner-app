import { Crown, Info, Wallet } from 'lucide-react';
import InfoHint from '../../../../../components/common/InfoHint';
import Select from '../../../../../components/common/Select';
import PillSwitch from '../../../../../components/common/PillSwitch';
import WizardFieldLabel from '../../../../../components/wizard/WizardFieldLabel';
import WizardSinglePillSelector from '../../../../../components/wizard/WizardSinglePillSelector';
import type {
  AudiobookWizardData,
  SubscriptionGatingMode,
} from '../../../../../types/audiobook';
import {
  CHAPTER_GATING_FIRST_CHAPTER_FREE_MESSAGE,
  SUBSCRIPTION_GATING_MODE_OPTIONS,
} from '../../../../../utils/audiobookWizard';
import { buildSubscriptionPlanSelectOptions } from '../../../../../utils/subscriptionPlans';
import type { SubscriptionPlanItem } from '../../../../../utils/audiobookApi';

const SUBSCRIPTION_LEVEL_HINT =
  "Audiobook subscription tier will apply on the entire audiobook and it's including chapters. Chapter subscription tier allows you to select subscription levels for chapters. All chapters must follow the subscription tier.";

interface SubscriptionTiersStepProps {
  data: AudiobookWizardData;
  errors: Partial<Record<keyof AudiobookWizardData, string>>;
  subscriptionPlans: SubscriptionPlanItem[];
  subscriptionPlansLoading: boolean;
  isLoading?: boolean;
  onChange: (updates: Partial<AudiobookWizardData>) => void;
}

function SubscriptionTiersStep({
  data,
  errors,
  subscriptionPlans,
  subscriptionPlansLoading,
  isLoading = false,
  onChange,
}: SubscriptionTiersStepProps) {
  const subscriptionPlanOptions = buildSubscriptionPlanSelectOptions(
    subscriptionPlans ?? []
  );

  const handleSubscriptionLevelChange = (mode: string | null) => {
    const subscriptionGatingMode = (mode ?? 'NONE') as SubscriptionGatingMode;
    const updates: Partial<AudiobookWizardData> = { subscriptionGatingMode };

    if (subscriptionGatingMode !== 'AUDIOBOOK') {
      updates.isPaid = false;
      updates.minSubscriptionTier =
        subscriptionGatingMode === 'CHAPTER' ? 0 : null;
    }

    onChange(updates);
  };

  return (
    <div className="wizard-step-form">
      <div className="wizard-field-group">
        <div className="wizard-field-label-row">
          <WizardFieldLabel icon={Crown}>Subscription Level</WizardFieldLabel>
          <InfoHint message={SUBSCRIPTION_LEVEL_HINT} />
        </div>
        <WizardSinglePillSelector
          name="audiobook-subscription-level"
          options={SUBSCRIPTION_GATING_MODE_OPTIONS}
          value={data.subscriptionGatingMode}
          onChange={handleSubscriptionLevelChange}
          disabled={isLoading}
        />
        {data.subscriptionGatingMode === 'CHAPTER' && (
          <div
            key="chapter-gating-notice"
            className="wizard-chapter-gating-notice"
            role="status"
          >
            <div className="wizard-chapter-gating-notice-panel">
              <Info
                size={16}
                className="wizard-chapter-gating-notice-icon"
                aria-hidden="true"
              />
              <p className="wizard-chapter-gating-notice-text">
                {CHAPTER_GATING_FIRST_CHAPTER_FREE_MESSAGE}
              </p>
            </div>
          </div>
        )}
      </div>

      {data.subscriptionGatingMode === 'AUDIOBOOK' && (
        <div className="wizard-field-group">
          <div className="wizard-paid-plan-layout">
            <div className="wizard-paid-switch">
              <PillSwitch
                id="audiobook-paid-switch"
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
                  htmlFor="audiobook-subscription-plan"
                  icon={Wallet}
                  required
                >
                  Subscription plan
                </WizardFieldLabel>
                <div className="wizard-paid-plan-dropdown">
                  <Select
                    id="audiobook-subscription-plan"
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
                      const tier = e.target.value
                        ? Number(e.target.value)
                        : null;
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
          </div>
        </div>
      )}
    </div>
  );
}

export default SubscriptionTiersStep;
