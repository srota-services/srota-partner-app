import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useDiscoverableCatalogIds } from '../../../hooks/useDiscoverableCatalogIds';
import {
  abortCollaborationRequest,
  counterCollaboration,
  fetchCollaborations,
} from '../../../store/slices/collaborationsSlice';
import type { AuthorCollaboration } from '../../../types/authorCollaboration';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Button from '../../../components/common/Button';
import CollaborationsTable from './CollaborationsTable';
import CounterBudgetModal from './CounterBudgetModal';
import CollaborationDetailModal from './CollaborationDetailModal';
import { showApiError, showSuccess } from '../../../utils/toast';
import { isDiscoverableOrg } from '../../../utils/discoverableCatalogFilter';
import '../../../styles/pages/audiobooks/Audiobooks.css';
import '../../../styles/pages/management/components/AuthorsTable.css';

const AuthorCollaborationsPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { collaborations, loading, actionLoadingId } = useAppSelector(
    state => state.collaborations
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollaboration, setSelectedCollaboration] =
    useState<AuthorCollaboration | null>(null);
  const [counterTarget, setCounterTarget] =
    useState<AuthorCollaboration | null>(null);
  const { orgIds, loading: catalogLoading } = useDiscoverableCatalogIds();

  useEffect(() => {
    dispatch(fetchCollaborations()).catch(showApiError);
  }, [dispatch]);

  const authorCollaborations = useMemo(
    () =>
      collaborations
        .filter(
          (item): item is AuthorCollaboration => 'organization' in item
        )
        .filter(collaboration =>
          isDiscoverableOrg(collaboration.organization.id, orgIds)
        ),
    [collaborations, orgIds]
  );

  const filteredCollaborations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return authorCollaborations;
    }
    return authorCollaborations.filter(collaboration =>
      collaboration.organization.name.toLowerCase().includes(query)
    );
  }, [authorCollaborations, searchQuery]);

  const handleCounter = useCallback(
    async (authorBudget: number) => {
      if (!counterTarget) {
        return;
      }
      try {
        await dispatch(
          counterCollaboration({
            collaborationId: counterTarget.id,
            authorBudget,
          })
        ).unwrap();
        showSuccess('Counter offer submitted');
        setCounterTarget(null);
      } catch (error) {
        showApiError(error);
      }
    },
    [counterTarget, dispatch]
  );

  const handleAbort = useCallback(
    async (collaborationId: string) => {
      try {
        await dispatch(abortCollaborationRequest(collaborationId)).unwrap();
        showSuccess('Collaboration request aborted');
      } catch (error) {
        showApiError(error);
      }
    },
    [dispatch]
  );

  return (
    <div className="manage-tab-content">
      <div className="authors-filter-bar collaborations-toolbar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by organization..."
          className="authors-search"
        />
        <Button
          variant="primary"
          className="collaborations-toolbar-action"
          onClick={() => navigate('/management/collaborations/create')}
        >
          <Plus size={16} className="btn-icon-left" />
          New Collaboration
        </Button>
      </div>

      {loading || catalogLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : filteredCollaborations.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">
            {searchQuery ? 'No results found' : 'No collaboration requests yet'}
          </h3>
          <p className="empty-state-message">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Submit a request to collaborate with an organization.'}
          </p>
        </div>
      ) : (
        <CollaborationsTable
          collaborations={filteredCollaborations}
          actionLoadingId={actionLoadingId}
          isOrgView={false}
          onView={collaboration => {
            if ('organization' in collaboration) {
              setSelectedCollaboration(collaboration);
            }
          }}
          onCounter={setCounterTarget}
          onAbort={handleAbort}
        />
      )}

      <CounterBudgetModal
        isOpen={counterTarget !== null}
        saving={actionLoadingId === counterTarget?.id}
        onClose={() => setCounterTarget(null)}
        onSubmit={handleCounter}
      />

      <CollaborationDetailModal
        isOpen={selectedCollaboration !== null}
        collaboration={selectedCollaboration}
        onClose={() => setSelectedCollaboration(null)}
      />
    </div>
  );
};

export default AuthorCollaborationsPanel;
