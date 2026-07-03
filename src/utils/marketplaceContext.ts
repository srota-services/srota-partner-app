import type { LoginAppType, UserRole } from '../types/auth';
import { isOrgStaffRole } from './authRole';

/** True when the user should see author discovery (org inviting authors). */
export function isOrgMarketplaceContext(
  appType: LoginAppType | null,
  role: UserRole | null
): boolean {
  return appType === 'organization' || isOrgStaffRole(role);
}

/** True when the user should see organization discovery (author finding orgs). */
export function isAuthorMarketplaceContext(
  appType: LoginAppType | null,
  role: UserRole | null
): boolean {
  return appType === 'author' || role === 'AUTHOR';
}
