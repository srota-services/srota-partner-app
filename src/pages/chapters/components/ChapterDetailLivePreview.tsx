import { Play } from 'lucide-react';
import WizardLivePreviewHeader from '../../../components/wizard/WizardLivePreviewHeader';
import type { ChapterApiResponse } from '../../../types/audiobook';
import type { ChapterTranscodingStatus } from '../../../types/streaming';
import { formatDurationDetailed } from '../../../utils/formatting';
import { getAudiobookSubscriptionTierLabel } from '../../../utils/subscriptionPlans';
import { computeStreamBadge } from '../../../utils/streamingApi';
import { getChapterStatus } from './chapterTableStatus';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';
import '../../../styles/pages/chapters/components/ChapterTranscodingStatus.css';
import '../../../styles/components/wizard/WizardShell.css';

interface ChapterDetailLivePreviewProps {
  chapter: ChapterApiResponse;
  transcodingStatus?: ChapterTranscodingStatus;
}

function ChapterDetailLivePreview({
  chapter,
  transcodingStatus,
}: ChapterDetailLivePreviewProps) {
  const status = getChapterStatus(chapter);
  const streamBadge = computeStreamBadge(transcodingStatus);

  return (
    <div className="chapter-detail-live-preview">
      <WizardLivePreviewHeader subtitle="Chapter details preview" />

      <div className="chapter-card chapter-card--detail-preview">
        <div className="chapter-card-cover-wrap">
          <div className="chapter-card-cover">
            {chapter.coverImage ? (
              <img src={chapter.coverImage} alt={chapter.title} />
            ) : (
              <div className="chapter-card-placeholder">
                <span>📖</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="chapter-card-play-btn"
            aria-label="Play chapter"
          >
            <Play size={20} fill="currentColor" />
          </button>
        </div>

        <div className="chapter-card-content chapter-card-content--with-play">
          <div className="chapter-card-header">
            <span className="chapter-card-number">
              Chapter {chapter.chapterNumber}
            </span>
          </div>

          <div className="chapter-detail-title-row">
            <h3 className="chapter-card-title">{chapter.title}</h3>
            <span
              className={`audiobook-status-badge audiobook-status-badge--${status.variant === 'upload-failed' ? 'draft' : status.variant}`}
            >
              {status.label}
            </span>
          </div>

          {chapter.description && (
            <p className="chapter-card-description chapter-card-description--full">
              {chapter.description}
            </p>
          )}

          <div className="chapter-detail-meta">
            <div className="chapter-detail-meta-row">
              <span className="chapter-detail-meta-label">Subscription</span>
              <span className="chapter-detail-meta-value">
                {getAudiobookSubscriptionTierLabel(chapter.minSubscriptionTier)}
              </span>
            </div>
            <div className="chapter-detail-meta-row">
              <span className="chapter-detail-meta-label">Duration</span>
              <span className="chapter-detail-meta-value">
                {formatDurationDetailed(chapter.duration)}
              </span>
            </div>
            <div className="chapter-detail-meta-row">
              <span className="chapter-detail-meta-label">Stream</span>
              <span className={`chapter-stream-badge ${streamBadge.className}`}>
                {streamBadge.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterDetailLivePreview;
