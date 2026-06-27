import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
} from '../src/utils/partnerApi';

vi.mock('../src/utils/config', () => ({
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
  handleApiError: vi.fn((error: unknown) => error),
}));

describe('forgotPassword', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts email to forgot-password endpoint with public headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'If the email exists, an OTP has been sent to your email',
      }),
    } as Response);

    const response = await forgotPassword({ email: 'user@example.com' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/forgot-password',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      })
    );
    expect(response.message).toBe(
      'If the email exists, an OTP has been sent to your email'
    );
  });
});

describe('verifyForgotPasswordOtp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts email and otp to verify-forgot-password-otp endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'OTP verified successfully' }),
    } as Response);

    const response = await verifyForgotPasswordOtp({
      email: 'user@example.com',
      otp: '123456',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/verify-forgot-password-otp',
      expect.objectContaining({
        body: JSON.stringify({ email: 'user@example.com', otp: '123456' }),
      })
    );
    expect(response.message).toBe('OTP verified successfully');
  });
});

describe('resetPassword', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts reset payload to reset-password endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Password reset successfully' }),
    } as Response);

    const response = await resetPassword({
      email: 'user@example.com',
      newPassword: 'NewSecure1!',
      confirmPassword: 'NewSecure1!',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/reset-password',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'user@example.com',
          newPassword: 'NewSecure1!',
          confirmPassword: 'NewSecure1!',
        }),
      })
    );
    expect(response.message).toBe('Password reset successfully');
  });

  it('propagates PASSWORD_RESET_OTP_REQUIRED error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Password reset OTP not verified or expired. Please verify your OTP first.',
        code: 'PASSWORD_RESET_OTP_REQUIRED',
      }),
    } as Response);

    await expect(
      resetPassword({
        email: 'user@example.com',
        newPassword: 'NewSecure1!',
        confirmPassword: 'NewSecure1!',
      })
    ).rejects.toMatchObject({
      code: 'PASSWORD_RESET_OTP_REQUIRED',
      statusCode: 400,
    });
  });
});
