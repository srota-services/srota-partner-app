import { useEffect, useState } from 'react';
import { useAppSelector } from './redux';
import type { OrganizationItem } from '../utils/audiobookApi';
import { resolveCurrentOrganization } from '../utils/resolveCurrentOrganization';
import { isOrgStaffRole } from '../utils/authRole';

interface UseCurrentOrganizationResult {
  organization: OrganizationItem | null;
  loading: boolean;
}

/**
 * Loads the current user's organization for org staff workspaces.
 */
export function useCurrentOrganization(): UseCurrentOrganizationResult {
  const role = useAppSelector(state => state.auth.role);
  const appType = useAppSelector(state => state.auth.appType);
  const workspaceSlug = useAppSelector(state => state.auth.workspaceSlug);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const [organization, setOrganization] = useState<OrganizationItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const shouldLoadOrganization =
    isAuthenticated && (appType === 'organization' || isOrgStaffRole(role));

  useEffect(() => {
    if (!shouldLoadOrganization) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void resolveCurrentOrganization(workspaceSlug)
      .then(org => {
        if (!cancelled) {
          setOrganization(org);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrganization(null);
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
  }, [shouldLoadOrganization, workspaceSlug]);

  return { organization, loading };
}
