import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../src/pages/forgot-password/ForgotPassword';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../src/utils/partnerApi', () => ({
  forgotPassword: vi.fn().mockResolvedValue({
    message: 'If the email exists, an OTP has been sent to your email',
  }),
  verifyForgotPasswordOtp: vi.fn().mockResolvedValue({
    message: 'OTP verified successfully',
  }),
  resetPassword: vi.fn().mockResolvedValue({
    message: 'Password reset successfully',
  }),
  resendOtp: vi.fn().mockResolvedValue({
    message: 'If the email exists, an OTP has been sent to your email',
  }),
}));

function renderForgotPassword() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

async function completeOtpStep(user: ReturnType<typeof userEvent.setup>) {
  const digits = screen.getAllByLabelText(/digit \d+ of 6/i);
  for (let i = 0; i < 6; i += 1) {
    await user.type(digits[i], String(i + 1));
  }
  await user.click(screen.getByRole('button', { name: /verify code/i }));
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks through email, OTP, and reset steps', async () => {
    const user = userEvent.setup();
    const {
      forgotPassword,
      verifyForgotPasswordOtp,
      resetPassword,
    } = await import('../src/utils/partnerApi');

    renderForgotPassword();

    await user.type(
      screen.getByLabelText(/^email$/i),
      'user@example.com'
    );
    await user.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    });

    await completeOtpStep(user);

    await waitFor(() => {
      expect(verifyForgotPasswordOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        otp: '123456',
      });
      expect(screen.getByText(/create a new password/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/^new password/i),
      'NewSecure1!'
    );
    await user.type(
      screen.getByLabelText(/^confirm password/i),
      'NewSecure1!'
    );
    await user.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        newPassword: 'NewSecure1!',
        confirmPassword: 'NewSecure1!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  it('calls resendOtp with PASSWORD_RESET after cooldown', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { forgotPassword, resendOtp } = await import('../src/utils/partnerApi');

    renderForgotPassword();

    await user.type(screen.getByLabelText(/^email$/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(forgotPassword).toHaveBeenCalled();
      expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    });

    for (let i = 0; i < 30; i += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });
    }

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /^resend code$/i })
      ).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: /^resend code$/i }));

    await waitFor(() => {
      expect(resendOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        purpose: 'PASSWORD_RESET',
      });
    });

    vi.useRealTimers();
  });
});
