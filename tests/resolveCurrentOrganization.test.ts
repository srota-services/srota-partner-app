import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resolveCurrentOrganization } from '../src/utils/resolveCurrentOrganization';
import { getOrganizations } from '../src/utils/audiobookApi';

vi.mock('../src/utils/audiobookApi', () => ({
  getOrganizations: vi.fn(),
}));

const mockedGetOrganizations = vi.mocked(getOrganizations);

describe('resolveCurrentOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns organization matching workspace slug', async () => {
    mockedGetOrganizations.mockResolvedValue([
      {
        id: 'm1',
        userId: 'u1',
        organizationId: 'org-1',
        role: 'ORG_ADMIN',
        joinedAt: '',
        createdAt: '',
        updatedAt: '',
        organization: {
          id: 'org-1',
          name: 'Alpha Org',
          slug: 'alpha',
          createdAt: '',
          updatedAt: '',
        },
      },
      {
        id: 'm2',
        userId: 'u1',
        organizationId: 'org-2',
        role: 'ORG_ADMIN',
        joinedAt: '',
        createdAt: '',
        updatedAt: '',
        organization: {
          id: 'org-2',
          name: 'Beta Org',
          slug: 'beta',
          createdAt: '',
          updatedAt: '',
        },
      },
    ]);

    const org = await resolveCurrentOrganization('beta');

    expect(org?.name).toBe('Beta Org');
  });

  it('falls back to first membership when slug does not match', async () => {
    mockedGetOrganizations.mockResolvedValue([
      {
        id: 'm1',
        userId: 'u1',
        organizationId: 'org-1',
        role: 'ORG_ADMIN',
        joinedAt: '',
        createdAt: '',
        updatedAt: '',
        organization: {
          id: 'org-1',
          name: 'Alpha Org',
          slug: 'alpha',
          createdAt: '',
          updatedAt: '',
        },
      },
    ]);

    const org = await resolveCurrentOrganization('missing');

    expect(org?.name).toBe('Alpha Org');
  });
});
