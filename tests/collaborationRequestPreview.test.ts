import { describe, expect, it } from 'vitest';
import {
  buildCollaborationRequestPreviewLines,
  formatCollaborationRequestBudget,
} from '../src/utils/collaborationRequestPreview';

describe('collaborationRequestPreview', () => {
  it('formats a valid INR budget', () => {
    expect(formatCollaborationRequestBudget('50000')).toBe('₹50,000');
  });

  it('returns null for invalid budget values', () => {
    expect(formatCollaborationRequestBudget('')).toBeNull();
    expect(formatCollaborationRequestBudget('0')).toBeNull();
    expect(formatCollaborationRequestBudget('abc')).toBeNull();
  });

  it('builds the collaboration request preview message', () => {
    const lines = buildCollaborationRequestPreviewLines({
      organizationName: 'Acme Audio',
      description: 'I would love to collaborate on a new series.',
      authorBudget: '75000',
      hasAttachment: true,
      userName: 'Jane Author',
    });

    expect(lines).toEqual([
      'Hi Acme Audio,',
      '',
      'I would love to collaborate on a new series.',
      '',
      'My proposed budget is ₹75,000',
      '',
      'Please find attached my short script.',
      '',
      'Thanks & Regards,',
      'Jane Author',
    ]);
  });
});
