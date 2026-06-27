/**
 * Authentication slice for Redux
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LoginAppType, UserRole } from '../../types/auth';

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  role: UserRole | null;
  appType: LoginAppType | null;
  workspaceSlug: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  role: null,
  appType: null,
  workspaceSlug: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.user = null;
        state.role = null;
        state.appType = null;
        state.workspaceSlug = null;
      }
    },
    setAuthInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setUserRole: (state, action: PayloadAction<UserRole | null>) => {
      state.role = action.payload;
    },
    setAppType: (state, action: PayloadAction<LoginAppType | null>) => {
      state.appType = action.payload;
    },
    setWorkspaceSlug: (state, action: PayloadAction<string | null>) => {
      state.workspaceSlug = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      if (action.payload) {
        state.isAuthenticated = true;
      }
    },
    logout: state => {
      state.isAuthenticated = false;
      state.role = null;
      state.appType = null;
      state.workspaceSlug = null;
      state.user = null;
    },
  },
});

export const {
  setAuthenticated,
  setAuthInitialized,
  setUserRole,
  setAppType,
  setWorkspaceSlug,
  setUser,
  logout,
} = authSlice.actions;
export default authSlice.reducer;
