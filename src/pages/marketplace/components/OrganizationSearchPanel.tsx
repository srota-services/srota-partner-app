import React, { useEffect, useMemo, useState } from 'react';
import {
  getAllOrganizations,
  type CatalogOrganizationItem,
} from '../../../utils/audiobookApi';
import { getMyOrganizationInvitations } from '../../../utils/authorInvitationApi';
import { getMyAuthorProfile } from '../../../utils/partnerApi';
import type { AuthorInvitationForAuthor } from '../../../types/authorInvitation';
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
  invitationsByOrgId: Map<string, AuthorInvitationForAuthor>
): string | null {
  if (linkedOrgIds.has(orgId)) {
    return 'Already linked';
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

const OrganizationSearchPanel: React.FC = () => {
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
  }, []);

  const invitationsByOrgId = useMemo(() => {
    const map = new Map<string, AuthorInvitationForAuthor>();
    invitations.forEach(invitation => {
      map.set(invitation.organization.id, invitation);
    });
    return map;
  }, [invitations]);

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
    <div className="marketplace-panel">
      <p className="marketplace-panel-description">
        Search for organizations to connect with. Request to join will be
        available soon.
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
            const badge = getOrgBadge(org.id, linkedOrgIds, invitationsByOrgId);

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
                    disabled
                    title="Coming soon"
                    aria-label="Request to join — coming soon"
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
