import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAudiobook,
  getLanguages,
  getMoods,
  getSubscriptionPlans,
  updateAudiobook,
} from '../src/utils/audiobookApi';

vi.mock('../src/utils/config', () => ({
  getAuthHeaders: vi.fn(() => ({
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  })),
  getAuthHeadersForFileUpload: vi.fn(() => ({
    Authorization: 'Bearer test-token',
  })),
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
  getContentApiBaseUrl: vi.fn(() => 'https://api.example.com'),
  handleApiError: vi.fn((error: unknown) => error),
}));

const baseCreatePayload = {
  title: 'Test Audiobook',
  author: 'Test Author',
  description: 'A test description',
  genreIds: ['genre-1'] as string[],
  tagIds: ['tag-1'] as string[],
  language: 'Hindi',
};

describe('audiobook API language payloads', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes language in JSON create payload when no cover image', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-1', ...baseCreatePayload },
      }),
    } as Response);

    await createAudiobook(baseCreatePayload);

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse((request as RequestInit).body as string);
    expect(body.language).toBe('Hindi');
    expect(body.title).toBe('Test Audiobook');
  });

  it('includes language in FormData create payload when cover image is provided', async () => {
    const coverImage = new File(['cover'], 'cover.png', { type: 'image/png' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-2', title: 'Test Audiobook' },
      }),
    } as Response);

    await createAudiobook({ ...baseCreatePayload, coverImage });

    const [, request] = fetchMock.mock.calls[0];
    const formData = (request as RequestInit).body as FormData;
    expect(formData.get('language')).toBe('Hindi');
    expect(formData.get('title')).toBe('Test Audiobook');
  });

  it('includes language in JSON update payload when no new cover image', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-1', title: 'Updated Title' },
      }),
    } as Response);

    await updateAudiobook({
      audiobookId: 'ab-1',
      title: 'Updated Title',
      language: 'Spanish',
      genreIds: ['genre-1'],
      tagIds: ['tag-1'],
    });

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse((request as RequestInit).body as string);
    expect(body.language).toBe('Spanish');
    expect(body.title).toBe('Updated Title');
  });

  it('includes language in FormData update payload when cover image is provided', async () => {
    const coverImage = new File(['cover'], 'cover.png', { type: 'image/png' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-1', title: 'Updated Title' },
      }),
    } as Response);

    await updateAudiobook({
      audiobookId: 'ab-1',
      title: 'Updated Title',
      language: 'French',
      coverImage,
    });

    const [, request] = fetchMock.mock.calls[0];
    const formData = (request as RequestInit).body as FormData;
    expect(formData.get('language')).toBe('French');
    expect(formData.get('audiobookId')).toBe('ab-1');
  });
});

