import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from './redux';
import type { OrganizationItem } from '../types/partner';
import { getOrganizations } from '../utils/audiobookApi';
import {
  getOrganizationById,
} from '../utils/partnerApi';
import { resolveCurrentOrganization } from '../utils/resolveCurrentOrganization';

interface UseSettingsOrganizationResult {
  organization: OrganizationItem | null;
  loading: boolean;
  canEdit: boolean;
  refresh: () => Promise<void>;
}

function isOrgAdminRole(role: string | undefined): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

export function useSettingsOrganization(): UseSettingsOrganizationResult {
  const appType = useAppSelector(state => state.auth.appType);
  const workspaceSlug = useAppSelector(state => state.auth.workspaceSlug);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const [organization, setOrganization] = useState<OrganizationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || appType !== 'organization') {
      setOrganization(null);
      setCanEdit(false);
      return;
    }

    setLoading(true);
    try {
      const [memberships, resolvedOrg] = await Promise.all([
        getOrganizations(),
        resolveCurrentOrganization(workspaceSlug),
      ]);

      if (!resolvedOrg?.id) {
        setOrganization(null);
        setCanEdit(false);
        return;
      }

      const membership = memberships.find(
        item => item.organizationId === resolvedOrg.id
      );
      setCanEdit(isOrgAdminRole(membership?.role));

      const fullOrganization = await getOrganizationById(resolvedOrg.id);
      setOrganization(fullOrganization);
    } catch {
      setOrganization(null);
      setCanEdit(false);
    } finally {
      setLoading(false);
    }
  }, [appType, isAuthenticated, workspaceSlug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { organization, loading, canEdit, refresh };
}
