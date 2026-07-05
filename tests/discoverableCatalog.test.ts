import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDiscoverableAuthors,
  toAuthorPickerItem,
} from '../src/utils/audiobookApi';

vi.mock('../src/utils/config', () => ({
  getAuthHeaders: vi.fn(() => ({
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  })),
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
  handleApiError: vi.fn((error: unknown) => error),
}));

describe('discoverable catalog API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches discoverable authors from the catalog endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Discoverable authors retrieved successfully',
        authors: [
          {
            authorId: 'author-1',
            slug: 'jane-doe',
            firstName: 'Jane',
            lastName: 'Doe',
            avatar: 'https://cdn.example.com/avatar.jpg',
            discoverable: true,
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

    const result = await getDiscoverableAuthors(1, 100);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/catalog/authors/discoverable?page=1&limit=100',
      expect.objectContaining({ method: 'GET' })
    );
    expect(result.authors).toHaveLength(1);
    expect(result.authors[0]?.authorId).toBe('author-1');
  });

  it('maps discoverable author authorId to AuthorItem id', () => {
    const pickerItem = toAuthorPickerItem({
      authorId: 'author-99',
      slug: 'author-slug',
      firstName: 'Alex',
      lastName: 'Writer',
      discoverable: true,
    });

    expect(pickerItem.id).toBe('author-99');
    expect(pickerItem.slug).toBe('author-slug');
    expect(pickerItem.firstName).toBe('Alex');
  });
});
