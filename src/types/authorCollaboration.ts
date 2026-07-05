export type CollaborationStatus =
  | 'PENDING_ORG_REVIEW'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ABORTED';

export type CollaborationTurn = 'AUTHOR' | 'ORGANIZATION';

export type CollaborationActor = 'AUTHOR' | 'ORGANIZATION';

export interface CollaborationOrganizationSummary {
  id: string;
  name: string;
}

export interface CollaborationAuthorSummary {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}

export interface CollaborationAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: CollaborationActor;
  createdAt: string;
}

export interface CollaborationRound {
  id: string;
  actor: CollaborationActor;
  authorBudget?: number | null;
  organizationAsk?: number | null;
  createdAt: string;
}

interface CollaborationBase {
  id: string;
  status: CollaborationStatus;
  description?: string | null;
  authorBudget: number;
  organizationAsk?: number | null;
  acceptedBudget?: number | null;
  currency: string;
  turn: CollaborationTurn;
  negotiationExpiresAt?: string | null;
  rejectedAt?: string | null;
  acceptedAt?: string | null;
  abortedAt?: string | null;
  attachments: CollaborationAttachment[];
  rounds: CollaborationRound[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthorCollaboration extends CollaborationBase {
  organization: CollaborationOrganizationSummary;
}

export interface OrgCollaboration extends CollaborationBase {
  author: CollaborationAuthorSummary;
}

export interface CreateCollaborationInput {
  organizationId: string;
  description?: string;
  authorBudget: number;
  currency: string;
  attachments?: File[];
}

export const COLLABORATION_CURRENCY = 'INR';

export const TERMINAL_COLLABORATION_STATUSES = new Set<CollaborationStatus>([
  'ACCEPTED',
  'REJECTED',
  'ABORTED',
]);
