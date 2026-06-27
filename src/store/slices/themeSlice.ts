import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
   getStoredTheme,
   setStoredTheme,
   type ThemeMode,
} from '../../utils/themeStorage';

export interface ThemeState {
   mode: ThemeMode;
   initialized: boolean;
}

const initialState: ThemeState = {
   mode: 'light',
   initialized: false,
};

const themeSlice = createSlice({
   name: 'theme',
   initialState,
   reducers: {
      initializeTheme: state => {
         const stored = getStoredTheme();
         state.mode = stored;
         state.initialized = true;
         setStoredTheme(stored);
      },
      setTheme: (state, action: PayloadAction<ThemeMode>) => {
         state.mode = action.payload;
         setStoredTheme(action.payload);
      },
      toggleTheme: state => {
         const nextMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
         state.mode = nextMode;
         setStoredTheme(nextMode);
      },
   },
});

export const { initializeTheme, setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
