import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import {
  getAllOrganizations,
  type CatalogOrganizationItem,
} from '../../../utils/audiobookApi';
import { getMyOrganizationInvitations } from '../../../utils/authorInvitationApi';
import { getMyAuthorProfile } from '../../../utils/partnerApi';
import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
import {
  TERMINAL_COLLABORATION_STATUSES,
  type AuthorCollaboration,
} from '../../../types/authorCollaboration';
import { fetchCollaborations } from '../../../store/slices/collaborationsSlice';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';
import AppImage from '../../../components/common/AppImage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { showApiError } from '../../../utils/toast';
import '../../../styles/pages/marketplace/Marketplace.css';

const TERMINAL_INVITATION_STATUSES = new Set(['ACCEPTED', 'DECLINED']);

function getOrgBadge(
  orgId: string,
  linkedOrgIds: Set<string>,
  invitationsByOrgId: Map<string, AuthorInvitationForAuthor>,
  collaborationsByOrgId: Map<string, AuthorCollaboration>
): string | null {
  if (linkedOrgIds.has(orgId)) {
    return 'Already linked';
  }

  const collaboration = collaborationsByOrgId.get(orgId);
  if (
    collaboration &&
    !TERMINAL_COLLABORATION_STATUSES.has(collaboration.status)
  ) {
    return 'Collaboration pending';
  }

  const invitation = invitationsByOrgId.get(orgId);
  if (!invitation) {
    return null;
  }

  if (invitation.status === 'ACCEPTED') {
    return 'Already linked';
  }

  if (!TERMINAL_INVITATION_STATUSES.has(invitation.status)) {
    return 'Invitation received';
  }

  return null;
}

function canRequestToJoin(
  orgId: string,
  linkedOrgIds: Set<string>,
  invitationsByOrgId: Map<string, AuthorInvitationForAuthor>,
  collaborationsByOrgId: Map<string, AuthorCollaboration>
): boolean {
  if (linkedOrgIds.has(orgId)) {
    return false;
  }

  const collaboration = collaborationsByOrgId.get(orgId);
  if (
    collaboration &&
    !TERMINAL_COLLABORATION_STATUSES.has(collaboration.status)
  ) {
    return false;
  }

  const invitation = invitationsByOrgId.get(orgId);
  if (invitation && !TERMINAL_INVITATION_STATUSES.has(invitation.status)) {
    return false;
  }

  return true;
}

function buildCollaborationCreatePath(org: CatalogOrganizationItem): string {
  const params = new URLSearchParams({
    organizationId: org.id,
    organizationName: org.name,
  });
  return `/management/collaborations/create?${params.toString()}`;
}

const OrganizationSearchPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { collaborations } = useAppSelector(state => state.collaborations);
  const [organizations, setOrganizations] = useState<CatalogOrganizationItem[]>(
    []
  );
  const [invitations, setInvitations] = useState<AuthorInvitationForAuthor[]>(
    []
  );
  const [linkedOrgIds, setLinkedOrgIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getAllOrganizations(1, 100),
      getMyOrganizationInvitations(),
      getMyAuthorProfile(),
      dispatch(fetchCollaborations()).unwrap(),
    ])
      .then(([catalog, authorInvitations, authorProfile]) => {
        if (cancelled) {
          return;
        }
        setOrganizations(catalog.organizations);
        setInvitations(authorInvitations);
        setLinkedOrgIds(
          new Set(authorProfile.organizations?.map(org => org.id) ?? [])
        );
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
  }, [dispatch]);

  const invitationsByOrgId = useMemo(() => {
    const map = new Map<string, AuthorInvitationForAuthor>();
    invitations.forEach(invitation => {
      map.set(invitation.organization.id, invitation);
    });
    return map;
  }, [invitations]);

  const collaborationsByOrgId = useMemo(() => {
    const map = new Map<string, AuthorCollaboration>();
    collaborations.forEach(collaboration => {
      if ('organization' in collaboration) {
        map.set(collaboration.organization.id, collaboration);
      }
    });
    return map;
  }, [collaborations]);

  const filteredOrganizations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return organizations;
    }
    return organizations.filter(org => {
      const name = org.name.toLowerCase();
      const slug = org.slug.toLowerCase();
      const description = org.description?.toLowerCase() ?? '';
      return (
        name.includes(query) ||
        slug.includes(query) ||
        description.includes(query)
      );
    });
  }, [organizations, searchQuery]);

  return (
    <div className="marketplace-panel" data-testid="organization-search-panel">
      <p className="marketplace-panel-description">
        Search for organizations to connect with and submit a collaboration
        request.
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
      ) : filteredOrganizations.length === 0 ? (
        <p className="marketplace-empty">No organizations found.</p>
      ) : (
        <ul className="marketplace-list">
          {filteredOrganizations.map(org => {
            const badge = getOrgBadge(
              org.id,
              linkedOrgIds,
              invitationsByOrgId,
              collaborationsByOrgId
            );
            const canJoin = canRequestToJoin(
              org.id,
              linkedOrgIds,
              invitationsByOrgId,
              collaborationsByOrgId
            );

            return (
              <li key={org.id} className="marketplace-list-item">
                <AppImage
                  src={org.image}
                  alt=""
                  variant="organization"
                  className="marketplace-list-thumb"
                />
                <div className="marketplace-list-body">
                  <div className="marketplace-list-info">
                    <span className="marketplace-list-name">{org.name}</span>
                    {org.description && (
                      <span className="marketplace-list-meta">
                        {org.description}
                      </span>
                    )}
                    {badge && (
                      <span className="marketplace-list-badge">{badge}</span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="small"
                    disabled={!canJoin}
                    title={
                      canJoin
                        ? 'Submit a collaboration request'
                        : 'Request unavailable for this organization'
                    }
                    aria-label={
                      canJoin
                        ? `Request to join ${org.name}`
                        : `Request to join ${org.name} unavailable`
                    }
                    onClick={() => navigate(buildCollaborationCreatePath(org))}
                  >
                    Request to join
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

export default OrganizationSearchPanel;
