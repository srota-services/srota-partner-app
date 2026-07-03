import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  fetchLinkedAuthors,
  fetchOrgInvitations,
  inviteAuthor,
} from '../../../store/slices/organizationAuthorsSlice';
import { getAuthors, type AuthorItem } from '../../../utils/audiobookApi';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import AppImage from '../../../components/common/AppImage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { showApiError, showSuccess } from '../../../utils/toast';
import '../../../styles/pages/marketplace/Marketplace.css';

function getPickerAuthorName(author: AuthorItem): string {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Author';
}

const AuthorSearchPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { linkedAuthors, invitations } = useAppSelector(
    state => state.organizationAuthors
  );

  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchLinkedAuthors()).catch(showApiError);
    dispatch(fetchOrgInvitations()).catch(showApiError);
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getAuthors()
      .then(data => {
        if (!cancelled) {
          setAuthors(data);
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
  }, []);

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
      dispatch(fetchOrgInvitations()).catch(showApiError);
    } catch (error) {
      showApiError(error);
    } finally {
      setInvitingId(null);
    }
  };

  const isUnavailable = (authorId: string) =>
    linkedAuthorIds.has(authorId) || pendingInvitationAuthorIds.has(authorId);

  return (
    <div className="marketplace-panel">
      <p className="marketplace-panel-description">
        Search for authors to invite to your organization. They will receive
        the invitation in their Inbox.
      </p>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by name..."
        className="marketplace-search"
      />

      {loading ? (
        <div className="marketplace-loading">
          <LoadingSpinner />
        </div>
      ) : filteredAuthors.length === 0 ? (
        <p className="marketplace-empty">No authors found.</p>
      ) : (
        <ul className="marketplace-list">
          {filteredAuthors.map(author => {
            const unavailable = isUnavailable(author.id);
            const isInviting = invitingId === author.id;

            return (
              <li key={author.id} className="marketplace-list-item">
                <AppImage
                  src={null}
                  alt=""
                  variant="author"
                  className="marketplace-list-thumb"
                />
                <div className="marketplace-list-body">
                  <div className="marketplace-list-info">
                    <span className="marketplace-list-name">
                      {getPickerAuthorName(author)}
                    </span>
                    {unavailable && (
                      <span className="marketplace-list-badge">
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AuthorSearchPanel;
