import { MoreVertical, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import TableActionsMenu from '../../../components/common/TableActionsMenu';
import AppImage from '../../../components/common/AppImage';
import type { ChapterApiResponse } from '../../../types/audiobook';
import type { ChapterTranscodingStatus } from '../../../types/streaming';
import { formatDuration } from '../../../utils/formatting';
import { getAudiobookSubscriptionTierLabel } from '../../../utils/subscriptionPlans';
import { computeStreamBadge } from '../../../utils/streamingApi';
import { getChapterStatus } from './chapterTableStatus';
import ChapterTranscodingStatusPanel from './ChapterTranscodingStatus';
import '../../../styles/components/common/TableActionsMenu.css';

interface ChapterTableRowProps {
  chapter: ChapterApiResponse;
  transcodingStatus?: ChapterTranscodingStatus;
  isSelected: boolean;
  openMenuId: string | null;
  onMenuToggle: (chapterId: string) => void;
  onMenuClose: () => void;
  onRowSelect: (chapter: ChapterApiResponse) => void;
  onEdit: (chapter: ChapterApiResponse) => void;
  onDelete: (chapter: ChapterApiResponse) => void;
  onRefresh: (chapterId: string) => void;
  refreshingChapterId: string | null;
}

function truncateDescription(text: string, maxLength = 120): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

function ChapterTableRow({
  chapter,
  transcodingStatus,
  isSelected,
  openMenuId,
  onMenuToggle,
  onMenuClose,
  onRowSelect,
  onEdit,
  onDelete,
  onRefresh,
  refreshingChapterId,
}: ChapterTableRowProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isMenuOpen = openMenuId === chapter.id;
  const isRefreshing = refreshingChapterId === chapter.id;
  const [isRefreshAnimating, setIsRefreshAnimating] = useState(false);
  const status = getChapterStatus(chapter);
  const streamBadge = computeStreamBadge(transcodingStatus);

  const handleRefreshClick = () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshAnimating(true);
    onRefresh(chapter.id);
  };

  return (
    <tr
      className={`chapter-table-row${isSelected ? ' chapter-table-row--selected' : ''}`}
      onClick={() => onRowSelect(chapter)}
    >
      <td>
        <div className="chapter-table-title-cell">
          <AppImage
            src={chapter.coverImage}
            alt=""
            variant="thumbnail"
            className="chapter-table-thumb"
          />
          <div>
            <p className="chapter-table-title">{chapter.title}</p>
            {chapter.description && (
              <p className="chapter-table-description">
                {truncateDescription(chapter.description)}
              </p>
            )}
          </div>
        </div>
      </td>
      <td>
        <span className="chapter-table-number">{chapter.chapterNumber}</span>
      </td>
      <td>
        <span
          className={`audiobook-status-badge audiobook-status-badge--${status.variant === 'upload-failed' ? 'draft' : status.variant} ${status.variant === 'upload-failed' ? 'chapter-status-badge--upload-failed' : ''}`}
        >
          {status.label}
        </span>
      </td>
      <td>
        <p className="audiobook-table-subscription">
          {getAudiobookSubscriptionTierLabel(chapter.minSubscriptionTier)}
        </p>
      </td>
      <td>{formatDuration(chapter.duration)}</td>
      <td>
        <span className={`chapter-stream-badge ${streamBadge.className}`}>
          {streamBadge.label}
        </span>
      </td>
      <td>
        <ChapterTranscodingStatusPanel
          chapterId={chapter.id}
          status={transcodingStatus}
        />
      </td>
      <td className="chapter-table-actions-cell">
        <div
          className="audiobook-table-actions"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            className="audiobook-table-menu-btn chapter-table-refresh-btn"
            aria-label="Refresh chapter"
            disabled={isRefreshing}
            onClick={handleRefreshClick}
          >
            <RefreshCw
              size={18}
              className={
                isRefreshAnimating
                  ? 'chapter-table-refresh-icon--spinning'
                  : undefined
              }
              onAnimationEnd={() => setIsRefreshAnimating(false)}
            />
          </button>
          <button
            ref={triggerRef}
            type="button"
            className="audiobook-table-menu-btn"
            aria-label="Actions"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => onMenuToggle(chapter.id)}
          >
            <MoreVertical size={18} />
          </button>
          <TableActionsMenu
            isOpen={isMenuOpen}
            onClose={onMenuClose}
            anchorRef={triggerRef}
            items={[
              {
                label: 'Edit',
                onClick: () => onEdit(chapter),
              },
              {
                label: 'Delete',
                onClick: () => onDelete(chapter),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

export default ChapterTableRow;
