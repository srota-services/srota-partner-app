import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthorInvitationForOrg,
  OrganizationAuthorMember,
} from '../../types/authorInvitation';
import {
  createAuthorInvitation,
  getOrganizationAuthors,
  getOrganizationInvitations,
} from '../../utils/authorInvitationApi';
import { resolveOrganizationId } from '../../utils/resolveOrganizationId';

interface OrganizationAuthorsState {
  organizationId: string | null;
  linkedAuthors: OrganizationAuthorMember[];
  invitations: AuthorInvitationForOrg[];
  loading: boolean;
  inviting: boolean;
  error: string | null;
}

const initialState: OrganizationAuthorsState = {
  organizationId: null,
  linkedAuthors: [],
  invitations: [],
  loading: false,
  inviting: false,
  error: null,
};

export const fetchLinkedAuthors = createAsyncThunk(
  'organizationAuthors/fetchLinkedAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const organizationId = await resolveOrganizationId();
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const authors = await getOrganizationAuthors(organizationId);
      return { organizationId, authors };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchOrgInvitations = createAsyncThunk(
  'organizationAuthors/fetchOrgInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const organizationId = await resolveOrganizationId();
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const invitations = await getOrganizationInvitations(organizationId);
      return { organizationId, invitations };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const inviteAuthor = createAsyncThunk(
  'organizationAuthors/inviteAuthor',
  async (authorId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { organizationAuthors: OrganizationAuthorsState };
      let organizationId = state.organizationAuthors.organizationId;
      if (!organizationId) {
        organizationId = await resolveOrganizationId();
      }
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const result = await createAuthorInvitation(organizationId, authorId);
      return {
        organizationId,
        invitation: result.invitation,
        message: result.message,
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const organizationAuthorsSlice = createSlice({
  name: 'organizationAuthors',
  initialState,
  reducers: {
    clearOrganizationAuthors: state => {
      state.linkedAuthors = [];
      state.invitations = [];
      state.organizationId = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLinkedAuthors.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLinkedAuthors.fulfilled,
        (
          state,
          action: PayloadAction<{
            organizationId: string;
            authors: OrganizationAuthorMember[];
          }>
        ) => {
          state.loading = false;
          state.organizationId = action.payload.organizationId;
          state.linkedAuthors = action.payload.authors;
        }
      )
      .addCase(fetchLinkedAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch linked authors';
      })
      .addCase(fetchOrgInvitations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrgInvitations.fulfilled,
        (
          state,
          action: PayloadAction<{
            organizationId: string;
            invitations: AuthorInvitationForOrg[];
          }>
        ) => {
          state.loading = false;
          state.organizationId = action.payload.organizationId;
          state.invitations = action.payload.invitations;
        }
      )
      .addCase(fetchOrgInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch invitations';
      })
      .addCase(inviteAuthor.pending, state => {
        state.inviting = true;
        state.error = null;
      })
      .addCase(
        inviteAuthor.fulfilled,
        (
          state,
          action: PayloadAction<{
            organizationId: string;
            invitation: AuthorInvitationForOrg;
          }>
        ) => {
          state.inviting = false;
          state.organizationId = action.payload.organizationId;
          const existing = state.invitations.findIndex(
            i => i.id === action.payload.invitation.id
          );
          if (existing >= 0) {
            state.invitations[existing] = action.payload.invitation;
          } else {
            state.invitations.unshift(action.payload.invitation);
          }
        }
      )
      .addCase(inviteAuthor.rejected, (state, action) => {
        state.inviting = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to send invitation';
      });
  },
});

export const { clearOrganizationAuthors } = organizationAuthorsSlice.actions;
export default organizationAuthorsSlice.reducer;
