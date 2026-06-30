/**
 * Audiobooks page — catalog management home screen
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchAudiobooks,
  setFilter,
  setCurrentPage,
  deleteAudiobookThunk,
  type AudiobookFilter,
} from '../../store/slices/audiobooksSlice';
import { fetchGenres } from '../../store/slices/genresSlice';
import type { AudiobookApiResponse } from '../../types/audiobook';
import AudiobookTable from './components/AudiobookTable';
import SummaryCards from './components/SummaryCards';
import UpcomingReleasesWidget from './components/widgets/UpcomingReleasesWidget';
import PerformanceSnapshotWidget from './components/widgets/PerformanceSnapshotWidget';
import QuickActionsWidget from './components/widgets/QuickActionsWidget';
import RecentActivityWidget from './components/widgets/RecentActivityWidget';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import { showApiError } from '../../utils/toast';
import '../../styles/pages/audiobooks/Audiobooks.css';

const TABS: { id: AudiobookFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'archived', label: 'Archived' },
];

const Audiobooks: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { audiobooks, pagination, loading, filter, searchQuery, currentPage } =
    useAppSelector(state => state.audiobooks);
  const { genres } = useAppSelector(state => state.genres);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAudiobook, setDeletingAudiobook] =
    useState<AudiobookApiResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchAudiobooks({ page: currentPage, filter }));
  }, [dispatch, currentPage, filter]);

  useEffect(() => {
    if (genres.length === 0) {
      dispatch(fetchGenres());
    }
  }, [dispatch, genres.length]);

  const filteredAudiobooks = useMemo(() => {
    let result = audiobooks;

    const query = (localSearch || searchQuery).trim().toLowerCase();
    if (query) {
      result = result.filter(
        ab =>
          ab.title.toLowerCase().includes(query) ||
          ab.author.toLowerCase().includes(query) ||
          (ab.narrators &&
            ab.narrators.some(n => n.toLowerCase().includes(query))) ||
          (ab.narrator && ab.narrator.toLowerCase().includes(query))
      );
    }

    if (genreFilter !== 'all') {
      result = result.filter(ab => {
        const genres = ab.genres?.map(g => g.name) || [];
        const single = ab.genre?.name;
        return genres.includes(genreFilter) || single === genreFilter;
      });
    }

    return result;
  }, [audiobooks, searchQuery, localSearch, genreFilter]);

  const genreOptions = useMemo(
    () => [...genres].sort((a, b) => a.name.localeCompare(b.name)),
    [genres]
  );

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleEdit = (audiobook: AudiobookApiResponse) => {
    navigate(`/audiobooks/${audiobook.id}/edit`, { state: { audiobook } });
  };

  const handleDelete = (audiobook: AudiobookApiResponse) => {
    setDeletingAudiobook(audiobook);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingAudiobook?.id) {
      setIsDeleting(true);
      try {
        await dispatch(deleteAudiobookThunk(deletingAudiobook.id)).unwrap();
        setIsDeleteModalOpen(false);
        setDeletingAudiobook(null);
        setIsDeleting(false);

        const targetPage =
          pagination && currentPage > 1 && audiobooks.length === 1
            ? currentPage - 1
            : currentPage;

        await dispatch(fetchAudiobooks({ page: targetPage, filter })).unwrap();
        if (targetPage !== currentPage) {
          dispatch(setCurrentPage(targetPage));
        }
      } catch (error) {
        showApiError(error);
        setIsDeleting(false);
      }
    }
  };

  const showingFrom = pagination
    ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1
    : 1;
  const showingTo = pagination
    ? Math.min(
        pagination.currentPage * pagination.itemsPerPage,
        pagination.totalItems
      )
    : filteredAudiobooks.length;

  return (
    <div className="audiobooks-page">
      <div className="audiobooks-layout">
        <div className="audiobooks-main">
          <div className="audiobooks-header">
            <div>
              <h1 className="audiobooks-title">Audiobooks</h1>
              <p className="audiobooks-subtitle">
                Manage live, scheduled, and draft releases across your catalog.
              </p>
            </div>
            <div className="audiobooks-header-actions">
              <Button
                variant="outline"
                onClick={() => toast('Import catalog coming soon')}
              >
                <Upload size={16} className="btn-icon-left" />
                Import Catalog
              </Button>
              <Button onClick={() => navigate('/audiobooks/create')}>
                <Plus size={16} className="btn-icon-left" />
                Create Audiobook
              </Button>
            </div>
          </div>

          <SummaryCards totalTitles={pagination?.totalItems} />

          <div className="audiobooks-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`audiobooks-tab ${filter === tab.id ? 'active' : ''}`}
                onClick={() => dispatch(setFilter(tab.id))}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="audiobooks-filters">
            <SearchBar
              className="audiobooks-local-search"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search audiobooks"
            />
            <Select
              fieldSize="sm"
              wrapperClassName="audiobooks-filter-select"
              placeholder={false}
              value={genreFilter}
              onChange={e => setGenreFilter(e.target.value)}
            >
              <option value="all">Genre</option>
              {genreOptions.map(genre => (
                <option key={genre.id} value={genre.name}>
                  {genre.name}
                </option>
              ))}
            </Select>
            <Select
              fieldSize="sm"
              wrapperClassName="audiobooks-filter-select"
              placeholder={false}
              defaultValue="all"
            >
              <option value="all">Language</option>
            </Select>
            <Select
              fieldSize="sm"
              wrapperClassName="audiobooks-filter-select"
              placeholder={false}
              defaultValue="recent"
            >
              <option value="recent">Sort by</option>
            </Select>
          </div>

          {loading && (
            <div className="loading-state">
              <p>Loading audiobooks...</p>
            </div>
          )}

          {!loading && filteredAudiobooks.length === 0 && (
            <div className="empty-state marketing-card">
              <p>
                {filter === 'drafts' || filter === 'archived'
                  ? `No ${filter} audiobooks yet.`
                  : 'No audiobooks found. Create one to get started.'}
              </p>
            </div>
          )}

          {!loading && filteredAudiobooks.length > 0 && (
            <>
              <AudiobookTable
                audiobooks={filteredAudiobooks}
                filter={filter}
                onRowClick={ab => navigate(`/audiobooks/${ab.id}/chapters`)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

              <div className="audiobooks-pagination-bar">
                {pagination && (
                  <p className="audiobooks-showing">
                    Showing {showingFrom}–{showingTo} of{' '}
                    {pagination.totalItems} audiobooks
                  </p>
                )}
                {pagination && pagination.totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
                <Select
                  fieldSize="sm"
                  wrapperClassName="audiobooks-filter-select"
                  placeholder={false}
                  defaultValue="10"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                </Select>
              </div>
            </>
          )}
        </div>

        <aside className="audiobooks-sidebar">
          <UpcomingReleasesWidget />
          <PerformanceSnapshotWidget />
          <QuickActionsWidget />
          <RecentActivityWidget />
        </aside>
      </div>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingAudiobook(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Audiobook"
        message={
          deletingAudiobook
            ? `Are you sure you want to delete "${deletingAudiobook.title}"? This action cannot be undone.`
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

export default Audiobooks;
