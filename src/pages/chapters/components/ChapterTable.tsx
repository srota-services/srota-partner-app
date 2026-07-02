import { useState, useEffect } from 'react';
import type { ChapterApiResponse } from '../../../types/audiobook';
import type { ChapterTranscodingStatus } from '../../../types/streaming';
import ChapterTableRow from './ChapterTableRow';
import '../../../styles/pages/chapters/components/ChapterTable.css';
import '../../../styles/pages/audiobooks/components/AudiobookTable.css';
import '../../../styles/pages/chapters/components/ChapterTranscodingStatus.css';

interface ChapterTableProps {
  chapters: ChapterApiResponse[];
  statusByChapter: Record<string, ChapterTranscodingStatus>;
  selectedChapterId: string | null;
  onRowSelect: (chapter: ChapterApiResponse) => void;
  onEdit: (chapter: ChapterApiResponse) => void;
  onDelete: (chapter: ChapterApiResponse) => void;
  onRefresh: (chapterId: string) => void;
  refreshingChapterId: string | null;
}

function ChapterTable({
  chapters,
  statusByChapter,
  selectedChapterId,
  onRowSelect,
  onEdit,
  onDelete,
  onRefresh,
  refreshingChapterId,
}: ChapterTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenuId) {
      return;
    }

    const chapterStillVisible = chapters.some(
      chapter => chapter.id === openMenuId
    );
    if (!chapterStillVisible) {
      setOpenMenuId(null);
    }
  }, [chapters, openMenuId]);

  const handleMenuToggle = (chapterId: string) => {
    setOpenMenuId(prev => (prev === chapterId ? null : chapterId));
  };

  return (
    <div className="chapter-table-wrapper marketing-card">
      <div className="chapter-table-scroll">
        <table className="chapter-table">
          <thead>
            <tr>
              <th>Chapter</th>
              <th>#</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>Duration</th>
              <th>Stream</th>
              <th>Transcoding</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {chapters.map(chapter => (
              <ChapterTableRow
                key={chapter.id}
                chapter={chapter}
                transcodingStatus={statusByChapter[chapter.id]}
                isSelected={selectedChapterId === chapter.id}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
                onMenuClose={() => setOpenMenuId(null)}
                onRowSelect={onRowSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onRefresh={onRefresh}
                refreshingChapterId={refreshingChapterId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChapterTable;
