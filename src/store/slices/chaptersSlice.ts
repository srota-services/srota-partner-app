/**
 * Chapters slice for Redux
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../../utils/audiobookApi';
import type {
  ChapterApiResponse,
  ChaptersApiResponse,
  CreateChapterRequest,
  UpdateChapterRequest,
  PaginationInfo,
} from '../../types/audiobook';

interface ChaptersState {
  chapters: ChapterApiResponse[];
  pagination: PaginationInfo | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  currentAudiobookId: string | null;
}

const initialState: ChaptersState = {
  chapters: [],
  pagination: null,
  loading: false,
  error: null,
  currentPage: 1,
  currentAudiobookId: null,
};

export const fetchChapters = createAsyncThunk(
  'chapters/fetchChapters',
  async (
    { audiobookId, page }: { audiobookId: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getChapters(audiobookId, page);
      return { response, audiobookId };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchChapter = createAsyncThunk(
  'chapters/fetchChapter',
  async (chapterId: string, { rejectWithValue }) => {
    try {
      return await getChapter(chapterId);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createChapterThunk = createAsyncThunk(
  'chapters/createChapter',
  async (data: CreateChapterRequest, { rejectWithValue }) => {
    try {
      const chapter = await createChapter(data);
      return chapter;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateChapterThunk = createAsyncThunk(
  'chapters/updateChapter',
  async (data: UpdateChapterRequest, { rejectWithValue }) => {
    try {
      const chapter = await updateChapter(data);
      return chapter;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteChapterThunk = createAsyncThunk(
  'chapters/deleteChapter',
  async (chapterId: string, { rejectWithValue }) => {
    try {
      await deleteChapter(chapterId);
      return chapterId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const chaptersSlice = createSlice({
  name: 'chapters',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setCurrentAudiobookId: (state, action: PayloadAction<string | null>) => {
      state.currentAudiobookId = action.payload;
      state.currentPage = 1;
      state.chapters = [];
      state.pagination = null;
    },
    clearChapters: state => {
      state.chapters = [];
      state.pagination = null;
      state.error = null;
      state.currentAudiobookId = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChapters.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchChapters.fulfilled,
        (
          state,
          action: PayloadAction<{
            response: ChaptersApiResponse;
            audiobookId: string;
          }>
        ) => {
          state.loading = false;
          state.chapters = action.payload.response.data;
          state.pagination = action.payload.response.pagination || null;
          state.currentAudiobookId = action.payload.audiobookId;
        }
      )
      .addCase(fetchChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch chapters';
      })
      .addCase(
        fetchChapter.fulfilled,
        (state, action: PayloadAction<ChapterApiResponse>) => {
          const index = state.chapters.findIndex(
            chapter => chapter.id === action.payload.id
          );
          if (index !== -1) {
            state.chapters[index] = action.payload;
          }
        }
      )
      .addCase(createChapterThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChapterThunk.fulfilled, state => {
        state.loading = false;
        // Don't add chapter here - let fetchChapters handle it to ensure consistency
      })
      .addCase(createChapterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to create Chapter. Try again later.';
      })
      .addCase(updateChapterThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChapterThunk.fulfilled, state => {
        state.loading = false;
        // Don't update chapter here - let fetchChapters handle it to ensure consistency
      })
      .addCase(updateChapterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to update chapter';
      })
      .addCase(deleteChapterThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChapterThunk.fulfilled, state => {
        state.loading = false;
        // Don't remove chapter here - let fetchChapters handle it to ensure consistency
      })
      .addCase(deleteChapterThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to delete chapter';
      });
  },
});

export const { setCurrentPage, setCurrentAudiobookId, clearChapters } =
  chaptersSlice.actions;
export default chaptersSlice.reducer;
