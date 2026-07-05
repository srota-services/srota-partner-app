import type { ResendOtpPurpose } from '../types/auth';

export const RESEND_OTP_COOLDOWN_SECONDS = 30;

const AUTH_RESEND_OTP_PURPOSES: readonly ResendOtpPurpose[] = [
  'PASSWORD_UPDATE',
  'EMAIL_UPDATE',
];

export function requiresAuthForResendOtp(purpose: ResendOtpPurpose): boolean {
  return AUTH_RESEND_OTP_PURPOSES.includes(purpose);
}
