import { FormEvent, useEffect, useMemo, useState } from 'react';

import { ArrowRight, Mail } from 'lucide-react';

import Button from '../../../components/common/Button';

import FieldErrorHint from '../../../components/common/FieldErrorHint';

import OtpInput from '../../../components/common/OtpInput';

import RegistrationSummary from '../../../components/common/RegistrationSummary';

import type { ResendOtpPurpose } from '../../../types/auth';
import type { PartnerType } from '../../../types/partner';

import { resendOtp } from '../../../utils/partnerApi';
import { RESEND_OTP_COOLDOWN_SECONDS } from '../../../utils/otpResend';
import { showApiError, showSuccess } from '../../../utils/toast';
import type { ApiError } from '../../../types/auth';

export interface VerifyOtpFormData {
  otp: string;
}

interface VerifyOtpStepProps {
  email: string;
  isLoading: boolean;
  variant?: PartnerType;
  organizationName?: string;
  logoPreviewUrl?: string | null;
  fullName?: string;
  photoPreviewUrl?: string | null;
  purpose?: ResendOtpPurpose;
  verificationEmail?: string;
  showSummary?: boolean;
  verifyButtonLabel?: string;
  onVerify: (data: VerifyOtpFormData) => void;
  onBack?: () => void;
  onEditEmail?: () => void;
}

function VerifyOtpStep({
  email,
  isLoading,
  variant = 'organization',
  organizationName,
  logoPreviewUrl,
  fullName,
  photoPreviewUrl,
  purpose = 'REGISTRATION',
  verificationEmail,
  showSummary = true,
  verifyButtonLabel = 'Verify & Finish',
  onVerify,
  onBack,
  onEditEmail,
}: VerifyOtpStepProps) {
  const [otp, setOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(RESEND_OTP_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft(current => current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setFieldErrors({
        otp: 'Please enter the 6-digit verification code',
      });
      return;
    }

    setFieldErrors({});
    onVerify({ otp });
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return;
    }

    setIsResending(true);
    try {
      const response = await resendOtp({
        email,
        purpose,
        ...(verificationEmail !== undefined ? { verificationEmail } : {}),
      });
      showSuccess(response.message);
      setSecondsLeft(RESEND_OTP_COOLDOWN_SECONDS);
    } catch (error) {
      const apiError = error as ApiError;
      if (
        apiError.statusCode === 429 &&
        apiError.code === 'OTP_RESEND_COOLDOWN'
      ) {
        const remaining = apiError.details?.remainingSeconds;
        setSecondsLeft(
          remaining !== undefined && remaining > 0
            ? remaining
            : RESEND_OTP_COOLDOWN_SECONDS
        );
        if (apiError.message) {
          showApiError(apiError);
        }
      } else {
        showApiError(error);
      }
    } finally {
      setIsResending(false);
    }
  };

  const resendDisabled = secondsLeft > 0 || isLoading || isResending;

  return (
    <form onSubmit={handleSubmit} className="partner-register-form">
      <div className="partner-verify-hero">
        <div className="partner-verify-icon" aria-hidden="true">
          <Mail size={28} />
        </div>
        <h2 className="partner-verify-title">Verify your email</h2>
        <p className="partner-verify-subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <div className="partner-form-group">
        <label className="partner-field-label">
          Verification code
          <FieldErrorHint message={fieldErrors.otp} />
        </label>
        <OtpInput
          value={otp}
          onChange={value => {
            setOtp(value);
            setFieldErrors({});
          }}
          disabled={isLoading}
          hasError={Boolean(fieldErrors.otp)}
        />
      </div>

      <div className="partner-verify-actions">
        <p className="partner-verify-helper">Didn&apos;t get it?</p>
        <button
          type="button"
          className="partner-resend-btn"
          onClick={() => void handleResend()}
          disabled={resendDisabled}
        >
          {isResending
            ? 'Sending...'
            : secondsLeft > 0
              ? `Resend code in ${formattedTimer}`
              : 'Resend code'}
        </button>
        {onEditEmail && (
          <button
            type="button"
            className="partner-edit-email-btn"
            onClick={onEditEmail}
            disabled={isLoading}
          >
            Edit email
          </button>
        )}
      </div>

      {showSummary && variant === 'organization' && (
        <RegistrationSummary
          partnerType="organization"
          email={email}
          organizationName={organizationName}
          logoPreviewUrl={logoPreviewUrl}
        />
      )}

      {showSummary && variant === 'individual' && (
        <RegistrationSummary
          partnerType="individual"
          email={email}
          fullName={fullName}
          photoPreviewUrl={photoPreviewUrl}
        />
      )}

      <div className="partner-wizard-footer">
        {onBack && (
          <button
            type="button"
            className="partner-back-link"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </button>
        )}
        <Button type="submit" className="partner-continue-btn" isLoading={isLoading}>
          {verifyButtonLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}

export default VerifyOtpStep;
