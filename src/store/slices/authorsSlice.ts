/**
 * Authors slice for Redux
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getDiscoverableAuthors,
  toAuthorPickerItem,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  type AuthorItem,
  type CreateAuthorRequest,
  type UpdateAuthorRequest,
} from '../../utils/audiobookApi';

interface AuthorsState {
  authors: AuthorItem[];
  loading: boolean;
  error: string | null;
}

const initialState: AuthorsState = {
  authors: [],
  loading: false,
  error: null,
};

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getDiscoverableAuthors(1, 100);
      return result.authors.map(toAuthorPickerItem);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createAuthorThunk = createAsyncThunk(
  'authors/createAuthor',
  async (authorData: CreateAuthorRequest, { rejectWithValue }) => {
    try {
      const author = await createAuthor(authorData);
      return author;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateAuthorThunk = createAsyncThunk(
  'authors/updateAuthor',
  async (
    { id, data }: { id: string; data: UpdateAuthorRequest },
    { rejectWithValue }
  ) => {
    try {
      const author = await updateAuthor(id, data);
      return author;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteAuthorThunk = createAsyncThunk(
  'authors/deleteAuthor',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteAuthor(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const authorsSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {
    clearAuthors: state => {
      state.authors = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAuthors.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAuthors.fulfilled,
        (state, action: PayloadAction<AuthorItem[]>) => {
          state.loading = false;
          state.authors = action.payload;
        }
      )
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch authors';
      })
      .addCase(createAuthorThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createAuthorThunk.fulfilled,
        (state, action: PayloadAction<AuthorItem>) => {
          state.loading = false;
          state.authors.push(action.payload);
        }
      )
      .addCase(createAuthorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to create author';
      })
      .addCase(updateAuthorThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateAuthorThunk.fulfilled,
        (state, action: PayloadAction<AuthorItem>) => {
          state.loading = false;
          const index = state.authors.findIndex(
            a => a.id === action.payload.id
          );
          if (index !== -1) {
            state.authors[index] = action.payload;
          }
        }
      )
      .addCase(updateAuthorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to update author';
      })
      .addCase(deleteAuthorThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteAuthorThunk.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.authors = state.authors.filter(a => a.id !== action.payload);
        }
      )
      .addCase(deleteAuthorThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to delete author';
      });
  },
});

export const { clearAuthors } = authorsSlice.actions;
export default authorsSlice.reducer;
