import type { LoginAppType } from '../types/auth';
import { getMyAuthorProfile } from './partnerApi';
import { resolveOrganizationId } from './resolveOrganizationId';

/**
 * Resolves ownerId for audiobook list queries based on workspace appType.
 * - organization → organizationId
 * - author → author id from GET /auth/authors/me
 */
export async function resolveAudiobookFetchOwnerId(
  appType: LoginAppType | null
): Promise<string | null> {
  if (appType === 'organization') {
    return resolveOrganizationId();
  }

  if (appType === 'author') {
    const author = await getMyAuthorProfile();
    return author.id;
  }

  return null;
}
