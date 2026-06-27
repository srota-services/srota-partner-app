import type { NavigateFunction } from 'react-router-dom';
import type { AppDispatch } from '../store/store';
import { logout as logoutAction } from '../store/slices/authSlice';
import { logout } from './api';
import { setAuthenticated } from './auth';
import { removeAccessToken } from './token';
import { clearStoredAppType } from './workspaceAppType';
import { showSuccess } from './toast';

/**
 * Clears local auth state (token, session flag, Redux) without calling the logout API.
 */
export function clearClientAuthSession(dispatch: AppDispatch): void {
  removeAccessToken();
  setAuthenticated(false);
  clearStoredAppType();
  dispatch(logoutAction());
}

/**
 * Ends server session if possible, clears client auth, and redirects to login.
 */
export async function endSessionAndRedirectToLogin(
  dispatch: AppDispatch,
  navigate: NavigateFunction,
  successMessage = 'Registration complete. Please sign in.'
): Promise<void> {
  try {
    await logout();
  } catch {
    clearClientAuthSession(dispatch);
    showSuccess(successMessage);
    navigate('/login', { replace: true });
    return;
  }

  clearClientAuthSession(dispatch);
  showSuccess(successMessage);
  navigate('/login', { replace: true });
}
