/**
 * Team page — linked authors and invitations (org staff)
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchLinkedAuthors,
  fetchOrgInvitations,
} from '../../store/slices/organizationAuthorsSlice';
import LinkedAuthorsTable from '../management/components/LinkedAuthorsTable';
import AuthorInvitationsTable from '../management/components/AuthorInvitationsTable';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TabPanel from '../../components/common/TabPanel';
import { getInvitationAuthorName } from '../../utils/authorInvitationDisplay';
import { isOrgStaffRole } from '../../utils/authRole';
import { showApiError } from '../../utils/toast';
import '../../styles/pages/team/Team.css';
import '../../styles/pages/management/Management.css';
import '../../styles/pages/management/components/AuthorsTable.css';
import '../../styles/pages/audiobooks/Audiobooks.css';

type TeamViewTab = 'linked' | 'invitations';

const TABS: { id: TeamViewTab; label: string }[] = [
  { id: 'linked', label: 'Linked' },
  { id: 'invitations', label: 'Invitations' },
];

const Team: React.FC = () => {
  const dispatch = useAppDispatch();
  const { role, appType } = useAppSelector(state => state.auth);
  const { linkedAuthors, invitations, loading } = useAppSelector(
    state => state.organizationAuthors
  );

  const [activeTab, setActiveTab] = useState<TeamViewTab>('linked');
  const [searchQuery, setSearchQuery] = useState('');

  const isOrgTeamContext =
    appType === 'organization' || isOrgStaffRole(role);

  useEffect(() => {
    if (!isOrgTeamContext) {
      return;
    }
    dispatch(fetchLinkedAuthors()).catch(showApiError);
    dispatch(fetchOrgInvitations()).catch(showApiError);
  }, [dispatch, isOrgTeamContext]);

  const filteredLinkedAuthors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return linkedAuthors;
    }
    return linkedAuthors.filter(author => {
      const name = getInvitationAuthorName(author).toLowerCase();
      return (
        name.includes(query) ||
        author.email.toLowerCase().includes(query) ||
        (author.contact?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [linkedAuthors, searchQuery]);

  const filteredInvitations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return invitations;
    }
    return invitations.filter(invitation => {
      const name = getInvitationAuthorName(invitation.author).toLowerCase();
      return (
        name.includes(query) ||
        (invitation.author.email?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [invitations, searchQuery]);

  const currentList =
    activeTab === 'linked' ? filteredLinkedAuthors : filteredInvitations;
  const isEmpty = !loading && currentList.length === 0;

  if (!isOrgTeamContext) {
    return (
      <div className="team-page">
        <div className="management-header">
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">
            Team management for your organization.
          </p>
        </div>
        <div className="team-placeholder marketing-card">
          <p>Team management is available for organization accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page authors-page">
      <div className="authors-page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">
            View linked authors and track outgoing invitations.
          </p>
        </div>
      </div>

      <div className="audiobooks-tabs authors-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`audiobooks-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="authors-filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={
            activeTab === 'linked'
              ? 'Search linked authors...'
              : 'Search invitations...'
          }
          className="authors-search"
        />
      </div>

      <TabPanel activeKey={loading ? 'loading' : activeTab}>
        {loading ? (
          <div className="loading-container">
            <LoadingSpinner />
          </div>
        ) : isEmpty ? (
          <div className="empty-state">
            <div className="empty-state-icon">✍️</div>
            <h3 className="empty-state-title">
              {searchQuery
                ? 'No results found'
                : activeTab === 'linked'
                  ? 'No linked authors yet'
                  : 'No invitations yet'}
            </h3>
            <p className="empty-state-message">
              {searchQuery
                ? 'Try adjusting your search query'
                : activeTab === 'linked'
                  ? 'Authors who accept your invitation will appear here.'
                  : 'Invite authors from the Marketplace to connect with them.'}
            </p>
          </div>
        ) : activeTab === 'linked' ? (
          <LinkedAuthorsTable authors={filteredLinkedAuthors} />
        ) : (
          <AuthorInvitationsTable invitations={filteredInvitations} />
        )}
      </TabPanel>
    </div>
  );
};

export default Team;
