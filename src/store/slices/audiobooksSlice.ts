/**
 * Audiobooks slice for Redux
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAudiobooks,
  createAudiobook,
  updateAudiobook,
  deleteAudiobook,
} from '../../utils/audiobookApi';
import { resolveAudiobookFetchOwnerId } from '../../utils/resolveAudiobookFetchOwnerId';
import type { RootState } from '../store';
import type {
  AudiobookApiResponse,
  AudiobooksApiResponse,
  CreateAudiobookRequest,
  UpdateAudiobookRequest,
  PaginationInfo,
} from '../../types/audiobook';

export type AudiobookFilter =
  | 'all'
  | 'live'
  | 'scheduled'
  | 'drafts'
  | 'archived';

interface AudiobooksState {
  audiobooks: AudiobookApiResponse[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  filter: AudiobookFilter;
  searchQuery: string;
}

const initialState: AudiobooksState = {
  audiobooks: [],
  pagination: null,
  loading: false,
  error: null,
  currentPage: 1,
  filter: 'live',
  searchQuery: '',
};

export const fetchAudiobooks = createAsyncThunk(
  'audiobooks/fetchAudiobooks',
  async (
    { page = 1, filter }: { page?: number; filter?: AudiobookFilter },
    { rejectWithValue, getState }
  ) => {
    try {
      if (filter === 'drafts' || filter === 'archived') {
        return {
          success: true,
          data: [],
          message: '',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          path: '',
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        } satisfies AudiobooksApiResponse;
      }

      const { appType } = (getState() as RootState).auth;
      const ownerId = await resolveAudiobookFetchOwnerId(appType);

      const active = filter === 'live' ? true : undefined;
      const scheduled = filter === 'scheduled' ? true : undefined;
      const response = await getAudiobooks(
        page,
        active,
        scheduled,
        ownerId ?? undefined
      );
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createAudiobookThunk = createAsyncThunk(
  'audiobooks/createAudiobook',
  async (data: CreateAudiobookRequest, { rejectWithValue }) => {
    try {
      const audiobook = await createAudiobook(data);
      return audiobook;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateAudiobookThunk = createAsyncThunk(
  'audiobooks/updateAudiobook',
  async (data: UpdateAudiobookRequest, { rejectWithValue }) => {
    try {
      const audiobook = await updateAudiobook(data);
      return audiobook;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAudiobookThunk = createAsyncThunk(
  'audiobooks/deleteAudiobook',
  async (audiobookId: string, { rejectWithValue }) => {
    try {
      await deleteAudiobook(audiobookId);
      return audiobookId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const audiobooksSlice = createSlice({
  name: 'audiobooks',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<AudiobookFilter>) => {
      state.filter = action.payload;
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearAudiobooks: state => {
      state.audiobooks = [];
      state.pagination = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAudiobooks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAudiobooks.fulfilled,
        (state, action: PayloadAction<AudiobooksApiResponse>) => {
          state.loading = false;
          state.audiobooks = action.payload.data;
          state.pagination = action.payload.pagination || null;
        }
      )
      .addCase(fetchAudiobooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch audiobooks';
      })
      .addCase(createAudiobookThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createAudiobookThunk.fulfilled,
        (state, action: PayloadAction<AudiobookApiResponse>) => {
          state.loading = false;
          // Add new audiobook to the list
          state.audiobooks = [action.payload, ...state.audiobooks];
        }
      )
      .addCase(createAudiobookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to create audiobook';
      })
      .addCase(updateAudiobookThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAudiobookThunk.fulfilled, state => {
        state.loading = false;
        // Don't update audiobook here - let fetchAudiobooks handle it to ensure consistency
      })
      .addCase(updateAudiobookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to update audiobook';
      })
      .addCase(deleteAudiobookThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAudiobookThunk.fulfilled, state => {
        state.loading = false;
        // Don't remove audiobook here - let fetchAudiobooks handle it to ensure consistency
      })
      .addCase(deleteAudiobookThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to delete audiobook';
      });
  },
});

export const { setFilter, setSearchQuery, setCurrentPage, clearAudiobooks } =
  audiobooksSlice.actions;
export default audiobooksSlice.reducer;