describe('audiobook API catalog endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches subscription plans from auth API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ name: 'Base Plan' }, { name: 'Standard Plan' }],
      }),
    } as Response);

    const plans = await getSubscriptionPlans();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/subscription-plans/',
      expect.objectContaining({ method: 'GET' })
    );
    expect(plans).toHaveLength(2);
    expect(plans[0].name).toBe('Base Plan');
  });

  it('fetches moods from content API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'mood-1',
            name: 'Calm',
            hexcode: '#38BDF8',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    } as Response);

    const moods = await getMoods();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/moods',
      expect.objectContaining({ method: 'GET' })
    );
    expect(moods[0].name).toBe('Calm');
    expect(moods[0].color).toBe('#38BDF8');
  });

  it('fetches languages from content API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          {
            id: 'lang-hi',
            name: 'Hindi',
            code: 'hi',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      }),
    } as Response);

    const languages = await getLanguages();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/languages',
      expect.objectContaining({ method: 'GET' })
    );
    expect(languages).toHaveLength(1);
    expect(languages[0]?.name).toBe('Hindi');
    expect(languages[0]?.code).toBe('hi');
  });

  it('returns an empty array when subscription plans response has no data array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const plans = await getSubscriptionPlans();
    expect(plans).toEqual([]);
  });

  it('parses nested subscription plan payloads and tier fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          plans: [
            { planName: 'Base', minSubscriptionTier: 1 },
            { title: 'Standard', tier: 2 },
            { label: 'Premium Plan', level: '3' },
          ],
        },
      }),
    } as Response);

    const plans = await getSubscriptionPlans();

    expect(plans).toEqual([
      { id: undefined, name: 'Base', minSubscriptionTier: 1 },
      { id: undefined, name: 'Standard', minSubscriptionTier: 2 },
      { id: undefined, name: 'Premium Plan', minSubscriptionTier: 3 },
    ]);
  });

  it('parses moods from a top-level array response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'mood-calm',
          name: 'Calm',
          hexcode: '#38BDF8',
          createdAt: '2026-06-11T17:35:55.418Z',
          updatedAt: '2026-06-11T17:35:55.432Z',
        },
      ],
    } as Response);

    const moods = await getMoods();

    expect(moods).toEqual([
      {
        id: 'mood-calm',
        name: 'Calm',
        color: '#38BDF8',
        createdAt: '2026-06-11T17:35:55.418Z',
        updatedAt: '2026-06-11T17:35:55.432Z',
      },
    ]);
  });

  it('returns an empty array when moods response has no data array', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const moods = await getMoods();
    expect(moods).toEqual([]);
  });
});

describe('getAudiobooks ownerId query', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes ownerId in query string when provided', async () => {
    const { getAudiobooks } = await import('../src/utils/audiobookApi');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    } as Response);

    await getAudiobooks(1, true, undefined, 'org-abc');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v1/audiobooks?page=1&active=true&ownerId=org-abc',
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('audiobook API paid and mood payloads', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('includes paid and mood fields in JSON create payload', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-1', title: 'Test Audiobook' },
      }),
    } as Response);

    await createAudiobook({
      ...baseCreatePayload,
      isPublic: true,
      minSubscriptionTier: 2,
      moodId: 'mood-1',
      subscriptionGatingMode: 'AUDIOBOOK',
    });

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse((request as RequestInit).body as string);
    expect(body.isPublic).toBe(true);
    expect(body.minSubscriptionTier).toBe(2);
    expect(body.moodId).toBe('mood-1');
    expect(body.subscriptionGatingMode).toBe('AUDIOBOOK');
  });

  it('includes paid and mood fields in FormData create payload', async () => {
    const coverImage = new File(['cover'], 'cover.png', { type: 'image/png' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-2', title: 'Test Audiobook' },
      }),
    } as Response);

    await createAudiobook({
      ...baseCreatePayload,
      coverImage,
      isPublic: true,
      minSubscriptionTier: 3,
      moodId: 'mood-2',
      subscriptionGatingMode: 'CHAPTER',
    });

    const [, request] = fetchMock.mock.calls[0];
    const formData = (request as RequestInit).body as FormData;
    expect(formData.get('isPublic')).toBe('true');
    expect(formData.get('minSubscriptionTier')).toBe('3');
    expect(formData.get('moodId')).toBe('mood-2');
    expect(formData.get('subscriptionGatingMode')).toBe('CHAPTER');
  });

  it('includes owner as JSON string in FormData create payload', async () => {
    const coverImage = new File(['cover'], 'cover.png', { type: 'image/png' });
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: 'ab-3', title: 'Test Audiobook' },
      }),
    } as Response);

    await createAudiobook({
      ...baseCreatePayload,
      coverImage,
      owner: { type: 'ORGANIZATION', id: 'org-123' },
    });

    const [, request] = fetchMock.mock.calls[0];
    const formData = (request as RequestInit).body as FormData;
    expect(formData.get('owner')).toBe(
      JSON.stringify({ type: 'ORGANIZATION', id: 'org-123' })
    );
  });
});
