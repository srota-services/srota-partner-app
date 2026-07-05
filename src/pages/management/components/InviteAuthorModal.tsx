import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import {
  getDiscoverableAuthors,
  toAuthorPickerItem,
  type AuthorItem,
} from '../../../utils/audiobookApi';
import { inviteAuthor } from '../../../store/slices/organizationAuthorsSlice';
import Modal from '../../../components/common/Modal';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { showApiError, showSuccess } from '../../../utils/toast';
import '../../../styles/pages/management/components/InviteAuthorModal.css';

/** Display name for invite picker — never shows slug */
function getPickerAuthorName(author: AuthorItem): string {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Author';
}

interface InviteAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedAuthorIds: Set<string>;
  pendingInvitationAuthorIds: Set<string>;
  onInvited: () => void;
}

const InviteAuthorModal: React.FC<InviteAuthorModalProps> = ({
  isOpen,
  onClose,
  linkedAuthorIds,
  pendingInvitationAuthorIds,
  onInvited,
}) => {
  const dispatch = useAppDispatch();
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    let cancelled = false;
    setLoading(true);

    getDiscoverableAuthors(1, 100)
      .then(result => {
        if (!cancelled) {
          setAuthors(result.authors.map(toAuthorPickerItem));
        }
      })
      .catch(error => {
        if (!cancelled) {
          showApiError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const filteredAuthors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return authors;
    }
    return authors.filter(author => {
      const name = getPickerAuthorName(author).toLowerCase();
      return name.includes(query);
    });
  }, [authors, searchQuery]);

  const handleInvite = async (authorId: string) => {
    setInvitingId(authorId);
    try {
      const result = await dispatch(inviteAuthor(authorId)).unwrap();
      showSuccess(result.message || 'Invitation sent successfully');
      onInvited();
      onClose();
    } catch (error) {
      showApiError(error);
    } finally {
      setInvitingId(null);
    }
  };

  const isUnavailable = (authorId: string) =>
    linkedAuthorIds.has(authorId) || pendingInvitationAuthorIds.has(authorId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Author" size="medium">
      <div className="invite-author-modal">
        <p className="invite-author-modal-description">
          Search for an author to invite to your organization. They will receive
          the invitation in their Inbox.
        </p>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name..."
          className="invite-author-search"
        />

        {loading ? (
          <div className="invite-author-loading">
            <LoadingSpinner />
          </div>
        ) : filteredAuthors.length === 0 ? (
          <p className="invite-author-empty">No authors found.</p>
        ) : (
          <ul className="invite-author-list">
            {filteredAuthors.map(author => {
              const unavailable = isUnavailable(author.id);
              const isInviting = invitingId === author.id;

              return (
                <li key={author.id} className="invite-author-list-item">
                  <div className="invite-author-list-info">
                    <span className="invite-author-list-name">
                      {getPickerAuthorName(author)}
                    </span>
                    {unavailable && (
                      <span className="invite-author-list-badge">
                        {linkedAuthorIds.has(author.id)
                          ? 'Already linked'
                          : 'Invitation pending'}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    disabled={unavailable || isInviting}
                    onClick={() => handleInvite(author.id)}
                  >
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default InviteAuthorModal;
