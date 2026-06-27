import type {
  InvitationAuthorSummary,
  InvitationOrganizationSummary,
  OrganizationAuthorMember,
} from '../types/authorInvitation';

/** Display name for an author — never falls back to slug */
export function getInvitationAuthorName(
  author: InvitationAuthorSummary | OrganizationAuthorMember
): string {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Author';
}

/** Display name for an organization */
export function getOrganizationDisplayName(
  org: InvitationOrganizationSummary
): string {
  return org.name;
}
