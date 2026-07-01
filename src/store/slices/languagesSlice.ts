/**
 * Languages slice for Redux
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLanguages, type LanguageItem } from '../../utils/audiobookApi';

interface LanguagesState {
  languages: LanguageItem[];
  loading: boolean;
  error: string | null;
}

const initialState: LanguagesState = {
  languages: [],
  loading: false,
  error: null,
};

export const fetchLanguages = createAsyncThunk(
  'languages/fetchLanguages',
  async (_, { rejectWithValue }) => {
    try {
      const languages = await getLanguages();
      return languages;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const languagesSlice = createSlice({
  name: 'languages',
  initialState,
  reducers: {
    clearLanguages: state => {
      state.languages = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchLanguages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchLanguages.fulfilled,
        (state, action: PayloadAction<LanguageItem[]>) => {
          state.loading = false;
          state.languages = action.payload;
        }
      )
      .addCase(fetchLanguages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
          ? String(action.payload)
          : 'Failed to fetch languages';
      });
  },
});

export const { clearLanguages } = languagesSlice.actions;
export default languagesSlice.reducer;
