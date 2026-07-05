import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import type { UserProfile } from '../types/partner';
import { getUserProfile } from '../utils/partnerApi';
import { setUser } from '../store/slices/authSlice';
import { mapProfileToAuthUser } from '../utils/userProfileAuth';

interface UseUserProfileSettingsResult {
  profile: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<UserProfile | null>;
}

export function useUserProfileSettings(): UseUserProfileSettingsResult {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(state => state.auth.user);
  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const nextProfile = await getUserProfile();
      setProfile(nextProfile);
      dispatch(setUser(mapProfileToAuthUser(nextProfile, authUserRef.current)));
      return nextProfile;
    } catch {
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}
