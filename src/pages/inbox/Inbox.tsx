/**
 * Inbox page — organization invitations for authors
 */
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchMyInvitations } from '../../store/slices/authorInboxSlice';
import OrganizationInvitationTable from './components/OrganizationInvitationTable';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showApiError } from '../../utils/toast';
import '../../styles/pages/inbox/Inbox.css';

const Inbox: React.FC = () => {
  const dispatch = useAppDispatch();
  const { role } = useAppSelector(state => state.auth);
  const { invitations, loading, actionLoadingId } = useAppSelector(
    state => state.authorInbox
  );

  const isAuthor = role === 'AUTHOR';

  useEffect(() => {
    if (isAuthor) {
      dispatch(fetchMyInvitations()).catch(showApiError);
    }
  }, [dispatch, isAuthor]);

  return (
    <div className="inbox-page">
      <div className="inbox-header">
        <h1 className="inbox-title">Inbox</h1>
        <p className="inbox-subtitle">
          {isAuthor
            ? 'Organization invitations and messages'
            : 'Messages and notifications'}
        </p>
      </div>

      {!isAuthor ? (
        <div className="empty-state">
          <p className="empty-state-message">No messages yet.</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : invitations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📬</div>
          <h3 className="empty-state-title">No invitations</h3>
          <p className="empty-state-message">
            When an organization invites you to join, it will appear here.
          </p>
        </div>
      ) : (
        <OrganizationInvitationTable
          invitations={invitations}
          actionLoadingId={actionLoadingId}
        />
      )}
    </div>
  );
};

export default Inbox;
