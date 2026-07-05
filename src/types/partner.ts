import type { ApiError } from './auth';
export type { ApiError };

export type PartnerType = 'organization' | 'individual';

export type TeamSize = '1-10' | '11-50' | '51-200' | '200+';

export interface UserProfile {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  avatar?: string;
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

export interface OrganizationMemberUserSummary {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  contact?: string | null;
}

export interface OrganizationMemberDto {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user?: OrganizationMemberUserSummary;
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
  avatar?: string | null;
  discoverable?: boolean;
  imageAssets?: Record<string, string>;
  organizations?: Array<{ id: string; name: string; slug: string }>;
  createdAt?: string;
  updatedAt?: string;
}
