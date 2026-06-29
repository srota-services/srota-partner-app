import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CreditCard,
  Crown,
  FileText,
  Globe,
  Mic,
  Smile,
  Tag,
  User,
  VenetianMask,
} from 'lucide-react';
import WizardReviewRow from '../../../../../components/wizard/WizardReviewRow';
import type { AudiobookWizardData } from '../../../../../types/audiobook';
import type { GenreItem, MoodItem, TagItem } from '../../../../../utils/audiobookApi';
import {
  filterAudiobookMeta,
  getSubscriptionGatingModeLabel,
  type AudiobookWizardStep,
} from '../../../../../utils/audiobookWizard';
import { getSubscriptionPlanNameForTier } from '../../../../../utils/subscriptionPlans';

interface ReviewPublishStepProps {
  data: AudiobookWizardData;
  genres: GenreItem[];
  tags: TagItem[];
  moods: MoodItem[];
  onNavigateToStep: (step: AudiobookWizardStep) => void;
}

interface ReviewRowConfig {
  label: string;
  value: string;
  icon: LucideIcon;
  step: AudiobookWizardStep;
}

function ReviewPublishStep({
  data,
  genres,
  tags,
  moods,
  onNavigateToStep,
}: ReviewPublishStepProps) {
  const genreNames = data.genres
    .map(id => genres.find(g => g.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const tagNames = data.tags
    .map(id => tags.find(t => t.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const metaEntries = Object.entries(filterAudiobookMeta(data.meta));

  const subscriptionPlanName =
    data.isPaid && data.minSubscriptionTier != null
      ? getSubscriptionPlanNameForTier(data.minSubscriptionTier) ||
        `Tier ${data.minSubscriptionTier}`
      : '—';

  const moodName = data.moodId
    ? moods.find(mood => mood.id === data.moodId)?.name || '—'
    : '—';

  const reviewRows: ReviewRowConfig[] = [
    {
      label: 'Title',
      value: data.title || '—',
      icon: BookOpen,
      step: 1,
    },
    {
      label: 'Author',
      value: data.author || '—',
      icon: User,
      step: 2,
    },
    {
      label: 'Narrators',
      value: data.narrators.length > 0 ? data.narrators.join(', ') : '—',
      icon: Mic,
      step: 2,
    },
    {
      label: 'Language',
      value: data.language || '—',
      icon: Globe,
      step: 1,
    },
    {
      label: 'Genres',
      value: genreNames.length > 0 ? genreNames.join(', ') : '—',
      icon: VenetianMask,
      step: 1,
    },
    {
      label: 'Tags',
      value: tagNames.length > 0 ? tagNames.join(', ') : '—',
      icon: Tag,
      step: 1,
    },
    {
      label: 'Subscription level',
      value: getSubscriptionGatingModeLabel(data.subscriptionGatingMode),
      icon: Crown,
      step: 4,
    },
    ...(data.subscriptionGatingMode === 'AUDIOBOOK'
      ? ([
          {
            label: 'Paid',
            value: data.isPaid ? 'Yes' : 'No',
            icon: CreditCard,
            step: 4 as AudiobookWizardStep,
          },
          {
            label: 'Subscription plan',
            value: subscriptionPlanName,
            icon: Crown,
            step: 4 as AudiobookWizardStep,
          },
        ] satisfies ReviewRowConfig[])
      : []),
    {
      label: 'Mood',
      value: moodName,
      icon: Smile,
      step: 1,
    },
    {
      label: 'Description',
      value: data.description || '—',
      icon: FileText,
      step: 1,
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
        {metaEntries.map(([key, value]) => (
          <WizardReviewRow
            key={key}
            label={key}
            value={value}
            icon={FileText}
            onEdit={() => onNavigateToStep(2)}
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewPublishStep;
