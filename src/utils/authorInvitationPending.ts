import type {
  AuthorInvitationForAuthor,
  AuthorInvitationStatus,
} from '../types/authorInvitation';

const PENDING_AUTHOR_ACTION_STATUSES = new Set<AuthorInvitationStatus>([
  'PENDING_CONTACT_CONSENT',
  'AWAITING_ORG_CONTACT',
  'AWAITING_JOIN_DECISION',
]);

export function isPendingAuthorAction(
  status: AuthorInvitationStatus
): boolean {
  return PENDING_AUTHOR_ACTION_STATUSES.has(status);
}

export function getPendingAuthorInvitations(
  invitations: AuthorInvitationForAuthor[]
): AuthorInvitationForAuthor[] {
  return invitations
    .filter(invitation => isPendingAuthorAction(invitation.status))
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
    );
}

export function getInvitationWizardStep(
  status: AuthorInvitationStatus
): number | null {
  switch (status) {
    case 'PENDING_CONTACT_CONSENT':
      return 1;
    case 'AWAITING_ORG_CONTACT':
      return 2;
    case 'AWAITING_JOIN_DECISION':
      return 3;
    default:
      return null;
  }
}
