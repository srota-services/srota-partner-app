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
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
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
        user: { id: 'profile-1', email: 'user@example.com' },
      }),
    } as Response);

    const profile = await getUserProfile();

    expect(profile.id).toBe('profile-1');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://auth.example.com/auth/user/profile',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('fetches user profile by user id', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        profile: {
          userId: 'user-99',
          username: 'user99',
          avatar: 'https://cdn.example.com/avatar.jpg',
        },
      }),
    } as Response);

    const profile = await getUserProfileByUserId('user-99');

    expect(profile?.userId).toBe('user-99');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://auth.example.com/auth/users/user-99/profile',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('returns null when profile by user id is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'User profile not found' }),
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
          user: { id: 'profile-2' },
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
