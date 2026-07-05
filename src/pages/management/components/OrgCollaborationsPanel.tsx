import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  acceptCollaboration,
  fetchCollaborations,
  negotiateCollaboration,
  rejectCollaboration,
} from '../../../store/slices/collaborationsSlice';
import type { OrgCollaboration } from '../../../types/authorCollaboration';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import CollaborationsTable from './CollaborationsTable';
import NegotiateCollaborationModal from './NegotiateCollaborationModal';
import CollaborationDetailModal from './CollaborationDetailModal';
import { getCollaborationAuthorName } from '../../../utils/collaborationDisplay';
import { showApiError, showSuccess } from '../../../utils/toast';
import { isOrgStaffRole } from '../../../utils/authRole';
import '../../../styles/pages/audiobooks/Audiobooks.css';

const OrgCollaborationsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { role } = useAppSelector(state => state.auth);
  const { collaborations, loading, actionLoadingId } = useAppSelector(
    state => state.collaborations
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollaboration, setSelectedCollaboration] =
    useState<OrgCollaboration | null>(null);
  const [negotiateTarget, setNegotiateTarget] =
    useState<OrgCollaboration | null>(null);

  useEffect(() => {
    dispatch(fetchCollaborations()).catch(showApiError);
  }, [dispatch]);

  const orgCollaborations = useMemo(
    () => collaborations.filter((item): item is OrgCollaboration => 'author' in item),
    [collaborations]
  );

  const filteredCollaborations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return orgCollaborations;
    }
    return orgCollaborations.filter(collaboration => {
      const name = getCollaborationAuthorName(collaboration.author).toLowerCase();
      return name.includes(query);
    });
  }, [orgCollaborations, searchQuery]);

  const handleAccept = useCallback(
    async (collaborationId: string) => {
      try {
        await dispatch(acceptCollaboration(collaborationId)).unwrap();
        showSuccess('Collaboration accepted');
      } catch (error) {
        showApiError(error);
      }
    },
    [dispatch]
  );

  const handleReject = useCallback(
    async (collaborationId: string) => {
      try {
        await dispatch(rejectCollaboration(collaborationId)).unwrap();
        showSuccess('Collaboration rejected');
      } catch (error) {
        showApiError(error);
      }
    },
    [dispatch]
  );

  const handleNegotiate = useCallback(
    async (organizationAsk: number) => {
      if (!negotiateTarget) {
        return;
      }
      try {
        await dispatch(
          negotiateCollaboration({
            collaborationId: negotiateTarget.id,
            organizationAsk,
          })
        ).unwrap();
        showSuccess('Counter offer sent');
        setNegotiateTarget(null);
      } catch (error) {
        showApiError(error);
      }
    },
    [dispatch, negotiateTarget]
  );

  if (!isOrgStaffRole(role)) {
    return (
      <div className="team-placeholder marketing-card">
        <p>Collaborations are available for organization accounts.</p>
      </div>
    );
  }

  return (
    <div className="manage-tab-content">
      <div className="authors-filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by author..."
          className="authors-search"
        />
      </div>

      {loading ? (
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
              : 'Authors can submit collaboration requests from Discovery.'}
          </p>
        </div>
      ) : (
        <CollaborationsTable
          collaborations={filteredCollaborations}
          actionLoadingId={actionLoadingId}
          isOrgView
          onView={collaboration => {
            if ('author' in collaboration) {
              setSelectedCollaboration(collaboration);
            }
          }}
          onAccept={handleAccept}
          onReject={handleReject}
          onNegotiate={setNegotiateTarget}
        />
      )}

      <CollaborationDetailModal
        isOpen={selectedCollaboration !== null}
        collaboration={selectedCollaboration}
        onClose={() => setSelectedCollaboration(null)}
      />

      <NegotiateCollaborationModal
        isOpen={negotiateTarget !== null}
        saving={actionLoadingId === negotiateTarget?.id}
        onClose={() => setNegotiateTarget(null)}
        onSubmit={handleNegotiate}
      />
    </div>
  );
};

export default OrgCollaborationsPanel;
