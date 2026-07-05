import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  getOrganizationMembers,
  addOrganizationMember,
} from '../src/utils/organizationMemberApi';

vi.mock('../src/utils/config', () => ({
  getAuthApiBaseUrl: () => 'https://auth.example.com',
  getAuthHeaders: () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
  handleApiError: (error: unknown) => error,
}));

describe('organizationMemberApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses organization members list response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'ok',
        members: [
          {
            id: 'member-1',
            userId: 'user-1',
            organizationId: 'org-1',
            role: 'ADMIN',
            joinedAt: '2026-01-01T00:00:00.000Z',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
            user: {
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              contact: '+15551234567',
            },
          },
        ],
      }),
    } as Response);

    const members = await getOrganizationMembers('org-1');

    expect(members).toHaveLength(1);
    expect(members[0]?.userId).toBe('user-1');
  });

  it('parses add member response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'created',
        member: {
          id: 'member-2',
          userId: 'user-2',
          organizationId: 'org-1',
          role: 'OWNER',
          joinedAt: '2026-01-02T00:00:00.000Z',
          createdAt: '2026-01-02T00:00:00.000Z',
          updatedAt: '2026-01-02T00:00:00.000Z',
        },
      }),
    } as Response);

    const member = await addOrganizationMember('org-1', {
      userId: 'user-2',
      role: 'OWNER',
    });

    expect(member.role).toBe('OWNER');
  });
});
