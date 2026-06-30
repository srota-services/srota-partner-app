import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Clock,
  CreditCard,
  Crown,
  FileText,
  Hash,
  Headphones,
  Image as ImageIcon,
} from 'lucide-react';
import WizardReviewRow from '../../../../../components/wizard/WizardReviewRow';
import type { ChapterWizardData } from '../../../../../types/audiobook';
import type { ChapterWizardStep } from '../../../../../utils/chapterWizard';
import { formatDurationDetailed, getFileNameFromUrl } from '../../../../../utils/formatting';
import { getSubscriptionPlanNameForTier } from '../../../../../utils/subscriptionPlans';

interface ChapterReviewPublishStepProps {
  data: ChapterWizardData;
  onNavigateToStep: (step: ChapterWizardStep) => void;
}

interface ReviewRowConfig {
  label: string;
  value: string;
  icon: LucideIcon;
  step: ChapterWizardStep;
}

function ChapterReviewPublishStep({
  data,
  onNavigateToStep,
}: ChapterReviewPublishStepProps) {
  const audioLabel =
    data.file?.name ||
    (data.existingAudioUrl ? getFileNameFromUrl(data.existingAudioUrl) : '—');
  const coverLabel =
    data.coverImage?.name ||
    (data.existingCoverUrl ? 'Existing cover' : '—');
  const durationLabel =
    data.duration !== undefined ? formatDurationDetailed(data.duration) : '—';
  const subscriptionPlanName =
    data.isPaid && data.minSubscriptionTier != null
      ? getSubscriptionPlanNameForTier(data.minSubscriptionTier) ||
        `Tier ${data.minSubscriptionTier}`
      : '—';

  const reviewRows: ReviewRowConfig[] = [
    {
      label: 'Chapter',
      value: String(data.chapterNumber),
      icon: Hash,
      step: 1,
    },
    {
      label: 'Title',
      value: data.title || '—',
      icon: BookOpen,
      step: 1,
    },
    {
      label: 'Description',
      value: data.description || '—',
      icon: FileText,
      step: 1,
    },
    {
      label: 'Paid',
      value: data.isPaid ? 'Yes' : 'No',
      icon: CreditCard,
      step: 1,
    },
    {
      label: 'Subscription plan',
      value: subscriptionPlanName,
      icon: Crown,
      step: 1,
    },
    {
      label: 'Audio',
      value: audioLabel,
      icon: Headphones,
      step: 2,
    },
    {
      label: 'Duration',
      value: durationLabel,
      icon: Clock,
      step: 2,
    },
    {
      label: 'Cover',
      value: coverLabel,
      icon: ImageIcon,
      step: 3,
    },
  ];

  return (
    <div className="wizard-step-form">
      <div className="wizard-review-list">
        {reviewRows.map(row => (
          <WizardReviewRow
            key={row.label}
            label={row.label}
            value={row.value}
            icon={row.icon}
            onEdit={() => onNavigateToStep(row.step)}
          />
        ))}
      </div>
    </div>
  );
}

export default ChapterReviewPublishStep;
