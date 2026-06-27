import type { AuthorInvitationStatus } from '../types/authorInvitation';

export type InvitationStatusVariant =
  | 'pending'
  | 'scheduled'
  | 'live'
  | 'draft'
  | 'archived';

/** Human-readable label for org staff view */
export function getInvitationStatusLabelForOrg(
  status: AuthorInvitationStatus
): string {
  switch (status) {
    case 'PENDING_CONTACT_CONSENT':
      return 'Awaiting author response';
    case 'AWAITING_ORG_CONTACT':
      return 'Contact author';
    case 'AWAITING_JOIN_DECISION':
      return 'Awaiting join decision';
    case 'ACCEPTED':
      return 'Accepted';
    case 'DECLINED':
      return 'Declined';
    default:
      return status;
  }
}

/** Human-readable label for author inbox view */
export function getInvitationStatusLabelForAuthor(
  status: AuthorInvitationStatus
): string {
  switch (status) {
    case 'PENDING_CONTACT_CONSENT':
      return 'Awaiting your response';
    case 'AWAITING_ORG_CONTACT':
      return 'Awaiting organization contact';
    case 'AWAITING_JOIN_DECISION':
      return 'Ready to join';
    case 'ACCEPTED':
      return 'Joined';
    case 'DECLINED':
      return 'Declined';
    default:
      return status;
  }
}

export function getInvitationStatusVariant(
  status: AuthorInvitationStatus
): InvitationStatusVariant {
  switch (status) {
    case 'PENDING_CONTACT_CONSENT':
      return 'pending';
    case 'AWAITING_ORG_CONTACT':
      return 'scheduled';
    case 'AWAITING_JOIN_DECISION':
      return 'draft';
    case 'ACCEPTED':
      return 'live';
    case 'DECLINED':
      return 'archived';
    default:
      return 'pending';
  }
}

/** Contextual guidance shown to org staff per invitation status */
export function getOrgInvitationGuidance(
  status: AuthorInvitationStatus
): string {
  switch (status) {
    case 'PENDING_CONTACT_CONSENT':
      return 'Waiting for the author to respond to your invitation.';
    case 'AWAITING_ORG_CONTACT':
      return 'Please contact this author using the details below.';
    case 'AWAITING_JOIN_DECISION':
      return 'Waiting for the author to decide whether to join.';
    case 'ACCEPTED':
      return 'This author has joined your organization.';
    case 'DECLINED':
      return 'This invitation was declined.';
    default:
      return '';
  }
}
