import { COLLABORATION_CURRENCY } from '../types/authorCollaboration';
import { formatBudget } from './collaborationDisplay';

export interface CollaborationRequestPreviewInput {
  organizationName: string;
  description: string;
  authorBudget: string;
  hasAttachment: boolean;
  userName: string;
}

export function formatCollaborationRequestBudget(
  authorBudget: string
): string | null {
  const trimmed = authorBudget.trim();
  if (!trimmed) {
    return null;
  }

  const amount = Number(trimmed);
  if (Number.isNaN(amount) || amount <= 0) {
    return null;
  }

  return formatBudget(amount, COLLABORATION_CURRENCY);
}

export function buildCollaborationRequestPreviewLines({
  organizationName,
  description,
  authorBudget,
  hasAttachment,
  userName,
}: CollaborationRequestPreviewInput): string[] {
  const lines: string[] = [`Hi ${organizationName || 'Organization name'},`];

  const trimmedDescription = description.trim();
  if (trimmedDescription) {
    lines.push('', trimmedDescription);
  }

  const budget = formatCollaborationRequestBudget(authorBudget);
  lines.push('', `My proposed budget is ${budget ?? 'your proposed budget'}`);

  if (hasAttachment) {
    lines.push('', 'Please find attached my short script.');
  }

  lines.push('', 'Thanks & Regards,', userName || 'Your name');

  return lines;
}
