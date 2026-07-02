/**
 * Manage page — organization authors and invitations
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchLinkedAuthors,
  fetchOrgInvitations,
} from '../../store/slices/organizationAuthorsSlice';
import LinkedAuthorsTable from './components/LinkedAuthorsTable';
import AuthorInvitationsTable from './components/AuthorInvitationsTable';
import InviteAuthorModal from './components/InviteAuthorModal';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TabPanel from '../../components/common/TabPanel';
import { getInvitationAuthorName } from '../../utils/authorInvitationDisplay';
import { showApiError } from '../../utils/toast';
import '../../styles/pages/management/Management.css';
import '../../styles/pages/audiobooks/Audiobooks.css';

type AuthorsViewTab = 'linked' | 'invitations';

const TABS: { id: AuthorsViewTab; label: string }[] = [
  { id: 'linked', label: 'Linked' },
  { id: 'invitations', label: 'Invitations' },
];

const Management: React.FC = () => {
  const dispatch = useAppDispatch();
  const { linkedAuthors, invitations, loading } = useAppSelector(
    state => state.organizationAuthors
  );

  const [activeTab, setActiveTab] = useState<AuthorsViewTab>('linked');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLinkedAuthors()).catch(showApiError);
    dispatch(fetchOrgInvitations()).catch(showApiError);
  }, [dispatch]);

  const linkedAuthorIds = useMemo(
    () => new Set(linkedAuthors.map(a => a.id)),
    [linkedAuthors]
  );

  const pendingInvitationAuthorIds = useMemo(
    () =>
      new Set(
        invitations
          .filter(
            inv => inv.status !== 'ACCEPTED' && inv.status !== 'DECLINED'
          )
          .map(inv => inv.author.id)
      ),
    [invitations]
  );

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

  const handleInvited = () => {
    dispatch(fetchOrgInvitations()).catch(showApiError);
  };

  const currentList =
    activeTab === 'linked' ? filteredLinkedAuthors : filteredInvitations;
  const isEmpty = !loading && currentList.length === 0;

  return (
    <div className="management-page authors-page">
      <div className="authors-page-header">
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">
            Invite authors to your organization and manage linked members.
          </p>
        </div>
        <div className="authors-page-header-actions">
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Plus size={16} className="btn-icon-left" />
            Invite Author
          </Button>
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
                  : 'Send an invitation to connect with an author.'}
            </p>
            {!searchQuery && activeTab === 'invitations' && (
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <Plus size={16} className="btn-icon-left" />
                Invite Author
              </Button>
            )}
          </div>
        ) : activeTab === 'linked' ? (
          <LinkedAuthorsTable authors={filteredLinkedAuthors} />
        ) : (
          <AuthorInvitationsTable invitations={filteredInvitations} />
        )}
      </TabPanel>

      <InviteAuthorModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        linkedAuthorIds={linkedAuthorIds}
        pendingInvitationAuthorIds={pendingInvitationAuthorIds}
        onInvited={handleInvited}
      />
    </div>
  );
};

export default Management;
