import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthorInvitationForAuthor } from '../../types/authorInvitation';
import {
  confirmOrgContact,
  decideJoin,
  getMyOrganizationInvitations,
  revealContact,
} from '../../utils/authorInvitationApi';

interface AuthorInboxState {
  invitations: AuthorInvitationForAuthor[];
  loading: boolean;
  actionLoadingId: string | null;
  error: string | null;
}

const initialState: AuthorInboxState = {
  invitations: [],
  loading: false,
  actionLoadingId: null,
  error: null,
};

export const fetchMyInvitations = createAsyncThunk(
  'authorInbox/fetchMyInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const invitations = await getMyOrganizationInvitations();
      return invitations;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const revealContactThunk = createAsyncThunk(
  'authorInbox/revealContact',
  async (
    { invitationId, reveal }: { invitationId: string; reveal: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await revealContact(invitationId, reveal);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const confirmContactThunk = createAsyncThunk(
  'authorInbox/confirmContact',
  async (
    { invitationId, contacted }: { invitationId: string; contacted: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await confirmOrgContact(invitationId, contacted);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const decideJoinThunk = createAsyncThunk(
  'authorInbox/decideJoin',
  async (
    { invitationId, accept }: { invitationId: string; accept: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await decideJoin(invitationId, accept);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

function updateInvitationInList(
  invitations: AuthorInvitationForAuthor[],
  updated: AuthorInvitationForAuthor
): AuthorInvitationForAuthor[] {
  return invitations.map(inv =>
    inv.id === updated.id ? updated : inv
  );
}

const authorInboxSlice = createSlice({
  name: 'authorInbox',
  initialState,
  reducers: {
    clearAuthorInbox: state => {
      state.invitations = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyInvitations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyInvitations.fulfilled,
        (state, action: PayloadAction<AuthorInvitationForAuthor[]>) => {
          state.loading = false;
          state.invitations = action.payload;
        }
      )
      .addCase(fetchMyInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch invitations';
      })
      .addCase(revealContactThunk.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.invitationId;
      })
      .addCase(revealContactThunk.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.invitations = updateInvitationInList(
          state.invitations,
          action.payload.invitation
        );
      })
      .addCase(revealContactThunk.rejected, (state) => {
        state.actionLoadingId = null;
      })
      .addCase(confirmContactThunk.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.invitationId;
      })
      .addCase(confirmContactThunk.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.invitations = updateInvitationInList(
          state.invitations,
          action.payload.invitation
        );
      })
      .addCase(confirmContactThunk.rejected, (state) => {
        state.actionLoadingId = null;
      })
      .addCase(decideJoinThunk.pending, (state, action) => {
        state.actionLoadingId = action.meta.arg.invitationId;
      })
      .addCase(decideJoinThunk.fulfilled, (state, action) => {
        state.actionLoadingId = null;
        state.invitations = updateInvitationInList(
          state.invitations,
          action.payload.invitation
        );
      })
      .addCase(decideJoinThunk.rejected, (state) => {
        state.actionLoadingId = null;
      });
  },
});

export const { clearAuthorInbox } = authorInboxSlice.actions;
export default authorInboxSlice.reducer;
