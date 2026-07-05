import type { AuthorInvitationForAuthor } from '../types/authorInvitation';

const TERMINAL_INVITATION_STATUSES = new Set(['DECLINED']);

export function isOrganizationInvited(
  orgId: string,
  linkedOrgIds: Set<string>,
  invitationsByOrgId: Map<string, AuthorInvitationForAuthor>
): boolean {
  if (linkedOrgIds.has(orgId)) {
    return true;
  }

  const invitation = invitationsByOrgId.get(orgId);
  if (!invitation) {
    return false;
  }

  if (invitation.status === 'ACCEPTED') {
    return true;
  }

  return !TERMINAL_INVITATION_STATUSES.has(invitation.status);
}

export function getDiscoveryInvitationBadge(
  orgId: string,
  linkedOrgIds: Set<string>,
  invitationsByOrgId: Map<string, AuthorInvitationForAuthor>
): string | null {
  return isOrganizationInvited(orgId, linkedOrgIds, invitationsByOrgId)
    ? 'Invited'
    : null;
}

export function isAuthorInvited(
  authorId: string,
  linkedAuthorIds: Set<string>,
  pendingInvitationAuthorIds: Set<string>
): boolean {
  return linkedAuthorIds.has(authorId) || pendingInvitationAuthorIds.has(authorId);
}

export function getAuthorDiscoveryInvitationBadge(
  authorId: string,
  linkedAuthorIds: Set<string>,
  pendingInvitationAuthorIds: Set<string>
): string | null {
  return isAuthorInvited(authorId, linkedAuthorIds, pendingInvitationAuthorIds)
    ? 'Invited'
    : null;
}
