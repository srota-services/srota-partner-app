export type UserRole =
  | 'LISTENER'
  | 'GLOBAL_ADMIN'
  | 'ORG_ADMIN'
  | 'ORG_COORDINATOR'
  | 'AUTHOR';

export type LoginAppType = 'organization' | 'author';

/**
 * Browser device metadata sent with login requests
 */
export interface DeviceInfo {
  deviceId: string;
  platform: string;
  userAgent: string;
}

/**
 * Login request payload structure
 */
export interface LoginRequest {
  email: string;
  password: string;
  clientType: string;
  device?: DeviceInfo;
  slug?: string;
}

/**
 * Successful login response structure
 */
export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  appType?: LoginAppType;
  role?: UserRole;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: UserRole;
    emailVerified?: boolean;
  };
  message?: string;
}

/**
 * CSRF token response structure
 */
export interface CsrfTokenResponse {
  csrfToken: string;
}

/**
 * Token refresh response structure
 */
export interface RefreshResponse {
  accessToken?: string;
  token?: string;
  appType?: LoginAppType;
  role?: UserRole;
  user?: LoginResponse['user'];
}

/**
 * OTP purposes accepted by POST /auth/resend-otp
 */
export type ResendOtpPurpose =
  | 'REGISTRATION'
  | 'PASSWORD_RESET'
  | 'PASSWORD_UPDATE'
  | 'EMAIL_UPDATE';

/**
 * Resend OTP request payload
 */
export interface ResendOtpRequest {
  email: string;
  purpose: ResendOtpPurpose;
  /** Required when purpose is EMAIL_UPDATE */
  verificationEmail?: string;
}

/**
 * Resend OTP response
 */
export interface ResendOtpResponse {
  message: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
  code?: string;
  details?: { remainingSeconds?: number };
}

/**
 * Logout response structure
 */
export interface LogoutResponse {
  message?: string;
  success?: boolean;
}

/**
 * Forgot password request (step 1)
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Verify forgot password OTP request (step 2)
 */
export interface VerifyForgotPasswordOtpRequest {
  email: string;
  otp: string;
}

/**
 * Reset password request (step 3)
 */
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Generic message-only API response
 */
export interface MessageResponse {
  message: string;
}
