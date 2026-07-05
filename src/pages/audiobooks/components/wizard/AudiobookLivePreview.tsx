import WizardLivePreviewHeader from '../../../../components/wizard/WizardLivePreviewHeader';
import AppImage from '../../../../components/common/AppImage';
import type { AudiobookWizardData } from '../../../../types/audiobook';
import type {
  GenreItem,
  MoodItem,
  SubscriptionPlanItem,
  TagItem,
} from '../../../../utils/audiobookApi';
import { filterAudiobookMeta } from '../../../../utils/audiobookWizard';
import { getReadableTextColor } from '../../../../utils/colorUtils';
import {
  getSubscriptionPlanNameForTier,
  resolveSubscriptionPlanTier,
} from '../../../../utils/subscriptionPlans';
import '../../../../styles/pages/audiobooks/components/AudiobookCard.css';

interface AudiobookLivePreviewProps {
  data: AudiobookWizardData;
  coverPreviewUrl: string | null;
  genres: GenreItem[];
  tags: TagItem[];
  moods: MoodItem[];
  subscriptionPlans: SubscriptionPlanItem[];
}

function AudiobookLivePreview({
  data,
  coverPreviewUrl,
  genres,
  tags,
  moods,
  subscriptionPlans,
}: AudiobookLivePreviewProps) {
  const genreNames = data.genres
    .map(id => genres.find(g => g.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const tagNames = data.tags
    .map(id => tags.find(t => t.id === id)?.name)
    .filter((name): name is string => Boolean(name));
  const metaEntries = Object.entries(filterAudiobookMeta(data.meta));
  const selectedMood = data.moodId
    ? moods.find(mood => mood.id === data.moodId)
    : undefined;
  const subscriptionPlanName =
    data.subscriptionGatingMode === 'AUDIOBOOK' &&
    data.isPaid &&
    data.minSubscriptionTier != null
      ? subscriptionPlans.find(
          plan =>
            resolveSubscriptionPlanTier(plan) === data.minSubscriptionTier
        )?.name ||
        getSubscriptionPlanNameForTier(data.minSubscriptionTier) ||
        `Tier ${data.minSubscriptionTier}`
      : undefined;

  return (
    <div className="wizard-preview-card">
      <WizardLivePreviewHeader subtitle="This is how your audiobook will appear" />

      <div className="audiobook-card audiobook-card--preview">
        <div className="audiobook-card-cover">
          <AppImage
            src={coverPreviewUrl}
            alt={data.title || 'Cover preview'}
            variant="cover"
          />
        </div>
        <div className="audiobook-card-content">
          <h3 className="audiobook-card-title">
            {data.title || 'Untitled Audiobook'}
          </h3>
          <p className="audiobook-card-author">
            by{' '}
            <span className="audiobook-card-author-name">
              {data.author || 'Author name'}
            </span>
          </p>
          {data.narrators.length > 0 && (
            <p className="audiobook-card-preview-detail">
              Narrated by {data.narrators.join(', ')}
            </p>
          )}
          {genreNames.length > 0 && (
            <div className="audiobook-preview-field">
              <span className="audiobook-preview-label">Genres</span>
              <div className="audiobook-card-badges">
                {genreNames.map(name => (
                  <span
                    key={name}
                    className="audiobook-card-badge audiobook-card-badge-genre"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tagNames.length > 0 && (
            <div className="audiobook-preview-field">
              <span className="audiobook-preview-label">Tags</span>
              <div className="audiobook-card-badges">
                {tagNames.map(name => (
                  <span
                    key={name}
                    className="audiobook-card-badge audiobook-card-badge-tag"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {selectedMood && (
            <div className="audiobook-preview-field">
              <span className="audiobook-preview-label">Mood</span>
              <div className="audiobook-card-badges">
                <span
                  className="audiobook-card-badge audiobook-card-badge-mood"
                  style={
                    selectedMood.color
                      ? {
                          backgroundColor: selectedMood.color,
                          color: getReadableTextColor(selectedMood.color),
                        }
                      : undefined
                  }
                >
                  {selectedMood.name}
                </span>
              </div>
            </div>
          )}
          {data.language && (
            <p className="audiobook-card-preview-detail">
              Language: {data.language}
            </p>
          )}
          {subscriptionPlanName && (
            <p className="audiobook-card-preview-detail">
              Subscription plan: {subscriptionPlanName}
            </p>
          )}
          {data.description && (
            <p className="audiobook-card-preview-detail">
              {data.description.length > 120
                ? `${data.description.slice(0, 120)}...`
                : data.description}
            </p>
          )}
          {metaEntries.map(([key, value]) => (
            <p key={key} className="audiobook-card-preview-detail">
              {key}: {value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AudiobookLivePreview;
