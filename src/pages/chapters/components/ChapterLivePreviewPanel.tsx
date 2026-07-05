import type { ChapterApiResponse } from '../../../types/audiobook';
import type { ChapterTranscodingStatus } from '../../../types/streaming';
import CloseButton from '../../../components/common/CloseButton';
import ChapterDetailLivePreview from './ChapterDetailLivePreview';
import '../../../styles/pages/chapters/components/ChapterLivePreviewPanel.css';

interface ChapterLivePreviewPanelProps {
  chapter: ChapterApiResponse | null;
  transcodingStatus?: ChapterTranscodingStatus;
  onClose: () => void;
}

function ChapterLivePreviewPanel({
  chapter,
  transcodingStatus,
  onClose,
}: ChapterLivePreviewPanelProps) {
  const isOpen = chapter != null;

  return (
    <aside
      className={`chapter-live-preview-panel${isOpen ? ' chapter-live-preview-panel--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <div className="chapter-live-preview-panel-inner marketing-card">
        <CloseButton
          className="chapter-live-preview-panel-close"
          label="Close preview"
          onClick={onClose}
        />

        {chapter && (
          <ChapterDetailLivePreview
            chapter={chapter}
            transcodingStatus={transcodingStatus}
          />
        )}
      </div>
    </aside>
  );
}

export default ChapterLivePreviewPanel;
