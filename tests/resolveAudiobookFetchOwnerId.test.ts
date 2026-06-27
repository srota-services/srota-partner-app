import { describe, expect, it, vi } from 'vitest';
import { resolveAudiobookFetchOwnerId } from '../src/utils/resolveAudiobookFetchOwnerId';

vi.mock('../src/utils/resolveOrganizationId', () => ({
  resolveOrganizationId: vi.fn().mockResolvedValue('org-123'),
}));

vi.mock('../src/utils/partnerApi', () => ({
  getMyAuthorProfile: vi.fn().mockResolvedValue({ id: 'author-789', userId: 'user-456' }),
}));

describe('resolveAudiobookFetchOwnerId', () => {
  it('returns organizationId when appType is organization', async () => {
    const ownerId = await resolveAudiobookFetchOwnerId('organization');
    expect(ownerId).toBe('org-123');
  });

  it('returns author id from GET /auth/authors/me when appType is author', async () => {
    const ownerId = await resolveAudiobookFetchOwnerId('author');
    expect(ownerId).toBe('author-789');
  });

  it('returns null when appType is not set', async () => {
    const ownerId = await resolveAudiobookFetchOwnerId(null);
    expect(ownerId).toBeNull();
  });
});
