import { describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import collaborationsReducer, {
  createCollaboration,
} from '../src/store/slices/collaborationsSlice';

vi.mock('../src/utils/authorCollaborationApi', () => ({
  createAuthorCollaboration: vi.fn().mockResolvedValue({
    id: 'collab-1',
    status: 'PENDING_ORG_REVIEW',
    organization: { id: 'org-1', name: 'Acme' },
    authorBudget: 1000,
    currency: 'USD',
    turn: 'ORGANIZATION',
    attachments: [],
    rounds: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }),
  getMyAuthorCollaborations: vi.fn().mockResolvedValue([]),
  getOrganizationCollaborations: vi.fn().mockResolvedValue([]),
}));

describe('collaborationsSlice', () => {
  it('adds created collaboration to state', async () => {
    const store = configureStore({
      reducer: {
        collaborations: collaborationsReducer,
      },
    });

    await store.dispatch(
      createCollaboration({
        organizationId: 'org-1',
        authorBudget: 1000,
        currency: 'USD',
      })
    );

    const state = store.getState().collaborations;
    expect(state.collaborations).toHaveLength(1);
    expect(state.collaborations[0]?.id).toBe('collab-1');
    expect(state.saving).toBe(false);
  });
});
