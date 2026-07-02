/**
 * Chapters page for a specific audiobook
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchChapters,
  fetchChapter,
  setCurrentPage,
  setCurrentAudiobookId,
  deleteChapterThunk,
} from '../../store/slices/chaptersSlice';
import type { ChapterApiResponse } from '../../types/audiobook';
import ChapterTable from './components/ChapterTable';
import ChapterLivePreviewPanel from './components/ChapterLivePreviewPanel';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { showApiError } from '../../utils/toast';
import { useChapterTranscodingEvents } from '../../hooks/useChapterTranscodingEvents';
import {
  selectTranscodingStatusByChapter,
  clearTranscodingForChapter,
} from '../../store/slices/transcodingSlice';
import '../../styles/pages/chapters/Chapters.css';
import '../../styles/pages/chapters/components/ChapterLivePreviewPanel.css';

const Chapters: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { chapters, pagination, loading, currentPage } = useAppSelector(
    state => state.chapters
  );
  const statusByChapter = useAppSelector(selectTranscodingStatusByChapter);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingChapter, setDeletingChapter] =
    useState<ChapterApiResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshingChapterId, setRefreshingChapterId] = useState<string | null>(
    null
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null
  );

  const sortedChapters = useMemo(
    () =>
      [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber),
    [chapters]
  );

  const chapterIds = useMemo(
    () => sortedChapters.map(chapter => chapter.id),
    [sortedChapters]
  );
  const selectedChapter = useMemo(
    () => sortedChapters.find(chapter => chapter.id === selectedChapterId) ?? null,
    [sortedChapters, selectedChapterId]
  );

  useEffect(() => {
    if (
      selectedChapterId &&
      !sortedChapters.some(chapter => chapter.id === selectedChapterId)
    ) {
      setSelectedChapterId(null);
    }
  }, [selectedChapterId, sortedChapters]);

  useChapterTranscodingEvents(chapterIds);

  useEffect(() => {
    if (id) {
      dispatch(setCurrentAudiobookId(id));
      dispatch(fetchChapters({ audiobookId: id, page: currentPage }));
    }
  }, [dispatch, id, currentPage]);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    if (id) {
      dispatch(fetchChapters({ audiobookId: id, page }));
    }
  };

  const handleEdit = (chapter: ChapterApiResponse) => {
    navigate(`/library/${id}/chapters/${chapter.id}/edit`, {
      state: { chapter },
    });
  };

  const handleDelete = (chapter: ChapterApiResponse) => {
    setDeletingChapter(chapter);
    setIsDeleteModalOpen(true);
  };

  const handleRowSelect = (chapter: ChapterApiResponse) => {
    setSelectedChapterId(current =>
      current === chapter.id ? null : chapter.id
    );
  };

  const handleRefresh = async (chapterId: string) => {
    setRefreshingChapterId(chapterId);
    try {
      await dispatch(fetchChapter(chapterId)).unwrap();
    } catch (error) {
      showApiError(error);
    } finally {
      setRefreshingChapterId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingChapter && deletingChapter.id) {
      setIsDeleting(true);
      try {
        await dispatch(deleteChapterThunk(deletingChapter.id)).unwrap();
        dispatch(clearTranscodingForChapter(deletingChapter.id));

        setIsDeleteModalOpen(false);
        setDeletingChapter(null);
        setIsDeleting(false);

        if (id) {
          const targetPage =
            pagination && currentPage > 1 && chapters.length === 1
              ? currentPage - 1
              : currentPage;

          await dispatch(
            fetchChapters({ audiobookId: id, page: targetPage })
          ).unwrap();

          if (targetPage !== currentPage) {
            dispatch(setCurrentPage(targetPage));
          }
        }
      } catch (error) {
        showApiError(error);
        setIsDeleting(false);
      }
    }
  };

  if (!id) {
    return (
      <div className="chapters-page">
        <div className="error-state">
          <p>Invalid audiobook ID</p>
          <Button onClick={() => navigate('/library')}>
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="chapters-page">
      <div className="chapters-header">
        <Button variant="outline" onClick={() => navigate('/library')}>
          ← Back to Library
        </Button>
        <div className="chapters-header-right">
          <h2>Chapters</h2>
          <Button onClick={() => navigate(`/library/${id}/chapters/create`)}>
            <Plus size={16} className="btn-icon-left" />
            Create Chapter
          </Button>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <p>Loading chapters...</p>
        </div>
      )}

      {!loading && chapters.length === 0 && (
        <div className="empty-state">
          <p>No chapters yet. Create the first chapter to get started.</p>
        </div>
      )}

      {!loading && chapters.length > 0 && (
        <div className="chapters-body">
          <div className="chapters-table-section">
            <ChapterTable
              chapters={sortedChapters}
              statusByChapter={statusByChapter}
              selectedChapterId={selectedChapterId}
              onRowSelect={handleRowSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={chapterId => void handleRefresh(chapterId)}
              refreshingChapterId={refreshingChapterId}
            />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          <ChapterLivePreviewPanel
            chapter={selectedChapter}
            transcodingStatus={
              selectedChapter
                ? statusByChapter[selectedChapter.id]
                : undefined
            }
            onClose={() => setSelectedChapterId(null)}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingChapter(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Chapter"
        message={
          deletingChapter
            ? `Are you sure you want to delete "${deletingChapter.title}"? This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Chapters;
