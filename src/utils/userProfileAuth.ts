import type { UserProfile, AuthorAppProfile, AuthorProfileDto } from '../types/partner';
import type { AuthUser } from '../store/slices/authSlice';

export function mapProfileToAuthUser(
  profile: UserProfile,
  current: AuthUser | null
): AuthUser {
  const name =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    current?.name;

  const avatarUrl =
    profile.avatarUrl ?? profile.avatar ?? current?.avatarUrl;

  return {
    id: current?.id,
    email: profile.email ?? current?.email,
    name,
    avatarUrl,
  };
}

export function mapAuthorProfilesToAuthUser(
  appProfile: AuthorAppProfile,
  author: AuthorProfileDto,
  current: AuthUser | null
): AuthUser {
  const name =
    [author.firstName, author.lastName].filter(Boolean).join(' ') ||
    current?.name;

  return {
    id: author.userId ?? current?.id,
    email: current?.email,
    name,
    avatarUrl: appProfile.avatar ?? current?.avatarUrl,
  };
}
