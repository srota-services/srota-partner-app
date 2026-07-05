import { useEffect, useState } from 'react';
import { getUserProfileByUserId } from '../utils/partnerApi';

function resolveAvatarUrl(profile: {
  avatar?: string | null;
  avatarUrl?: string | null;
}): string | null {
  const avatar = profile.avatar?.trim() || profile.avatarUrl?.trim();
  return avatar || null;
}

export function useMemberUserProfiles(userIds: string[]) {
  const [avatarsByUserId, setAvatarsByUserId] = useState<
    Record<string, string | null>
  >({});

  const userIdsKey = userIds.join('|');

  useEffect(() => {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
    if (uniqueUserIds.length === 0) {
      setAvatarsByUserId({});
      return;
    }

    let cancelled = false;

    void Promise.all(
      uniqueUserIds.map(async userId => {
        try {
          const profile = await getUserProfileByUserId(userId);
          return [userId, profile ? resolveAvatarUrl(profile) : null] as const;
        } catch {
          return [userId, null] as const;
        }
      })
    ).then(results => {
      if (!cancelled) {
        setAvatarsByUserId(Object.fromEntries(results));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userIdsKey]);

  return avatarsByUserId;
}
