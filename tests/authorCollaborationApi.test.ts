import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createAuthorCollaboration,
  getMyAuthorCollaborations,
} from '../src/utils/authorCollaborationApi';

vi.mock('../src/utils/config', () => ({
  getAuthApiBaseUrl: () => 'https://auth.example.com',
  getAuthHeaders: () => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  }),
  handleApiError: (error: unknown) => error,
}));

describe('authorCollaborationApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses author collaborations list response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'ok',
        collaborations: [
          {
            id: 'collab-1',
            status: 'PENDING_ORG_REVIEW',
            organization: { id: 'org-1', name: 'Acme' },
            authorBudget: 500,
            currency: 'USD',
            turn: 'ORGANIZATION',
            attachments: [],
            rounds: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      }),
    } as Response);

    const collaborations = await getMyAuthorCollaborations();

    expect(collaborations).toHaveLength(1);
    expect(collaborations[0]?.organization.name).toBe('Acme');
  });

  it('submits multipart collaboration create request', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'created',
        collaboration: {
          id: 'collab-2',
          status: 'PENDING_ORG_REVIEW',
          organization: { id: 'org-1', name: 'Acme' },
          authorBudget: 1000,
          currency: 'USD',
          turn: 'ORGANIZATION',
          attachments: [],
          rounds: [],
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    } as Response);

    const collaboration = await createAuthorCollaboration({
      organizationId: 'org-1',
      authorBudget: 1000,
      currency: 'INR',
      description: 'Sample project',
    });

    expect(collaboration.id).toBe('collab-2');
    const [, request] = fetchMock.mock.calls[0] ?? [];
    expect(request?.method).toBe('POST');
    expect(request?.body).toBeInstanceOf(FormData);
  });
});
