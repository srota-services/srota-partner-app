import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthorCollaboration,
  CreateCollaborationInput,
  OrgCollaboration,
} from '../../types/authorCollaboration';
import {
  abortCollaboration,
  acceptOrganizationCollaboration,
  counterCollaborationBudget,
  createAuthorCollaboration,
  getMyAuthorCollaborations,
  getOrganizationCollaborations,
  negotiateOrganizationCollaboration,
  rejectOrganizationCollaboration,
} from '../../utils/authorCollaborationApi';
import { resolveOrganizationId } from '../../utils/resolveOrganizationId';
import { isOrgMarketplaceContext } from '../../utils/marketplaceContext';
import type { RootState } from '../store';

type CollaborationItem = AuthorCollaboration | OrgCollaboration;

interface CollaborationsState {
  organizationId: string | null;
  collaborations: CollaborationItem[];
  loading: boolean;
  saving: boolean;
  actionLoadingId: string | null;
  error: string | null;
}

const initialState: CollaborationsState = {
  organizationId: null,
  collaborations: [],
  loading: false,
  saving: false,
  actionLoadingId: null,
  error: null,
};

function upsertCollaboration(
  collaborations: CollaborationItem[],
  updated: CollaborationItem
): CollaborationItem[] {
  const index = collaborations.findIndex(item => item.id === updated.id);
  if (index >= 0) {
    const next = [...collaborations];
    next[index] = updated;
    return next;
  }
  return [updated, ...collaborations];
}

export const fetchCollaborations = createAsyncThunk(
  'collaborations/fetchCollaborations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const { appType, role } = state.auth;

      if (isOrgMarketplaceContext(appType, role)) {
        const organizationId = await resolveOrganizationId();
        if (!organizationId) {
          throw new Error('No organization found for current user');
        }
        const collaborations =
          await getOrganizationCollaborations(organizationId);
        return { organizationId, collaborations };
      }

      const collaborations = await getMyAuthorCollaborations();
      return { organizationId: null, collaborations };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createCollaboration = createAsyncThunk(
  'collaborations/createCollaboration',
  async (input: CreateCollaborationInput, { rejectWithValue }) => {
    try {
      const collaboration = await createAuthorCollaboration(input);
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const counterCollaboration = createAsyncThunk(
  'collaborations/counterCollaboration',
  async (
    { collaborationId, authorBudget }: { collaborationId: string; authorBudget: number },
    { rejectWithValue }
  ) => {
    try {
      const collaboration = await counterCollaborationBudget(
        collaborationId,
        authorBudget
      );
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const abortCollaborationRequest = createAsyncThunk(
  'collaborations/abortCollaborationRequest',
  async (collaborationId: string, { rejectWithValue }) => {
    try {
      const collaboration = await abortCollaboration(collaborationId);
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const acceptCollaboration = createAsyncThunk(
  'collaborations/acceptCollaboration',
  async (collaborationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.collaborations.organizationId;
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const collaboration = await acceptOrganizationCollaboration(
        organizationId,
        collaborationId
      );
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rejectCollaboration = createAsyncThunk(
  'collaborations/rejectCollaboration',
  async (collaborationId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.collaborations.organizationId;
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const collaboration = await rejectOrganizationCollaboration(
        organizationId,
        collaborationId
      );
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const negotiateCollaboration = createAsyncThunk(
  'collaborations/negotiateCollaboration',
  async (
    {
      collaborationId,
      organizationAsk,
    }: { collaborationId: string; organizationAsk: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const organizationId = state.collaborations.organizationId;
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const collaboration = await negotiateOrganizationCollaboration(
        organizationId,
        collaborationId,
        organizationAsk
      );
      return collaboration;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const collaborationsSlice = createSlice({
  name: 'collaborations',
  initialState,
  reducers: {
    clearCollaborations: state => {
      state.collaborations = [];
      state.organizationId = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCollaborations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCollaborations.fulfilled,
        (
          state,
          action: PayloadAction<{
            organizationId: string | null;
            collaborations: CollaborationItem[];
          }>
        ) => {
          state.loading = false;
          state.organizationId = action.payload.organizationId;
          state.collaborations = action.payload.collaborations;
        }
      )
      .addCase(fetchCollaborations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch collaborations';
      })
      .addCase(createCollaboration.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(
        createCollaboration.fulfilled,
        (state, action: PayloadAction<AuthorCollaboration>) => {
          state.saving = false;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(createCollaboration.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to create collaboration';
      })
      .addCase(counterCollaboration.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.collaborationId;
        state.error = null;
      })
      .addCase(
        counterCollaboration.fulfilled,
        (state, action: PayloadAction<AuthorCollaboration>) => {
          state.actionLoadingId = null;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(counterCollaboration.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to counter collaboration';
      })
      .addCase(abortCollaborationRequest.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(
        abortCollaborationRequest.fulfilled,
        (state, action: PayloadAction<AuthorCollaboration>) => {
          state.actionLoadingId = null;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(abortCollaborationRequest.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to abort collaboration';
      })
      .addCase(acceptCollaboration.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(
        acceptCollaboration.fulfilled,
        (state, action: PayloadAction<OrgCollaboration>) => {
          state.actionLoadingId = null;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(acceptCollaboration.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to accept collaboration';
      })
      .addCase(rejectCollaboration.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg;
        state.error = null;
      })
      .addCase(
        rejectCollaboration.fulfilled,
        (state, action: PayloadAction<OrgCollaboration>) => {
          state.actionLoadingId = null;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(rejectCollaboration.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to reject collaboration';
      })
      .addCase(negotiateCollaboration.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.collaborationId;
        state.error = null;
      })
      .addCase(
        negotiateCollaboration.fulfilled,
        (state, action: PayloadAction<OrgCollaboration>) => {
          state.actionLoadingId = null;
          state.collaborations = upsertCollaboration(
            state.collaborations,
            action.payload
          );
        }
      )
      .addCase(negotiateCollaboration.rejected, (state, action) => {
        state.actionLoadingId = null;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to negotiate collaboration';
      });
  },
});

export const { clearCollaborations } = collaborationsSlice.actions;
export default collaborationsSlice.reducer;
