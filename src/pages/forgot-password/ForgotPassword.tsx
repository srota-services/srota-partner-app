import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import LoginMarketingPanel from '../login/components/LoginMarketingPanel';
import VerifyOtpStep, {
  type VerifyOtpFormData,
} from '../partner/components/VerifyOtpStep';
import ForgotPasswordEmailStep, {
  type ForgotPasswordEmailFormData,
} from './components/ForgotPasswordEmailStep';
import ResetPasswordStep, {
  type ResetPasswordFormData,
} from './components/ResetPasswordStep';
import {
  forgotPassword,
  resetPassword,
  verifyForgotPasswordOtp,
} from '../../utils/partnerApi';
import { showApiError, showSuccess } from '../../utils/toast';
import type { ApiError } from '../../types/auth';
import '../../styles/shared/marketing.css';
import '../../styles/pages/login/Login.css';
import '../../styles/pages/forgot-password/ForgotPassword.css';

type ForgotPasswordStep = 'email' | 'otp' | 'reset';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetServerError, setResetServerError] = useState('');

  useEffect(() => {
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  const handleEmailSubmit = async (data: ForgotPasswordEmailFormData) => {
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email: data.email });
      setEmail(data.email);
      showSuccess(response.message);
      setStep('otp');
    } catch (error) {
      showApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (data: VerifyOtpFormData) => {
    setIsLoading(true);
    try {
      await verifyForgotPasswordOtp({ email, otp: data.otp });
      setResetServerError('');
      setStep('reset');
    } catch (error) {
      showApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setResetServerError('');
    try {
      const response = await resetPassword({
        email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      showSuccess(response.message);
      navigate('/login', { replace: true });
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.code === 'PASSWORD_RESET_OTP_REQUIRED') {
        setResetServerError(apiError.message);
        setStep('otp');
        return;
      }
      showApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container forgot-password-page">
      <LoginMarketingPanel />
      <section className="login-panel">
        <div className="login-form-card marketing-card forgot-password-card">
          {step === 'email' && (
            <div className="login-form-icon">
              <KeyRound size={24} />
            </div>
          )}

          {step === 'email' && (
            <ForgotPasswordEmailStep
              isLoading={isLoading}
              initialEmail={email}
              onSubmit={handleEmailSubmit}
              onBack={() => navigate('/login')}
            />
          )}

          {step === 'otp' && (
            <VerifyOtpStep
              email={email}
              isLoading={isLoading}
              purpose="PASSWORD_RESET"
              showSummary={false}
              verifyButtonLabel="Verify code"
              onVerify={handleOtpVerify}
              onBack={() => setStep('email')}
              onEditEmail={() => setStep('email')}
            />
          )}

          {step === 'reset' && (
            <ResetPasswordStep
              email={email}
              isLoading={isLoading}
              serverError={resetServerError}
              onSubmit={handleResetSubmit}
              onBack={() => setStep('otp')}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
