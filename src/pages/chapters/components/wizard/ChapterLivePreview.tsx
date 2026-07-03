import WizardLivePreviewHeader from '../../../../components/wizard/WizardLivePreviewHeader';
import AppImage from '../../../../components/common/AppImage';
import { formatDurationDetailed } from '../../../../utils/formatting';
import type { ChapterWizardData } from '../../../../types/audiobook';
import type { SubscriptionPlanItem } from '../../../../utils/audiobookApi';
import {
  getSubscriptionPlanNameForTier,
  resolveSubscriptionPlanTier,
} from '../../../../utils/subscriptionPlans';
import '../../../../styles/pages/chapters/components/ChapterCard.css';

interface ChapterLivePreviewProps {
  data: ChapterWizardData;
  coverPreviewUrl: string | null;
  subscriptionPlans: SubscriptionPlanItem[];
}

function ChapterLivePreview({
  data,
  coverPreviewUrl,
  subscriptionPlans,
}: ChapterLivePreviewProps) {
  const subscriptionPlanName =
    data.isPaid && data.minSubscriptionTier != null
      ? subscriptionPlans.find(
          plan =>
            resolveSubscriptionPlanTier(plan) === data.minSubscriptionTier
        )?.name ||
        getSubscriptionPlanNameForTier(data.minSubscriptionTier) ||
        `Tier ${data.minSubscriptionTier}`
      : undefined;

  return (
    <div className="wizard-preview-card">
      <WizardLivePreviewHeader subtitle="This is how your chapter will appear" />

      <div className="chapter-card chapter-card--preview">
        <div className="chapter-card-cover">
          <AppImage
            src={coverPreviewUrl}
            alt={data.title || 'Chapter cover'}
            variant="cover"
          />
        </div>
        <div className="chapter-card-content">
          <div className="chapter-card-header">
            <span className="chapter-card-number">
              Chapter {data.chapterNumber}
            </span>
          </div>
          <h3 className="chapter-card-title">
            {data.title || 'Untitled Chapter'}
          </h3>
          {subscriptionPlanName && (
            <p className="chapter-card-description">
              Subscription plan: {subscriptionPlanName}
            </p>
          )}
          {data.description && (
            <p className="chapter-card-description">
              {data.description.length > 120
                ? `${data.description.slice(0, 120)}...`
                : data.description}
            </p>
          )}
          {data.duration !== undefined && (
            <p className="chapter-card-description">
              Duration: {formatDurationDetailed(data.duration)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChapterLivePreview;
