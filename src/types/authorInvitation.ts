export type AuthorInvitationStatus =
  | 'PENDING_CONTACT_CONSENT'
  | 'AWAITING_ORG_CONTACT'
  | 'AWAITING_JOIN_DECISION'
  | 'DECLINED'
  | 'ACCEPTED';

export interface InvitationOrganizationSummary {
  id: string;
  name: string;
}

export interface InvitationAuthorSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  contact?: string | null;
}

export interface OrganizationAuthorMember {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  contact?: string | null;
}

export interface AuthorInvitationForOrg {
  id: string;
  status: AuthorInvitationStatus;
  author: InvitationAuthorSummary;
  contactRevealedAt?: string | null;
  orgContactConfirmedAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorInvitationForAuthor {
  id: string;
  status: AuthorInvitationStatus;
  organization: InvitationOrganizationSummary;
  contactRevealedAt?: string | null;
  orgContactConfirmedAt?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
