import { getOrganizations } from './audiobookApi';

/**
 * Resolves the current user's primary organization ID (first membership).
 */
export async function resolveOrganizationId(): Promise<string | null> {
  const memberships = await getOrganizations();
  return memberships[0]?.organization?.id ?? null;
}
