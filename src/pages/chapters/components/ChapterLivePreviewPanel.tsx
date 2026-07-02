import { X } from 'lucide-react';
import type { ChapterApiResponse } from '../../../types/audiobook';
import type { ChapterTranscodingStatus } from '../../../types/streaming';
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
        <button
          type="button"
          className="chapter-live-preview-panel-close"
          aria-label="Close preview"
          onClick={onClose}
        >
          <X size={18} />
        </button>

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
