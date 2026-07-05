/**
 * Auth Initializer component - bootstraps CSRF, restores session via refresh, and syncs Redux
 */
import { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import { setAuthenticated } from '../../utils/auth';
import { refresh } from '../../utils/api';
import {
  setAuthenticated as setAuthRedux,
  setAuthInitialized,
  setUserRole,
  setUser,
  setAppType,
  setWorkspaceSlug,
} from '../../store/slices/authSlice';
import { getUserRoleFromAuthResponse } from '../../utils/authRole';
import { ensureCsrfToken } from '../../utils/csrf';
import { getStoredWorkspaceSlug } from '../../utils/workspaceSlug';
import {
  getStoredAppType,
  setStoredAppType,
} from '../../utils/workspaceAppType';
import { removeAccessToken } from '../../utils/token';
let authInitPromise: Promise<void> | null = null;
async function runAuthInitialization(
  dispatch: ReturnType<typeof useAppDispatch>
): Promise<void> {
  try {
    await ensureCsrfToken();
    try {
      const refreshResponse = await refresh();
      setAuthenticated(true);
      dispatch(setAuthRedux(true));
      const role = getUserRoleFromAuthResponse(refreshResponse);
      if (role) {
        dispatch(setUserRole(role));
      }
      if (refreshResponse.appType) {
        setStoredAppType(refreshResponse.appType);
        dispatch(setAppType(refreshResponse.appType));
      } else {
        const storedAppType = getStoredAppType();
        if (storedAppType) {
          dispatch(setAppType(storedAppType));
        }
      }
      const storedSlug = getStoredWorkspaceSlug();
      if (storedSlug) {
        dispatch(setWorkspaceSlug(storedSlug));
      }
      if (refreshResponse.user) {
        dispatch(
          setUser({
            id: refreshResponse.user.id,
            email: refreshResponse.user.email,
            name: refreshResponse.user.name,
          })
        );
      }
    } catch {
      setAuthenticated(false);
      removeAccessToken();
      dispatch(setAuthRedux(false));
    }
  } catch {
    setAuthenticated(false);
    removeAccessToken();
    dispatch(setAuthRedux(false));
  } finally {
    dispatch(setAuthInitialized(true));
  }
}

const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!authInitPromise) {
      authInitPromise = runAuthInitialization(dispatch);
    } else {
      void authInitPromise.then(() => {
        dispatch(setAuthInitialized(true));
      });
    }
  }, [dispatch]);
  return null;
};

export default AuthInitializer;
