import { afterEach, describe, expect, it, vi } from 'vitest';
import { resendOtp, resendRegistrationOtp } from '../src/utils/partnerApi';

vi.mock('../src/utils/config', () => ({
  getAuthApiBaseUrl: vi.fn(() => 'https://auth.example.com'),
  getAuthHeaders: vi.fn(() => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  })),
  handleApiError: vi.fn((error: unknown) => error),
}));

describe('resendOtp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends REGISTRATION resend with public headers and no Authorization', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'If the email exists, an OTP has been sent to your email',
      }),
    } as Response);

    const response = await resendOtp({
      email: 'user@example.com',
      purpose: 'REGISTRATION',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/resend-otp',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com',
          purpose: 'REGISTRATION',
        }),
      })
    );
    expect(response.message).toBe(
      'If the email exists, an OTP has been sent to your email'
    );
  });

  it('sends PASSWORD_RESET resend with public headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'If the email exists, an OTP has been sent to your email',
      }),
    } as Response);

    await resendOtp({
      email: 'user@example.com',
      purpose: 'PASSWORD_RESET',
    });

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestInit.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(requestInit.body).toBe(
      JSON.stringify({
        email: 'user@example.com',
        purpose: 'PASSWORD_RESET',
      })
    );
  });

  it('sends PASSWORD_UPDATE resend with Bearer token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'OTP resent successfully' }),
    } as Response);

    await resendOtp({
      email: 'user@example.com',
      purpose: 'PASSWORD_UPDATE',
    });

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestInit.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    });
    expect(requestInit.body).toBe(
      JSON.stringify({
        email: 'user@example.com',
        purpose: 'PASSWORD_UPDATE',
      })
    );
  });

  it('sends EMAIL_UPDATE resend with verificationEmail in body', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'OTP resent successfully' }),
    } as Response);

    await resendOtp({
      email: 'user@example.com',
      purpose: 'EMAIL_UPDATE',
      verificationEmail: 'user@example.com',
    });

    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        body: JSON.stringify({
          email: 'user@example.com',
          purpose: 'EMAIL_UPDATE',
          verificationEmail: 'user@example.com',
        }),
      })
    );
  });

  it('propagates 429 cooldown error with remainingSeconds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({
        error: 'Please wait 15 seconds before resending the OTP',
        code: 'OTP_RESEND_COOLDOWN',
        details: { remainingSeconds: 15 },
      }),
    } as Response);

    await expect(
      resendOtp({ email: 'user@example.com', purpose: 'REGISTRATION' })
    ).rejects.toMatchObject({
      message: 'Please wait 15 seconds before resending the OTP',
      statusCode: 429,
      code: 'OTP_RESEND_COOLDOWN',
      details: { remainingSeconds: 15 },
    });
  });
});

describe('resendRegistrationOtp', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates to resendOtp with REGISTRATION purpose', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'If the email exists, an OTP has been sent to your email',
      }),
    } as Response);

    await resendRegistrationOtp('author@example.com');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://auth.example.com/auth/resend-otp',
      expect.objectContaining({
        body: JSON.stringify({
          email: 'author@example.com',
          purpose: 'REGISTRATION',
        }),
      })
    );
  });
});
