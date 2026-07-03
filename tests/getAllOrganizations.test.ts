import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getAllOrganizations } from '../src/utils/audiobookApi';

vi.mock('../src/utils/config', () => ({
  getAuthHeaders: vi.fn(() => ({
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  })),
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
  getContentApiBaseUrl: vi.fn(() => 'https://api.example.com'),
  handleApiError: vi.fn((error: unknown) => error),
}));

describe('getAllOrganizations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches organizations from the catalog endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Organizations retrieved',
        organizations: [
          {
            id: 'org-1',
            name: 'Acme Publishing',
            slug: 'acme-publishing',
            description: 'Independent publisher',
          },
        ],
        pagination: {
          page: 1,
          limit: 100,
          totalCount: 1,
          totalPages: 1,
        },
      }),
    } as Response);

    const result = await getAllOrganizations(1, 100);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/organizations/all?page=1&limit=100',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.organizations).toHaveLength(1);
    expect(result.organizations[0]?.name).toBe('Acme Publishing');
    expect(result.pagination?.totalCount).toBe(1);
  });
});
