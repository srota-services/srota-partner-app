import type {
  CollaborationAuthorSummary,
  CollaborationStatus,
} from '../types/authorCollaboration';

export function getCollaborationAuthorName(
  author: CollaborationAuthorSummary
): string {
  const parts = [author.firstName, author.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown author';
}

export function formatCollaborationStatus(status: CollaborationStatus): string {
  switch (status) {
    case 'PENDING_ORG_REVIEW':
      return 'Pending review';
    case 'NEGOTIATION':
      return 'Negotiation';
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'ABORTED':
      return 'Aborted';
    default:
      return status;
  }
}

export function formatBudget(amount: number, currency: string): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
