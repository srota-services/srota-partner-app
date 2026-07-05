import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { OrganizationMemberDto } from '../../types/partner';
import type {
  AddOrganizationMemberInput,
  OrganizationMemberRole,
  UpdateOrganizationMemberInput,
} from '../../utils/organizationMemberApi';
import {
  addOrganizationMember,
  getOrganizationMembers,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from '../../utils/organizationMemberApi';
import { resolveOrganizationId } from '../../utils/resolveOrganizationId';

interface OrganizationMembersState {
  organizationId: string | null;
  members: OrganizationMemberDto[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: OrganizationMembersState = {
  organizationId: null,
  members: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchOrganizationMembers = createAsyncThunk(
  'organizationMembers/fetchOrganizationMembers',
  async (_, { rejectWithValue }) => {
    try {
      const organizationId = await resolveOrganizationId();
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const members = await getOrganizationMembers(organizationId);
      return { organizationId, members };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addMember = createAsyncThunk(
  'organizationMembers/addMember',
  async (input: AddOrganizationMemberInput, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        organizationMembers: OrganizationMembersState;
      };
      let organizationId = state.organizationMembers.organizationId;
      if (!organizationId) {
        organizationId = await resolveOrganizationId();
      }
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const member = await addOrganizationMember(organizationId, input);
      return { organizationId, member };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'organizationMembers/updateMemberRole',
  async (
    { userId, role }: { userId: string; role: OrganizationMemberRole },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as {
        organizationMembers: OrganizationMembersState;
      };
      const organizationId = state.organizationMembers.organizationId;
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      const input: UpdateOrganizationMemberInput = { role };
      const member = await updateOrganizationMemberRole(
        organizationId,
        userId,
        input
      );
      return member;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeMember = createAsyncThunk(
  'organizationMembers/removeMember',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as {
        organizationMembers: OrganizationMembersState;
      };
      const organizationId = state.organizationMembers.organizationId;
      if (!organizationId) {
        throw new Error('No organization found for current user');
      }
      await removeOrganizationMember(organizationId, userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const organizationMembersSlice = createSlice({
  name: 'organizationMembers',
  initialState,
  reducers: {
    clearOrganizationMembers: state => {
      state.members = [];
      state.organizationId = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOrganizationMembers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizationMembers.fulfilled,
        (
          state,
          action: PayloadAction<{
            organizationId: string;
            members: OrganizationMemberDto[];
          }>
        ) => {
          state.loading = false;
          state.organizationId = action.payload.organizationId;
          state.members = action.payload.members;
        }
      )
      .addCase(fetchOrganizationMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch members';
      })
      .addCase(addMember.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.saving = false;
        state.organizationId = action.payload.organizationId;
        state.members.push(action.payload.member);
      })
      .addCase(addMember.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to add member';
      })
      .addCase(updateMemberRole.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(
        updateMemberRole.fulfilled,
        (state, action: PayloadAction<OrganizationMemberDto>) => {
          state.saving = false;
          const index = state.members.findIndex(
            member => member.userId === action.payload.userId
          );
          if (index >= 0) {
            state.members[index] = action.payload;
          }
        }
      )
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to update member';
      })
      .addCase(removeMember.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.saving = false;
        state.members = state.members.filter(
          member => member.userId !== action.payload
        );
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to remove member';
      });
  },
});

export const { clearOrganizationMembers } = organizationMembersSlice.actions;
export default organizationMembersSlice.reducer;
