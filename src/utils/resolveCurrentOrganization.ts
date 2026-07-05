import type { OrganizationItem } from './audiobookApi';
import { getOrganizations } from './audiobookApi';

/**
 * Resolves the active organization from memberships, preferring a slug match.
 */
export async function resolveCurrentOrganization(
  workspaceSlug: string | null
): Promise<OrganizationItem | null> {
  const memberships = await getOrganizations();
  if (memberships.length === 0) {
    return null;
  }

  const normalizedSlug = workspaceSlug?.trim().toLowerCase();
  if (normalizedSlug) {
    const matched = memberships.find(
      membership =>
        membership.organization?.slug.toLowerCase() === normalizedSlug
    );
    if (matched?.organization) {
      return matched.organization;
    }
  }

  return memberships[0]?.organization ?? null;
}
