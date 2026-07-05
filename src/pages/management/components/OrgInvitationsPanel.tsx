import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { useDiscoverableCatalogIds } from '../../../hooks/useDiscoverableCatalogIds';
import {
  fetchLinkedAuthors,
  fetchOrgInvitations,
} from '../../../store/slices/organizationAuthorsSlice';
import { getInvitationAuthorName } from '../../../utils/authorInvitationDisplay';
import { isDiscoverableAuthor } from '../../../utils/discoverableCatalogFilter';
import { isOrgStaffRole } from '../../../utils/authRole';
import SearchBar from '../../../components/common/SearchBar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import LinkedAuthorsTable from './LinkedAuthorsTable';
import AuthorInvitationsTable from './AuthorInvitationsTable';
import { showApiError } from '../../../utils/toast';
import '../../../styles/pages/audiobooks/Audiobooks.css';
import '../../../styles/pages/management/InvitationsPanel.css';

const OrgInvitationsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { role } = useAppSelector(state => state.auth);
  const { linkedAuthors, invitations, loading } = useAppSelector(
    state => state.organizationAuthors
  );
  const [searchQuery, setSearchQuery] = useState('');
  const { authorIds, loading: catalogLoading } = useDiscoverableCatalogIds();

  useEffect(() => {
    dispatch(fetchLinkedAuthors()).catch(showApiError);
    dispatch(fetchOrgInvitations()).catch(showApiError);
  }, [dispatch]);

  const discoverableLinkedAuthors = useMemo(
    () =>
      linkedAuthors.filter(author =>
        isDiscoverableAuthor(author.id, authorIds)
      ),
    [linkedAuthors, authorIds]
  );

  const discoverableInvitations = useMemo(
    () =>
      invitations.filter(invitation =>
        isDiscoverableAuthor(invitation.author.id, authorIds)
      ),
    [invitations, authorIds]
  );

  const filteredLinkedAuthors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return discoverableLinkedAuthors;
    }
    return discoverableLinkedAuthors.filter(author => {
      const searchable = [
        getInvitationAuthorName(author),
        author.email ?? '',
        author.contact ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [discoverableLinkedAuthors, searchQuery]);

  const filteredInvitations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return discoverableInvitations;
    }
    return discoverableInvitations.filter(invitation => {
      const searchable = [
        getInvitationAuthorName(invitation.author),
        invitation.author.email ?? '',
        invitation.author.contact ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [discoverableInvitations, searchQuery]);

  if (!isOrgStaffRole(role)) {
    return (
      <div className="team-placeholder marketing-card">
        <p>Invitations are available for organization accounts.</p>
      </div>
    );
  }

  return (
    <div className="manage-tab-content invitations-panel">
      <p className="invitations-panel-note">
        Send new invitations from Discovery. Track linked authors and sent
        invitations here.
      </p>

      <div className="authors-filter-bar">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name or email..."
          className="authors-search"
        />
      </div>

      {loading || catalogLoading ? (
        <div className="loading-container">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <section className="invitations-panel-section">
            <h2 className="invitations-panel-heading">Linked authors</h2>
            {filteredLinkedAuthors.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state-title">
                  {searchQuery ? 'No results found' : 'No linked authors yet'}
                </h3>
                <p className="empty-state-message">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Authors who accept your invitations will appear here.'}
                </p>
              </div>
            ) : (
              <LinkedAuthorsTable authors={filteredLinkedAuthors} />
            )}
          </section>

          <section className="invitations-panel-section">
            <h2 className="invitations-panel-heading">Sent invitations</h2>
            {filteredInvitations.length === 0 ? (
              <div className="empty-state">
                <h3 className="empty-state-title">
                  {searchQuery ? 'No results found' : 'No sent invitations yet'}
                </h3>
                <p className="empty-state-message">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Invitations you send from Discovery will appear here.'}
                </p>
              </div>
            ) : (
              <AuthorInvitationsTable invitations={filteredInvitations} />
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OrgInvitationsPanel;
