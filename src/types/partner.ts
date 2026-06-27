import type { ApiError } from './auth';
export type { ApiError };

export type PartnerType = 'organization' | 'individual';

export type TeamSize = '1-10' | '11-50' | '51-200' | '200+';

export interface UserProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  avatar?: string;
}

/** App-service author profile (avatar) for authenticated authors */
export interface AuthorAppProfile {
  id: string;
  authorId: string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthorAppProfileResponse {
  success: boolean;
  data: AuthorAppProfile;
  message?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

export interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  preferredGenre?: string | null;
  websiteUrl?: string | null;
  teamSize?: TeamSize | null;
  memberCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  websiteUrl?: string;
  teamSize?: TeamSize;
  preferredGenre?: string;
  image?: File;
}

export interface CreateOrganizationResponse {
  message?: string;
  organization: OrganizationItem;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  contact?: string;
}

export interface RegisterResponse {
  message?: string;
  otpSent?: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export type VerifyRegistrationOtpType = 'organization' | 'author';

export interface VerifyRegistrationOtpRequest {
  email: string;
  otp: string;
  type: VerifyRegistrationOtpType;
  firstName?: string;
  lastName?: string;
}

export interface VerifyRegistrationOtpResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export interface RegisterPartnerUserInput {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  address?: string;
  contact?: string;
}

export interface RegisterIndividualInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  address: string;
  contact?: string;
  profileImage?: File;
}

export interface CompletePartnerOrganizationInput {
  organizationName: string;
  websiteUrl?: string;
  teamSize?: TeamSize;
  preferredGenre?: string;
  image?: File;
}

export interface OrganizationMemberDto {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  organization?: OrganizationItem;
}

export interface AuthorProfileDto {
  id: string;
  userId: string;
  slug: string;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  contact?: string | null;
  organizations?: Array<{ id: string; name: string; slug: string }>;
  createdAt?: string;
  updatedAt?: string;
}
