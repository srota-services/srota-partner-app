import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { fetchMyInvitations } from '../../../store/slices/authorInboxSlice';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PendingInvitationActionsCard from './PendingInvitationActionsCard';
import AuthorInvitationHistoryTable from './AuthorInvitationHistoryTable';
import { getOrganizationDisplayName } from '../../../utils/authorInvitationDisplay';
import { showApiError } from '../../../utils/toast';
import '../../../styles/pages/audiobooks/Audiobooks.css';
import '../../../styles/pages/management/InvitationsPanel.css';

const AuthorInvitationsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { invitations, loading } = useAppSelector(state => state.authorInbox);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMyInvitations()).catch(showApiError);
  }, [dispatch]);

  const filteredInvitations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return invitations;
    }
    return invitations.filter(invitation => {
      const name = getOrganizationDisplayName(
        invitation.organization
      ).toLowerCase();
      return name.includes(query);
    });
  }, [invitations, searchQuery]);

  return (
    <div className="manage-tab-content invitations-panel">
      <PendingInvitationActionsCard invitations={invitations} />

      <div className="authors-filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by organization..."
          className="authors-search"
        />
      </div>

      {loading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : filteredInvitations.length === 0 ? (
        <div className="empty-state">
          <h3 className="empty-state-title">
            {searchQuery ? 'No results found' : 'No invitations yet'}
          </h3>
          <p className="empty-state-message">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'When an organization invites you to join, it will appear here.'}
          </p>
        </div>
      ) : (
        <AuthorInvitationHistoryTable invitations={filteredInvitations} />
      )}
    </div>
  );
};

export default AuthorInvitationsPanel;
