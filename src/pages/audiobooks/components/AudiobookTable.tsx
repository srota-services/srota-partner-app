import { MoreVertical } from 'lucide-react';
import { useRef, useState } from 'react';
import TableActionsMenu from '../../../components/common/TableActionsMenu';
import AppImage from '../../../components/common/AppImage';
import type { AudiobookApiResponse } from '../../../types/audiobook';
import type { AudiobookFilter } from '../../../store/slices/audiobooksSlice';
import { getAudiobookSubscriptionTierLabel } from '../../../utils/subscriptionPlans';
import { getStatus } from './audiobookTableStatus';
import '../../../styles/components/common/TableActionsMenu.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';

interface AudiobookTableProps {
  audiobooks: AudiobookApiResponse[];
  filter: AudiobookFilter;
  onRowClick: (audiobook: AudiobookApiResponse) => void;
  onEdit: (audiobook: AudiobookApiResponse) => void;
  onDelete: (audiobook: AudiobookApiResponse) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const placeholderListeners = ['12.4K', '8.1K', '5.6K', '3.2K', '9.8K'];
const placeholderDates = [
  'May 8, 2026',
  'Apr 12, 2026',
  'Mar 3, 2026',
  'Feb 18, 2026',
  'Jan 25, 2026',
];

interface AudiobookTableRowProps {
  audiobook: AudiobookApiResponse;
  index: number;
  filter: AudiobookFilter;
  isMenuOpen: boolean;
  onMenuToggle: (audiobookId: string) => void;
  onMenuClose: () => void;
  onRowClick: (audiobook: AudiobookApiResponse) => void;
  onEdit: (audiobook: AudiobookApiResponse) => void;
  onDelete: (audiobook: AudiobookApiResponse) => void;
}

function AudiobookTableRow({
  audiobook,
  index,
  filter,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  onRowClick,
  onEdit,
  onDelete,
}: AudiobookTableRowProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const status = getStatus(filter, audiobook);
  const genre =
    audiobook.genres?.[0]?.name || audiobook.genre?.name || 'General';

  return (
    <tr onClick={() => onRowClick(audiobook)} className="audiobook-table-row">
      <td>
        <div className="audiobook-table-title-cell">
          <AppImage
            src={audiobook.coverImage}
            alt=""
            variant="thumbnail"
            className="audiobook-table-thumb"
          />
          <div>
            <p className="audiobook-table-title">{audiobook.title}</p>
            <p className="audiobook-table-genre">{genre}</p>
          </div>
        </div>
      </td>
      <td>
        <p className="audiobook-table-author">{audiobook.author}</p>
      </td>
      <td>
        <span
          className={`audiobook-status-badge audiobook-status-badge--${status.variant}`}
        >
          {status.label}
        </span>
      </td>
      <td>
        <p className="audiobook-table-subscription">
          {getAudiobookSubscriptionTierLabel(audiobook.minSubscriptionTier)}
        </p>
      </td>
      <td>{audiobook.chapterCount ?? '—'}</td>
      <td>{placeholderDates[index % placeholderDates.length]}</td>
      <td>{formatDuration(audiobook.duration)}</td>
      <td>{placeholderListeners[index % placeholderListeners.length]}</td>
      <td className="audiobook-table-actions-cell">
        <div
          className="audiobook-table-actions"
          onClick={e => e.stopPropagation()}
        >
          <button
            ref={triggerRef}
            type="button"
            className="audiobook-table-menu-btn"
            aria-label="Actions"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => onMenuToggle(audiobook.id)}
          >
            <MoreVertical size={18} />
          </button>
          <TableActionsMenu
            isOpen={isMenuOpen}
            onClose={onMenuClose}
            anchorRef={triggerRef}
            items={[
              {
                label: 'View chapters',
                onClick: () => onRowClick(audiobook),
              },
              {
                label: 'Edit',
                onClick: () => onEdit(audiobook),
              },
              {
                label: 'Delete',
                onClick: () => onDelete(audiobook),
                variant: 'danger',
              },
            ]}
          />
        </div>
      </td>
    </tr>
  );
}

function AudiobookTable({
  audiobooks,
  filter,
  onRowClick,
  onEdit,
  onDelete,
}: AudiobookTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="audiobook-table-wrapper marketing-card">
      <div className="audiobook-table-scroll">
        <table className="audiobook-table">
          <thead>
            <tr>
              <th>Audiobook</th>
              <th>Author</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Chapters</th>
              <th>Publish Date</th>
              <th>Duration</th>
              <th>Listeners</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {audiobooks.map((audiobook, index) => (
              <AudiobookTableRow
                key={audiobook.id}
                audiobook={audiobook}
                index={index}
                filter={filter}
                isMenuOpen={openMenuId === audiobook.id}
                onMenuToggle={audiobookId =>
                  setOpenMenuId(prev => (prev === audiobookId ? null : audiobookId))
                }
                onMenuClose={() => setOpenMenuId(null)}
                onRowClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AudiobookTable;
