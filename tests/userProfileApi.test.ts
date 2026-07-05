import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchUserProfileWithRetry,
  getUserProfile,
  getUserProfileByUserId,
} from '../src/utils/partnerApi';

vi.mock('../src/utils/config', () => ({
  getAuthHeaders: vi.fn(() => ({
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  })),
  getContentApiBaseUrl: vi.fn(() => 'https://api.example.com'),
  handleApiError: vi.fn((error: unknown) => error),
}));

describe('user profile API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches user profile on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'profile-1', email: 'user@example.com' },
      }),
    } as Response);

    const profile = await getUserProfile();

    expect(profile.id).toBe('profile-1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/user/profile',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('fetches user profile by user id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'profile-3',
          userId: 'user-99',
          avatar: 'https://cdn.example.com/avatar.jpg',
        },
      }),
    } as Response);

    const profile = await getUserProfileByUserId('user-99');

    expect(profile?.userId).toBe('user-99');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/users/user-99/profile',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns null when profile by user id is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found', statusCode: 404 }),
    } as Response);

    const profile = await getUserProfileByUserId('missing-user');

    expect(profile).toBeNull();
  });

  it('retries up to 3 times on 404 then succeeds', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found', statusCode: 404 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found', statusCode: 404 }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { id: 'profile-2' },
        }),
      } as Response);

    const profile = await fetchUserProfileWithRetry(3);

    expect(profile.id).toBe('profile-2');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry on non-404 errors', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Server error', statusCode: 500 }),
    } as Response);

    await expect(fetchUserProfileWithRetry(3)).rejects.toMatchObject({
      statusCode: 500,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws after 3 failed 404 attempts', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not found', statusCode: 404 }),
    } as Response);

    await expect(fetchUserProfileWithRetry(3)).rejects.toMatchObject({
      statusCode: 404,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});

describe('author app profile API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches author app profile from content API', async () => {
    const { getMyAuthorAppProfile } = await import('../src/utils/partnerApi');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          id: 'profile-1',
          authorId: 'author-1',
          avatar: 'https://cdn.example.com/avatar.jpg',
        },
      }),
    } as Response);

    const profile = await getMyAuthorAppProfile();

    expect(profile.authorId).toBe('author-1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/author-profiles/me',
      expect.objectContaining({ method: 'GET' })
    );
  });
});
